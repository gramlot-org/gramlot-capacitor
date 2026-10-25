import test from 'node:test';
import assert from 'node:assert/strict';
import {motionStream} from '../src/motion-provider.js';
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
test('native stream waits for acknowledgement and releases its own id once',async()=>{
    let callback,stops=0,done=false;const values=[],controller=new AbortController();
    const plugin={async startGyroscope(options,cb){callback=cb;return 'gyro-1';},async stop({id}){assert.equal(id,'gyro-1');stops++;}};
    const pending=motionStream(plugin,'startGyroscope',value=>values.push(value),controller.signal).then(stop=>{done=true;return stop;});
    await flush();assert.equal(done,false);callback({kind:'state',watching:true});const stop=await pending;
    callback({kind:'sample',x:0,y:0,z:0,timestamp:1});assert.equal(values.length,2);
    await stop();await stop();assert.equal(stops,1);
    callback({kind:'sample',x:1,y:1,z:1,timestamp:2});assert.equal(values.length,2);
});
test('abort before acknowledgement closes a delayed callback id without leaking native registration',async()=>{
    let resolve,stops=0;const controller=new AbortController();
    const plugin={startAccelerometer(){return new Promise(r=>{resolve=r;});},async stop(){stops++;}};
    const pending=motionStream(plugin,'startAccelerometer',()=>assert.fail('late event'),controller.signal);
    const rejected=assert.rejects(pending,{code:'CANCELLED'});await flush();controller.abort();resolve('accel');await rejected;assert.equal(stops,1);
});
test('native denial and asynchronous stream error remain distinct and disposable',async()=>{
    let callback,stops=0;const values=[],controller=new AbortController();
    const plugin={async startGyroscope(_,cb){callback=cb;return 'gyro';},async stop(){stops++;}};
    const pending=motionStream(plugin,'startGyroscope',v=>values.push(v),controller.signal);
    const denied=assert.rejects(pending,{code:'PERMISSION_DENIED'});await flush();callback(null,{code:'PERMISSION_DENIED',message:'Denied'});await denied;
    assert.equal(stops,1);
    const next=motionStream(plugin,'startGyroscope',v=>values.push(v),controller.signal);await flush();callback({kind:'state',watching:true});const stop=await next;
    callback({kind:'error',error:{code:'FAILED',message:'Sensor failure'}});assert.ok(values.at(-1).error instanceof Error);await stop();assert.equal(stops,2);
});
