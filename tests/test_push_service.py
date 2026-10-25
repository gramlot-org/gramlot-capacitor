"""Synthetic server tests: no actual APNs request or real key/token."""
import json
from pathlib import Path
import tempfile
import unittest
import stat
from unittest.mock import patch
import httpx
import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, NoEncryption
from push_service import register_token, send_push, TOPIC


class PushServiceTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.registration = self.root / 'device.json'
        self.config = self.root / 'config.json'
        self.key = self.root / 'key.p8'
        self.private = ec.generate_private_key(ec.SECP256R1())
        self.key.write_bytes(self.private.private_bytes(Encoding.PEM, PrivateFormat.PKCS8, NoEncryption()))
        self.config.write_text(json.dumps(dict(keyId='AAAAAAAAAA', teamId='BBBBBBBBBB')))
        register_token('A1' * 32, path=self.registration)

    def send(self, handler, **kwargs):
        client = httpx.Client(transport=httpx.MockTransport(handler), http2=True)
        self.addCleanup(client.close)
        return send_push(kwargs.get('title', 'Test'), kwargs.get('body', 'Synthetic'),
                         registration=self.registration, config=self.config, key=self.key, client=client)

    def test_registration_replaces_token_privately_without_returning_it(self):
        result = register_token('B2' * 32, path=self.registration)
        self.assertNotIn('token', result)
        self.assertEqual(json.loads(self.registration.read_text())['token'], 'B2' * 32)
        self.assertEqual(stat.S_IMODE(self.registration.stat().st_mode), 0o600)
        for token in ['', '../not-a-token', 123, 'A', 'X' * 64]:
            with self.assertRaises(ValueError):
                register_token(token, path=self.registration)

    def test_real_request_shape_jwt_and_fixed_sandbox_destination(self):
        def handler(request):
            self.assertEqual(request.url.host, 'api.sandbox.push.apple.com')
            self.assertEqual(request.headers['apns-topic'], TOPIC)
            self.assertEqual(request.headers['apns-push-type'], 'alert')
            self.assertEqual(request.headers['apns-priority'], '10')
            self.assertEqual(request.headers['apns-expiration'], '0')
            auth = request.headers['authorization'].removeprefix('bearer ')
            self.assertEqual(jwt.get_unverified_header(auth)['kid'], 'AAAAAAAAAA')
            claims = jwt.decode(auth, self.private.public_key(), algorithms=['ES256'], issuer='BBBBBBBBBB')
            self.assertIsInstance(claims['iat'], int)
            payload = json.loads(request.content)
            self.assertEqual(payload['destination'], 'device')
            self.assertEqual(payload['aps']['alert'], dict(title='Test', body='Synthetic'))
            self.assertEqual(payload['messageId'], request.headers['apns-id'])
            return httpx.Response(200, extensions={'http_version': b'HTTP/2'})
        result = self.send(handler)
        self.assertTrue(result['accepted'])
        self.assertNotIn('token', result)
        self.assertNotIn('authorization', result)

    def test_apns_rejection_is_not_delivery_success(self):
        result = self.send(lambda _: httpx.Response(410, json={'reason': 'Unregistered'}, extensions={'http_version': b'HTTP/2'}))
        self.assertFalse(result['accepted'])
        self.assertEqual(result['reason'], 'Unregistered')

    def test_invalid_payload_and_wrong_app_cannot_send(self):
        def unexpected(_):
            self.fail('Must not send')
        with self.assertRaises(ValueError):
            self.send(unexpected, body='x' * 5000)
        record = json.loads(self.registration.read_text())
        record['topic'] = 'other.app'
        self.registration.write_text(json.dumps(record))
        with self.assertRaises(ValueError):
            self.send(unexpected)

    def test_network_errors_do_not_expose_token_or_jwt(self):
        def handler(request):
            raise httpx.ConnectError('Private URL ' + str(request.url), request=request)
        with self.assertRaises(RuntimeError) as captured:
            self.send(handler)
        self.assertNotIn('A1' * 32, str(captured.exception))
        self.assertNotIn('/3/device', str(captured.exception))

    def test_http1_is_not_accepted(self):
        with self.assertRaises(RuntimeError):
            self.send(lambda _: httpx.Response(200, extensions={'http_version': b'HTTP/1.1'}))


if __name__ == '__main__':
    unittest.main()
