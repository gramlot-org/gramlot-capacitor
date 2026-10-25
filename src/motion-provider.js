/** Native callback streams use one id per consumer, released even during startup. */
export async function motionStream(plugin, method, callback, signal) {
    if (signal.aborted) throw Object.assign(new Error('Motion stream cancelled'), {code:'CANCELLED'});
    let resolveReady, rejectReady, id, closeTask, closed=false;
    const ready = new Promise((resolve, reject) => { resolveReady=resolve; rejectReady=reject; });
    // Observe early native rejections before the callback id Promise settles.
    ready.catch(() => {});
    const close = () => { closed=true; return closeTask ??= id.then(value => plugin.stop({id:value})); };
    const abort = () => { rejectReady(Object.assign(new Error('Motion stream cancelled'), {code:'CANCELLED'})); void close().catch(() => {}); };
    id = Promise.resolve().then(() => plugin[method]({}, (event, error) => {
        if (signal.aborted || closed) return;
        if (error) {
            const failure = Object.assign(new Error(error.message), {code:error.code ?? 'FAILED'});
            rejectReady(failure);
            callback({kind:'error',error:failure});
        } else {
            if (event?.kind === 'error') event = {...event,error:Object.assign(new Error(event.error.message),{code:event.error.code})};
            callback(event);
            resolveReady();
        }
    }));
    signal.addEventListener('abort', abort, {once:true});
    try {
        await id;
        await ready;
        return async () => { signal.removeEventListener('abort', abort); await close(); };
    } catch (error) {
        signal.removeEventListener('abort', abort);
        await close();
        throw error;
    }
}
