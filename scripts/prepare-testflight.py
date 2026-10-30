"""Prepare an isolated, public-only internal TestFlight project. Never uploads or signs."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import subprocess
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'config/testflight/internal.json'

def validate(profile):
    if profile['distribution'] != 'testflight-internal' or profile['apnsEnvironment'] != 'production':
        raise ValueError('Expected internal TestFlight with production APNs')
    if profile['deviceProbeUrl'] is not None:
        raise ValueError('Beta must not depend on a local device-probe site')
    if not re.fullmatch(r'[1-9][0-9]*', profile['build']):
        raise ValueError('Build must be a positive integer')
    if not re.fullmatch(r'[0-9]+\.[0-9]+(?:\.[0-9]+)?', profile['version']):
        raise ValueError('Invalid version')
    for key in ('galleryUrl','exampleUrl'):
        u=urlparse(profile[key])
        if u.scheme!='https' or u.hostname!='gallery-py.gramlot.dev' or u.port is not None or u.username or u.password or u.query or u.fragment:
            raise ValueError('Only the approved public HTTPS gallery is allowed')
    if profile['appId'] != 'dev.gramlot.capacitor.poc':
        raise ValueError('This preparation preserves the existing app identity')

def prepare(output, modules):
    profile=json.loads(PROFILE.read_text());validate(profile)
    output=output.resolve()
    if not output.is_relative_to(ROOT/'.local/testflight'):
        raise ValueError('The isolated output must remain under .local/testflight')
    if output.exists():
        raise FileExistsError('Output already exists; choose a fresh --output directory')
    core=Path((ROOT/'.local/core-path').read_text().strip())
    node=Path((ROOT/'.local/node/runtime-path').read_text().strip())/'bin/node'
    if not (modules/'sharp/package.json').is_file():
        raise FileNotFoundError('Set GRAMLOT_ASSET_NODE_MODULES to the asset renderer node_modules directory')
    output.mkdir(parents=True)
    shutil.copytree(ROOT/'ios',output/'ios',ignore=shutil.ignore_patterns('xcuserdata','DerivedData','build','public','*.p8','*.p12','*.mobileprovision'))
    shutil.copy2(ROOT/'package.json',output/'package.json')
    (output/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
    config=json.loads((ROOT/'capacitor.config.json').read_text())
    config.update(appId=profile['appId'],appName=profile['appName'],webDir='www')
    config['server']={'cleartext':False,'allowNavigation':['gallery-py.gramlot.dev'],'appStartPath':'/index.html'}
    config['ios']={'webContentsDebuggingEnabled':False}
    (output/'capacitor.config.json').write_text(json.dumps(config,indent=2)+'\n')
    web=output/'www';web.mkdir()
    for name in ('index.html','entry.js','logic.js','entry.css'):
        shutil.copy2(ROOT/'shell'/name,web/name)
    target={k:profile[k] for k in ('galleryUrl','exampleUrl','deviceProbeUrl')}
    (web/'target.js').write_text('export const target = '+json.dumps(target)+';\n')
    source_code="import json,runpy,sys; print(json.dumps(runpy.run_path(sys.argv[1])['source'](include_device_probe=False)))"
    env={**os.environ,'PYTHONPATH':str(core/'src')}
    source=subprocess.check_output([str(core/'.venv/bin/python'),'-c',source_code,str(ROOT/'shell/source.py')],env=env,text=True).strip()
    (web/'source.js').write_text('export const source = '+source+';\n')
    shutil.copy2(core/'js/dist/gramlot.min.js',web/'gramlot.js')
    shutil.copy2(ROOT/'examples/mobile_application/assets/device-provider.js',web/'device-provider.js')
    app=output/'ios/App/App'
    info=plistlib.loads((app/'Info.plist').read_bytes())
    info['CFBundleDisplayName']=profile['appName']
    info['ITSAppUsesNonExemptEncryption']=False
    info.pop('NSLocalNetworkUsageDescription',None)
    info.pop('CAPACITOR_DEBUG',None)
    (app/'Info.plist').write_bytes(plistlib.dumps(info,sort_keys=False))
    entitlements=plistlib.loads((app/'App.entitlements').read_bytes())
    entitlements['aps-environment']='production'
    (app/'App.entitlements').write_bytes(plistlib.dumps(entitlements,sort_keys=False))
    project=output/'ios/App/App.xcodeproj/project.pbxproj'
    text=project.read_text()
    text=re.sub(r'CURRENT_PROJECT_VERSION = [^;]+;',f"CURRENT_PROJECT_VERSION = {profile['build']};",text)
    text=re.sub(r'MARKETING_VERSION = [^;]+;',f"MARKETING_VERSION = {profile['version']};",text)
    project.write_text(text)
    icon=app/'Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
    subprocess.run([str(node),str(ROOT/'scripts/render-testflight-icon.mjs'),str(modules),str(core/'assets/branding/icons/app-icon.svg'),str(icon)],check=True)
    shutil.copy2(ROOT/'config/testflight/ExportOptions.plist',output/'ExportOptions.plist')
    with (output/'capacitor-sync.log').open('w') as log:
        subprocess.run([str(node),str(ROOT/'node_modules/@capacitor/cli/bin/capacitor'),'sync','ios'],cwd=output,stdout=log,stderr=subprocess.STDOUT,check=True,env={**os.environ,'PATH':str(node.parent)+os.pathsep+os.environ['PATH']})
    receipt={'profile':profile,'signed':False,'uploaded':False,'iconSource':'Gramlot assets/branding/icons/app-icon.svg','iconSha256':hashlib.sha256(icon.read_bytes()).hexdigest()}
    (output/'preparation.json').write_text(json.dumps(receipt,indent=2)+'\n')
    (ROOT/'.local/testflight/current.json').write_text(json.dumps({'project':str(output)})+'\n')
    print('Prepared isolated TestFlight project:',output)
    print('Production APNs entitlement; public gallery only; no signing or upload performed.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'.local/testflight/build-2')
    parser.add_argument('--asset-modules',type=Path,default=os.environ.get('GRAMLOT_ASSET_NODE_MODULES'))
    args=parser.parse_args()
    if args.asset_modules is None:parser.error('Provide --asset-modules or GRAMLOT_ASSET_NODE_MODULES')
    prepare(args.output,args.asset_modules)
