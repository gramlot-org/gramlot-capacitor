# 010 · Phase 0: preparation and proposed contract

Document ID: **GCP-010**. Updated: **2026-10-24**.

[Concise counterpart](../docs_llm/010-phase-0-preparation.md). [PoC plan](005-poc-plan.md).

**Status: phase 0 in progress.** Inspection and a concrete proposal are available; the biometric plugin is selected, while the remaining baseline, contract and outstanding prerequisites are not yet accepted. No application or container implementation has started.

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
| Future environment | “Later we can put it on Hetzner with my servers.” Future direction, not permission to access or deploy to those servers now. |

Repository placement and the preference for site updates rather than frequent native updates remain confirmed. The Docker decision supersedes any assumption that Kajenn runs directly on the Mac. It does not move the native iOS build into Docker.

<a id="gcp-010-010"></a>
## 010 · Docker hosting boundary

Confirmed target: the dedicated Python Gramlot test site runs with Kajenn in a Linux container on the Mac. The iPhone/iPad reaches an HTTPS address of the Mac over the LAN. Xcode builds and signs the native application on macOS.

Proposed implementation boundary for later phases:

- Keep container definition, site fixtures and operational instructions in gramlot-capacitor; consume existing Gramlot/Kajenn packages without changing their repositories implicitly.
- Bind Kajenn to the container network interface and deliberately publish the required service through the Mac. Device localhost is not the Mac or the container.
- Define TLS termination, certificate issuance/trust, stable local address and port before serving the site. Do not bypass certificate validation. No CA, certificate or trust setting has been created or changed.
- Use configuration for environment-specific URL, credentials and storage. Keep secrets outside image layers and tracked files. Exact configuration names and TLS tooling are undecided.
- Keep live page/resource changes distinct from server dependency changes: page changes may require a Kajenn reload/restart; package changes require a server image rebuild. Neither inherently requires a native app rebuild while the bridge contract stays compatible.
- The existing Kajenn integration keeps its page registry in process; use one process for the first proposed fixture, unless an existing supported affinity strategy is selected.

For eventual Hetzner use, retain the same application/container definition with environment-specific HTTPS and secrets. The Mac Docker engine is ARM64; the Hetzner target architecture is unknown. Verify/build for the actual server architecture later rather than assuming the local image is transferable. No Hetzner credentials, server inspection, registry push, public ingress or deployment are part of phase 0.

TLS implementation, local name/address, port, image base and volume layout remain proposals to settle before implementation, not approved settings hidden in this document.

<a id="gcp-010-015"></a>
## 015 · Prerequisite evidence

Read-only checks on 2026-10-24:

| Item | Evidence | Consequence |
| --- | --- | --- |
| Mac | Apple Silicon, macOS 27.0.1 | Native builds stay on this Mac. |
| Docker | CLI and engine 29.8.2; engine Linux/arm64; Compose 5.5.1 | Engine is reachable. No image built or container started. |
| Node | 23.11.0; only Node 23 discovered in the inspected Homebrew paths | Meets Capacitor's numerical minimum but is EOL. Propose maintained Node 24 LTS before setup; no install performed. |
| Xcode | 26.1.1, selected at /Applications/Xcode.app | Apple's table documents this release for macOS through 26.x, while this Mac is on 27.0.1. Select a supported Xcode/macOS combination before native qualification; no upgrade performed. |
| Physical device inventory | One paired iPhone, iOS 27.0.1, disconnected in devicectl | Model/Face ID and Developer Mode still need confirmation; discovery is not deployment verification. No iPad identified by this check. |
| HTTPS | LAN HTTPS chosen; no endpoint/certificate configured | TLS method and actual device trust remain prerequisites. mkcert was not found on PATH. |
| Signing | Team, permitted bundle ID and signing readiness not verified | Resolve before installing the app; no credentials read. |
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

The owner selected @aparajita/capacitor-biometric-auth for local biometrics. The proposed remaining baseline uses official plugins for supported operations. No paid plugin or secure-storage plugin is selected. Keychain-backed server login remains a separate later contract.

<a id="gcp-010-025"></a>
## 025 · Proposed operation contract

This table describes behavior, not approved API names, proxy names or Data paths. Confirm public naming under GC-225 before implementing it. No generic arbitrary-plugin invocation surface is proposed.

| Operation | Input and result | Explicit limits/failure |
| --- | --- | --- |
| Read native app information | Read-only request; installed app identifier, native version and build | Proposed first probe on iPhone and iPad. A web shim is not evidence of native execution. |
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

