# 010 · Phase 0: preparation and proposed contract

Document ID: **GCP-010**. Updated: **2026-10-24**.

[Concise counterpart](../docs_llm/010-phase-0-preparation.md). [PoC plan](005-poc-plan.md).

**Preparation record; current implementation is in [GCP-015](015-gallery-poc.md).** The owner directed work toward a working gallery PoC (§045). Earlier pending proposals below record the preparation checkpoint; the gallery shell is now built, installed and owner-verified on iPhone; App.getInfo/Data bridge validation remains outstanding.

**Later owner direction:** [GCP-020](020-device-integration.md) and GC-225 §100 establish `gramlot.dvc`, `DeviceHandler` and the provider-independent `gramlot.device` Data map. Earlier probe paths and wrapper sketches below are historical; no old-path aliases are approved.

<a id="gcp-010-005"></a>
## 005 · Confirmed decisions and authorization

Owner confirmations in this conversation on 2026-10-24, translated from Italian:

| Decision | Confirming words and scope |
| --- | --- |
| Begin phase 0 | “OK, let us start phase 0 of the plan in gramlot-capacitor.” Preparation and contract work, not phase 1. |
| Test host | “Kajenn with a dedicated test site.” |
| Initial environment | “On the Mac, on the local network.” Response to an explicit proposal for HTTPS and a certificate trusted by iPhone/iPad. |
| Server packaging | “I would put it in Docker, still using Kajenn.” |
| Biometrics | “Yes, let us adopt this plugin.” Response to the proposal for @aparajita/capacitor-biometric-auth, MIT/Capacitor 8/SPM, for local Face ID/Touch ID; site login remains separate. |
| Minimal behavioral contract | “Yes, I confirm the minimal contract.” Response to the question about §§025–030: explicit native commands, results/events updating Data Bags, distinct permissions/cancellation/errors and page-close handling of listeners/pending results. API names are to be defined before implementation. |
| Future environment | “Later we can put it on Hetzner with my servers.” Future direction, not permission to access or deploy to those servers now. |

Repository placement and the preference for site updates rather than frequent native updates remain confirmed. The Docker decision supersedes any assumption that Kajenn runs directly on the Mac. It does not move the native iOS build into Docker.

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

Read-only checks on 2026-10-24:

| Item | Evidence | Consequence |
| --- | --- | --- |
| Mac | Apple Silicon, macOS 27.0.1 | Native builds stay on this Mac. |
| Docker | CLI and engine 29.8.2; engine Linux/arm64; Compose 5.5.1 | Engine reachable; the reusable HTTPS environment was subsequently built and verified (§010). |
| Node | 23.11.0; only Node 23 discovered in the inspected Homebrew paths | EOL; owner selected Node 24 LTS as target. Installation remains pending. |
| Xcode | 26.1.1, selected at /Applications/Xcode.app | Apple's table documents this release for macOS through 26.x, while this Mac is on 27.0.1. Owner selected Xcode 27.1 as target; installation and native qualification remain pending. |
| Physical device inventory | One paired iPhone, iOS 27.0.1, disconnected in devicectl | Model/Face ID and Developer Mode still need confirmation; discovery is not deployment verification. No iPad identified by this check. |
| HTTPS | Mac LAN endpoint verified; owner confirms iPhone Safari without warnings | iPhone browser trust/reachability confirmed; native WebView and iPad tests remain pending. |
| Signing | Owner confirms active Apple Developer Program; read-only inventory reports two valid code-signing identities | Exact team, permitted bundle ID, provisioning and device deployment remain unverified. No private keys or identity names were recorded. |
| APNs | Account entitlement, credentials and environment not verified | Needed for phase 5, not for drafting or camera/location work. |

Initial sandboxed device/Docker queries were denied access to tool caches/socket. The same read-only inventory succeeded with the permitted host access. These were access restrictions, not proof of a broken device or Docker installation. No personal device identifier is recorded here.

