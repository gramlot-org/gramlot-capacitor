# 005 · Capacitor client proof of concept

Document ID: **GCP-005**. Date: **2026-10-24**.

[Concise counterpart](../docs_llm/005-poc-plan.md). [Repository overview](../README.md).

**Current status:** gallery, camera, Face ID and local notification display/tap are owner-accepted. Real APNs registration, reactive server association and foreground receipt are verified on iPhone. Background banner and tap-to-Data are owner-accepted after disabling Focus; see [GCP-045](045-server-push-poc.md). The following phases remain the overall acceptance plan; later bounded increments have started without satisfying every earlier exit gate.

<a id="gcp-005-005"></a>
## 005 · Purpose and owner direction

Demonstrate a native iPhone/iPad container that opens a remote Gramlot site, exposes camera, biometric authentication, notifications and location to its pages, and receives application changes from the site without reinstalling the native binary.

Owner direction in the originating conversation, 2026-10-24 (English translations of the Italian messages):

- Prefer updating the served site and avoiding frequent store updates.
- Use the same container implementation for separate applications with different icons and site URLs.
- Explore camera, Face ID, notifications, geolocation and their integration with Gramlot bindings.
- Repository placement: “I would see it as a gramlot-capacitor repository.”
- Initial authorization: “OK, create the gramlot-capacitor repository and save the PoC plan before starting implementation.”
- Phase 0 authorization: “OK, let us start phase 0 of the plan in gramlot-capacitor.”
- Hosting confirmations: “Kajenn with a dedicated test site”; “On the Mac, on the local network”; then “I would put it in Docker, still using Kajenn. Later we can put it on Hetzner with my servers.”

The LAN confirmation answered a proposal explicitly including HTTPS and a device-trusted certificate. The Docker decision changes server packaging, not the agreed host or remote-page model. No deployment to Hetzner has been requested.

These statements establish the objective, repository and current documentation scope. They do not approve every proposed technical choice below. Store publication and a production architecture are outside the current authorization.

<a id="gcp-005-010"></a>
## 010 · Proposed architecture and responsibilities

**Owner update, 2026-10-24:** the native integration follows the provider-independent `gramlot.dvc` / `DeviceHandler` contract and reserved Data subtree `gramlot.device`. Reads use resolvers; Data and ordinary controllers own triggers, requests and queues. Capacitor is the first provider. See [GCP-020](020-device-integration.md); earlier provider-specific API sketches are superseded as recorded there.

| Installed application | Remote site |
| --- | --- |
| Capacitor runtime and selected native plugins | Gramlot browser runtime and its web dependencies |
| Minimal native bridge and connection/error handling | Python-authored pages, Source and Data |
| App identity, icon and trusted site configuration | Application browser logic, CSS and resources |
| Native permissions and platform configuration | Services, identity integration and push sender |

One container codebase produces separately identified apps. Begin with one site and one iOS app; later validate a second configuration without copying or diverging the container implementation.

Proposed primary path: load the HTTPS site in Capacitor's main WebView using server.url. Verify that remote page modules can access installed plugins under the site's actual CSP. Capacitor documents server.url for development, not production; this experiment does not resolve distribution or production support.

The packaging and loading mechanism for the minimal bridge remains to be proved. Files bundled with the app are not automatically available as imports to a remote page. Do not assume loading the website preserves a JavaScript context previously created in a local page.

Dependencies point from gramlot-capacitor toward Gramlot and its integrations. Core receives no Capacitor dependency. General runtime contracts remain in core; HTTP hosting, identity and server push delivery remain in the appropriate server/application layer. The owner selected Kajenn in Docker on the local Mac. The owner authorized the reusable kajenn/Caddy setup in kajenn/deploy/local-https; iPhone Safari trust and plugin selection are confirmed; native WebView trust and bridge loading/naming remain open.

Keep demonstration pages Python-first and based on Source, Data Bags, bindings, controllers, resolvers and shared components. No parallel UI, DOM/event machinery or application-local transport workaround. Prefer existing extension/resource mechanisms; report missing lifecycle or extension points before proposing a bounded owning-project change.

<a id="gcp-005-015"></a>
## 015 · Scope and prerequisites

Required demonstrations: remote Gramlot rendering and RPC; native capability discovery; camera with bound preview; foreground location; real biometric prompt; local notification; real remote push with navigation; web-only update with unchanged installed binary.

Supporting scope: network and app lifecycle, permission/error states, listener cleanup, trusted navigation and app/bridge capability reporting. App.getInfo is the owner-selected first bridge probe; Haptics is supplementary.

Deferred: Android qualification, offline business-data synchronization, continuous background location, silent push handling, exhaustive plugin coverage, store submission and production guarantees. Biometric server sign-in is a distinct extension; local biometric confirmation alone must never be reported as server authentication.

Prerequisites to resolve in phase 0:

