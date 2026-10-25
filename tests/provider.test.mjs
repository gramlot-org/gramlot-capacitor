import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
let native=true, permission='granted', reads=0, checks=0, requests=0, watches=0, clears=0, callback;
let check, read;
let cameraPermission='granted', cameraCheck, cameraShot, shots=0, cameraRequests=0;
let galleryPick, galleryPicks=0;
const galleryPhoto={type:0,webPath:'capacitor://localhost/_capacitor_file_/selected.png',uri:'private-path',thumbnail:'private-thumbnail',metadata:{format:'png',exif:'private-exif'}};
let biometryCheck, authenticate, biometricChecks=0, authentications=0, biometricPlugin=true;
let notificationPermission='granted', notificationCheck, notificationSchedule, listenerSetup;
let notificationChecks=0, notificationRequests=0, schedules=0, removed=[], notificationCallbacks=new Map();
let pushPermission='granted',pushCheck,pushStart,pushListenerSetup,pushCallbacks=new Map(),pushRemoved=[],pushRequests=0,pushRegistrations=0;
const position={coords:{latitude:45,longitude:9,accuracy:20,altitude:0},timestamp:123};
let barcodeScan, barcodeScans=0;
let shortcutCallback, shortcutTake, shortcutSetup, shortcutRemoves=0;
let linkCallback,linkTake,linkRemoves=0;
const links={addListener:async(name,cb)=>{assert.equal(name,'requestAvailable');linkCallback=cb;return {remove:async()=>{linkRemoves++;}};},takePending:async()=>linkTake?linkTake():{request:null}};
const shortcuts={addListener:async(name,cb)=>{assert.equal(name,'requestAvailable');shortcutCallback=cb;if(shortcutSetup)await shortcutSetup();return {remove:async()=>{shortcutRemoves++;}};},takePending:async()=>shortcutTake?shortcutTake():{request:null}};
mock.module('@capacitor/core',{namedExports:{registerPlugin:name=>{if(name==='GramlotMotion'||name==='GramlotSQLite')return {};if(name==='GramlotLinks')return links;assert.equal(name,'GramlotShortcuts');return shortcuts;},Capacitor:{convertFileSrc:path=>'capacitor://localhost/_capacitor_file_'+path,isNativePlatform:()=>native,isPluginAvailable:name=>name==='Clipboard'?clipboardPlugin:name==='BiometricAuthNative'?biometricPlugin:name==='Share'?sharePlugin:true}}});
let stateCallbacks=new Map(), stateRemovals=[], stateSetup, stateRemoval, networkRead, appRead, impactCall, impacts=[], vibrationCall, vibrations=[];
const stateListener=async(name,cb)=>{stateCallbacks.set(name,cb);if(stateSetup)await stateSetup(name);return {remove:async()=>{stateRemovals.push(name);if(stateRemoval)await stateRemoval(name);}};};
let clipboardValue={type:'text/plain',value:'GRAMLOT-CLIPBOARD-001'},clipboardRead,clipboardWrite,clipboardReads=0,clipboardWrites=[],clipboardPlugin=true;
mock.module('@capacitor/clipboard',{namedExports:{Clipboard:{
 read:async()=>{clipboardReads++;return clipboardRead?clipboardRead():clipboardValue;},
 write:async options=>{clipboardWrites.push(options);if(clipboardWrite)await clipboardWrite();}
}}});
let shareCall,shareCalls=[],sharePlugin=true;
mock.module('@capacitor/share',{namedExports:{Share:{share:async options=>{shareCalls.push(options);return shareCall?shareCall():{activityType:'save-to-files'};}}}});
let audioPermission=true,audioStart,audioStop,audioDelete,audioPermissionRequest,audioSetup,audioStarts=0,audioStops=0,audioDeletes=[],audioCallbacks=new Map(),audioRemovals=[];
const recordedAudio={value:{uri:'/cache/gramlot-audio/test.m4a',msDuration:1250,mimeType:'audio/mp4'}};
mock.module('@independo/capacitor-voice-recorder',{namedExports:{VoiceRecorder:{
 hasAudioRecordingPermission:async()=>({value:audioPermission}),
 requestAudioRecordingPermission:async()=>audioPermissionRequest?audioPermissionRequest():{value:true},
 startRecording:async options=>{assert.deepEqual(options,{directory:'CACHE',subDirectory:'gramlot-audio'});audioStarts++;return audioStart?audioStart():{value:true};},
 stopRecording:async()=>{audioStops++;return audioStop?audioStop():recordedAudio;},
 addListener:async(name,cb)=>{audioCallbacks.set(name,cb);if(audioSetup)await audioSetup();return {remove:async()=>{audioRemovals.push(name);}};}
}}});
mock.module('@capacitor/filesystem',{namedExports:{Directory:{Cache:'CACHE'},Filesystem:{deleteFile:async options=>{audioDeletes.push(options.path);if(audioDelete)await audioDelete();}}}});
mock.module('@capacitor/app',{namedExports:{App:{getInfo:async()=>({id:'test',name:'Test',version:'1',build:'2'}),
 getState:async()=>appRead?appRead():{isActive:true},addListener:stateListener}}});