Capacitor 8 documentation requires Node 22+ and Xcode 26+. These minimums alone do not prove that the current host OS, selected Xcode and physical device can be used together. The Xcode table lists device support separately from SDK/deployment targets; no claim is made that iOS 27 itself necessarily fails with the inspected Xcode.

<a id="gcp-010-020"></a>
## 020 · Candidate inventory

The following versions were observed from the public npm registry on 2026-10-24. They are evidence, not installation instructions or version pins. Recheck the selected graph before setup. All listed packages declare MIT and the inspected native archives include license files; transitive dependency license/build qualification remains pending.

| Package | Observed version | Published | Proposed responsibility |
| --- | --- | --- | --- |
| @capacitor/core | 8.5.3 | 2026-10-07 | Web/native bridge runtime |
| @capacitor/ios | 8.5.3 | 2026-10-07 | iOS platform |
| @capacitor/cli | 8.5.3 | 2026-10-07 | Development tooling |
| @capacitor/app | 8.1.2 | 2026-10-02 | App information and lifecycle |
| @capacitor/network | 8.0.1 | 2026-02-12 | Connectivity events |
| @capacitor/haptics | 8.0.2 | 2026-03-27 | Optional haptic probe |
| @capacitor/camera | 8.2.6 | 2026-10-16 | Capture and gallery |
| @capacitor/geolocation | 8.2.4 | 2026-10-16 | Foreground location/watch |
| @capacitor/push-notifications | 8.1.3 | 2026-10-02 | Remote notification registration/events |
| @capacitor/local-notifications | 8.3.1 | 2026-08-19 | Local scheduling/events |
| @aparajita/capacitor-biometric-auth | 10.0.0 | 2026-02-09 | Local biometric confirmation |

Eight plugin archives (App, Network, Haptics, Camera, Geolocation, Push Notifications, Local Notifications and Biometric Auth) contain Package.swift with Swift tools 5.9, iOS 15 and Capacitor SPM dependency from 8.0.0. This establishes manifest presence, not a successful native build. The platform/tooling packages have different layouts; lack of a root manifest there is not evidence that Capacitor lacks SPM support.

Official plugin metadata requires @capacitor/core >=8.0.0; @capacitor/ios 8.5.3 declares ^8.5.0. Biometric Auth 10.0.0 has direct Capacitor dependencies (^8.0.2 for core/ios/android and ^8.0.0 for app), rather than a peer-only declaration. Inspect resolution during setup to avoid treating duplicate runtime installations as harmless.

Camera and Haptics, plus Geolocation and Local Notifications, now have dedicated upstream repositories. Use each package's current repository rather than the old monorepo copy. Camera adds ion-ios-camera; Geolocation adds ion-ios-geolocation and @capacitor/synapse. These transitive dependencies need build verification with the final graph.

The owner selected @aparajita/capacitor-biometric-auth for local biometrics. The owner selected all seven official plugins listed above for supported operations. No paid plugin or secure-storage plugin is selected. Keychain-backed server login remains a separate later contract.

<a id="gcp-010-025"></a>
## 025 · Minimum operation contract

The owner confirmed the minimal behavior on 2026-10-24: explicit commands, results/events in Data Bags, distinct permission/cancellation/error outcomes and cleanup at page closure. This table describes behavior, not approved API names, proxy names or Data paths. Confirm public naming under GC-225 before implementing it. No generic arbitrary-plugin invocation surface is proposed.

