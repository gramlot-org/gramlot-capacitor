# 010 · Phase 0: preparation and proposed contract

Document ID: **GCP-010**. Updated: **2026-10-24**.

[Expanded counterpart](../docs/010-phase-0-preparation.md). [PoC plan](005-poc-plan.md).

**Preparation record; current implementation is in [GCP-015](015-gallery-poc.md).** The owner directed work toward a working gallery PoC (§045). Earlier pending proposals below record the preparation checkpoint; the gallery shell is now built, installed and owner-verified on iPhone; App.getInfo/Data bridge validation remains outstanding.

**Later owner direction:** [GCP-020](020-device-integration.md) and GC-225 §100 establish `gramlot.dvc`, `DeviceHandler` and the provider-independent `gramlot.device` Data map. Earlier probe paths and wrapper sketches below are historical; no old-path aliases are approved.

<a id="gcp-010-005"></a>
## 005 · Confirmed decisions and authorization

Owner, 2026-10-24 (translated from Italian): “OK, let us start phase 0 of the plan in gramlot-capacitor”; “Kajenn with a dedicated test site”; “On the Mac, on the local network” (answer to LAN HTTPS/device-trusted-certificate proposal); “I would put it in Docker, still using Kajenn. Later we can put it on Hetzner with my servers.”

Confirmed: phase-0 preparation, dedicated Kajenn site, Docker on Mac/LAN HTTPS; future Hetzner direction. Docker supersedes direct host-process assumptions for the server, not macOS native builds. Owner also confirmed “Yes, let us adopt this plugin” for @aparajita/capacitor-biometric-auth (local Face ID/Touch ID; site login separate). The owner then confirmed “Yes, I confirm the minimal contract”: explicit native commands, results/events in Data Bags, distinct permission/cancellation/error outcomes and listener/pending-result handling at page closure (§§025–030). API names remain to be defined before implementation. No phase-1 start or Hetzner access/deployment authorization. Repository and preference for remote site updates remain confirmed.

Owner, originating conversation, 2026-10-24 (translated from Italian): “Yes, I confirm: implement in kajenn/deploy/local-https and start the containers on the Mac to verify that it works.” This explicitly authorizes the reusable local HTTPS environment and its Docker verification, separately from the still-unstarted native phase 1.

Owner confirmations in the resumed phase-0 conversation, 2026-10-24 (translated from Italian):

- “Yes, I see the message without warnings. Let us resume phase 0 of the PoC in gramlot-capacitor.” This is user-reported physical iPhone Safari verification of the LAN HTTPS endpoint after certificate installation/trust, not a native app or iPad test.
- “Yes, I confirm the seven official plugins”: Camera, Geolocation, Push Notifications, Local Notifications, App, Network and Haptics. The already-approved biometric plugin remains unchanged.
- “Yes, first test with App.getInfo.” This replaces haptics as the initial native probe; Haptics remains a later supplementary operation. The page will display the installed app identifier, version and build from the native result.
- “Yes, Node 24 LTS and Xcode 27.1.” This selects the target toolchain; the question explicitly excluded installation. The Mac still has Node 23.11.0 and Xcode 26.1.1.
- “Yes, I already have an active membership”: Apple Developer Program membership for signing and later APNs tests. The exact team, bundle identifier, provisioning and APNs configuration remain to be verified.

Owner, 2026-10-24 (translated): “Yes, first test without login.” The first dedicated page is limited to the local network and synthetic data for App.getInfo. This does not choose a later identity provider or authorize anonymous push-token association.

<a id="gcp-010-010"></a>
## 010 · Docker hosting boundary

The reusable infrastructure belongs to `kajenn/deploy/local-https`; site-specific Gramlot fixtures and the mobile client belong to gramlot-capacitor. This supersedes the earlier proposal to keep the generic Docker setup here. Xcode continues to build/sign on macOS.

Implemented and verified in `kajenn/deploy/local-https`: Compose with published kajenn packages, a non-root application process, Caddy internal CA, mounted site recipe and persistent site/CA volumes. Default endpoint: `https://localhost:8443/_server` (server information JSON, not a Gramlot test application). Verified HTTPS for localhost and an IPv4 address, certificate rejection without the CA, container health, dependency consistency, and data/CA survival across container recreation. The standard environment now binds the Mac Wi-Fi IPv4 address on port 8443 and is verified from the Mac. The owner subsequently confirmed successful iPhone Safari access without certificate warnings after manually installing/trusting the CA. No native app or iPad verification is implied; no signing setting or Hetzner deployment was changed.

