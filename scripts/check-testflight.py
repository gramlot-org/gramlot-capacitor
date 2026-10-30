"""Check the staged application target; this is not App Store validation."""
import json
from pathlib import Path
import plistlib
import re
ROOT=Path(__file__).resolve().parents[1]

def check(project):
    config=json.loads((project/'capacitor.config.json').read_text())
    assert config['server']=={'cleartext':False,'allowNavigation':['gallery-py.gramlot.dev'],'appStartPath':'/index.html'}
    assert config['ios']['webContentsDebuggingEnabled'] is False
    assert config['appName'] == 'Gramlot'
    app=project/'ios/App/App'
    assert plistlib.loads((app/'Info.plist').read_bytes())['CFBundleDisplayName'] == 'Gramlot'
    assert plistlib.loads((app/'Info.plist').read_bytes())['ITSAppUsesNonExemptEncryption'] is False
    manifest=plistlib.loads((app/'PrivacyInfo.xcprivacy').read_bytes())
    reasons={item['NSPrivacyAccessedAPIType']:item['NSPrivacyAccessedAPITypeReasons'] for item in manifest['NSPrivacyAccessedAPITypes']}
    assert reasons == {'NSPrivacyAccessedAPICategoryUserDefaults':['CA92.1'], 'NSPrivacyAccessedAPICategoryFileTimestamp':['C617.1']}
    assert plistlib.loads((app/'App.entitlements').read_bytes())['aps-environment']=='production'
    assert 'NSLocalNetworkUsageDescription' not in plistlib.loads((app/'Info.plist').read_bytes())
    options=plistlib.loads((project/'ExportOptions.plist').read_bytes())
    assert options['destination']=='export' and options['testFlightInternalTestingOnly'] is True
    for folder in (project/'www',app/'public'):
        for name in ('target.js','logic.js','source.js'):
            text=(folder/name).read_text()
            assert not re.search(r'https?://(?:192\.168\.|127\.|localhost|10\.|172\.(?:1[6-9]|2\d|3[01])\.)',text),name
        assert 'Prove dispositivi sul Mac' not in (folder/'source.js').read_text()
        assert '"deviceProbeUrl": null' in (folder/'target.js').read_text()
    native=json.loads((app/'capacitor.config.json').read_text())
    assert native['server']==config['server']
    assert native['ios']['webContentsDebuggingEnabled'] is False
    print('Beta checks passed: public-only navigation, embedded entry, production APNs, internal-only local export.')

if __name__=='__main__':
    project=Path(json.loads((ROOT/'.local/testflight/current.json').read_text())['project'])
    check(project)