| Operation | Input and result | Explicit limits/failure |
| --- | --- | --- |
| Read native app information | Read-only request; installed app identifier, native version and build | Owner-selected first probe on iPhone and iPad. A web shim is not evidence of native execution. |
| Report capabilities | Installed/implemented operations and bridge contract version, plus device availability where knowable | No inference of permission from plugin presence; no use as server authorization. Native capabilities stay separate from Gramlot server capabilities. |
| Observe app/network state | Subscription to lifecycle/connectivity; observable state and events | Reachable network is not proof the Kajenn server is reachable. Listener ownership and cleanup required. |
| Haptic feedback | Explicit supported feedback request | Optional supplementary probe: upstream resolves without an effect on devices without suitable hardware. A resolved call alone is insufficient proof. |
| Capture/select photo | Explicit source choice and bounded media options; temporary reference, preview information and metadata | User cancellation, denied/limited access, unavailable source and plugin failure are distinct. Remote-origin media access must be tested. Upload is not included implicitly. |
| Acquire/watch position | Explicit accuracy/time budget; coordinates, accuracy and timestamp | Foreground only. Watch has an owner and explicit stop. Denial, timeout, unavailable services and failure are distinct. |
| Confirm biometrics | User-facing reason and selected authentication policy; local outcome | Never proves site identity. Passcode fallback is not silently enabled. Availability/enrollment and OS cancellation are handled. |
| Schedule local notification | Identifier, content, trigger and app destination; scheduling result | Permission denial and invalid input are reported. Scheduling is not delivery evidence. |
| Register/handle remote push | Explicit permission/registration, token updates, receipt and tap events | Server associates app/environment/account; token can change. Credentials remain server-side. No silent iOS push support claimed. |

For every command: validate the agreed input shape; complete once with success, user cancellation, permission denial, unsupported/unavailable operation or an operation failure. These are proposed semantic categories, not invented string constants or a coercion layer. Preserve diagnostically useful native error details while excluding secrets.

An OS operation may be impossible to cancel programmatically. Page disposal must still stop delivery to that page and release owned watches/listeners; do not claim that disposing a Promise closes native UI. Do not automatically retry prompts or duplicate server side effects.


Owner, 2026-10-24 (translated): “Yes, I confirm these names.” Confirmed first-probe names: page companion `Logic.readAppInfo`, invoked through existing `func='readAppInfo'`; page Data paths `native.app.info` for the native result (displaying `id`, `version`, `build`), `native.app.status` for operation state and `native.app.error` for safe diagnostic information. These are page-local Data paths, not a new core proxy. The camelCase method and domain-oriented Data paths follow GC-225's existing named-Logic/Data conventions. Naming is approved; no native implementation or device qualification is implied.

Owner, 2026-10-24 (translated): “Yes, I confirm this contract.” This confirms the first-probe states `idle`, `pending`, `success`, `unavailable`, `error`; clearing previous information/error on each accepted invocation; filling information only on success; error fields `code` and `message`, with integration-owned codes `NATIVE_UNAVAILABLE` or `APP_INFO_FAILED`; and normal-browser unavailability without simulated native information.

Confirmed first-probe state contract: `native.app.status` is `idle` before a request, `pending` during it, `success` after native App.getInfo completes, `unavailable` when the native platform or App plugin is absent, and `error` when the native call fails. `native.app.info` is cleared at request start and filled only on success. `native.app.error` is cleared at request start and stays empty on success; on an unsuccessful result it contains `code` and a safe user-facing `message`. Confirmed integration-owned codes are `NATIVE_UNAVAILABLE` for unavailable execution and `APP_INFO_FAILED` for a failed native call; these are not claimed to be upstream Capacitor codes. A normal browser reports unavailable and supplies no simulated installed-app data. This read-only probe requests no camera/location/biometric permissions; the broader cancellation/permission contract remains for later operations. Loading/lifecycle details and reusable module exports still need specification before implementation.

<a id="gcp-010-030"></a>
## 030 · Gramlot state, lifecycle and bridge boundary

Behavioral ownership follows the confirmed minimal contract; concrete attachment/loading mechanisms remain to be verified:

- Native plugin owns hardware/OS interaction. The shared integration owns native listeners and command lifetimes. Gramlot Data remains the page's observable state.
- Explicit page actions start native commands. Results/state update their agreed Data destinations and existing bindings render them. Ordinary page logic handles events. Recomputing a binding never starts a camera or biometric prompt by itself.
- Page-owned subscriptions end at disposal; subsequent completions cannot update disposed Data. App-level push/tap intent may outlive a page, but requires a bounded owner, single consumption after startup/authentication and a clear reset at logout.
- The site's identity service authorizes RPC and navigation. Face ID outcome or a capability report from JavaScript is never sufficient server proof.
- The remote site uses installed, explicitly exposed native capabilities. Loading remote content, redirects, external frames and script policy must be tested against that boundary; TLS alone is not bridge isolation.

Observed Gramlot hooks: Gramlot.dispose aborts its controller and disposes bindings/subscriptions; named Logic classes cannot declare constructors. These observations suggest useful lifecycle points, but do not yet establish a public extension installation/cleanup contract. Do not patch constructors or invent an application-local event system. Phase 1/2 must identify the supported reuse path or report a bounded core gap.

The stable native bridge/loading mechanism remains unresolved. Bundled JS does not automatically load into an HTTPS page, and a local-page JavaScript context does not persist after navigation. Verify the real Capacitor bootstrap, module imports and strict CSP before claiming feasibility. No iframe, native HTTP replacement or alternate origin is approved.

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

Performed: registry metadata inspection for eleven packages, eight Swift manifests, local prerequisite inventory and read-only lifecycle inspection. The separate authorized Docker work added the real HTTPS/container checks recorded in §010. No native build or physical-device app test has been performed. The owner confirms the iPhone Safari HTTPS check, which is a separate prerequisite.

Registry records were read from https://registry.npmjs.org and their published tarballs, without installation or execution. Exact versions above are the observation snapshot. Maintainers/releases and static manifests are evidence, not runtime qualification.

Primary references checked on 2026-10-24:

- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup), [configuration](https://capacitorjs.com/docs/config) and [official plugins](https://github.com/ionic-team/capacitor-plugins).
- [Node release schedule](https://github.com/nodejs/Release#release-schedule) and [EOL versions](https://nodejs.org/en/about/eol).
- [Xcode system requirements](https://developer.apple.com/xcode/system-requirements).
- [App](https://capacitorjs.com/docs/apis/app), [Haptics](https://capacitorjs.com/docs/apis/haptics), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications).
- [Biometric Auth source](https://github.com/aparajita/capacitor-biometric-auth).
- Local gramlot-py-server README, docs/505-kajenn.md and src/gramlot_py_server/kajenn.py: existing Kajenn avatar/tag auth, owner cookie and process-local page registry.
- Local Gramlot js/src/gramlot.js, js/src/bootstrap.js and js/src/binding/logic.js: disposal, page bootstrap and named-logic rules. These are observations, not new extension API approval.


<a id="gcp-010-045"></a>
## 045 · Owner-directed gallery PoC — 2026-10-24

Owner direction (translated): “It is a PoC: we have discussed it and must finish; ideally I would like to access the Gramlot gallery from iPhone.” This directs work toward a usable gallery PoC using the agreed Capacitor/Kajenn boundary, instead of continuing isolated contract questions. Phase-1 work starts with the existing gallery hosted on the dedicated LAN HTTPS site. Existing approved native names and state contracts remain; the previous module/lifecycle proposal is the implementation basis within this bounded objective, not approval of unrelated framework APIs.

The first deliverable is the existing Gramlot gallery over the already trusted Kajenn/Caddy endpoint, followed by the Capacitor shell pointing at it. The gallery implementation stays in gramlot-examples and its existing Python adapter; gramlot-capacitor only configures/hosts it. Native bridge proof remains a separate verification from browser gallery access. Toolchain installation, signing and physical app tests must be reported as actually performed or outstanding.

Owner follow-up: “Yes, catalog and examples work” confirms local iPhone Safari gallery access. The owner then supplied `https://gallery-py.gramlot.dev` and stated “This is the official one”; the generated Capacitor shell uses this official URL. See GCP-015 for implementation, verification and remaining device/toolchain work.