mock.module('@capacitor/network',{namedExports:{Network:{getStatus:async()=>networkRead?networkRead():{connected:true,connectionType:'wifi'},addListener:stateListener}}});
mock.module('@capacitor/haptics',{namedExports:{ImpactStyle:{Light:'LIGHT',Medium:'MEDIUM',Heavy:'HEAVY'},Haptics:{vibrate:async options=>{vibrations.push(options);if(vibrationCall)await vibrationCall();},impact:async options=>{impacts.push(options);if(impactCall)await impactCall();}}}});
mock.module('@capacitor/geolocation',{namedExports:{Geolocation:{
 checkPermissions:async()=>{checks++; return check ? check() : {location:permission};},
 requestPermissions:async()=>{requests++; return {location:'granted'};},
 getCurrentPosition:async()=>{reads++; return read ? read() : position;},
 watchPosition:async(options,cb)=>{watches++; callback=cb; return 'watch-test';},
 clearWatch:async({id})=>{assert.equal(id,'watch-test'); clears++;}
}}});
mock.module('@capacitor/camera',{namedExports:{EncodingType:{JPEG:'jpeg'},MediaType:{Photo:0},MediaTypeSelection:{Photo:0},Camera:{
 chooseFromGallery:async options=>{galleryPicks++;assert.deepEqual(options,{mediaType:0,allowMultipleSelection:false,editable:'no',quality:85,includeMetadata:true});return galleryPick?galleryPick():{results:[galleryPhoto]};},
 checkPermissions:async()=>cameraCheck?cameraCheck():{camera:cameraPermission},
 requestPermissions:async(options)=>{assert.deepEqual(options,{permissions:['camera']});cameraRequests++;return {camera:'granted'};},
 takePhoto:async(options)=>{shots++;assert.deepEqual(options,{encodingType:'jpeg',quality:85,saveToGallery:false,includeMetadata:false});
  return cameraShot?cameraShot():{webPath:'capacitor://localhost/_capacitor_file_/test.jpg',thumbnail:'not-exposed',uri:'private-file',metadata:{exif:'not-exposed'}};}
}}});
mock.module('@aparajita/capacitor-biometric-auth',{namedExports:{BiometricAuth:{
 checkBiometry:async()=>{biometricChecks++;return biometryCheck?biometryCheck():{isAvailable:true,code:'',reason:''};},
 authenticate:async(options)=>{authentications++;assert.equal(options.allowDeviceCredential,false);assert.equal(options.iosFallbackTitle,'');
  assert.equal(options.cancelTitle,'Cancel');assert.ok(options.reason.length>0);if(authenticate)await authenticate();}
}}});
mock.module('@capacitor/local-notifications',{namedExports:{LocalNotifications:{
 checkPermissions:async()=>{notificationChecks++;return notificationCheck?notificationCheck():{display:notificationPermission};},
 requestPermissions:async()=>{notificationRequests++;return {display:'granted'};},
 schedule:async(options)=>{schedules++;return notificationSchedule?notificationSchedule(options):{notifications:options.notifications.map(n=>({id:n.id}))};},
 addListener:async(name,callback)=>{notificationCallbacks.set(name,callback);if(listenerSetup)await listenerSetup(name);
  return {remove:async()=>{removed.push(name);}};}
}}});
mock.module('@capacitor/push-notifications',{namedExports:{PushNotifications:{
 checkPermissions:async()=>pushCheck?pushCheck():{receive:pushPermission},
 requestPermissions:async()=>{pushRequests++;return {receive:'granted'};},
 register:async()=>{pushRegistrations++;if(pushStart)await pushStart();},
 addListener:async(name,callback)=>{pushCallbacks.set(name,callback);if(pushListenerSetup)await pushListenerSetup(name);return {remove:async()=>{pushRemoved.push(name);}};}
}}});
mock.module('@capacitor/barcode-scanner',{namedExports:{
 CapacitorBarcodeScannerTypeHint:{0:'QR_CODE',5:'CODE_128',9:'EAN_13',ALL:17},
 CapacitorBarcodeScanner:{scanBarcode:async options=>{barcodeScans++;assert.equal(options.hint,17);assert.equal(options.scanButton,false);return barcodeScan?barcodeScan(options):{ScanResult:'GRAMLOT-POC-QR-001',format:0};}}
}});
const {CapacitorDeviceProvider}=await import('../src/capacitor-device-provider.js');
test.beforeEach(()=>{linkCallback=linkTake=null;linkRemoves=0;galleryPick=null;galleryPicks=0;clipboardValue={type:'text/plain',value:'GRAMLOT-CLIPBOARD-001'};clipboardRead=clipboardWrite=null;clipboardReads=0;clipboardWrites=[];clipboardPlugin=true;shareCall=null;shareCalls=[];sharePlugin=true;audioPermission=true;audioStart=audioStop=audioDelete=audioPermissionRequest=audioSetup=null;audioStarts=audioStops=0;audioDeletes=[];audioCallbacks=new Map();audioRemovals=[];vibrationCall=null;vibrations=[];stateCallbacks=new Map();stateRemovals=[];stateSetup=stateRemoval=networkRead=appRead=impactCall=null;impacts=[];barcodeScan=null;barcodeScans=0;shortcutCallback=shortcutTake=shortcutSetup=null;shortcutRemoves=0;pushPermission='granted';pushCheck=pushStart=pushListenerSetup=null;pushCallbacks=new Map();pushRemoved=[];pushRequests=pushRegistrations=0;notificationPermission='granted';notificationCheck=notificationSchedule=listenerSetup=null;notificationChecks=notificationRequests=schedules=0;removed=[];notificationCallbacks=new Map();biometryCheck=authenticate=null;biometricChecks=authentications=0;biometricPlugin=true;cameraPermission='granted';cameraCheck=cameraShot=null;shots=cameraRequests=0;native=true;permission='granted';reads=checks=requests=watches=clears=0;check=read=null;});

