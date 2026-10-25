/** Async Asqueel driver over a page-owned native connection. No SQLCipher. */
export async function openNativeDatabase(plugin, name, signal) {
    const cancelled = () => Object.assign(new Error('Database operation cancelled'), {code:'CANCELLED'});
    if (signal.aborted) throw cancelled();
    const {connection} = await plugin.open({name});
    if (signal.aborted) { await plugin.close({connection}); throw cancelled(); }
    let closed = false, closing = null;
    const invoke = async (method, sql, params) => {
        if (closed) throw new Error('Database connection is closed');
        if (typeof sql !== 'string') throw new TypeError('SQL must be a string');
        if (!Array.isArray(params) && (params === null || Object.getPrototypeOf(params) !== Object.prototype)) throw new TypeError('Invalid SQL parameters');
        for (const value of Object.values(params)) {
            if (value !== null && typeof value !== 'string' && !(typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER)) throw new TypeError('Only null, text and safe finite numbers are supported');
        }
        return plugin[method]({connection, sql, params});
    };
    return {query: async (sql,params=[]) => (await invoke('query',sql,params)).rows,
        execute: async (sql,params=[]) => { await invoke('execute',sql,params); },
        close: () => { if (!closing) { closed=true; closing=plugin.close({connection}); } return closing; }};
}
