"""The beta profile must never select the developer's local service."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('prepare_beta', ROOT / 'scripts/prepare-testflight.py')
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)

class BetaProfileTests(unittest.TestCase):
    def setUp(self):
        self.profile = json.loads(prepare.PROFILE.read_text())

    def test_approved_public_target(self):
        prepare.validate(self.profile)

    def test_local_or_other_origins_are_rejected(self):
        for url in ('https://192.168.5.115:8443/', 'http://gallery-py.gramlot.dev/',
                    'https://gallery-py.gramlot.dev:8443/', 'https://example.org/',
                    'https://user:password@gallery-py.gramlot.dev/'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                prepare.validate({**self.profile, 'galleryUrl': url})

    def test_local_probe_is_rejected(self):
        with self.assertRaises(ValueError):
            prepare.validate({**self.profile, 'deviceProbeUrl': 'https://192.168.5.115:8443/device/'})

    def test_sandbox_push_is_rejected(self):
        with self.assertRaises(ValueError):
            prepare.validate({**self.profile, 'apnsEnvironment': 'development'})

if __name__ == '__main__':
    unittest.main()