test('native capabilities and provider-independent app/position fields',async()=>{
 const p=new CapacitorDeviceProvider(); assert.deepEqual(p.capabilities,['database','orientation','gyroscope','accelerometer','clipboard','appinfo','lifecycle','audio','network','haptics','location','camera','biometrics','notifications','push','shortcuts','links','barcode']);
 assert.deepEqual(await p.readAppInfo(),{id:'test',name:'Test',version:'1',build:'2'});
 assert.deepEqual(await p.readLocation(),{latitude:45,longitude:9,accuracy:20,timestamp:123});
 assert.equal(requests,0);
});
test('browser advertises no native capabilities',()=>{native=false;assert.deepEqual(new CapacitorDeviceProvider().capabilities,[]);});
test('permission request is explicit when necessary; denial does not invoke location',async()=>{
 permission='prompt'; await new CapacitorDeviceProvider().readLocation(); assert.equal(requests,1);
 permission='denied'; await assert.rejects(new CapacitorDeviceProvider().readLocation(),{code:'PERMISSION_DENIED'});
 assert.equal(reads,1);
});
test('concurrent reads share a pending permission check',async()=>{
 let resolve;check=()=>new Promise(r=>{resolve=r;}); const p=new CapacitorDeviceProvider();
 const a=p.readLocation(),b=p.readLocation(); assert.equal(checks,1);
 resolve({location:'granted'}); await Promise.all([a,b]); assert.equal(reads,2);
});
test('disabling during permission acquisition does not register a listener',async()=>{
 let resolve;check=()=>new Promise(r=>{resolve=r;}); const c=new AbortController();
 const start=new CapacitorDeviceProvider().startLocationUpdates(()=>assert.fail('unexpected event'),c.signal);
 c.abort();resolve({location:'granted'});await assert.rejects(start,{code:'CANCELLED'});assert.equal(watches,0);
});
test('watch maps samples/errors, ignores aborted callbacks and releases handle once',async()=>{
 const events=[];const c=new AbortController();const p=new CapacitorDeviceProvider();
 const stop=await p.startLocationUpdates((value,error)=>events.push({value,error}),c.signal);
 callback(position,null); callback(null,{code:'OS-PLUG-GLOC-0010',message:'Timed out'});
 assert.equal(events[0].value.timestamp,123);assert.equal(events[1].error.code,'TIMEOUT');
 c.abort();callback(position,null);assert.equal(events.length,2);await stop();await stop();assert.equal(clears,1);
});
test('native service errors map to the common error vocabulary',async()=>{
 read=()=>{throw {code:'OS-PLUG-GLOC-0007',message:'Location services disabled'};};
 await assert.rejects(new CapacitorDeviceProvider().readLocation(),{code:'UNAVAILABLE'});
});


test('camera captures JPEG without gallery storage and exposes only preview fields',async()=>{
 const result=await new CapacitorDeviceProvider().takePhoto(new AbortController().signal);
 assert.deepEqual(result,{url:'capacitor://localhost/_capacitor_file_/test.jpg',format:'jpeg'});
 assert.equal(shots,1);assert.equal(cameraRequests,0);
});
test('camera prompts only for camera permission and denial prevents capture',async()=>{
 cameraPermission='prompt';await new CapacitorDeviceProvider().takePhoto(new AbortController().signal);
 assert.equal(cameraRequests,1);cameraPermission='denied';
 await assert.rejects(new CapacitorDeviceProvider().takePhoto(new AbortController().signal),{code:'PERMISSION_DENIED'});
 assert.equal(shots,1);
});
test('camera maps structured native cancellation, denial and missing hardware',async()=>{
 for(const [nativeCode,code] of [['OS-PLUG-CAMR-0006','CANCELLED'],['OS-PLUG-CAMR-0003','PERMISSION_DENIED'],['OS-PLUG-CAMR-0007','UNAVAILABLE'],['OS-PLUG-CAMR-0010','FAILED']]){
  cameraShot=()=>{throw {code:nativeCode,message:'Synthetic outcome'};};
  await assert.rejects(new CapacitorDeviceProvider().takePhoto(new AbortController().signal),{code});
 }
});
test('page closure during a camera permission check prevents prompt and capture',async()=>{
 let resolve;cameraCheck=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().takePhoto(c.signal);c.abort();resolve({camera:'prompt'});
 await assert.rejects(pending,{code:'CANCELLED'});assert.equal(cameraRequests,0);assert.equal(shots,0);
});
test('camera rejects missing preview path rather than inventing a media fallback',async()=>{
 cameraShot=()=>({uri:'private-file',thumbnail:'not-a-preview-path'});
 await assert.rejects(new CapacitorDeviceProvider().takePhoto(new AbortController().signal),{code:'FAILED'});
});


test('native biometric verification checks availability and uses biometrics without passcode fallback',async()=>{
 const p=new CapacitorDeviceProvider();assert.equal(authentications,0);assert.equal(biometricChecks,0);
 assert.equal(await p.verifyBiometrics(new AbortController().signal),undefined);
 assert.equal(biometricChecks,1);assert.equal(authentications,1);
});
test('biometric web simulation is unreachable, even through a direct provider call',async()=>{
 native=false;const p=new CapacitorDeviceProvider();
 await assert.rejects(p.verifyBiometrics(new AbortController().signal),{code:'UNAVAILABLE'});
 assert.equal(biometricChecks,0);assert.equal(authentications,0);
 native=true;biometricPlugin=false;const missing=new CapacitorDeviceProvider();
 assert.equal(missing.capabilities.includes('biometrics'),false);
 await assert.rejects(missing.verifyBiometrics(new AbortController().signal),{code:'UNAVAILABLE'});
 assert.equal(biometricChecks,0);assert.equal(authentications,0);
});
test('unenrolled, unavailable and locked biometrics never start verification',async()=>{
 for(const code of ['biometryNotEnrolled','biometryNotAvailable','biometryLockout']){
  biometryCheck=()=>({isAvailable:false,code,reason:'Synthetic availability result'});
  await assert.rejects(new CapacitorDeviceProvider().verifyBiometrics(new AbortController().signal),{code:'UNAVAILABLE'});
 }
 assert.equal(authentications,0);
});
test('native biometric cancellations are distinct from failed recognition',async()=>{
 for(const [nativeCode,code] of [['userCancel','CANCELLED'],['appCancel','CANCELLED'],['systemCancel','CANCELLED'],['userFallback','CANCELLED'],['authenticationFailed','FAILED'],['invalidContext','FAILED']]){
  authenticate=()=>{throw {code:nativeCode,message:'Synthetic verification outcome'};};
  await assert.rejects(new CapacitorDeviceProvider().verifyBiometrics(new AbortController().signal),{code});
 }
});
test('closing during biometric availability check prevents the native prompt',async()=>{
 let resolve;biometryCheck=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().verifyBiometrics(c.signal);c.abort();resolve({isAvailable:true});
 await assert.rejects(pending,{code:'CANCELLED'});assert.equal(authentications,0);
});
test('late biometric success after page closure is rejected as cancelled',async()=>{
 let resolve;authenticate=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().verifyBiometrics(c.signal);
 for(let i=0;i<10;i++)await Promise.resolve();
 assert.equal(authentications,1);c.abort();resolve();await assert.rejects(pending,{code:'CANCELLED'});
});


