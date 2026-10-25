# 130 · Native SQLite and Asqueel JS

Document ID: **GCP-130**. Date: **2026-10-25**.

<a id="gcp-130-005"></a>
## 005 · Approved contract and ownership

Owner requests native SQLite without SQLCipher, connected to Asqueel JS through Gramlot Data, creating a database from the application and recovering saved records after an app restart. Owner confirms “ok” to `gramlot.dvc.openDatabase('notes')`, its `query`, `execute`, `close` connection, `gramlot.device.database` state/errors, trusted iframe use and page-owned cleanup. TestFlight preparation remains local, internal-only and without upload.

Core owns the backend-neutral connection lifecycle and frame delegation. gramlot-capacitor owns the SQLite3 native implementation, Capacitor adapter, Asqueel dependency and Python demonstration. Asqueel supplies model compilation, migration, parameterized queries and transaction management. No core dependency on Asqueel or SQL technology is introduced. No Asqueel, Builder or Bag sources are modified.

<a id="gcp-130-010"></a>
## 010 · Runtime and Data

One open connection per page. `openDatabase(name)` accepts a simple ASCII identifier (letter followed by letters/digits/underscore, maximum 64 characters), not a filesystem path. The native plugin creates the app-private Application Support/GramlotDatabases directory and named .sqlite file if missing. Opening an existing name preserves its contents. Asqueel's `migrateSQLite` creates the declared tables; a repeat opening performs no DDL when the schema matches. No browser fallback is provided. Android remains unimplemented.

The reserved Data node `gramlot.device.database` has `status` and `error` attributes. Status is idle/pending/success/unavailable/error/closed, with cancellation represented by the existing device cancellation contract. Errors use the existing code/message representation. State changes emit normal Bag triggers and can drive bindings/controllers. Application notes and UI state live under `view.database`. Database connections and query objects are resources, not serialized Data.

The connection implements async query(sql, params), execute(sql, params) and idempotent close(). Query returns row objects; execute resolves without a result. Asqueel is responsible for its application transaction boundary. Each page/frame has its own connection, avoiding cross-frame transaction sharing. SQLite operations run on a dedicated serial native queue, with a bounded busy timeout. Page disposal, iframe removal/navigation and top-level WebView navigation release connections; SQLite rolls back unfinished transactions when closing. Saved records survive app/process closure; uninstalling normally removes the app's local data.

PoC values are null, text and finite numeric values within the JavaScript safe numeric range. Named parameters include their SQLite prefix (Asqueel already emits this form); positional arrays are also supported. BLOB and BigInt transport are not implemented and fail explicitly. There is one SQL statement per call, with bound values. ATTACH/DETACH and unrelated PRAGMAs are disallowed to preserve the connection's app-private database boundary. No SQLCipher, encryption extension, arbitrary filesystem path, generic plugin dispatcher or automatic browser database is introduced.

<a id="gcp-130-015"></a>
## 015 · Demonstration

The English Python page is `mobile_application/pages/database.py`, companion Logic database.js, catalogue entry `database` titled **SQLite and persistent notes**. Model: local.note with text id, text and created fields. The page's model belongs to the example, not DeviceHandler. The generated device-provider module exports the upstream defineModel/migrateSQLite functions used by the companion; its dependency is the unconstrained @asqueel/asqueel-js package (tested 0.1.1), without a first-party lockfile.

In the native development app: Device examples on Mac → SQLite and persistent notes → Open database → Save note. Fully terminate and reopen the app, return to the page and choose Open database. The saved note must appear without inserting it again. Saving additional notes uses unique IDs and refreshes Data from a query. No records are sent to a server. The local page is /device/database; public mounting remains /mobile-application/database.

<a id="gcp-130-020"></a>
## 020 · Verification and remaining work

Verified on the actual NativeDatabase Swift implementation linked to system SQLite, exercised through Asqueel 0.1.1: schema migration, insert/read, duplicate constraint rollback, uncommitted transaction rollback on process close, process restart persistence, unchanged-model migration, embedded NUL text, parameter validation, unsafe integer rejection and attachment denial. The test process runs on the Mac; this is not physical iPhone acceptance.

Core device/frame checks: 82 pass, including state triggers, one connection per page, pending-open disposal and independent frame connections/removal cleanup. Full core run: 3947 pass and eight sandbox localhost-bind failures; those eight conformance tests pass when run with local-server permissions. Provider suite: 73 pass. Python catalogue/pages: three pass. Browser verification: English page renders, save/load initially disabled, Open database reports unavailable with reactive Data in a browser. iOS Debug build succeeds. The first installation attempt failed with a device connection interruption; owner reconnection and physical persistence acceptance are pending.

The native test harness is tests/sqlite-engine-main.swift; compile together with ios/App/App/NativeDatabase.swift, then run tests/sqlite-native-integration.mjs with that executable path under Node 24. It creates and removes only its temporary synthetic database. Runtime npm audit reports zero known vulnerabilities. Final signed beta verification and public deployment are tracked in GCP-120 and GCP-110.


<a id="gcp-130-025"></a>
## 025 · iPhone persistence accepted and beta exported — 2026-10-25

After the owner reconnected the phone, installation and launch succeeded. The owner confirms “Sì, la nota è ancora presente” to the full save/terminate/reopen/read procedure in §015. Native SQLite creation and persistence via Asqueel and Gramlot Data are now owner-accepted on iPhone. This supersedes the installation/acceptance pending status in §020; public iframe deployment and Android remain separate.

The signed public-only internal beta now includes the plugin, matching embedded provider and core, motion support and English authored UI. GCP-120 §050 records final package verification, with no upload. Public /mobile-application/database still requires deployment by the gallery owner (GCP-110 §060).
