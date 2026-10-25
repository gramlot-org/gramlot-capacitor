# 005 · Capacitor client proof of concept

Document ID: **GCP-005**. Date: **2026-10-24**.

[Expanded counterpart](../docs/005-poc-plan.md). [Repository overview](../README.md).

**Current status:** gallery, camera, Face ID and local notification display/tap are owner-accepted. Real APNs registration, reactive server association and foreground receipt are verified on iPhone. Background banner and tap-to-Data are owner-accepted after disabling Focus; see [GCP-045](045-server-push-poc.md). The following phases remain the overall acceptance plan; later bounded increments have started without satisfying every earlier exit gate.

<a id="gcp-005-005"></a>
## 005 · Purpose and owner direction

Owner direction, originating conversation of 2026-10-24: minimize store updates, serve mutable application code from the site, share container code across separately identified apps, and explore camera, Face ID, notifications and location through Gramlot bindings. Owner explicitly chose gramlot-capacitor and requested (English translation): “OK, create the gramlot-capacitor repository and save the PoC plan before starting implementation.” Subsequent owner confirmations (English translations): “OK, let us start phase 0 of the plan in gramlot-capacitor”; “Kajenn with a dedicated test site”; “On the Mac, on the local network”; “I would put it in Docker, still using Kajenn. Later we can put it on Hetzner with my servers.” The LAN choice answered an HTTPS/device-trusted certificate proposal. Remaining technical choices below are proposals.

<a id="gcp-005-010"></a>
## 010 · Proposed architecture and responsibilities

**Owner update, 2026-10-24:** the native integration follows the provider-independent `gramlot.dvc` / `DeviceHandler` contract and reserved Data subtree `gramlot.device`. Reads use resolvers; Data and ordinary controllers own triggers, requests and queues. Capacitor is the first provider. See [GCP-020](020-device-integration.md); earlier provider-specific API sketches are superseded as recorded there.

Installed: Capacitor, selected plugins, minimal native bridge/connection handling, identity/icon/trusted URL and native permissions. Remote: Gramlot runtime/dependencies, Python-authored pages, Source/Data, browser application logic, styles and server services.

Proposed primary path: HTTPS site in the main WebView through server.url. Prove bridge access and loading under actual CSP; bundled files do not automatically become remote-page imports, and a local page's JavaScript context does not survive navigation by assumption. Capacitor documents server.url for development, not production.

Dependency direction: gramlot-capacitor → Gramlot/integrations. No core Capacitor dependency. Core owns general runtime contracts; host/application owns HTTP, identity and push sending. Kajenn in Docker on the Mac is confirmed; the reusable kajenn/Caddy setup in kajenn/deploy/local-https is now authorized and verified; iPhone Safari trust is confirmed; native WebView trust and bridge loading/naming remain open. Use Python-first Source/Data/bindings/controllers/resolvers/components; no parallel UI, manual DOM wiring, ad hoc page requests or workarounds for missing library capabilities.

<a id="gcp-005-015"></a>
## 015 · Scope and prerequisites

Required: remote rendering/RPC, capability discovery, camera preview, foreground location, real biometrics, local notification, real remote push/navigation and web-only updates with unchanged binary. Supporting: permissions, network/lifecycle, cleanup and trusted navigation. Owner-selected first bridge probe: App.getInfo; Haptics is supplementary.

Deferred: Android qualification, offline data synchronization, background location, silent pushes, exhaustive plugins, stores and production guarantees. Biometric server sign-in is separate from local authentication.

Resolve devices/OS (physical Face ID device; physical iPad coverage or explicit limitation), signing identity, HTTPS site, Python host/session model, APNs credentials/environment, plugin licenses/maintenance/SPM, and synthetic test data. No paid purchase assumed. APNs absence blocks push acceptance only. Observed baseline: Apple Silicon, Xcode 26.1.1, Node 23.11.0; recheck supported versions at setup. No first-party dependency pins.

<a id="gcp-005-020"></a>
## 020 · Phase 0 — Contract and preparation

