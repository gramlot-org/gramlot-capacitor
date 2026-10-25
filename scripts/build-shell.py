"""Package existing Gramlot runtime plus Python-authored embedded Source."""
import importlib.util
import json
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
core = Path((root / '.local/core-path').read_text().strip())
spec = importlib.util.spec_from_file_location('shell_source', root / 'shell/source.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
output = root / 'www'
output.mkdir(exist_ok=True)
for name in ('index.html', 'entry.js', 'logic.js', 'target.js', 'entry.css'):
    shutil.copy2(root / 'shell' / name, output / name)
shutil.copy2(core / 'js/dist/gramlot.min.js', output / 'gramlot.js')
shutil.copy2(root / 'examples/mobile_application/assets/device-provider.js', output / 'device-provider.js')
(output / 'source.js').write_text('export const source = ' + json.dumps(module.source()) + ';\n')
print('Packaged Python-authored app entry.')