const notice={id:7,title:'Synthetic title',body:'Synthetic body',delay:5};
test('notification scheduling checks permission and returns only acknowledged id and native time',async()=>{
 const start=Date.now();let sent;
 notificationSchedule=options=>{sent=options.notifications[0];return {notifications:[{id:7}]};};
 const result=await new CapacitorDeviceProvider().scheduleNotification(notice,new AbortController().signal);
 assert.equal(sent.id,7);assert.equal(sent.title,notice.title);assert.equal(sent.body,notice.body);
 assert.ok(sent.schedule.at instanceof Date);assert.equal(result.at,sent.schedule.at.getTime());
 assert.ok(result.at>=start+5000);assert.ok(result.at<=Date.now()+5000);assert.equal(result.id,7);
 assert.equal(notificationRequests,0);
});
test('notification permission prompting is explicit and denial prevents scheduling',async()=>{
 notificationPermission='prompt';await new CapacitorDeviceProvider().scheduleNotification(notice,new AbortController().signal);
 assert.equal(notificationRequests,1);notificationPermission='denied';
 await assert.rejects(new CapacitorDeviceProvider().scheduleNotification(notice,new AbortController().signal),{code:'PERMISSION_DENIED'});
 assert.equal(schedules,1);
});
test('closing while notification permission is checked prevents prompting and scheduling',async()=>{
 let resolve;notificationCheck=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().scheduleNotification(notice,c.signal);c.abort();resolve({display:'prompt'});
 await assert.rejects(pending,{code:'CANCELLED'});assert.equal(notificationRequests,0);assert.equal(schedules,0);
});
test('notification native denial and absent acknowledgement cannot become success',async()=>{
 notificationSchedule=()=>{throw {code:'OS-PLUG-LNOT-0005',message:'Disabled'};};
 await assert.rejects(new CapacitorDeviceProvider().scheduleNotification(notice,new AbortController().signal),{code:'PERMISSION_DENIED'});
 notificationSchedule=()=>({notifications:[]});
 await assert.rejects(new CapacitorDeviceProvider().scheduleNotification(notice,new AbortController().signal),{code:'FAILED'});
});
test('notification event setup never prompts; callbacks project received and action and cleanup owns only its handles',async()=>{
 const events=[];const c=new AbortController();const stop=await new CapacitorDeviceProvider().startNotificationEvents(e=>events.push(e),c.signal);
 assert.equal(notificationChecks,0);assert.equal(notificationRequests,0);assert.equal(schedules,0);
 notificationCallbacks.get('localNotificationReceived')({...notice,extra:{secret:'not projected'}});
 notificationCallbacks.get('localNotificationActionPerformed')({notification:notice,actionId:'tap',inputValue:'not projected'});
 assert.deepEqual(events,[{kind:'received',id:7,title:notice.title,body:notice.body},{kind:'action',id:7,title:notice.title,body:notice.body,actionId:'tap'}]);
 c.abort();notificationCallbacks.get('localNotificationReceived')(notice);assert.equal(events.length,2);
 await stop();assert.deepEqual(removed,['localNotificationReceived','localNotificationActionPerformed']);
});
test('partial notification listener setup failure releases previously registered listeners',async()=>{
 listenerSetup=name=>{if(name==='localNotificationActionPerformed')throw new Error('Synthetic setup failure');};
 await assert.rejects(new CapacitorDeviceProvider().startNotificationEvents(()=>{},new AbortController().signal),{code:'FAILED'});
 assert.deepEqual(removed,['localNotificationReceived']);
});
test('notification setup aborted while native registration is pending releases the arriving handle',async()=>{
 let resolve;listenerSetup=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().startNotificationEvents(()=>{},c.signal);c.abort();resolve();
 await assert.rejects(pending,{code:'CANCELLED'});assert.deepEqual(removed,['localNotificationReceived']);
 assert.equal(notificationCallbacks.size,1);
});


