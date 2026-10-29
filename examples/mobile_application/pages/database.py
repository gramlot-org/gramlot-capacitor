"""Create a native database from the app and keep notes across app restarts."""
from mobile_application.page import DevicePage

class Page(DevicePage):
    title = 'SQLite and persistent notes'

    def main(self, root):
        root.dataController(func='databaseAttach', _init=True)
        page = root.main(class_='device-page')
        page.h1(self.title)
        page.nav().a('All examples', href='./index')
        self.example(page)

    def example(self, page):
        card = page.section(class_='device-card', nodeId='nativeNotes')
        card.p('Create the database on this device, save a note, then fully close and reopen Gramlot. Open this page and load the notes again.')
        card.dataSetter('view.database.text', 'GRAMLOT-SQLITE-001')
        card.dataSetter('view.database.busy', False)
        card.dataSetter('view.database.ready', False)
        card.dataFormula('view.database.disabled', func='databaseDisabled', _init=True, busy='^view.database.busy', ready='^view.database.ready')
        card.textBox(value='^view.database.text', lbl='Note', live=True)
        card.button('Open database', action='databaseOpen', disabled='^view.database.busy')
        card.button('Save note', action='databaseSave', disabled='^view.database.disabled')
        card.button('Load notes', action='databaseLoad', disabled='^view.database.disabled')
        card.p('Database status:')
        card.span('^gramlot.device.database?status')
        card.p('Notes loaded from SQLite:')
        card.pre('^view.database.notes')
        card.p('^view.database.error')
        card.p('Native SQLite, without SQLCipher. Notes stay in the app; no upload or browser storage is used. Uninstalling the app removes its local data.', class_='note')
