import test from 'node:test';
import assert from 'node:assert/strict';
import {openNativeDatabase} from '../src/sqlite-provider.js';
test('native adapter preserves named bindings, validates types and closes once', async()=>{
    const calls=[]; const plugin={async open(){return {connection:'one'};},async query(value){calls.push(value);return {rows:[{text:'saved'}]};},async execute(){},async close(){calls.push('closed');}};
    const db=await openNativeDatabase(plugin,'notes',new AbortController().signal);
    assert.deepEqual(await db.query('SELECT :text',{':text':'hello'}),[{text:'saved'}]);
    assert.deepEqual(calls[0].params,{':text':'hello'});
    for(const value of [true,1n,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,new Uint8Array([1])]) await assert.rejects(db.query('SELECT ?',[value]),/Only null/);
    await db.close();await db.close();assert.equal(calls.filter(v=>v==='closed').length,1);
    await assert.rejects(db.query('SELECT 1'),/closed/);
});
test('late native open after cancellation releases its connection',async()=>{
    const controller=new AbortController();let closes=0;
    const plugin={async open(){controller.abort();return {connection:'late'};},async close(){closes++;}};
    await assert.rejects(openNativeDatabase(plugin,'notes',controller.signal),/cancelled/);assert.equal(closes,1);
});
