import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const bundle = await build({entryPoints:['examples/mobile_application/pages/database.js'],
    bundle:true, write:false, format:'esm', platform:'node',
    plugins:[{name:'database-boundary', setup(build) {
        build.onResolve({filter:/^\.\/device-provider\.js$/}, () => ({path:'provider', namespace:'test'}));
        build.onLoad({filter:/.*/, namespace:'test'}, () => ({contents:`
            export async function attachDeviceProvider() {}
            export async function migrateSQLite(connection) { connection.migrations++; }
            export function defineModel() {
                return {toMigration:()=>[], queries:connection=>({table:()=>({
                    query:()=>({fetch:async()=>connection.rows}),
                    insert:async row=>connection.rows.push(row)
                })})};
            }
        `}));
    }}]});
const {Logic} = await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));

function node(owner, data) {
    return {builder:{nodeById(id) { assert.equal(id,'nativeNotes'); return owner; }},
        GET:path=>data.get(path), SET:(path,value)=>data.set(path,value)};
}

test('database resources belong to each Source card, never to Logic', async () => {
    const logic = new Logic();
    let opened=0;
    logic.page={state:'ready',dvc:{openDatabase:async()=>{opened++;return {rows:[],migrations:0};}}};
    const firstOwner={}, secondOwner={}, firstData=new Map(), secondData=new Map();
    const first=node(firstOwner,firstData), anotherButton=node(firstOwner,firstData), second=node(secondOwner,secondData);
    await logic.databaseOpen(first);
    await logic.databaseOpen(anotherButton);
    assert.equal(opened,1);
    firstData.set('view.database.text','First card note');
    await logic.databaseSave(anotherButton);
    assert.match(firstData.get('view.database.notes'),/First card note/);
    await logic.databaseOpen(second);
    assert.equal(opened,2);
    assert.notEqual(firstOwner.databaseContext,secondOwner.databaseContext);
    assert.equal(secondData.get('view.database.notes'),'No saved notes');
    assert.deepEqual(Object.keys(logic),['page']);
});

test('failed opening leaves the card retryable and releases busy Data', async () => {
    const logic=new Logic(), owner={}, data=new Map();
    logic.page={state:'ready',dvc:{openDatabase:async()=>{throw new Error('unavailable');}}};
    await logic.databaseOpen(node(owner,data));
    assert.equal(data.get('view.database.busy'),false);
    assert.match(data.get('view.database.error'),/Database operation failed/);
    assert.equal(owner.databaseContext.database,null);
    logic.page.dvc.openDatabase=async()=>({rows:[],migrations:0});
    await logic.databaseOpen(node(owner,data));
    assert.equal(data.get('view.database.ready'),true);
    assert.equal(data.get('view.database.error'),null);
});