Inventory/select plugins and define inputs/results, permission denial, cancellation, unavailability and failure. Distinguish installed capability, device availability and permission. Owner-selected official plugins: Camera, Geolocation, Push/Local Notifications, App, Network and Haptics; App.getInfo is the first probe; the owner selected @aparajita/capacitor-biometric-auth for local biometrics; the minimal behavioral contract is also confirmed; remaining concrete naming/loading details are in GCP-010.

Define versioned bridge contract, unsupported-capability behavior, Data writers, subscription ownership and cleanup. Commands explicitly start native actions; state/results update Data; events invoke ordinary logic. No prompts from reactive recomputation or late writes to disposed pages. Native capability reporting is separate from server capabilities. Confirm new names under GC-225, one decision at a time; no inferred fallback.

Exit: bounded confirmed contract, prerequisites and blockers recorded.

<a id="gcp-005-025"></a>
## 025 · Phase 1 — Remote page and native bridge feasibility

After implementation authorization, open a real Gramlot page in the minimal native app; prove rendering, bound input, RPC and a native operation from the remote page. Inspect bridge/script loading, CSP, URLs and session cookies. Test redirects/external links/untrusted frames against the trusted-site boundary; no arbitrary-plugin dispatcher.

Exit: hardware evidence of remote page plus native access. Failure blocks dependent work; no automatic iframe, proxy, native HTTP override or local-origin alternative.

<a id="gcp-005-030"></a>
## 030 · Phase 2 — Gramlot integration and diagnostics

Reusable agreed integration plus Python diagnostic page showing capabilities, permissions, app/bridge version and sanitized outcomes through bindings. Exercise commands/results, state and events. Own app-level pre-page events with bounded lifetime; avoid parallel application state. Dispose watches/listeners and restore deliberately after navigation without duplicates.

Exit: ordinary Gramlot mechanisms including cancellation/cleanup; report missing framework hooks before separately approved owning-project work.

<a id="gcp-005-035"></a>
## 035 · Phase 3 — Camera and foreground location

Observation page: note, capture/select image, bound preview, position/accuracy. Store media references/metadata; prove local media rendering from remote origin under CSP. Upload requires inspection and an explicit supported host path; missing upload capability is a gap, not permission for page fetch workarounds.

Test location acquisition/watch/stop/disposal; permissions requested at use, limited/denied access, cancellation and unavailable hardware.

Exit: real media and location update Data; watches stop; no background-location claim.

<a id="gcp-005-040"></a>
## 040 · Phase 4 — Biometrics and session boundary

Test physical Face ID availability/enrollment, success, failure, cancellation and denied permission; report other biometric types accurately. Required scope is local biometric confirmation, not server sign-in or secure locking achieved merely by hiding web UI.

Optional separately confirmed extension: Keychain-protected credentials or cryptographic operations integrated with site identity, logout and revocation. Native enforcement must gate secret access; a JS prompt plus unrestricted secret retrieval is insufficient. No credentials in Data/diagnostics, no client boolean as server proof.

Exit: hardware results; explicitly identify whether server login remains deferred.

<a id="gcp-005-045"></a>
## 045 · Phase 5 — Local and remote notifications

Real local notification and APNs push from server test service. Associate token with app/environment/account as applicable; replace tokens and handle logout. Credentials stay server-side. Payload names an authorized destination, not arbitrary URLs/commands.

Preserve a bounded pending tap intent until startup/authentication; consume once and authorize server-side. Test foreground/background/cold start. Distinguish OS display from JS event delivery; do not assume guaranteed delivery.

Exit: real push opens the authorized page on hardware. Missing APNs credentials explicitly block this item; local/mocked events cannot substitute. Silent iOS push excluded.

<a id="gcp-005-050"></a>
## 050 · Phase 6 — Live updates, recovery and per-site configuration

Record binary identity; change only site content, logic and use of an installed plugin; reload/reopen without reinstalling. Test an absent-capability request. Proposed updates occur on explicit reload/reopening, not hot replacement during editing. Define cache/version consistency and unsaved-edit behavior.