- Device models and OS versions; one Face ID-capable physical device. Test iPad layout/lifecycle on a physical iPad if available, explicitly recording missing coverage.
- Xcode/device compatibility, signing team and permitted test bundle identifier.
- One reachable HTTPS site and one existing Python host integration; existing authentication/session model, if applicable.
- Push entitlement and APNs credentials/environment for a real remote push. Missing credentials block that acceptance item, not unrelated phases.
- Plugin compatibility, license, maintenance and SPM support; no paid plugin purchase is assumed.
- Synthetic media and accounts; credentials remain outside tracked files.

Observed local baseline on 2026-10-24: Apple Silicon, Xcode 26.1.1 and Node 23.11.0. This is an observation, not a recommended toolchain freeze. Recheck supported versions before setup; refresh first-party dependencies without pins.

<a id="gcp-005-020"></a>
## 020 · Phase 0 — Contract and preparation

Prepare the plugin inventory, select the host and devices, and settle the minimal bridge contract before implementation. Ask one unresolved owner decision at a time. The owner selected the seven official plugins Camera, Geolocation, Push Notifications, Local Notifications, App, Network and Haptics; App.getInfo is the first probe. The owner selected @aparajita/capacitor-biometric-auth for local biometrics on 2026-10-24; the minimal behavioral contract is also owner-confirmed; remaining concrete naming/loading details and setup prerequisites are tracked in GCP-010.

Specify each operation's input, result, cancellation, denial, unavailable state and failure. Distinguish installed capability, OS/device availability and granted permission. State who writes Data, owns listeners and releases resources. Keep native capability reporting separate from Gramlot's server capabilities.

Proposed model: explicit commands start native operations; results and observable state update Data Bags; events invoke ordinary page logic. Do not trigger camera/biometric prompts just because a reactive value is recomputed. Promise completion and cancellation must not update a disposed page.

Version the bridge contract and define unsupported-capability handling explicitly. The site must not guess native availability or silently emulate unsupported operations. Confirm any new public names under GC-225 before implementation.

**Exit:** bounded contract and ownership confirmed; prerequisites and blockers recorded. No unresolved requirement is silently converted into a fallback.

<a id="gcp-005-025"></a>
## 025 · Phase 1 — Remote page and native bridge feasibility

Create the minimal app only after implementation authorization. Open one remote Gramlot page and verify Source rendering, bound input and one server call. Exercise a simple installed native operation from that remote page.

Inspect the exact bridge/script-loading path, CSP, resource URLs, cookie/session behavior and navigation. Remote script injection and native bridge access must work on hardware; browser mocks are not sufficient. Restrict native access to the configured trusted site and test external links, redirects and untrusted frames. Do not expose a general arbitrary-plugin dispatcher to remote content.

**Exit:** remote Gramlot page and real native operation work together; architecture evidence is recorded. A failed feasibility gate stops dependent integration work. No unapproved iframe, native HTTP override, proxy or local-origin alternative is introduced.

<a id="gcp-005-030"></a>
## 030 · Phase 2 — Gramlot integration and diagnostics

Implement the agreed reusable integration layer and a Python-authored diagnostic page. Display capability availability, permissions, app/bridge version and sanitized operation outcomes through Data and bindings.

Exercise command/result, observable state and native events. Release listeners and watches on page disposal, and restore subscriptions deliberately after navigation or reload without duplicate events. App-level events arriving before page readiness need a defined owner and bounded lifetime; they are not a second application state model.

**Exit:** integration works through ordinary Gramlot mechanisms, including cancellation and cleanup. Missing framework hooks are reported and handled only through separately approved owning-project work.

<a id="gcp-005-035"></a>
## 035 · Phase 3 — Camera and foreground location

Build a small observation page: text note, capture/select image, preview, acquire position and display accuracy. Bind the native results to the page through Data Bags.

Use media references and metadata rather than large base64 values in ordinary Data. Verify that media can be displayed from the remote page under its origin/CSP. Upload is a separate explicitly designed path: inspect existing host capabilities first; if absent, record the gap before implementation. No ad hoc page fetch workaround.

Test location acquisition and a foreground watch with explicit stop and page-disposal cleanup. Request permissions at the operation that needs them, and handle limited/denied access, user cancellation and device unavailability.

**Exit:** real camera/gallery and location results update the page; watch cleanup passes. Background location is not claimed.

<a id="gcp-005-040"></a>
## 040 · Phase 4 — Biometrics and session boundary

Check biometric availability/enrollment and invoke Face ID on a supported device. Distinguish success, failed authentication, cancellation, denied permission and unavailable hardware. Other biometric methods are reported accurately, not labelled Face ID.

The required result is a real local biometric operation integrated with the page. A boolean in Data or JavaScript is not proof of identity to the server. Do not claim secure app locking merely from hiding web UI after a successful prompt.

Optional extension, requiring a separate confirmed contract: connect biometric-protected credentials or cryptographic operations to the site's identity system. Select a suitable Keychain-backed implementation, define logout/revocation and keep secrets out of Data Bags and diagnostics. Native credential protection must enforce biometric access; a JavaScript prompt followed by unrestricted secret access is insufficient.