test('push registration prompts when necessary and denial does not register',async()=>{
 pushPermission='prompt';await new CapacitorDeviceProvider().registerPush(new AbortController().signal);
 assert.equal(pushRequests,1);assert.equal(pushRegistrations,1);pushPermission='denied';
 await assert.rejects(new CapacitorDeviceProvider().registerPush(new AbortController().signal),{code:'PERMISSION_DENIED'});
 assert.equal(pushRegistrations,1);
});
test('push setup only listens; token, error, received and action are projected without executable payloads',async()=>{
 const events=[];const c=new AbortController();const stop=await new CapacitorDeviceProvider().startPushEvents(e=>events.push(e),c.signal);
 assert.equal(pushRequests,0);assert.equal(pushRegistrations,0);
 pushCallbacks.get('registration')({value:'SYNTHETIC_TOKEN'});
 pushCallbacks.get('registrationError')({error:'Synthetic registration error'});
 const notification={id:'id',title:'Title',body:'Body',data:{messageId:'message-id',destination:'device',script:'not projected'}};
 pushCallbacks.get('pushNotificationReceived')(notification);
 pushCallbacks.get('pushNotificationActionPerformed')({notification,actionId:'tap'});
 assert.equal(events[0].token,'SYNTHETIC_TOKEN');assert.equal(events[1].error.code,'FAILED');
 assert.deepEqual(events[2],{kind:'received',id:'id',title:'Title',body:'Body',messageId:'message-id',destination:'device'});
 assert.equal(events[3].actionId,'tap');c.abort();pushCallbacks.get('registration')({value:'LATE'});assert.equal(events.length,4);
 await stop();assert.equal(pushRemoved.length,4);
});
test('push page closure before permission completes prevents register',async()=>{
 let resolve;pushCheck=()=>new Promise(r=>{resolve=r;});const c=new AbortController();
 const pending=new CapacitorDeviceProvider().registerPush(c.signal);c.abort();resolve({receive:'prompt'});
 await assert.rejects(pending,{code:'CANCELLED'});assert.equal(pushRequests,0);assert.equal(pushRegistrations,0);
});
test('partial push listener setup failure releases acquired handles',async()=>{
 pushListenerSetup=name=>{if(name==='pushNotificationReceived')throw new Error('Synthetic setup failure');};
 await assert.rejects(new CapacitorDeviceProvider().startPushEvents(()=>{},new AbortController().signal),{code:'FAILED'});
 assert.deepEqual(pushRemoved,['registration','registrationError']);
});


test('shortcut listener attaches before draining cold request and serializes availability events',async()=>{
 const c=new AbortController(),seen=[];let reads=0;
 shortcutTake=async()=>{assert.ok(shortcutCallback);reads++;return {request:reads===1?{id:'cold',destination:'gallery'}:null};};
 const stop=await new CapacitorDeviceProvider().startShortcutEvents((value,error)=>{assert.equal(error,null);seen.push(value);},c.signal);
 shortcutCallback();shortcutCallback();
 for(let i=0;i<15;i++)await Promise.resolve();
 assert.deepEqual(seen,[{id:'cold',destination:'gallery'}]);assert.equal(reads,3);
 c.abort();await stop();shortcutCallback();await Promise.resolve();assert.equal(shortcutRemoves,1);assert.equal(reads,3);
});
test('shortcut startup failures and disposal release the acquired listener',async()=>{
 const c=new AbortController();shortcutTake=async()=>{throw new Error('native failure');};
 await assert.rejects(new CapacitorDeviceProvider().startShortcutEvents(()=>{},c.signal),/native failure/);
 assert.equal(shortcutRemoves,1);
 let resolve;shortcutSetup=()=>new Promise(r=>{resolve=r;});
 const pending=new CapacitorDeviceProvider().startShortcutEvents(()=>assert.fail('late event'),c.signal);
 c.abort();resolve();await assert.rejects(pending,{code:'CANCELLED'});assert.equal(shortcutRemoves,2);
});
test('shortcut native read completing after disposal never delivers to page',async()=>{
 const c=new AbortController();let resolve;shortcutTake=()=>new Promise(r=>{resolve=r;});
 const pending=new CapacitorDeviceProvider().startShortcutEvents(()=>assert.fail('late event'),c.signal);
 for(let i=0;i<5;i++)await Promise.resolve();
 c.abort();resolve({request:{id:'late',destination:'gallery'}});
 const stop=await pending;await stop();assert.equal(shortcutRemoves,1);
});


test('barcode projects text and named symbology without opening or modifying the payload',async()=>{
 const p=new CapacitorDeviceProvider(),signal=new AbortController().signal;
 assert.deepEqual(await p.scanBarcode(signal),{text:'GRAMLOT-POC-QR-001',format:'QR_CODE'});
 barcodeScan=async()=>({ScanResult:'https://example.test/untrusted',format:5});
 assert.deepEqual(await p.scanBarcode(signal),{text:'https://example.test/untrusted',format:'CODE_128'});
 barcodeScan=async()=>({ScanResult:'5901234123457',format:9});
 assert.deepEqual(await p.scanBarcode(signal),{text:'5901234123457',format:'EAN_13'});
 for(const format of [17,99,'0',null]){
  barcodeScan=async()=>({ScanResult:'bad',format});
  await assert.rejects(p.scanBarcode(signal),{code:'FAILED'});
 }
});
test('barcode maps native cancellation and denial to the shared outcome contract',async()=>{
 const p=new CapacitorDeviceProvider(),signal=new AbortController().signal;
 for(const [native,expected] of [['OS-PLUG-BARC-0006','CANCELLED'],['OS-PLUG-BARC-0007','PERMISSION_DENIED'],['OS-PLUG-BARC-0004','FAILED']]){
  barcodeScan=async()=>{throw Object.assign(new Error('native scan'),{code:native});};
  await assert.rejects(p.scanBarcode(signal),{code:expected});
 }
});
test('barcode disposal before native invocation or after acquisition discards the operation',async()=>{
 const p=new CapacitorDeviceProvider(),before=new AbortController();before.abort();
 await assert.rejects(p.scanBarcode(before.signal),{code:'CANCELLED'});assert.equal(barcodeScans,0);
 const during=new AbortController();let resolve;barcodeScan=()=>new Promise(r=>{resolve=r;});
 const result=p.scanBarcode(during.signal);during.abort();resolve({ScanResult:'late',format:0});
 await assert.rejects(result,{code:'CANCELLED'});
});


