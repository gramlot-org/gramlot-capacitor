# 050 · Gallery App Shortcut through Data

Document ID: **GCP-050**. Updated: **2026-10-24**.

**Status:** implemented, tested, signed, installed and launched on iPhone. Xcode metadata contains both OpenGalleryIntent and the automatic shortcut. After instructions to find the action in the Shortcuts editor and run it, the owner confirmed “funziona”. Invocation from Shortcuts and gallery opening are owner-accepted. Automatic tile discovery, cold-start invocation and Siri voice invocation have not been individually verified.

<a id="gcp-050-005"></a>
## 005 · Confirmed contract

Owner: “ok proviamo a registrare uno shortcut che apra la gallery, sempre passando dai dati gramlot”. The missing core navigation capability was reported. Owner explicitly confirmed “Sì, procedi con questo percorso” to a request Bag at gramlot.device.shortcuts.request, a dataController accepting only destination=gallery, and gramlot.dom.navigate(url) with the fixed official gallery URL. Names and scoped details were recorded in GC-225 §100 before implementation.

The primary path is App Intent → native pending request → Capacitor provider → DeviceHandler → Data Bag → Python-declared dataController → named Logic → gramlot.dom.navigate. Neither the App Intent nor DeviceHandler selects a web URL. The fixture alone maps gallery to https://gallery-py.gramlot.dev/. No general dispatcher, arbitrary URL input, iframe or direct application DOM wiring was introduced.

<a id="gcp-050-010"></a>
## 010 · Data and lifecycle

Under gramlot.device.shortcuts, request is null or a Bag with nonempty string id/destination. listening and listenerError are attributes. The capability is shortcuts; provider startShortcutEvents(callback, signal) supplies a request or an error and returns asynchronous cleanup. Core validates and projects the request, suppresses the current duplicate id and writes ordinary Data events. Unknown destinations remain data for application policy to reject. This is an event source, not a resolver or an implicit action on reading Data.

Provider attachment installs its native listener before draining pending input. Availability events serialize subsequent drains. Disposal aborts the consumer, ignores late native results and removes its own listener, including a handle arriving after disposal. Setup failures and native delivery errors are visible in listenerError. The page's deviceOpenShortcut controller ignores the initial empty request, accepts gallery, reports other destinations in view.shortcuts.error and invokes navigate with the fixed URL. Named dataController conditions belong inside Logic; the declaration does not combine func with inline _if.

DomHandler.navigate accepts an absolute HTTP(S) string without credentials and navigates the current owning document. It rejects relative URLs, executable/data/file schemes and credentials. Destination authorization remains application policy; this method is not a permission check. The fixture permits only its fixed official gallery. Capacitor allowNavigation adds that exact hostname to keep it inside the app; no wildcard is added. This makes the official gallery a trusted native WebView destination; broader bridge-isolation qualification remains a separate plan gate.

<a id="gcp-050-015"></a>
## 015 · Native handoff

OpenGalleryIntent uses App Intents supportedModes=foreground on iOS 26+. GramlotAppShortcuts registers “Apri la gallery”, with applicationName-based phrase templates, during app launch. The App Intent has no arguments and only enqueues destination=gallery with a fresh UUID. DeviceBridgeViewController registers the local GramlotShortcuts plugin. This uses the existing native build, not a third-party shortcut plugin or a background JavaScript runtime.

ShortcutStore retains one pending request in private app preferences across startup; the latest request replaces an earlier pending one. It expires after five minutes. Native takePending atomically consumes the slot on the main thread before delivering it to JavaScript, and is restricted to the exact configured Device entry URL. A running app on another page returns to that configured entry point, where the Data consumer starts. The native code never opens the gallery directly.

This is at-most-once consumption, not a durable transaction: process termination or page disposal after native consumption but before Data delivery may lose that request. Expired/invalid entries are removed. No acknowledgement retry protocol, persistent request queue, server request, analytics upload or secret storage is part of this slice. Starting the shortcut from another page intentionally replaces that page; there is no unsaved-form restoration claim.

<a id="gcp-050-020"></a>
## 020 · Verification and device procedure

- Core focused tests: 45 pass, including real Data controller delivery, duplicate ids, malformed events, setup failure, late callbacks/cleanup and navigation rejection. Full JavaScript suite: 3,887 pass after selecting the worktree Python virtualenv in PATH.
- Provider suite: 32 pass, including attach-before-drain, serialized native events, disposal and startup cleanup. Fixture controller test: one pass, confirming the fixed gallery mapping and rejecting arbitrary destinations.
- Swift store checks pass for persistence across instances, single consumption, replacement, expiry, clock reversal and invalid destination.
- Runtime/provider build and Python page rendering pass. An initial func/_if declaration error was corrected using the established Logic condition contract; the updated page renders the Comandi Rapidi section.
- Native build, App Intents metadata extraction, strict signature validation, installation and relaunch pass. Installed-device OS compatibility is verified. The owner subsequently confirmed successful invocation and gallery opening from Shortcuts; automatic tile discovery was not separately confirmed.

On iPhone, open Shortcuts (Comandi Rapidi), then the app shortcuts collection and Gramlot PoC. Run “Apri la gallery”. If the tile is not visible, use + → search actions → Gramlot to inspect whether the underlying action was registered; adding that action creates a user shortcut with the same implementation. Verify the official gallery opens inside Gramlot PoC. Repeat with the app closed and when the gallery is already open. Siri phrase testing is a separate check.

[Apple App Shortcuts](https://developer.apple.com/documentation/appintents/acceleratingappinteractionswithappintents/). [Native Capacitor plugin registration](https://capacitorjs.com/docs/ios/custom-code).