**Exit:** local biometric outcomes are verified, and the report states explicitly whether server sign-in was implemented and verified or remains deferred.

<a id="gcp-005-045"></a>
## 045 · Phase 5 — Local and remote notifications

Schedule and receive a local notification. Register for remote push, associate token/app/environment with the test account where applicable, and send a real APNs notification from the server test service. Credentials stay on the server; track token replacement and account logout.

A notification identifies an authorized application destination, not an arbitrary executable command or untrusted URL. On tap, preserve a pending navigation intent until page startup and authentication complete, consume it once and check destination authorization on the server.

Test foreground, background and cold-start notification taps. Distinguish OS receipt/display from JavaScript event delivery; record payload, timing and observed behavior without assuming guaranteed delivery. Local notifications or fabricated callbacks do not satisfy the remote-push gate.

**Exit:** a real push opens the expected authorized page on hardware. Missing APNs configuration is an explicit blocker. Silent iOS pushes remain outside scope.

<a id="gcp-005-050"></a>
## 050 · Phase 6 — Live updates, recovery and per-site configuration

Record the installed binary identity, then update only the site: change page content, browser logic and use of an already-installed native capability. Reload/reopen and verify the new behavior without reinstalling. Exercise a site request for an absent native capability and show the agreed unavailable result.

Proposed update policy: reload on explicit user action or reopening; no hot replacement of running page code during data entry. Define cache invalidation and consistent resource versions to avoid mixing deployments. Preserve or explicitly warn about unsaved edits; do not assume automatic recovery.

Exercise offline startup, lost network during an operation, unreachable server, expired server page/session, revoked permissions, background/resume and repeated navigation. Native error/retry handling must work even when the site never loads. Existing session recovery remains the host's responsibility.

Validate a second app/site configuration using the same container source. Check app identifiers, trusted URL, branding, session separation and push routing; never reuse a token across apps by assumption.

**Exit:** web-only update is demonstrated with the unchanged binary; recovery and cleanup evidence is recorded; configuration changes do not require container source forks.

<a id="gcp-005-055"></a>
## 055 · Acceptance matrix and evidence

| Area | Required evidence |
| --- | --- |
| Remote page | Real Source rendering, Data binding and RPC inside the app |
| Native bridge | Operation from remote content under actual CSP; untrusted navigation cannot gain bridge access |
| Camera | Physical capture and bound preview; cancellation and permission cases |
| Location | Real position/accuracy, foreground watch and cleanup |
| Biometrics | Physical Face ID success/cancellation/failure; no false server-login claim |
| Notifications | Local notification plus real remote push and authorized tap navigation, including cold start |
| Live update | Before/after site revision with unchanged installed binary |
| Lifecycle | No duplicated subscriptions or writes to disposed pages across repeated navigation/resume |
| Configuration | Second site/app configuration uses shared source and separate identity/session/push routing |

Use focused automated tests for contract/error handling, subscriptions, disposal and event ordering. Browser/simulator tests supplement physical iPhone/iPad verification; they cannot establish camera, Face ID or push success. Preserve diagnostic details on failures and summarize passing checks.

Record actual devices/OS, plugin versions, tested source revisions, steps, observed results and limitations. Tested first-party revisions are evidence, not dependency pins. Label each item proposed, implemented, verified or owner-accepted. A missing required hardware or push result leaves the PoC partially verified.

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

Read-only local observations, 2026-10-24:

- Gramlot checkout HEAD d01bf3d: js/src/bootstrap.js, js/src/http-transport.js, js/src/server/gramlot-server.js and GC-230 show server-generated bootstrap/resource URLs and same-origin HTTP credentials. Checkout observations are not a full qualification of that commit.
- Genropy legacy checkout HEAD fa35e5adfa: gnrjs/gnr_d11/js/genro_cordova.js, gnrpy/gnr/web/gnrwebpage_proxy/connection.py and gnrpy/gnr/web/gnrwsgisite_proxy/gnrstatichandler.py show user-agent detection, Cordova loading, native events and Data Bag updates. The full native application has not been verified. Reuse the behavioral evidence, not the implementation by bulk copying.
- Core constitution sections 1–7, 9–10 and 13; GC-005 documentation policy; GC-225 naming/proxy conventions. Core/provider gaps require bounded review, not consumer workarounds.

Primary external references (checked 2026-10-24):

- [Capacitor configuration](https://capacitorjs.com/docs/config): bundled assets versus server.url; remote URL is not documented for production.
- [Maintainer discussion, 2021](https://github.com/ionic-team/capacitor/discussions/5183): historical explanation, not current store approval.
- [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation): no direct background-location support in the latter.
- [Push Notifications](https://capacitorjs.com/docs/apis/push-notifications): no iOS silent-push support in this plugin.
- [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [App lifecycle](https://capacitorjs.com/docs/apis/app), [Security](https://capacitorjs.com/docs/guides/security).
- [Biometric Auth candidate](https://github.com/aparajita/capacitor-biometric-auth): third-party plugin; verify current compatibility and license before selection.


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