The recipe uses Python 3.12 and `caddy:2-alpine`; first-party package releases are unconstrained and refreshed with a no-cache build. Only the HTTPS port is published; Kajenn is reached over the private Compose network. Site code/configuration is mounted read-only, while site state and the CA remain in named volumes. `verify.sh` exports only the public root and passes it to curl, without TLS bypass. Each copied Compose project uses its own volumes/CA and a free port.

For iPhone/iPad, configure the Mac's stable LAN IPv4 address in the provided `.env` and explicitly install/trust the public root on each device. The local .env selects the current Mac Wi-Fi address; its HTTPS endpoint is verified from the Mac, with iPhone Safari success subsequently confirmed by the owner. Certificate trust is separate from bridge isolation and site authentication.

Page/resource edits may require a Kajenn restart; dependency changes require an image rebuild. Neither inherently requires a native rebuild while the bridge stays compatible. The base environment has one Kajenn process; Gramlot's process-local page registry does not establish multi-process routing support.

Hetzner remains a future target with its existing proxy/Certbot if desired. Its CPU architecture, ingress and secrets must be verified separately; no remote access, registry push or deployment is authorized here.

Owner follow-up, 2026-10-24 (translated): “OK, configure access from the local network and tell me how to install the certificate on my iPhone to try it.” The ignored local .env now selects the Mac Wi-Fi IPv4 address on port 8443 for both the public URL and published bind. Both services are healthy and HTTPS was verified from the Mac through that address. The existing CA is unchanged; only its public certificate was exported as certificates/kajenn-local-ca.cer for AirDrop. At that configuration checkpoint, iPhone testing was still pending; the owner subsequently installed/trusted the profile and confirmed Safari success. The agent did not change the Mac trust store. The address is DHCP-assigned; reserve it or update .env when it changes.

<a id="gcp-010-015"></a>
## 015 · Prerequisite evidence

Read-only 2026-10-24: Apple Silicon/macOS 27.0.1; Docker CLI/engine 29.8.2 Linux/arm64 and Compose 5.5.1, engine reachable; Node 23.11.0 EOL (owner selected Node 24 LTS; installation pending); Xcode 26.1.1 selected (Apple documents host macOS through 26.x, owner selected Xcode 27.1; installation pending). Numerical Capacitor minimums are insufficient qualification; device support differs from SDK targets, so do not infer iOS 27 necessarily fails.

One paired iPhone on iOS 27.0.1 was discovered disconnected; model/Face ID/Developer Mode unconfirmed, no iPad identified. No identifiers recorded. No device app test. The Caddy endpoint/CA is verified on the Mac (§010); iPhone Safari trust is confirmed by the owner; native/iPad trust, signing team/bundle ID and APNs configuration remain unresolved. The owner confirms active Apple Developer Program membership; read-only inventory reports two valid code-signing identities, without recording identity names or private keys. APNs is needed for phase 5 only.

Initial sandbox restrictions on Xcode caches/Docker socket were resolved by allowed read-only host queries; not evidence of broken tools. The later authorized work started the local containers; no host toolchain installation or signing change; iPhone certificate trust was manually enabled by the owner.

<a id="gcp-010-020"></a>
## 020 · Candidate inventory

Observed npm versions on 2026-10-24, not pins: core/ios/cli 8.5.3; App 8.1.2; Network 8.0.1; Haptics 8.0.2; Camera 8.2.6; Geolocation 8.2.4; Push Notifications 8.1.3; Local Notifications 8.3.1; @aparajita/capacitor-biometric-auth 10.0.0. Expanded guide records publication dates and responsibilities.

All declare MIT; inspected native archives contain license files. All eight plugins have Package.swift, Swift tools 5.9, iOS 15 and Capacitor SPM dependency from 8.0.0. Static manifests do not prove builds or transitive-license qualification. Platform/tooling package layouts differ; no root manifest does not imply no SPM support.

