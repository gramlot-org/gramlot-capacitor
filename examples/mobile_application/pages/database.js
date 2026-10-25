import {attachDeviceProvider, defineModel, migrateSQLite} from './device-provider.js';

// The application owns the model; Gramlot core has no SQL or note-table knowledge.
const model = defineModel(root => {
    const columns = root.db({name:'notes', implementation:'sqlite'}).packages()
        .package({name:'local'}).tables().table({name:'note', pkey:'id'}).columns();
    columns.column({name:'id', dtype:'T'});
    columns.column({name:'text', dtype:'T', notnull:true});
    columns.column({name:'created', dtype:'T', notnull:true});
});

export class Logic {
    async databaseAttach() { await attachDeviceProvider(this.page); }
    databaseDisabled({busy, ready}) { return busy || !ready; }
    async databaseRun(node, operation) {
        if (node.GET('view.database.busy')) return;
        node.SET('view.database.busy', true); node.SET('view.database.error', null);
        try { await operation(); }
        catch (error) {
            console.error('Native database example failed', error);
            if (this.page.state !== 'disposed') node.SET('view.database.error', 'Database operation failed. Check that the current native app is installed and try opening the database again.');
        } finally { if (this.page.state !== 'disposed') node.SET('view.database.busy', false); }
    }
    async databaseRead(node) {
        const rows = await this.queries.table('local.note').query({columns:'$id,$text,$created',order_by:'$created'}).fetch();
        if (this.page.state !== 'disposed') node.SET('view.database.notes', rows.map(row=>`${row.created}  ${row.text}`).join('\n') || 'No saved notes');
    }
    databaseOpen(node) {
        return this.databaseRun(node, async()=>{
            if (!this.database) this.database = await this.page.dvc.openDatabase('notes');
            await migrateSQLite(this.database, model.toMigration());
            this.queries = model.queries(this.database);
            if (this.page.state === 'disposed') return;
            node.SET('view.database.ready', true);
            await this.databaseRead(node);
        });
    }
    databaseSave(node) {
        return this.databaseRun(node, async()=>{
            await this.queries.table('local.note').insert({id:crypto.randomUUID(),text:node.GET('view.database.text'),created:new Date().toISOString()});
            await this.databaseRead(node);
        });
    }
    databaseLoad(node) { return this.databaseRun(node, ()=>this.databaseRead(node)); }
}