const deferredState=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const flushState=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
test('network snapshot, events and owned cleanup project native state',async()=>{
 const seen=[];const stop=await new CapacitorDeviceProvider().startNetworkEvents(s=>seen.push(s),new AbortController().signal);
 assert.deepEqual(seen,[{connected:true,type:'wifi'}]);
 stateCallbacks.get('networkStatusChange')({connected:false,connectionType:'none'});
 assert.deepEqual(seen.at(-1),{connected:false,type:'none'});
 await stop();await stop();assert.deepEqual(stateRemovals,['networkStatusChange']);
 stateCallbacks.get('networkStatusChange')({connected:true,connectionType:'wifi'});assert.equal(seen.length,2);
});
test('new network events supersede an in-flight stale snapshot',async()=>{
 const pending=deferredState();networkRead=()=>pending.promise;const seen=[];
 const setup=new CapacitorDeviceProvider().startNetworkEvents(s=>seen.push(s),new AbortController().signal);await flushState();
 stateCallbacks.get('networkStatusChange')({connected:false,connectionType:'none'});
 pending.resolve({connected:true,connectionType:'wifi'});const stop=await setup;
 assert.deepEqual(seen,[{connected:false,type:'none'}]);await stop();
});
test('lifecycle distinguishes inactive from pause and preserves latest state during snapshot',async()=>{
 const pending=deferredState();appRead=()=>pending.promise;const seen=[];
 const setup=new CapacitorDeviceProvider().startLifecycleEvents(e=>seen.push(e),new AbortController().signal);await flushState();
 stateCallbacks.get('appStateChange')({isActive:false});stateCallbacks.get('pause')();stateCallbacks.get('resume')();
 pending.resolve({isActive:true});const stop=await setup;
 assert.deepEqual(seen,[{kind:'state',active:false},{kind:'pause'},{kind:'resume'}]);
 await stop();assert.deepEqual(stateRemovals,['appStateChange','pause','resume']);
 stateCallbacks.get('resume')();assert.equal(seen.length,3);
});
test('lifecycle supplies an initial snapshot and cleans partial setup failures',async()=>{
 const seen=[];const p=new CapacitorDeviceProvider();const stop=await p.startLifecycleEvents(e=>seen.push(e),new AbortController().signal);
 assert.deepEqual(seen,[{kind:'state',active:true}]);await stop();stateRemovals=[];
 stateSetup=async name=>{if(name==='resume')throw new Error('setup failed');};
 await assert.rejects(p.startLifecycleEvents(()=>{},new AbortController().signal),{code:'FAILED'});
 assert.deepEqual(stateRemovals,['appStateChange','pause']);
});
test('state subscription abortion during handle acquisition cleans late handles',async()=>{
 const pending=deferredState(),controller=new AbortController();stateSetup=()=>pending.promise;let calls=0;
 const setup=new CapacitorDeviceProvider().startNetworkEvents(()=>calls++,controller.signal);
 await flushState();controller.abort();pending.resolve();await assert.rejects(setup,{code:'CANCELLED'});
 assert.deepEqual(stateRemovals,['networkStatusChange']);assert.equal(calls,0);
});
test('snapshot failure cleans listeners and cleanup tries every owned handle',async()=>{
 networkRead=async()=>{throw new Error('snapshot failed');};
 await assert.rejects(new CapacitorDeviceProvider().startNetworkEvents(()=>{},new AbortController().signal),{code:'FAILED'});
 assert.deepEqual(stateRemovals,['networkStatusChange']);stateRemovals=[];
 const stop=await new CapacitorDeviceProvider().startLifecycleEvents(()=>{},new AbortController().signal);
 stateRemoval=async name=>{if(name==='appStateChange')throw new Error('remove failed');};
 await assert.rejects(stop,/cleanup failed/);assert.deepEqual(stateRemovals,['appStateChange','pause','resume']);
});
test('haptic styles map explicitly; invalid values and native failures reject',async()=>{
 const p=new CapacitorDeviceProvider(),signal=new AbortController().signal;
 for(const style of ['light','medium','heavy'])await p.impact(style,signal);
 assert.deepEqual(impacts,[{style:'LIGHT'},{style:'MEDIUM'},{style:'HEAVY'}]);
 await assert.rejects(p.impact('other',signal),{code:'FAILED'});assert.equal(impacts.length,3);
 impactCall=async()=>{throw Object.assign(new Error('not implemented'),{code:'UNIMPLEMENTED'});};
 await assert.rejects(p.impact('medium',signal),{code:'UNAVAILABLE'});
});
test('haptic abortion before or after native acquisition is explicit',async()=>{
 const p=new CapacitorDeviceProvider(),controller=new AbortController();controller.abort();
 await assert.rejects(p.impact('light',controller.signal),{code:'CANCELLED'});assert.equal(impacts.length,0);
 const pending=deferredState(),later=new AbortController();impactCall=()=>pending.promise;
 const task=p.impact('heavy',later.signal);later.abort();pending.resolve();await assert.rejects(task,{code:'CANCELLED'});
});


test('vibration passes duration in milliseconds and rejects malformed inputs before native dispatch',async()=>{
 const p=new CapacitorDeviceProvider(),signal=new AbortController().signal;
 await p.vibrate(600,signal);assert.deepEqual(vibrations,[{duration:600}]);
 for(const duration of [0,5001,1.5,'600',NaN])await assert.rejects(p.vibrate(duration,signal),{code:'FAILED'});
 assert.equal(vibrations.length,1);
 vibrationCall=async()=>{throw Object.assign(new Error('unavailable'),{code:'UNIMPLEMENTED'});};
 await assert.rejects(p.vibrate(600,signal),{code:'UNAVAILABLE'});
});
test('vibration abort before and after native dispatch never reports success',async()=>{
 const p=new CapacitorDeviceProvider(),controller=new AbortController();controller.abort();
 await assert.rejects(p.vibrate(600,controller.signal),{code:'CANCELLED'});assert.equal(vibrations.length,0);
 const pending=deferredState(),later=new AbortController();vibrationCall=()=>pending.promise;
 const task=p.vibrate(600,later.signal);later.abort();pending.resolve();await assert.rejects(task,{code:'CANCELLED'});
});


