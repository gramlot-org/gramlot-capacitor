"""Operator-only APNs sandbox sender and one anonymous PoC device slot.

Only register_token is exposed through the Gramlot page endpoint. Sending requires
local container access; credentials are never returned through HTTP or stored in Data.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import tempfile
import time
import uuid

TOPIC = 'dev.gramlot.capacitor.poc'
ENVIRONMENT = 'development'
REGISTRATION = Path('/var/lib/kajenn/push/device.json')
CONFIG = Path('/run/gramlot-apns/config.json')
KEY = Path('/run/gramlot-apns/AuthKey.p8')
APNS = 'https://api.sandbox.push.apple.com'


def validate_token(token):
    if not isinstance(token, str) or not re.fullmatch(r'[0-9a-fA-F]{2,512}', token) or len(token) % 2:
        raise ValueError('Invalid APNs device token')
    return token


def register_token(token, *, path=REGISTRATION):
    """Replace the dedicated test-device slot atomically; never return the token."""
    validate_token(token)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    record = dict(token=token, topic=TOPIC, environment=ENVIRONMENT, updatedAt=int(time.time()))
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix='.registration-')
    try:
        with os.fdopen(descriptor, 'w') as stream:
            json.dump(record, stream)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return dict(registered=True, topic=TOPIC, environment=ENVIRONMENT)


def send_push(title, body, *, registration=REGISTRATION, config=CONFIG, key=KEY, client=None):
    """Send a single visible alert to the current PoC device. No public send route."""
    import httpx
    import jwt

    if not isinstance(title, str) or not title.strip() or not isinstance(body, str) or not body.strip():
        raise ValueError('Push title and body must be nonempty strings')
    settings = json.loads(config.read_text())
    if set(settings) != {'keyId', 'teamId'} or any(not re.fullmatch(r'[A-Z0-9]{10}', settings[k]) for k in settings):
        raise ValueError('Invalid APNs key/team configuration')
    record = json.loads(registration.read_text())
    if record['topic'] != TOPIC or record['environment'] != ENVIRONMENT:
        raise ValueError('Registration does not belong to this sandbox app')
    token = validate_token(record['token'])
    message_id = str(uuid.uuid4())
    payload = {'aps': {'alert': {'title': title, 'body': body}, 'sound': 'default'},
               'messageId': message_id, 'destination': 'device'}
    content = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode()
    if len(content) > 4096:
        raise ValueError('APNs alert payload exceeds 4096 bytes')
    authorization = jwt.encode({'iss': settings['teamId'], 'iat': int(time.time())},
                               key.read_bytes(), algorithm='ES256', headers={'kid': settings['keyId']})
    headers = {'authorization': 'bearer ' + authorization, 'apns-topic': TOPIC,
               'apns-push-type': 'alert', 'apns-priority': '10', 'apns-expiration': '0',
               'apns-id': message_id, 'content-type': 'application/json'}
    owned = client is None
    if owned:
        client = httpx.Client(http2=True, timeout=20)
    try:
        try:
            response = client.post(APNS + '/3/device/' + token, headers=headers, content=content)
        except httpx.RequestError:
            raise RuntimeError('APNs network request failed; device token and authorization omitted') from None
        if response.http_version != 'HTTP/2':
            raise RuntimeError('APNs requires HTTP/2')
        if response.status_code != 200:
            reason = response.json().get('reason', 'UnknownReason')
            # APNs reasons are identifiers, never echo arbitrary response content or request URLs.
            if not isinstance(reason, str) or not re.fullmatch(r'[A-Za-z0-9]+', reason):
                reason = 'UnknownReason'
            return {'accepted': False, 'status': response.status_code, 'reason': reason, 'messageId': message_id}
        return {'accepted': True, 'status': 200, 'messageId': message_id, 'destination': 'device'}
    finally:
        if owned:
            client.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('status')
    send = commands.add_parser('send')
    send.add_argument('--title', required=True)
    send.add_argument('--body', required=True)
    args = parser.parse_args()
    if args.command == 'status':
        print(json.dumps({'registered': REGISTRATION.is_file(), 'configured': CONFIG.is_file() and KEY.is_file(),
                          'topic': TOPIC, 'environment': ENVIRONMENT}))
        return
    try:
        result = send_push(args.title, args.body)
    except (OSError, ValueError, RuntimeError):
        # Never print a traceback containing credentials, a token or a request URL.
        print(json.dumps({'accepted': False, 'error': 'Check server APNs configuration and registration'}))
        raise SystemExit(1) from None
    print(json.dumps(result))
    if not result['accepted']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
