import test from 'node:test';
import assert from 'node:assert/strict';
import {Logic,exampleUrl} from '../shell/logic.js';

test('entry navigation consumes the Data request and accepts only the chosen example',()=>{
 const logic=new Logic(),navigations=[],writes=[];
 logic.page={dom:{navigate:url=>navigations.push(url)}};
 const node={SET:(...args)=>writes.push(args)};
 logic.openLink(node,{request:null});
 for(const url of ['http://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker',exampleUrl+'?x=1','https://untrusted.invalid/',exampleUrl]){
  logic.openLink(node,{request:{getItem:key=>key==='url'?url:'id'}});
 }
 assert.deepEqual(navigations,[exampleUrl]);assert.deepEqual(writes.at(-1),['view.linkError',null]);
});


test('embedded entry resolves the provider shared runtime without a server import map',async()=>{
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(new URL('../shell/index.html',import.meta.url),'utf8');
 const map=JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/s)[1]);
 assert.equal(map.imports['@gramlot/gramlot'],'./gramlot.js');
 assert.ok(html.indexOf('type="importmap"')<html.indexOf('type="module"'));
 const provider=await readFile(new URL('../examples/mobile_application/assets/device-provider.js',import.meta.url),'utf8');
 for(const [,name] of provider.matchAll(/from "(@[^"\n]+)"/g)) assert.ok(map.imports[name],`Unresolved embedded import: ${name}`);
});