Official plugin peers require core >=8; ios 8.5.3 peer requires ^8.5.0. Biometric candidate declares direct core/ios/android ^8.0.2 and app ^8.0.0 dependencies: inspect final resolution for duplication. Camera/Haptics/Geolocation/Local Notifications moved to dedicated repos; camera/geolocation add ion native dependencies, geolocation also @capacitor/synapse. Recheck graph at setup; no first-party Genro/Gramlot pins.

Selected: @aparajita/capacitor-biometric-auth for local biometrics. The owner also selected the seven listed official plugins. No paid or secure-storage plugin selected; Keychain/server login is separate.

<a id="gcp-010-025"></a>
## 025 · Minimum operation contract

Owner-confirmed principles: explicit commands, results/events in Data, distinct permission/cancellation/error outcomes and page-close cleanup. Operations below do not establish approved API names or Data paths: native app information (id/version/build); installed capabilities/bridge version plus device availability; app/network subscriptions; optional haptic request; explicit photo capture/gallery with temporary reference/preview/metadata; foreground location acquisition/watch; explicit local biometric confirmation; local notification scheduling; remote push permission/registration/token/receipt/tap.

Installed capability, device support and permission are distinct. Native capability reports do not authorize the server or replace Gramlot server capabilities. Connectivity is not server reachability. Photo upload and passcode fallback are not implicit. Token association includes app/environment/account; updates/logout handled, APNs credentials server-only; silent iOS push excluded.

Validate agreed input and complete once with success, cancellation, denial, unsupported/unavailable or operation failure, retaining safe diagnostic detail. These categories are proposals, not string constants/coercions. No arbitrary-plugin dispatcher, automatic prompt retries or duplicate side effects. Disposed pages receive no late results; release owned subscriptions/watches even if native UI cannot be programmatically cancelled.


Owner, 2026-10-24 (translated): “Yes, I confirm these names.” Confirmed first-probe names: page companion `Logic.readAppInfo`, invoked through existing `func='readAppInfo'`; page Data paths `native.app.info` for the native result (displaying `id`, `version`, `build`), `native.app.status` for operation state and `native.app.error` for safe diagnostic information. These are page-local Data paths, not a new core proxy. The camelCase method and domain-oriented Data paths follow GC-225's existing named-Logic/Data conventions. Naming is approved; no native implementation or device qualification is implied.

Owner, 2026-10-24 (translated): “Yes, I confirm this contract.” This confirms the first-probe states `idle`, `pending`, `success`, `unavailable`, `error`; clearing previous information/error on each accepted invocation; filling information only on success; error fields `code` and `message`, with integration-owned codes `NATIVE_UNAVAILABLE` or `APP_INFO_FAILED`; and normal-browser unavailability without simulated native information.

Confirmed first-probe state contract: `native.app.status` is `idle` before a request, `pending` during it, `success` after native App.getInfo completes, `unavailable` when the native platform or App plugin is absent, and `error` when the native call fails. `native.app.info` is cleared at request start and filled only on success. `native.app.error` is cleared at request start and stays empty on success; on an unsuccessful result it contains `code` and a safe user-facing `message`. Confirmed integration-owned codes are `NATIVE_UNAVAILABLE` for unavailable execution and `APP_INFO_FAILED` for a failed native call; these are not claimed to be upstream Capacitor codes. A normal browser reports unavailable and supplies no simulated installed-app data. This read-only probe requests no camera/location/biometric permissions; the broader cancellation/permission contract remains for later operations. Loading/lifecycle details and reusable module exports still need specification before implementation.

<a id="gcp-010-030"></a>
## 030 · Gramlot state, lifecycle and bridge boundary

Native plugin owns OS interaction; shared integration owns command/listener lifetime; Gramlot Data remains page state. Explicit actions invoke commands; results/state update Data; normal logic consumes events. Reactive recomputation does not prompt. Dispose page subscriptions; bounded pending app-level tap intent waits for readiness/auth and consumes once/reset at logout. Server authorizes identity/navigation, never a client biometric boolean.

Test trusted remote content, redirects, frames and CSP; TLS is not bridge isolation. Gramlot.dispose aborts its controller and disposes subscriptions/bindings; named Logic disallows constructors. This is evidence, not an approved public extension contract: reuse supported hooks or report the gap, no constructor patch or manual application event system.

