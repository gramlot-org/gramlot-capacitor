import {openNativeDatabase} from './sqlite-provider.js';
import {motionStream} from './motion-provider.js';
import {Capacitor, registerPlugin} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Clipboard} from '@capacitor/clipboard';
import {Share} from '@capacitor/share';
import {VoiceRecorder} from '@independo/capacitor-voice-recorder';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {Network} from '@capacitor/network';
import {Haptics, ImpactStyle} from '@capacitor/haptics';
import {Geolocation} from '@capacitor/geolocation';
import {Camera, EncodingType, MediaType, MediaTypeSelection} from '@capacitor/camera';
import {BiometricAuth} from '@aparajita/capacitor-biometric-auth';
import {LocalNotifications} from '@capacitor/local-notifications';
import {PushNotifications} from '@capacitor/push-notifications';
import {CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint} from '@capacitor/barcode-scanner';

const GramlotShortcuts = registerPlugin('GramlotShortcuts');
const GramlotSQLite = registerPlugin('GramlotSQLite');
const GramlotMotion = registerPlugin('GramlotMotion');
const GramlotLinks = registerPlugin('GramlotLinks');

function nativeError(error) {
    const code = ({'OS-PLUG-GLOC-0003':'PERMISSION_DENIED', 'OS-PLUG-GLOC-0008':'PERMISSION_DENIED',
        'OS-PLUG-GLOC-0010':'TIMEOUT', 'OS-PLUG-GLOC-0007':'UNAVAILABLE',
        'OS-PLUG-CAMR-0003':'PERMISSION_DENIED', 'OS-PLUG-CAMR-0006':'CANCELLED',
        'OS-PLUG-CAMR-0007':'UNAVAILABLE', 'OS-PLUG-CAMR-0005':'PERMISSION_DENIED',
        'OS-PLUG-CAMR-0020':'CANCELLED',
        'OS-PLUG-BARC-0006':'CANCELLED', 'OS-PLUG-BARC-0007':'PERMISSION_DENIED',
        'OS-PLUG-LNOT-0005':'PERMISSION_DENIED', appCancel:'CANCELLED', systemCancel:'CANCELLED', userCancel:'CANCELLED', userFallback:'CANCELLED',
        biometryNotAvailable:'UNAVAILABLE', biometryNotEnrolled:'UNAVAILABLE', biometryLockout:'UNAVAILABLE',
        passcodeNotSet:'UNAVAILABLE', noDeviceCredential:'UNAVAILABLE', MISSING_PERMISSION:'PERMISSION_DENIED', DEVICE_CANNOT_VOICE_RECORD:'UNAVAILABLE', UNAVAILABLE:'UNAVAILABLE', UNIMPLEMENTED:'UNAVAILABLE', PERMISSION_DENIED:'PERMISSION_DENIED', CANCELLED:'CANCELLED'})[error?.code] ?? 'FAILED';
    return Object.assign(new Error(error?.message ?? 'Native device operation failed'), {code});
}
function locationValue(position) {
    return {latitude:position.coords.latitude, longitude:position.coords.longitude,
        accuracy:position.coords.accuracy, timestamp:position.timestamp};
}

// Attempt every owned removal even if an earlier plugin handle rejects.
async function removeStateListeners(handles) {
    const results = await Promise.allSettled(handles.splice(0).map(handle => Promise.resolve().then(() => handle.remove())));
    const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
    if (errors.length) throw new AggregateError(errors, 'Device state listener cleanup failed');
}