test('audio session uses app-cache file, stops once, restores ownership and deletes only its result',async()=>{
 const events=[];const session=await new CapacitorDeviceProvider().startAudioRecording(e=>events.push(e),new AbortController().signal);
 assert.equal(audioStarts,1);assert.deepEqual(audioDeletes,[]);
 const result=await session.stop();assert.deepEqual(result,{url:'capacitor://localhost/_capacitor_file_/cache/gramlot-audio/test.m4a',duration:1250,mimeType:'audio/mp4'});
 assert.equal(audioStops,1);assert.deepEqual(audioRemovals,['voiceRecordingInterrupted']);assert.deepEqual(stateRemovals,['pause']);
 await session.dispose();await session.dispose();assert.equal(audioStops,1);assert.deepEqual(audioDeletes,[recordedAudio.value.uri]);
});
test('audio permission denial prevents recording and removes listeners',async()=>{
 audioPermission=false;audioPermissionRequest=async()=>({value:false});
 await assert.rejects(new CapacitorDeviceProvider().startAudioRecording(()=>{},new AbortController().signal),{code:'PERMISSION_DENIED'});
 assert.equal(audioStarts,0);assert.deepEqual(audioRemovals,['voiceRecordingInterrupted']);assert.deepEqual(stateRemovals,['pause']);
});
test('audio abortion during native start stops and deletes the late recording',async()=>{
 const pending=deferredState(),controller=new AbortController();audioStart=()=>pending.promise;
 const setup=new CapacitorDeviceProvider().startAudioRecording(()=>{},controller.signal);await flushState();
 controller.abort();pending.resolve({value:true});await assert.rejects(setup,{code:'CANCELLED'});
 assert.equal(audioStops,1);assert.deepEqual(audioDeletes,[recordedAudio.value.uri]);
});
test('audio foreground/interruption events are explicit and disposal silences them',async()=>{
 const events=[];const session=await new CapacitorDeviceProvider().startAudioRecording(e=>events.push(e),new AbortController().signal);
 audioCallbacks.get('voiceRecordingInterrupted')();stateCallbacks.get('pause')();assert.equal(events.length,2);assert.ok(events.every(e=>e.code==='CANCELLED'));
 await session.dispose();audioCallbacks.get('voiceRecordingInterrupted')();stateCallbacks.get('pause')();assert.equal(events.length,2);
 assert.equal(audioStops,1);assert.equal(audioDeletes.length,1);
});
test('audio cleanup waits for an in-flight stop and can retry deletion failure',async()=>{
 const pending=deferredState(),controller=new AbortController();audioStop=()=>pending.promise;
 const session=await new CapacitorDeviceProvider().startAudioRecording(()=>{},controller.signal);
 const stop=session.stop();controller.abort();audioDelete=async()=>{throw new Error('file busy');};const close=session.dispose();
 pending.resolve(recordedAudio);await assert.rejects(stop,{code:'CANCELLED'});await assert.rejects(close,{code:'FAILED'});
 assert.equal(audioStops,1);audioDelete=null;await session.dispose();assert.equal(audioDeletes.length,2);
});
test('audio listener setup failure prevents microphone access and cleans partial handles',async()=>{
 audioSetup=async()=>{throw new Error('listener setup');};
 await assert.rejects(new CapacitorDeviceProvider().startAudioRecording(()=>{},new AbortController().signal),{code:'FAILED'});
 assert.equal(audioStarts,0);assert.deepEqual(stateRemovals,['pause']);
});


test('audio sharing exports only the retained native file, never its web playback URL',async()=>{
 const controller=new AbortController(),p=new CapacitorDeviceProvider();
 const session=await p.startAudioRecording(()=>{},controller.signal);
 await assert.rejects(session.share(controller.signal),{code:'FAILED'});assert.equal(shareCalls.length,0);
 audioStop=async()=>({value:{...recordedAudio.value,uri:'/cache/gramlot-audio/voce #1 è.m4a'}});
 await session.stop();const result=await session.share(controller.signal);assert.deepEqual(result,{activity:'save-to-files'});
 assert.deepEqual(shareCalls,[{files:['file:///cache/gramlot-audio/voce%20%231%20%C3%A8.m4a'],title:'Gramlot recording',dialogTitle:'Share recording'}]);
 assert.equal(audioDeletes.length,0);await session.dispose();assert.equal(audioDeletes.length,1);
});
test('native share cancellation and availability are distinct and preserve the recording',async()=>{
 const signal=new AbortController().signal,session=await new CapacitorDeviceProvider().startAudioRecording(()=>{},signal);await session.stop();
 shareCall=async()=>{throw new Error('Share canceled');};await assert.rejects(session.share(signal),{code:'CANCELLED'});assert.equal(audioDeletes.length,0);
 shareCall=async()=>{throw new Error('Error sharing item');};await assert.rejects(session.share(signal),{code:'FAILED'});
 sharePlugin=false;await assert.rejects(session.share(signal),{code:'UNAVAILABLE'});sharePlugin=true;
 shareCall=async()=>({activityType:''});assert.deepEqual(await session.share(signal),{activity:''});await session.dispose();
});
test('audio disposal waits for the open share sheet before deleting its file',async()=>{
 const controller=new AbortController(),session=await new CapacitorDeviceProvider().startAudioRecording(()=>{},controller.signal);await session.stop();
 const pending=deferredState();shareCall=()=>pending.promise;const shared=session.share(controller.signal);await flushState();
 controller.abort();const closing=session.dispose();await flushState();assert.equal(audioDeletes.length,0);
 pending.resolve({activityType:'save-to-files'});await assert.rejects(shared,{code:'CANCELLED'});await closing;assert.equal(audioDeletes.length,1);
});
test('aborted audio share never opens a panel and malformed SDK result is rejected',async()=>{
 const session=await new CapacitorDeviceProvider().startAudioRecording(()=>{},new AbortController().signal);await session.stop();
 const cancelled=new AbortController();cancelled.abort();await assert.rejects(session.share(cancelled.signal),{code:'CANCELLED'});assert.equal(shareCalls.length,0);
 shareCall=async()=>({});await assert.rejects(session.share(new AbortController().signal),{code:'FAILED'});await session.dispose();
});


