"""Portable mobile module contract; no host, native hardware or APNs credentials."""
import importlib.util
from importlib.resources import files
import json
import sys
import unittest
from urllib.parse import urljoin
from gramlot import GramlotBuilder
from mobile_application import CATALOG, PAGES, ASSETS
from mobile_application.page import DevicePage

class MobileModuleTests(unittest.TestCase):
    def test_catalogue_and_pages_are_independent_of_mount_and_private_host(self):
        self.assertNotIn('push_service', sys.modules)
        self.assertEqual(CATALOG['title'], 'Mobile application')
        self.assertEqual(CATALOG['visibility'], 'native')
        entries=CATALOG['entries']
        self.assertEqual(len(entries), len({e['id'] for e in entries}))
        grammars=[json.loads(files('gramlot').joinpath('collections',name+'.json').read_text()) for name in ('inputs','layout')]
        for entry in entries:
            with self.subTest(page=entry['id']):
                self.assertEqual(entry['path'],entry['id'])
                self.assertTrue((PAGES/(entry['path']+'.js')).is_file())
                spec=importlib.util.spec_from_file_location('mobile_probe_'+entry['id'],PAGES/(entry['path']+'.py'))
                module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
                b=GramlotBuilder(collections=grammars);module.Page().main(b.root)
                wire=b.to_tytx()
                self.assertNotIn('/device/',wire)
                for prefix in ('/device/','/mobile-application/'):
                    self.assertEqual(urljoin('https://example.test'+prefix,entry['path']), 'https://example.test'+prefix+entry['path'])
    def test_push_backend_is_explicit_and_not_imported_by_pages(self):
        page=DevicePage()
        with self.assertRaisesRegex(RuntimeError,'not configured'):
            page.pushRegister('synthetic-test-token')
        received=[]
        page.push_register=lambda token: received.append(token) or {'registered':True}
        self.assertTrue(page.pushRegister('synthetic-test-token').get_item('registered'))
        self.assertEqual(received,['synthetic-test-token'])
    def test_companions_and_synthetic_resources_are_local(self):
        for file in PAGES.glob('*.js'):
            text=file.read_text()
            self.assertNotIn("'/device/",text)
            self.assertNotIn('192.168.',text)
        self.assertTrue((ASSETS/'barcode-test.png').is_file())
        self.assertTrue((ASSETS/'barcode-test-code128.png').is_file())

if __name__=='__main__': unittest.main()
