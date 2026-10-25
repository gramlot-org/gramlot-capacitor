import {Gramlot} from './gramlot.js';
import {CapacitorDeviceProvider} from './device-provider.js';
import {Logic} from './logic.js';
import {source} from './source.js';

const app = new Gramlot({rootId:'gramlot-root', transport:false});
app.src.logicRegistry.register(Logic, {group:null, resource:'./logic.js'});
app.src.startSource(source);
app.dvc.attach(new CapacitorDeviceProvider());
// The container owns the embedded runtime lifetime; application actions stay in Source/Data.
window.addEventListener('pagehide', () => app.dispose(), {once:true});
