import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['examples/mobile_application/pages/index.js'],bundle:true,write:false,format:'esm',platform:'node',
    plugins:[{name:'native-provider-test-boundary',setup(build){
        build.onResolve({filter:/^\.\/device-provider\.js$/},()=>({path:'provider',namespace:'test'}));
        build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export async function attachDeviceProvider() {}'}));
    }}]});
const {Logic}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));

test('shortcut page chooses only the fixed gallery URL from a Data request',()=>{
    const logic=new Logic(),navigations=[],writes=[];
    logic.page={dom:{navigate:url=>navigations.push(url)}};
    const node={SET:(path,value)=>writes.push([path,value])};
    logic.deviceOpenShortcut(node,{request:null});
    logic.deviceOpenShortcut(node,{request:undefined});
    assert.equal(navigations.length,0);
    logic.deviceOpenShortcut(node,{request:{getItem:key=>key==='destination'?'gallery':'id'}});
    assert.deepEqual(navigations,['https://gallery-py.gramlot.dev/']);
    assert.deepEqual(writes.at(-1),['view.shortcuts.error',null]);
    logic.deviceOpenShortcut(node,{request:{getItem:()=> 'https://untrusted.example/'}});
    assert.equal(navigations.length,1);
    assert.equal(writes.at(-1)[0],'view.shortcuts.error');
    assert.ok(writes.at(-1)[1]);
});
