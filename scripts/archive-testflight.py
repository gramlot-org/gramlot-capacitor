"""Compile a local unsigned Release archive. No portal changes, export or upload."""
import json
from pathlib import Path
import subprocess
from importlib.util import spec_from_file_location,module_from_spec
ROOT=Path(__file__).resolve().parents[1]
spec=spec_from_file_location('beta_check',ROOT/'scripts/check-testflight.py');module=module_from_spec(spec);spec.loader.exec_module(module)
project=Path(json.loads((ROOT/'.local/testflight/current.json').read_text())['project'])
module.check(project)
archive=project/'App-unsigned.xcarchive'
if archive.exists():raise FileExistsError('The archive already exists; prepare a fresh output before rebuilding')
with (project/'archive.log').open('w') as log:
    result=subprocess.run(['xcodebuild','-project',str(project/'ios/App/App.xcodeproj'),'-scheme','App','-configuration','Release','-destination','generic/platform=iOS','-archivePath',str(archive),'-derivedDataPath',str(project/'DerivedData'),'CODE_SIGNING_ALLOWED=NO','CODE_SIGNING_REQUIRED=NO','CODE_SIGN_IDENTITY=','archive'],stdout=log,stderr=subprocess.STDOUT)
print('Unsigned Release archive:', 'success' if result.returncode==0 else 'failed; inspect archive.log')
raise SystemExit(result.returncode)