Remote-page bridge loading is unresolved: bundled JS is not automatically imported by HTTPS pages, and local JS context does not survive navigation by assumption. No iframe, native HTTP override or alternative origin approved.

Static bridge inspection, 2026-10-24: published @capacitor/ios 8.5.3, `Capacitor/Capacitor/JSExport.swift` lines 18–35, 73–108 and 209–215, installs the Capacitor global, framework-bundled native-bridge.js and generated plugin wrappers as WKUserScript at document start, main frame only. `CapacitorBridge.swift` lines 204–222 exports core JS and registered plugins during initialization. @capacitor/app 8.1.2 `dist/esm/index.js` exports App through the official registerPlugin API. The package archives were inspected without installation or execution.

This narrows the feasibility question: Capacitor already owns the injection of its stable native bridge; the remote page does not have to preserve the JavaScript context of a previous local page. The app-facing integration/module loading, resource policy and navigation isolation still need an explicit design and real WebView tests. Do not expose the generated low-level globals as a new Gramlot API merely because they exist.

Do not assume injectScriptBeforeLoad called from capacitorDidLoad will work: in the inspected source, canInjectJS is set false at the end of bridge initialization, before CAPBridgeViewController invokes capacitorDidLoad. No custom injection hook is selected here.

Gramlot `js/src/bootstrap.js` loads declared JS resources and registers their Logic classes before start; `js/src/gramlot.js` aborts its controller on dispose. These are existing seams to evaluate, not authorization for constructor patching or a new proxy. GC-225 naming conventions were reviewed; no native proxy name or public integration API is approved by this inspection.

Resource-loading evidence: GramlotFileServer.resolve_resources rejects named js_requires/css_requires; those need the Genro resource host. The Kajenn adapter already serves declared assets and JS/CSS files below the pages directory (gramlot-py-server/src/gramlot_py_server/kajenn.py, Application index/companion paths). A Python page companion can therefore load a shared integration module through existing asset serving. Do not assume the generic Kajenn container includes the Genro resource host.

Owner, 2026-10-24 (translated): “Yes, JS integration served by the site.” Confirmed scope: the reusable application-facing JavaScript integration belongs to gramlot-capacitor and is served with the remote site using existing Kajenn assets and page Logic. It uses official Capacitor plugin APIs and updates Gramlot Data Bags. The installed app retains the Capacitor runtime, native plugins and native configuration. This selects code placement; it does not establish successful WebView module loading, CSP or navigation isolation. The confirmed command/lifecycle contract applies; no new core proxy or application DOM/request layer is approved.

Pending loading/lifecycle proposal for the first probe (not approved or implemented):

- The Python fixture has its existing JS companion exporting `Logic`. `Logic.readAppInfo(node, kwargs)` delegates to the reusable `readAppInfo(page, node)` export of `native-app.js`, passing `this.page` and the triggering Source node. The action has no operation-specific input arguments.
- Build the shared module and its official `@capacitor/core`/`@capacitor/app` JavaScript imports as browser-loadable ES modules, served by Kajenn assets on the same HTTPS origin. The companion imports that asset. Capacitor owns native bridge injection; no custom Swift injection, core proxy or named resource-host extension is added. Actual CSP/module compatibility remains a phase-1 gate.
- The integration writes only the approved Data destinations through Source `node.GET/SET`; Python Source/bindings initialize and render them. It checks `page.abort.signal.aborted` before starting and before delivering any completion. No result is written after disposal; this does not cancel the OS call. `App.getInfo` creates no native listener, so this slice needs no persistent listener manager.
- One invocation per page may be pending. A second invocation while the Data status is `pending` is ignored without resetting Data or starting another native call; the button is also disabled through a binding. No independent observable state store is introduced. The already-approved request reset applies to accepted invocations.

Read-only local evidence, 2026-10-24: `js/src/gramlot.d.ts` declares `abort: AbortController` as the controller aborted on dispose; `js/src/gramlot.js` aborts it in `dispose()`. GC-095 §065 documents Source-node GET/SET for Data. The Kajenn adapter documents same-origin declared asset serving; named Logic rejects inheritance and constructors, so the companion uses delegation rather than subclassing. These existing APIs support the proposal but do not prove native behavior or approve it.