test('clipboard preserves plain text, newlines, tabs and empty strings without automatic reads',async()=>{
 const p=new CapacitorDeviceProvider();assert.equal(clipboardReads,0);
 const signal=new AbortController().signal;
 for(const text of ['A\tB\n1\t2','', 'Caffè ☕']) {await p.copyText(text,signal);assert.deepEqual(clipboardWrites.at(-1),{string:text});clipboardValue={type:'text/plain',value:text};assert.deepEqual(await p.pasteText(signal),{text});}
 assert.equal(clipboardReads,3);
});
test('clipboard rejects nontext payloads, invalid input and preserves native read failures',async()=>{
 const p=new CapacitorDeviceProvider(),signal=new AbortController().signal;
 await assert.rejects(p.copyText(12,signal),{code:'FAILED'});assert.equal(clipboardWrites.length,0);
 for(const result of [{type:'image/png',value:'data:image/png;base64,test'},{type:'text/html',value:'<b>test</b>'},{type:'text/plain',value:42},{}]) {clipboardValue=result;await assert.rejects(p.pasteText(signal),{code:'FAILED'});}
 clipboardRead=async()=>{throw new Error('There is no data on the clipboard');};await assert.rejects(p.pasteText(signal),{code:'FAILED',message:'There is no data on the clipboard'});
 clipboardPlugin=false;assert.equal(new CapacitorDeviceProvider().capabilities.includes('clipboard'),false);
});
test('clipboard cancellation suppresses native calls before start and rejects late results',async()=>{
 const p=new CapacitorDeviceProvider(),before=new AbortController();before.abort();
 await assert.rejects(p.copyText('text',before.signal),{code:'CANCELLED'});await assert.rejects(p.pasteText(before.signal),{code:'CANCELLED'});
 assert.equal(clipboardReads,0);assert.equal(clipboardWrites.length,0);
 const controller=new AbortController();clipboardRead=async()=>{controller.abort();return {type:'text/plain',value:'late'};};
 await assert.rejects(p.pasteText(controller.signal),{code:'CANCELLED'});
});


test('photo library returns only selected preview and actual format without camera permission',async()=>{
 cameraPermission='denied';cameraCheck=()=>{throw new Error('Camera permission must not be checked');};
 const provider=new CapacitorDeviceProvider();assert.equal(galleryPicks,0);
 assert.deepEqual(await provider.choosePhoto(new AbortController().signal),{url:galleryPhoto.webPath,format:'png'});
 assert.equal(galleryPicks,1);assert.equal(shots,0);assert.equal(cameraRequests,0);
});

test('photo library maps native cancellation and denied permission distinctly',async()=>{
 for(const [nativeCode,code] of [['OS-PLUG-CAMR-0020','CANCELLED'],['OS-PLUG-CAMR-0005','PERMISSION_DENIED'],['OS-PLUG-CAMR-0018','FAILED']]){
  galleryPick=()=>{throw {code:nativeCode,message:'Synthetic library outcome'};};
  await assert.rejects(new CapacitorDeviceProvider().choosePhoto(new AbortController().signal),{code});
 }
});

test('photo library rejects wrong cardinality, videos and missing preview or format without fallback',async()=>{
 for(const results of [undefined,[],[galleryPhoto,galleryPhoto],[null],[{...galleryPhoto,type:1}],[{...galleryPhoto,webPath:null}],[{...galleryPhoto,metadata:null}],[{...galleryPhoto,metadata:{format:''}}]]){
  galleryPick=()=>({results});
  await assert.rejects(new CapacitorDeviceProvider().choosePhoto(new AbortController().signal),{code:'FAILED'});
 }
});

test('photo selection does not start after disposal and ignores a late native result',async()=>{
 const controller=new AbortController();controller.abort();
 await assert.rejects(new CapacitorDeviceProvider().choosePhoto(controller.signal),{code:'CANCELLED'});assert.equal(galleryPicks,0);
 let resolve;galleryPick=()=>new Promise(r=>{resolve=r;});
 const late=new AbortController(),pending=new CapacitorDeviceProvider().choosePhoto(late.signal);late.abort();
 resolve({results:[galleryPhoto]});await assert.rejects(pending,{code:'CANCELLED'});assert.equal(galleryPicks,1);
});


test('links drain the pending native request and remove the listener on disposal',async()=>{
 const request={id:'link-one',url:'https://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker'};
 let pending=request;linkTake=async()=>{const request=pending;pending=null;return {request};};
 const received=[],controller=new AbortController();
 const stop=await new CapacitorDeviceProvider().startLinkEvents((value,error)=>received.push({value,error}),controller.signal);
 assert.deepEqual(received,[{value:request,error:null}]);
 controller.abort();await stop();assert.equal(linkRemoves,1);
 linkCallback();await Promise.resolve();assert.equal(received.length,1);
});

test('links reject unapproved native destinations and release setup listeners',async()=>{
 linkTake=async()=>({request:{id:'untrusted',url:'https://example.invalid/'}});
 await assert.rejects(new CapacitorDeviceProvider().startLinkEvents(()=>assert.fail('must not deliver'),new AbortController().signal),{code:'FAILED'});
 assert.equal(linkRemoves,1);
});
