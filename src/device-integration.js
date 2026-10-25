export {defineModel} from '@asqueel/asqueel-js';
export {migrateSQLite} from '@asqueel/asqueel-js/sqlite';
import {Capacitor, SystemBars, SystemBarsStyle} from '@capacitor/core';
import {DeviceFrameHost, FrameDeviceProvider} from '@gramlot/gramlot/device-frames';
import {MobileEnvironment} from '@gramlot/gramlot';
import {CapacitorDeviceProvider} from './capacitor-device-provider.js';
export {CapacitorDeviceProvider};

export async function attachDeviceProvider(page) {
    const document=page.src.renderer.destination.ownerDocument, window=document.defaultView;
    if(window.parent===window){page.dvc.attach(new CapacitorDeviceProvider());return;}
    const parentOrigin=window.location.origin;
    const provider=await FrameDeviceProvider.connect({window,parentOrigin});
    if(page.state==='disposed'){provider.dispose();return;}
    page.dvc.attach(provider,{dispose:()=>provider.dispose()});
}
export function installDeviceFrameHost(page, {origins}) {
    const root=page.src.renderer.destination, document=root.ownerDocument, window=document.defaultView;
    const environment=MobileEnvironment.install({document,root});
    const host=new DeviceFrameHost({window,origins,createProvider:()=>new CapacitorDeviceProvider(),
        resolveFrame(source){
            for(const frame of root.querySelectorAll('iframe')){
                if(frame.contentWindow!==source)continue;
                const node=page.dom.getBaseSourceNode(frame);
                if(node && page.dom.getDomNode(node)===frame)return frame;
            }
            return null;
        }});
    const releaseAppearance=Capacitor.isNativePlatform()?environment.subscribeAppearance(({dark})=>{
        void SystemBars.setStyle({style:dark?SystemBarsStyle.Dark:SystemBarsStyle.Light}).catch(error=>console.error('System bar appearance failed',error));
    }):()=>{};
    let disposed=false;
    const dispose=()=>{
        if(disposed)return;disposed=true;
        window.removeEventListener('pagehide',dispose);
        // The current core owns the shared MobileEnvironment.
        releaseAppearance();host.dispose();
    };
    window.addEventListener('pagehide',dispose,{once:true});
    return {dispose};
}