<a id="gcp-010-035"></a>
## 035 · Decisions still required and phase gate

Confirmed: repository/phase-0 start, Kajenn/Docker/Caddy hosting, Mac LAN HTTPS with owner-confirmed iPhone Safari trust, all seven official plugins, biometric plugin, minimal behavioral contract, App.getInfo as first native probe, Node 24 LTS/Xcode 27.1 target, active Apple Developer Program membership, anonymous first fixture and site-served JS integration, and the first-probe Logic/Data names and state/error contract in §025. Do not ask these again.

Remaining phase-0 design: review the concrete first-probe loading/lifecycle proposal and reusable module exports in §030; authentication is deferred to its dedicated step. A successful native bootstrap inspection is not owner approval of an API or extension mechanism.

Before the phase-1 device build: install/verify the selected toolchain under a separate setup instruction; choose the team and bundle identifier, verify provisioning and Developer Mode, and confirm the actual iPhone model/Face ID support. iPad coverage is not established. The current DHCP address needs reservation or reconfiguration if it changes. APNs credentials, entitlement and environment are required before phase 5; they do not block the read-only App.getInfo probe.

Historical preparation gate, superseded by the owner-directed gallery implementation in §045: phase 0 was in progress and phase 1 required its own start instruction. The local Docker authorization does not authorize native scaffolding, toolchain installation, signing changes or remote deployment. No pending item is silently replaced by a fallback or marked verified from static inspection alone.

<a id="gcp-010-040"></a>
## 040 · Verification and sources

Inspected eleven npm metadata records, eight plugin Swift manifests, local prerequisites and Kajenn/Gramlot source. Subsequently verified the authorized Docker/HTTPS infrastructure (§010). Owner confirms iPhone Safari HTTPS; no native build or device app test.

Sources checked 2026-10-24: [npm registry](https://registry.npmjs.org), [Capacitor setup](https://capacitorjs.com/docs/getting-started/environment-setup), [configuration](https://capacitorjs.com/docs/config), [plugins](https://github.com/ionic-team/capacitor-plugins), [Node schedule](https://github.com/nodejs/Release#release-schedule)/[EOL](https://nodejs.org/en/about/eol), [Xcode matrix](https://developer.apple.com/xcode/system-requirements), [App](https://capacitorjs.com/docs/apis/app), [Haptics](https://capacitorjs.com/docs/apis/haptics), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [Biometric Auth](https://github.com/aparajita/capacitor-biometric-auth).

Local evidence: gramlot-py-server README, docs/505-kajenn.md and src/gramlot_py_server/kajenn.py (avatar/tag auth, owner cookie, process-local registry); Gramlot js/src/gramlot.js, bootstrap.js and binding/logic.js (lifecycle and named logic). Observations do not approve new APIs.


<a id="gcp-010-045"></a>
## 045 · Owner-directed gallery PoC — 2026-10-24

Owner direction (translated): “It is a PoC: we have discussed it and must finish; ideally I would like to access the Gramlot gallery from iPhone.” This directs work toward a usable gallery PoC using the agreed Capacitor/Kajenn boundary, instead of continuing isolated contract questions. Phase-1 work starts with the existing gallery hosted on the dedicated LAN HTTPS site. Existing approved native names and state contracts remain; the previous module/lifecycle proposal is the implementation basis within this bounded objective, not approval of unrelated framework APIs.

The first deliverable is the existing Gramlot gallery over the already trusted Kajenn/Caddy endpoint, followed by the Capacitor shell pointing at it. The gallery implementation stays in gramlot-examples and its existing Python adapter; gramlot-capacitor only configures/hosts it. Native bridge proof remains a separate verification from browser gallery access. Toolchain installation, signing and physical app tests must be reported as actually performed or outstanding.

Owner follow-up: “Yes, catalog and examples work” confirms local iPhone Safari gallery access. The owner then supplied `https://gallery-py.gramlot.dev` and stated “This is the official one”; the generated Capacitor shell uses this official URL. See GCP-015 for implementation, verification and remaining device/toolchain work.
