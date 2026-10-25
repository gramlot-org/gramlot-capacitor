// Run after compiling sqlite-engine-main.swift with the app's NativeDatabase.swift.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {defineModel} from '@asqueel/asqueel-js';
import {migrateSQLite} from '@asqueel/asqueel-js/sqlite';
const dir=await mkdtemp(join(tmpdir(),'gramlot-sqlite-'));
function adapter() {
    const child=spawn(process.argv[2],[join(dir,'notes.sqlite')]);
    const pending=[];
    createInterface({input:child.stdout}).on('line',line=>{const next=pending.shift(),value=JSON.parse(line);value.error?next.reject(new Error(value.error)):next.resolve(value.rows);});
    child.on('error',error=>{for(const p of pending.splice(0))p.reject(error);});
    child.stderr.pipe(process.stderr);
    const query=(sql,params=[])=>new Promise((resolve,reject)=>{pending.push({resolve,reject});child.stdin.write(JSON.stringify({sql,params})+'\n');});
    return {query,execute:async(sql,params=[])=>{await query(sql,params);},close:()=>new Promise(resolve=>{child.on('exit',resolve);child.stdin.end();})};
}
const model=defineModel(root=>{
    const c=root.db({name:'notes',implementation:'sqlite'}).packages().package({name:'local'}).tables().table({name:'note',pkey:'id'}).columns();
    c.column({name:'id',dtype:'T'});c.column({name:'text',dtype:'T',notnull:true});
});
let db=adapter();
try {
    await migrateSQLite(db,model.toMigration());
    await model.queries(db).table('local.note').insert({id:'one',text:'Persistent note ☕'});
    await assert.rejects(model.queries(db).table('local.note').insert({id:'one',text:'duplicate'}),/UNIQUE/);
    await db.execute('BEGIN IMMEDIATE');
    await db.execute('INSERT INTO local_note (id,text) VALUES (?,?)',['rollback','Not committed']);
    await db.close(); // SQLite rolls back the unfinished transaction.
    db=adapter();
    assert.deepEqual((await migrateSQLite(db,model.toMigration())).executed,[]);
    assert.deepEqual(await model.queries(db).table('local.note').query({columns:'$id,$text'}).fetch(),[{id:'one',text:'Persistent note ☕'}]);
    assert.deepEqual(await db.query('SELECT ? AS value',['text\0tail']),[{value:'text\0tail'}]);
    await assert.rejects(db.query('SELECT 9007199254740992 AS value'),/safe range/);
    await assert.rejects(db.execute("ATTACH DATABASE '/tmp/unwanted.sqlite' AS other"),/authorized/);
    await assert.rejects(db.query('SELECT 1; SELECT 2'),/One SQL/);
    await assert.rejects(db.query('SELECT ?',[]),/count/);
    console.log('Native SQLite + Asqueel passed: migration, CRUD, rollback, process restart persistence, text, parameter validation and database isolation.');
} finally { await db.close(); await rm(dir,{recursive:true,force:true}); }