Test offline startup, operation interrupted by lost network, unavailable site, expired page/session, revoked permissions, background/resume and repeated navigation. Native retry/error UI must survive failure to load the site. Host owns session recovery.

Validate a second app/site configuration from shared code: branding, identifier, trusted URL, session separation and correct push routing.

Exit: unchanged-binary update and recovery/cleanup evidence; no container fork per site.

<a id="gcp-005-055"></a>
## 055 · Acceptance matrix and evidence

Required evidence: remote rendering/binding/RPC; trusted remote bridge and denied untrusted access; camera capture/preview/errors; foreground position/watch cleanup; physical Face ID outcomes without false login claims; local and real remote push with authorized cold-start navigation; site updates with identical binary; no duplicated subscriptions/late Data writes; second configuration identity/session/push separation.

Automate contracts, errors, disposal and ordering. Browser/simulator checks supplement physical iPhone/iPad tests, never replace native evidence. Record models/OS, plugin versions, tested revisions, steps/results and limitations; revisions are evidence, not pins. Track proposed/implemented/verified/accepted separately. Missing required hardware or push evidence means partial verification.

<a id="gcp-005-060"></a>
## 060 · Current execution status

Owner-directed bounded increments have progressed through DeviceHandler/resolvers, camera, Face ID, local notifications and real server push. GCP-025 through GCP-045 record implemented, verified and accepted evidence. Camera, biometrics and local notification display/tap are accepted. APNs registration and foreground receipt work; background presentation/tap are owner-accepted after disabling Focus. Phase 5 is partial: cold-start opening and tap-to-Data are owner-accepted; general authorized navigation/account lifecycle remains outside this bounded fixture. Navigation/frame isolation, remaining lifecycle cases, second-site configuration and other full-plan gates are still open. No official-site deployment, store submission or release is claimed.

Gallery shortcut extension: GCP-050 is implemented and installed after explicit owner confirmation of Data-driven navigation. The owner confirmed successful invocation and gallery opening from Shortcuts. Automatic tile discovery, cold start and Siri voice use remain separately unverified.

Additional feature increments: GCP-050 shortcut invocation/gallery opening is owner-accepted. GCP-055 QR scanning is implemented and owner-verified on iPhone; Owner also confirms Code 128 and cancellation. Network/app lifecycle/haptics are implemented, automatically/browser verified and installed (GCP-060). Haptic impact is owner-accepted after enabling iOS System Haptics; a distinct Data-driven 600 ms vibration is also implemented, tested and owner-accepted. Network/lifecycle hardware checks remain pending. GCP-065 audio recording uses a selected MIT recorder, is implemented/tested/installed, and recording/playback, explicit cancellation and Home/return cancellation are owner-accepted; permission-denial and external audio-interruption hardware cases remain separately unverified. GCP-070 sharing of the recorded audio is implemented with the official MIT Share plugin, tested and owner-accepted on iPhone; native cancellation and delivery/export details are separately unverified. Keyboard, external-link handling, broader sharing and speech/voice services remain future extensions.

Slider extension (GCP-075): existing horizontalSlider live Data binding and change-triggered publication are implemented in the Python fixture; runtime diagnostic passes. Live Python/browser verification passes for keyboard and pointer changes with final value/counter updates. Physical iPhone dragging remains pending. No new native dependency or core API.

Pinch extension (GCP-080): owner approves pinchPane in core and the photo/rectangle fixture sharing the slider Data value and completion publication. Implementation, 3,915 core tests, focused Python checks and browser shared-transform/publication checks pass. After the initial device-lock blocker, the owner confirms the pinch trial works (“si va bene ma si puo anche ruotare?”). The bounded shared-scale interaction is accepted; rotation is not implemented. No release is claimed.

Transform extension (GCP-085): owner approves x/y/rotate/zoom and transformPane. Implementation, 22 focused and 3,921 full JS tests, five Python checks and browser rotation/drag verification pass. After successful iPhone relaunch the owner responds “perfetto”, accepting the bounded transform result. This does not separately verify every gesture/cancellation or photo-specific hardware case.