<a id="gcp-010-030"></a>
## 030 · Gramlot state, lifecycle and bridge boundary

Proposed ownership:

- Native plugin owns hardware/OS interaction. The shared integration owns native listeners and command lifetimes. Gramlot Data remains the page's observable state.
- Explicit page actions start native commands. Results/state update their agreed Data destinations and existing bindings render them. Ordinary page logic handles events. Recomputing a binding never starts a camera or biometric prompt by itself.
- Page-owned subscriptions end at disposal; subsequent completions cannot update disposed Data. App-level push/tap intent may outlive a page, but requires a bounded owner, single consumption after startup/authentication and a clear reset at logout.
- The site's identity service authorizes RPC and navigation. Face ID outcome or a capability report from JavaScript is never sufficient server proof.
- The remote site uses installed, explicitly exposed native capabilities. Loading remote content, redirects, external frames and script policy must be tested against that boundary; TLS alone is not bridge isolation.

Observed Gramlot hooks: Gramlot.dispose aborts its controller and disposes bindings/subscriptions; named Logic classes cannot declare constructors. These observations suggest useful lifecycle points, but do not yet establish a public extension installation/cleanup contract. Do not patch constructors or invent an application-local event system. Phase 1/2 must identify the supported reuse path or report a bounded core gap.

The stable native bridge/loading mechanism remains unresolved. Bundled JS does not automatically load into an HTTPS page, and a local-page JavaScript context does not persist after navigation. Verify the real Capacitor bootstrap, module imports and strict CSP before claiming feasibility. No iframe, native HTTP replacement or alternate origin is approved.

<a id="gcp-010-035"></a>
## 035 · Decisions still required and phase gate

Confirmed: repository, phase-0 start, dedicated Kajenn host, Docker packaging, Mac/LAN HTTPS and future Hetzner direction. Do not ask these again.

Remaining decisions, requested one at a time:

1. Confirm the remaining official-plugin baseline; the third-party biometric plugin is already selected and must not be asked again. No secure-storage/server-login extension is assumed.
2. Confirm the proposed minimal operation/lifecycle contract and supported extension path; settle public names before implementation rather than inventing them here.
3. Select supported tooling and the local HTTPS/certificate approach, address and port. Confirm actual device/signing readiness before native execution; no trust or toolchain changes happen during this investigation.

Proposed first native probe is App.getInfo (a native result usable on iPad), with Haptics supplementary. This refines the original haptic-first suggestion because the upstream Haptics documentation explicitly allows no-effect success. It remains a proposal for confirmation.

Authentication fixture policy is open: Kajenn provides avatar/tag integration, but the scaffold does not automatically establish a test identity provider. APNs/account setup remains needed before phase 5; uncertainty must be recorded, not replaced with fabricated push success.

Phase 0 closes only after the bounded contract and ownership are accepted and prerequisite/blocker disposition is recorded. Phase 1 requires its own start instruction. No package installation, Dockerfile/Compose implementation, container startup, TLS/signing change, native project or deployment is authorized by this preparation record alone.

<a id="gcp-010-040"></a>
## 040 · Verification and sources

Performed: registry metadata inspection for eleven packages; read-only inspection of eight plugin Swift manifests; local Node/Xcode/Docker versions and redacted device inventory; read-only Kajenn and Gramlot lifecycle inspection. No native build, device app test, TLS connection or container health check has been performed.

Registry records were read from https://registry.npmjs.org and their published tarballs, without installation or execution. Exact versions above are the observation snapshot. Maintainers/releases and static manifests are evidence, not runtime qualification.

Primary references checked on 2026-10-24:

- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup), [configuration](https://capacitorjs.com/docs/config) and [official plugins](https://github.com/ionic-team/capacitor-plugins).
- [Node release schedule](https://github.com/nodejs/Release#release-schedule) and [EOL versions](https://nodejs.org/en/about/eol).
- [Xcode system requirements](https://developer.apple.com/xcode/system-requirements).
- [App](https://capacitorjs.com/docs/apis/app), [Haptics](https://capacitorjs.com/docs/apis/haptics), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications).
- [Biometric Auth source](https://github.com/aparajita/capacitor-biometric-auth).
- Local gramlot-py-server README, docs/505-kajenn.md and src/gramlot_py_server/kajenn.py: existing Kajenn avatar/tag auth, owner cookie and process-local page registry.
- Local Gramlot js/src/gramlot.js, js/src/bootstrap.js and js/src/binding/logic.js: disposal, page bootstrap and named-logic rules. These are observations, not new extension API approval.
