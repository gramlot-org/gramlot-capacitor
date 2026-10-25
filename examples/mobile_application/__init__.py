"""Independently hosted mobile examples; no gallery or server dependency."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
PAGES = ROOT / "pages"
ASSETS = ROOT / "assets"
CATALOG = json.loads((ROOT / "catalog.json").read_text())