Clipboard extension (GCP-090): explicit plain-text copy/paste through Data is implemented with the official MIT plugin. All 3,926 core tests, focused/provider checks, browser unavailable behavior, native build/signature/plugin inclusion and iPhone installation pass. After the device-lock checkpoint, the owner explicitly confirms successful Copy/Paste on iPhone with the correct Data result; this bounded text round trip is accepted. External-app exchange and permission-denial cases remain separately unverified. No Excel-format or rich-media clipboard support is claimed.

Photo-library extension (GCP-095): single-photo choice through camera?choose is implemented using the installed Camera plugin and the existing result/preview. All 3,931 core tests, 73 focused and 63 provider/page tests pass; browser unavailable behavior and local refresh pass. No new native dependency or reinstall. iPhone photo-selection/cancellation acceptance remains pending.

Universal Link and Mobile application increments: GCP-100/GCP-105 record a signed, installed bundled entry, Data-driven link routing, public Apple association verified through the CDN, and 14 separate Mac-hosted device pages. The native-only gallery branch is deployed as a temporary reviewed asset override. Browser/test verification passes; The owner confirms external QR-to-app example opening and the separate native App information page. Preferences are a documented ownership proposal only; Android is deferred by the owner.

<a id="gcp-005-065"></a>
## 065 · Evidence and references

Read-only observations 2026-10-24: Gramlot checkout HEAD d01bf3d (bootstrap.js, http-transport.js, server/gramlot-server.js, GC-230) uses server bootstrap/resource URLs and same-origin HTTP credentials; not full commit qualification. Genropy checkout HEAD fa35e5adfa (genro_cordova.js, connection.py, gnrstatichandler.py) shows UA detection, Cordova loading and events into Data; native project unverified. Preserve behavioral evidence, no bulk port.

