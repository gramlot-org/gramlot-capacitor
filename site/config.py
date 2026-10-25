"""Dedicated Gramlot gallery on the reusable Kajenn/Caddy LAN environment."""
from pathlib import Path

from genro_bag.resolvers import EnvResolver
from kajenn.config.templates import DefaultConfiguration
from gramlot_py_server.gallery import environment_catalogs, examples_package, stage
from gramlot_py_server.kajenn import Application
from mobile_application import PAGES, ASSETS, ROOT
from mobile_application.page import DevicePage
from push_service import register_token


class ServerConfiguration(DefaultConfiguration):
    site_home = "/var/lib/kajenn/site"

    def server_section(self, cfg):
        cfg.server(host="0.0.0.0", port=8080,
                   external_url=EnvResolver("KAJENN_EXTERNAL_URL"))

    def applications_section(self, cfg):
        DevicePage.push_register = staticmethod(register_token)
        apps = cfg.applications()
        pages = Path("/var/lib/kajenn/gallery")
        pages.mkdir(parents=True, exist_ok=True)
        assets = stage(pages, environment_catalogs("kajenn"), "/gallery")
        apps.application(
            code="gallery", mount="gallery", app_class=Application,
            pages=pages, assets=assets,
            collections=examples_package().build_gallery()["collections"],
        ).request(body="raw")

        apps.application(
            code="device", mount="device", app_class=Application,
            pages=PAGES,
            assets={
                **assets,
                "/catalog.json": {"file": ROOT / "catalog.json", "type": "application/json"},
                "/barcode-test-code128.png": {"file": ASSETS / "barcode-test-code128.png", "type": "image/png"},
                "/barcode-test.png": {"file": ASSETS / "barcode-test.png", "type": "image/png"},
                "/device-provider.js": {"file": ASSETS / "device-provider.js", "type": "text/javascript"},
                "/source.py": {"file": PAGES / "index.py", "type": "text/plain; charset=utf-8"},
            },
            collections=examples_package().build_gallery()["collections"],
        ).request(body="raw")