/** Explicit Capacitor provider. Browser geolocation is not a fallback for native plugins. */
export class CapacitorDeviceProvider {
    openDatabase(name, signal) { return openNativeDatabase(GramlotSQLite, name, signal); }
    constructor() {
        this.capabilities = Object.freeze(Capacitor.isNativePlatform()
            ? [ ...(Capacitor.isPluginAvailable('GramlotSQLite') ? ['database'] : []),
                ...(Capacitor.isPluginAvailable('GramlotMotion') ? ['orientation', 'gyroscope', 'accelerometer'] : []),
                ...(Capacitor.isPluginAvailable('Clipboard') ? ['clipboard'] : []),
                ...(Capacitor.isPluginAvailable('App') ? ['appinfo', 'lifecycle'] : []),
                ...(Capacitor.isPluginAvailable('VoiceRecorder') && Capacitor.isPluginAvailable('Filesystem') && Capacitor.isPluginAvailable('App') ? ['audio'] : []),
                ...(Capacitor.isPluginAvailable('Network') ? ['network'] : []),
                ...(Capacitor.isPluginAvailable('Haptics') ? ['haptics'] : []),
                ...(Capacitor.isPluginAvailable('Geolocation') ? ['location'] : []),
                ...(Capacitor.isPluginAvailable('Camera') ? ['camera'] : []),
                ...(Capacitor.isPluginAvailable('BiometricAuthNative') ? ['biometrics'] : []),
                ...(Capacitor.isPluginAvailable('LocalNotifications') ? ['notifications'] : []),
                ...(Capacitor.isPluginAvailable('PushNotifications') ? ['push'] : []),
                ...(Capacitor.isPluginAvailable('GramlotShortcuts') ? ['shortcuts'] : []),
                ...(Capacitor.isPluginAvailable('GramlotLinks') ? ['links'] : []),
                ...(Capacitor.isPluginAvailable('CapacitorBarcodeScanner') ? ['barcode'] : []) ] : []);
        this.permission = null;
    }
    startOrientationEvents(callback, signal) { return motionStream(GramlotMotion, 'startOrientation', callback, signal); }
    startGyroscopeUpdates(callback, signal) { return motionStream(GramlotMotion, 'startGyroscope', callback, signal); }
    startAccelerometerUpdates(callback, signal) { return motionStream(GramlotMotion, 'startAccelerometer', callback, signal); }
    async startAudioRecording(onInterruption, signal) {
        const handles = [];
        let started = false, disposed = false, output = null, stopTask = null, disposeTask = null, shareTask = null;
        const checkCancelled = () => {
            if (signal.aborted) throw Object.assign(new Error('Audio recording cancelled'), {code:'CANCELLED'});
        };
        const stopNative = () => {
            if (!stopTask) stopTask = VoiceRecorder.stopRecording().then(({value}) => {
                started = false;
                if (typeof value?.uri !== 'string' || !value.uri) throw new TypeError('Audio recorder did not return a file');
                output = value.uri;
                return value;
            }, error => { started = false; throw error; });
            return stopTask;
        };
        const dispose = () => {
            if (disposeTask) return disposeTask;
            disposed = true;
            disposeTask = (async () => {
                const errors = [];
                // The native sheet may still be reading the file; closing the page cannot dismiss it.
                if (shareTask) await shareTask.catch(() => undefined);
                try { if (started) await stopNative(); }
                catch (error) { errors.push(error); }
                try { await removeStateListeners(handles); }
                catch (error) { errors.push(error); }
                if (output !== null) {
                    try { await Filesystem.deleteFile({path:output}); output = null; }
                    catch (error) { errors.push(error); }
                }
                if (errors.length) throw nativeError(new AggregateError(errors, 'Audio cleanup failed'));
            })();
            disposeTask.catch(() => { disposeTask = null; });
            return disposeTask;
        };
        const interrupt = message => {
            if (!disposed && !signal.aborted) onInterruption(Object.assign(new Error(message), {code:'CANCELLED'}));
        };
        try {
            checkCancelled();
            handles.push(await App.addListener('pause', () => interrupt('Audio recording cancelled when app entered background')));
            checkCancelled();
            handles.push(await VoiceRecorder.addListener('voiceRecordingInterrupted', () => interrupt('Audio recording interrupted')));
            checkCancelled();
            let permission = await VoiceRecorder.hasAudioRecordingPermission();
            checkCancelled();
            if (permission.value === false) permission = await VoiceRecorder.requestAudioRecordingPermission();
            checkCancelled();
            if (permission.value !== true) throw Object.assign(new Error('Microphone permission was denied'), {code:'PERMISSION_DENIED'});
            const result = await VoiceRecorder.startRecording({directory:Directory.Cache, subDirectory:'gramlot-audio'});
            if (result.value !== true) throw new Error('Audio recorder did not start');
            started = true;
            checkCancelled();
            return {
                share: shareSignal => {
                    if (shareTask) return shareTask;
                    const checkShare = () => {
                        if (disposed || signal.aborted || shareSignal.aborted) {
                            throw Object.assign(new Error('Audio share cancelled'), {code:'CANCELLED'});
                        }
                    };
                    shareTask = Promise.resolve().then(async () => {
                        try {
                            checkShare();
                            if (!Capacitor.isPluginAvailable('Share')) throw Object.assign(new Error('Native sharing is unavailable'), {code:'UNAVAILABLE'});
                            if (started || typeof output !== 'string' || !output.startsWith('/')) {
                                throw new Error('No completed local audio file to share');
                            }
                            const file = new URL('file:///');
                            file.pathname = output;
                            const result = await Share.share({files:[file.href], title:'Gramlot recording', dialogTitle:'Share recording'});
                            checkShare();
                            if (typeof result.activityType !== 'string') throw new TypeError('Invalid native share result');
                            return {activity:result.activityType};
                        } catch (error) {
                            if (error?.message === 'Share canceled') {
                                throw Object.assign(new Error('Audio share cancelled'), {code:'CANCELLED'});
                            }
                            throw nativeError(error);
                        }
                    }).finally(() => { shareTask = null; });
                    return shareTask;
                },
                stop: async () => {
                    try {
                        checkCancelled();
                        const value = await stopNative();
                        checkCancelled();
                        // Native interruption listeners are no longer needed after capture stops.
                        await removeStateListeners(handles);
                        return {url:Capacitor.convertFileSrc(value.uri), mimeType:value.mimeType, duration:value.msDuration};
                    } catch (error) { throw nativeError(error); }
                },
                dispose
            };
        } catch (error) {
            try { await dispose(); }
            catch (cleanupError) { throw nativeError(new AggregateError([error, cleanupError], 'Audio startup cleanup failed')); }
            throw nativeError(error);
        }
    }
    async startNetworkEvents(callback, signal) {
        const handles = [];
        let stopped = false, revision = 0;
        const checkCancelled = () => {
            if (signal.aborted) throw Object.assign(new Error('Network subscription cancelled'), {code:'CANCELLED'});
        };
        const stop = async () => {
            stopped = true;
            await removeStateListeners(handles);
        };
        const emit = state => callback({connected: state.connected, type: state.connectionType});
        try {
            checkCancelled();
            handles.push(await Network.addListener('networkStatusChange', state => {
                if (stopped || signal.aborted) return;
                revision++;
                emit(state);
            }));
            checkCancelled();
            const snapshotRevision = revision;
            const state = await Network.getStatus();
            checkCancelled();
            if (revision === snapshotRevision) emit(state);
            return stop;
        } catch (error) {
            try { await stop(); }
            catch (cleanupError) { throw nativeError(new AggregateError([error, cleanupError], 'Network setup and cleanup failed')); }
            throw nativeError(error);
        }
    }
    async startLifecycleEvents(callback, signal) {
        const handles = [];
        let stopped = false, revision = 0;
        const checkCancelled = () => {
            if (signal.aborted) throw Object.assign(new Error('Lifecycle subscription cancelled'), {code:'CANCELLED'});
        };
        const stop = async () => {
            stopped = true;
            await removeStateListeners(handles);
        };
        try {
            checkCancelled();
            handles.push(await App.addListener('appStateChange', state => {
                if (stopped || signal.aborted) return;
                revision++;
                callback({kind:'state', active:state.isActive});
            }));
            for (const kind of ['pause', 'resume']) {
                checkCancelled();
                handles.push(await App.addListener(kind, () => {
                    if (!stopped && !signal.aborted) callback({kind});
                }));
            }
            checkCancelled();
            const snapshotRevision = revision;
            const state = await App.getState();
            checkCancelled();
            if (revision === snapshotRevision) callback({kind:'state', active:state.isActive});
            return stop;
        } catch (error) {
            try { await stop(); }
            catch (cleanupError) { throw nativeError(new AggregateError([error, cleanupError], 'Lifecycle setup and cleanup failed')); }
            throw nativeError(error);
        }
    }
    async copyText(text, signal) {
        try {
            if (signal.aborted) throw Object.assign(new Error('Clipboard request cancelled'), {code:'CANCELLED'});
            if (typeof text !== 'string') throw new TypeError('Clipboard text must be a string');
            await Clipboard.write({string:text});
            if (signal.aborted) throw Object.assign(new Error('Clipboard request cancelled'), {code:'CANCELLED'});
        } catch (error) { throw nativeError(error); }
    }
    async pasteText(signal) {
        try {
            if (signal.aborted) throw Object.assign(new Error('Clipboard request cancelled'), {code:'CANCELLED'});
            const result = await Clipboard.read();
            if (signal.aborted) throw Object.assign(new Error('Clipboard request cancelled'), {code:'CANCELLED'});
            if (result.type !== 'text/plain' || typeof result.value !== 'string') {
                throw new TypeError('This clipboard probe accepts plain text only');
            }
            return {text:result.value};
        } catch (error) { throw nativeError(error); }
    }
    async vibrate(duration, signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Vibration request cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            if (!Number.isInteger(duration) || duration < 1 || duration > 5000) {
                throw new TypeError('Vibration duration must be an integer from 1 to 5000 milliseconds');
            }
            await Haptics.vibrate({duration});
            checkCancelled();
        } catch (error) { throw nativeError(error); }
    }
    async impact(style, signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Haptic request cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            const nativeStyle = {light:ImpactStyle.Light, medium:ImpactStyle.Medium, heavy:ImpactStyle.Heavy}[style];
            if (!['light', 'medium', 'heavy'].includes(style)) throw new TypeError('Invalid haptic style');
            await Haptics.impact({style:nativeStyle});
            checkCancelled();
        } catch (error) { throw nativeError(error); }
    }
    async readAppInfo() {
        try {
            const {id,name,version,build} = await App.getInfo();
            return {id,name,version,build};
        } catch(error) { throw nativeError(error); }
    }
    async scanBarcode(signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Barcode scan cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHint.ALL,
                scanInstructions: 'Point at a QR code or barcode',
                scanButton: false,
                cancelButtonAccessibilityLabel: 'Cancel scan'
            });
            checkCancelled();
            if (!Number.isInteger(result.format) || result.format < 0 || result.format >= CapacitorBarcodeScannerTypeHint.ALL) {
                throw new TypeError('Invalid native barcode format');
            }
            const format = CapacitorBarcodeScannerTypeHint[result.format];
            if (typeof format !== 'string') throw new TypeError('Unknown native barcode format');
            return {text: result.ScanResult, format};
        } catch (error) { throw nativeError(error); }
    }
    async takePhoto(signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Photo capture cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            let permission = await Camera.checkPermissions();
            checkCancelled();
            if (permission.camera === 'prompt' || permission.camera === 'prompt-with-rationale') {
                permission = await Camera.requestPermissions({permissions:['camera']});
            }
            checkCancelled();
            if (permission.camera !== 'granted') {
                throw Object.assign(new Error('Camera permission was denied'), {code:'PERMISSION_DENIED'});
            }
            const photo = await Camera.takePhoto({encodingType:EncodingType.JPEG, quality:85,
                saveToGallery:false, includeMetadata:false});
            checkCancelled();
            if (typeof photo.webPath !== 'string' || !photo.webPath) {
                throw new Error('Camera did not return a preview URL');
            }
            return {url:photo.webPath, format:'jpeg'};
        } catch (error) { throw nativeError(error); }
    }
    async choosePhoto(signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Photo selection cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            // The SDK handles photo-library permission, including limited access.
            const selected = await Camera.chooseFromGallery({mediaType:MediaTypeSelection.Photo,
                allowMultipleSelection:false, editable:'no', quality:85, includeMetadata:true});
            checkCancelled();
            if (!Array.isArray(selected?.results) || selected.results.length !== 1) {
                throw new TypeError('Photo library did not return exactly one photo');
            }
            const photo = selected.results[0];
            if (photo?.type !== MediaType.Photo || typeof photo.webPath !== 'string' || !photo.webPath ||
                typeof photo.metadata?.format !== 'string' || !photo.metadata.format) {
                throw new TypeError('Photo library did not return a photo URL and format');
            }
            return {url:photo.webPath, format:photo.metadata.format};
        } catch (error) { throw nativeError(error); }
    }
    async verifyBiometrics(signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Biometric verification cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            // The upstream web implementation simulates biometrics; this provider must never use it.
            if (!this.capabilities.includes('biometrics')) {
                throw Object.assign(new Error('Native biometrics are unavailable'), {code:'UNAVAILABLE'});
            }
            const availability = await BiometricAuth.checkBiometry();
            checkCancelled();
            if (!availability.isAvailable) {
                throw Object.assign(new Error(availability.reason), {code:availability.code});
            }
            await BiometricAuth.authenticate({
                reason:'Confirm local biometric verification in the Gramlot example.',
                cancelTitle:'Cancel', allowDeviceCredential:false, iosFallbackTitle:''
            });
            checkCancelled();
        } catch (error) { throw nativeError(error); }
    }
    async scheduleNotification(request, signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Notification request cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            let permission = await LocalNotifications.checkPermissions();
            checkCancelled();
            if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
                permission = await LocalNotifications.requestPermissions();
            }
            checkCancelled();
            if (permission.display !== 'granted') {
                throw Object.assign(new Error('Notification permission was denied'), {code:'PERMISSION_DENIED'});
            }
            const at = new Date(Date.now() + request.delay * 1000);
            if (!Number.isFinite(at.getTime())) throw new TypeError('Invalid notification time');
            const result = await LocalNotifications.schedule({notifications:[{
                id:request.id, title:request.title, body:request.body, schedule:{at}
            }]});
            checkCancelled();
            if (result.notifications.length !== 1 || result.notifications[0].id !== request.id) {
                throw new Error('Notification scheduling was not acknowledged');
            }
            return {id:request.id, at:at.getTime()};
        } catch (error) { throw nativeError(error); }
    }
    async startNotificationEvents(callback, signal) {
        const handles = [];
        const stop = async () => {
            const results = await Promise.allSettled(handles.map(handle => handle.remove()));
            const failed = results.find(result => result.status === 'rejected');
            if (failed) throw nativeError(failed.reason);
        };
        const checkCancelled = () => {
            if (signal.aborted) throw Object.assign(new Error('Notification listeners cancelled'), {code:'CANCELLED'});
        };
        try {
            checkCancelled();
            handles.push(await LocalNotifications.addListener('localNotificationReceived', notification => {
                if (signal.aborted) return;
                callback({kind:'received', id:notification.id, title:notification.title, body:notification.body});
            }));
            checkCancelled();
            handles.push(await LocalNotifications.addListener('localNotificationActionPerformed', event => {
                if (signal.aborted) return;
                callback({kind:'action', id:event.notification.id, title:event.notification.title,
                    body:event.notification.body, actionId:event.actionId});
            }));
            checkCancelled();
            return stop;
        } catch (error) {
            await stop();
            throw nativeError(error);
        }
    }
    async startShortcutEvents(callback, signal) {
        let handle;
        let pending = Promise.resolve();
        const drain = () => {
            const attempt = pending.then(async () => {
                if (signal.aborted) return;
                const {request} = await GramlotShortcuts.takePending();
                if (!signal.aborted && request !== null) callback(request, null);
            });
            pending = attempt.catch(() => {});
            return attempt;
        };
        try {
            if (signal.aborted) throw Object.assign(new Error('Shortcut listeners cancelled'), {code:'CANCELLED'});
            handle = await GramlotShortcuts.addListener('requestAvailable', () => {
                void drain().catch(error => { if (!signal.aborted) callback(null, nativeError(error)); });
            });
            if (signal.aborted) throw Object.assign(new Error('Shortcut listeners cancelled'), {code:'CANCELLED'});
            await drain();
            return async () => { await handle.remove(); };
        } catch (error) {
            if (handle) await handle.remove();
            throw nativeError(error);
        }
    }
    async startLinkEvents(callback, signal) {
        let handle;
        let pending = Promise.resolve();
        const drain = () => {
            const attempt = pending.then(async () => {
                if (signal.aborted) return;
                const {request} = await GramlotLinks.takePending();
                if (!signal.aborted && request !== null) {
                    if (request.url !== 'https://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker') throw new Error('Link destination is not allowed');
                    callback(request, null);
                }
            });
            pending = attempt.catch(() => {});
            return attempt;
        };
        try {
            if (signal.aborted) throw Object.assign(new Error('Link listeners cancelled'), {code:'CANCELLED'});
            handle = await GramlotLinks.addListener('requestAvailable', () => {
                void drain().catch(error => { if (!signal.aborted) callback(null, nativeError(error)); });
            });
            if (signal.aborted) throw Object.assign(new Error('Link listeners cancelled'), {code:'CANCELLED'});
            await drain();
            return async () => { await handle.remove(); };
        } catch (error) {
            if (handle) await handle.remove();
            throw nativeError(error);
        }
    }
    async registerPush(signal) {
        try {
            const checkCancelled = () => {
                if (signal.aborted) throw Object.assign(new Error('Push registration cancelled'), {code:'CANCELLED'});
            };
            checkCancelled();
            let permission = await PushNotifications.checkPermissions();
            checkCancelled();
            if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
                permission = await PushNotifications.requestPermissions();
            }
            checkCancelled();
            if (permission.receive !== 'granted') {
                throw Object.assign(new Error('Push notification permission was denied'), {code:'PERMISSION_DENIED'});
            }
            await PushNotifications.register();
        } catch (error) { throw nativeError(error); }
    }
    async startPushEvents(callback, signal) {
        const handles = [];
        const stop = async () => {
            const results = await Promise.allSettled(handles.map(handle => handle.remove()));
            const failed = results.find(result => result.status === 'rejected');
            if (failed) throw nativeError(failed.reason);
        };
        const notificationValue = notification => ({id:notification.id, title:notification.title,
            body:notification.body, messageId:notification.data.messageId, destination:notification.data.destination});
        const listeners = [
            ['registration', token => callback({kind:'registration', token:token.value})],
            ['registrationError', error => callback({kind:'registrationError', error:nativeError(new Error(error.error))})],
            ['pushNotificationReceived', notification => callback({kind:'received', ...notificationValue(notification)})],
            ['pushNotificationActionPerformed', event => callback({kind:'action', ...notificationValue(event.notification), actionId:event.actionId})]
        ];
        try {
            for (const [name, receive] of listeners) {
                if (signal.aborted) throw Object.assign(new Error('Push listeners cancelled'), {code:'CANCELLED'});
                handles.push(await PushNotifications.addListener(name, event => {
                    if (!signal.aborted) receive(event);
                }));
            }
            if (signal.aborted) throw Object.assign(new Error('Push listeners cancelled'), {code:'CANCELLED'});
            return stop;
        } catch (error) {
            await stop();
            throw nativeError(error);
        }
    }
    async ensureLocationPermission() {
        if (this.permission) return this.permission;
        const pending = (async () => {
            let permission = await Geolocation.checkPermissions();
            if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
                permission = await Geolocation.requestPermissions({permissions:['location']});
            }
            if (permission.location !== 'granted') {
                throw Object.assign(new Error('Location permission was denied'), {code:'PERMISSION_DENIED'});
            }
        })();
        this.permission = pending;
        try { await pending; }
        finally { if (this.permission === pending) this.permission = null; }
    }
    async readLocation() {
        try {
            await this.ensureLocationPermission();
            return locationValue(await Geolocation.getCurrentPosition({enableHighAccuracy:false,timeout:15000,maximumAge:0}));
        } catch(error) { throw nativeError(error); }
    }
    async startLocationUpdates(callback, signal) {
        try {
            await this.ensureLocationPermission();
            if (signal.aborted) throw Object.assign(new Error('Location updates cancelled'),{code:'CANCELLED'});
            const id = await Geolocation.watchPosition({enableHighAccuracy:false,timeout:30000}, (position,error) => {
                if (signal.aborted) return;
                if (error) callback(null,nativeError(error));
                else if (position !== null) callback(locationValue(position),null);
            });
            let stopped = false;
            return async () => {
                if (stopped) return;
                await Geolocation.clearWatch({id});
                stopped = true;
            };
        } catch(error) { throw nativeError(error); }
    }
}