Apply core constitution §§1–7, 9–10, 13, GC-005 and GC-225. References checked 2026-10-24: [configuration](https://capacitorjs.com/docs/config), [historical maintainer explanation](https://github.com/ionic-team/capacitor/discussions/5183), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [App](https://capacitorjs.com/docs/apis/app), [Security](https://capacitorjs.com/docs/guides/security), [Biometric Auth candidate](https://github.com/aparajita/capacitor-biometric-auth). Standard geolocation has no direct background support; standard push has no silent iOS support; plugin selection remains open.


2026-10-25 — Independent mobile module and Mela: implemented in examples/mobile_application with relative routes, one catalogue and host-injected push backend. GCP-110 is the integration contract for the other gallery chat; this increment does not edit or publish the gallery. GCP-115 describes the refined shared Mela theme and local Source-owned iframe preview. Module/core/provider checks pass; physical iPhone appearance and receiver integration remain acceptance work.


<a id="gcp-005-070"></a>
## 070 · Internal TestFlight preparation — 2026-10-25

Owner authorizes preparation only, public gallery without Mac dependence, internal testers and the existing Gramlot asset icon. GCP-120 records an isolated public-only beta project, opaque 1024px icon, production APNs entitlement and successful unsigned Release archive. No signing, export, upload, invitations or public deployment. Public mobile module integration remains absent (catalogue 404; served gallery still references LAN); signing, compliance answers and production push backend remain prerequisites for the relevant distribution/tests. Internal TestFlight does not require Beta App Review; external testing requires a separately eligible build and review information.

Signing/Connect follow-up, 2026-10-25: explicit owner request authorizes preparation without upload. Local Apple Distribution export settings and a draft app/internal-group record are prepared; no distribution identity is present locally. Account changes remain blocked by automatic approval review pending specific certificate/profile approval; browser authentication must be completed in the accessible Codex tab. GCP-120 §035 records the evidence. No remote changes or signed artifact are claimed.

Signing/Connect result, 2026-10-25: owner explicitly authorizes certificate/profile creation, names the app Gramlot and retains the official icon. App Store Connect app 6826770549 and empty Team interno group are created; automatic distribution is disabled. The local IPA passes Apple Distribution, production APNs and associated-domain entitlement verification. No upload or invitations. GCP-120 §040 supersedes the earlier authorization/login blockers; public integration and compliance prerequisites remain.

Compliance follow-up, 2026-10-25: owner confirms exempt-encryption response and app-private UserDefaults/local file timestamp privacy reasons. The rebuilt Distribution IPA verifies the Boolean and manifest alongside production push and Universal Links. No upload. GCP-120 §045 supersedes the pending technical encryption declaration; public service privacy and future dependencies are not covered by that confirmation.


<a id="gcp-005-motion"></a>
## Native orientation and motion — 2026-10-25

Owner confirms the Data paths and enabled/watching contract. GCP-125 records the system-native implementation, iframe cleanup and tests; iPhone acceptance remains pending. The new motion page is local-only pending separate public deployment. SQLite without SQLCipher with Asqueel is still requested and pending. No TestFlight upload.


<a id="gcp-005-english-ui"></a>
## English-only interface — 2026-10-25

Owner requires English for every application page. The mobile module, catalogue, embedded app entry and authored native messages have been translated; GCP-110 §055 is the integration requirement. Public gallery propagation and regenerating the previously signed beta are separate from this local update. The earlier beta artifact is not the current motion/English source snapshot.


English-copy verification: all 71 provider/entry tests and three Python module tests pass; the signed Debug build succeeds and is installed on iPhone. The final automatic launch was blocked only because the phone was locked; open Gramlot manually. The local motion page renders English headings, help, switches and states. Public propagation and regeneration of the older signed beta remain outstanding. Sensor movement/background acceptance is still pending.


Motion correction, 2026-10-25: iPhone testing exposed native startup reporting watching=false without a later activation event. GCP-125 §025 records the corrected native state-before-sample delivery, binding test, successful build/install/launch and pending user retest.


Owner hardware confirmation, 2026-10-25: “Sì, ora vedo i valori dei due sensori” confirms displayed gyroscope and accelerometer values after the delayed-activation fix. This does not establish background/resume or orientation acceptance. The owner also observes changing values at rest and suggests a threshold; a configurable Data update threshold is under discussion, not implemented or approved.


<a id="gcp-005-sqlite"></a>
## Native SQLite and local beta preparation — 2026-10-25

Owner-approved native SQLite/Asqueel connection and Data lifecycle implemented; GCP-130 records the scalar PoC scope, actual native engine persistence tests, core/provider tests and iOS build. iPhone installation/acceptance is pending a device reconnection. Public database page currently returns 404; matching gallery deployment is separate (GCP-110 §060). A fresh internal-only beta is being prepared with the public gallery, new plugins and English UI; no upload is authorized or performed. Bluetooth/PacketLogger remains postponed.


SQLite closure, 2026-10-25: owner accepts creation/save/full-app-restart/read on iPhone (“Sì, la nota è ancora presente”). The current beta is locally distribution-signed and verified with system SQLite, Asqueel integration and public-only navigation; no upload. This supersedes the preceding installation and signing pending status. Public SQLite page deployment and a public-only device trial remain separate (GCP-130 §025, GCP-120 §050, GCP-110 §060).


First internal TestFlight delivery, 2026-10-25: owner explicitly authorizes upload and the two concrete tester invitations. Gramlot 1.0 (2) uploaded successfully, processed by Apple, assigned to Team interno and shown as Testing. Two internal testers show Invited. This supersedes the earlier no-upload status for this build only. Installation acceptance and matching public module deployment remain separate. GCP-120 §055 records authorization and verification.


<a id="gcp-005-github"></a>
## Public source repository — 2026-10-25

Owner requests “su github mettilo in gramlot-org” and explicitly chooses “Pubblico, come gli altri repository Gramlot”. Publish this repository as gramlot-org/gramlot-capacitor. The reviewed current PoC snapshot is the consolidated main reference, with develop retained for further work. This authorizes source publication only; no additional package release, app deployment or TestFlight build is implied. Private .local artifacts, signing/provisioning/APNs material, device identifiers, user media and generated npm lockfiles are excluded. Core source remains owned and published separately by Gramlot; consumers need the matching core device/frame contracts described in GCP-110 and GCP-130.
