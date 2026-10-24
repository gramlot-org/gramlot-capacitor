# 010 · Phase 0: preparation and proposed contract

Document ID: **GCP-010**. Updated: **2026-10-24**.

[Expanded counterpart](../docs/010-phase-0-preparation.md). [PoC plan](005-poc-plan.md).

**Phase 0 in progress.** Evidence and proposals are prepared; biometric plugin selected; remaining baseline/contract/prerequisites remain open. No app/container implementation.

<a id="gcp-010-005"></a>
## 005 · Confirmed decisions and authorization

Owner, 2026-10-24 (translated from Italian): “OK, let us start phase 0 of the plan in gramlot-capacitor”; “Kajenn with a dedicated test site”; “On the Mac, on the local network” (answer to LAN HTTPS/device-trusted-certificate proposal); “I would put it in Docker, still using Kajenn. Later we can put it on Hetzner with my servers.”

Confirmed: phase-0 preparation, dedicated Kajenn site, Docker on Mac/LAN HTTPS; future Hetzner direction. Docker supersedes direct host-process assumptions for the server, not macOS native builds. Owner also confirmed “Yes, let us adopt this plugin” for @aparajita/capacitor-biometric-auth (local Face ID/Touch ID; site login separate). No phase-1 start or Hetzner access/deployment authorization. Repository and preference for remote site updates remain confirmed.

<a id="gcp-010-010"></a>
## 010 · Docker hosting boundary

Kajenn/Python site runs in Linux Docker on the Mac; iPhone/iPad accesses a Mac HTTPS LAN endpoint; Xcode builds/signs on macOS.

Proposals: own container/site fixtures here and consume existing packages; bind within the container and deliberately publish through the Mac; define stable address/port and certificate trust without bypassing validation. TLS tooling, image base, volumes and configuration names remain undecided. No CA/trust changes made. Credentials stay outside tracked files/image layers.

Page/resource edits may need server restart; dependency updates need image rebuild, not a mobile rebuild while bridge-compatible. Existing Kajenn registry is process-local: propose one process initially. Later reuse the container/application definition on Hetzner with environment-specific HTTPS/secrets; verify target architecture (Mac Docker is ARM64, Hetzner unknown). No server access, registry push or deployment now.

<a id="gcp-010-015"></a>
## 015 · Prerequisite evidence

Read-only 2026-10-24: Apple Silicon/macOS 27.0.1; Docker CLI/engine 29.8.2 Linux/arm64 and Compose 5.5.1, engine reachable; Node 23.11.0 EOL (propose maintained Node 24 LTS); Xcode 26.1.1 selected (Apple documents host macOS through 26.x, so select a supported host/toolchain combination). Numerical Capacitor minimums are insufficient qualification; device support differs from SDK targets, so do not infer iOS 27 necessarily fails.

One paired iPhone on iOS 27.0.1 was discovered disconnected; model/Face ID/Developer Mode unconfirmed, no iPad identified. No identifiers recorded. No device app test. TLS endpoint/certificate, signing team/bundle ID and APNs environment/credentials unresolved; mkcert absent from PATH. APNs is needed for phase 5 only.

Initial sandbox restrictions on Xcode caches/Docker socket were resolved by allowed read-only host queries; not evidence of broken tools. No toolchain install, container startup or signing/trust change.

<a id="gcp-010-020"></a>
## 020 · Candidate inventory

Observed npm versions on 2026-10-24, not pins: core/ios/cli 8.5.3; App 8.1.2; Network 8.0.1; Haptics 8.0.2; Camera 8.2.6; Geolocation 8.2.4; Push Notifications 8.1.3; Local Notifications 8.3.1; @aparajita/capacitor-biometric-auth 10.0.0. Expanded guide records publication dates and responsibilities.

All declare MIT; inspected native archives contain license files. All eight plugins have Package.swift, Swift tools 5.9, iOS 15 and Capacitor SPM dependency from 8.0.0. Static manifests do not prove builds or transitive-license qualification. Platform/tooling package layouts differ; no root manifest does not imply no SPM support.

Official plugin peers require core >=8; ios 8.5.3 peer requires ^8.5.0. Biometric candidate declares direct core/ios/android ^8.0.2 and app ^8.0.0 dependencies: inspect final resolution for duplication. Camera/Haptics/Geolocation/Local Notifications moved to dedicated repos; camera/geolocation add ion native dependencies, geolocation also @capacitor/synapse. Recheck graph at setup; no first-party Genro/Gramlot pins.

Selected: @aparajita/capacitor-biometric-auth for local biometrics. Proposed remaining baseline: official plugins. No paid or secure-storage plugin selected; Keychain/server login is separate.

<a id="gcp-010-025"></a>
## 025 · Proposed operation contract

Conceptual operations, not approved names or Data paths: native app information (id/version/build); installed capabilities/bridge version plus device availability; app/network subscriptions; optional haptic request; explicit photo capture/gallery with temporary reference/preview/metadata; foreground location acquisition/watch; explicit local biometric confirmation; local notification scheduling; remote push permission/registration/token/receipt/tap.

Installed capability, device support and permission are distinct. Native capability reports do not authorize the server or replace Gramlot server capabilities. Connectivity is not server reachability. Photo upload and passcode fallback are not implicit. Token association includes app/environment/account; updates/logout handled, APNs credentials server-only; silent iOS push excluded.

Validate agreed input and complete once with success, cancellation, denial, unsupported/unavailable or operation failure, retaining safe diagnostic detail. These categories are proposals, not string constants/coercions. No arbitrary-plugin dispatcher, automatic prompt retries or duplicate side effects. Disposed pages receive no late results; release owned subscriptions/watches even if native UI cannot be programmatically cancelled.

<a id="gcp-010-030"></a>
## 030 · Gramlot state, lifecycle and bridge boundary

Native plugin owns OS interaction; shared integration owns command/listener lifetime; Gramlot Data remains page state. Explicit actions invoke commands; results/state update Data; normal logic consumes events. Reactive recomputation does not prompt. Dispose page subscriptions; bounded pending app-level tap intent waits for readiness/auth and consumes once/reset at logout. Server authorizes identity/navigation, never a client biometric boolean.

Test trusted remote content, redirects, frames and CSP; TLS is not bridge isolation. Gramlot.dispose aborts its controller and disposes subscriptions/bindings; named Logic disallows constructors. This is evidence, not an approved public extension contract: reuse supported hooks or report the gap, no constructor patch or manual application event system.

Remote-page bridge loading is unresolved: bundled JS is not automatically imported by HTTPS pages, and local JS context does not survive navigation by assumption. No iframe, native HTTP override or alternative origin approved.

<a id="gcp-010-035"></a>
## 035 · Decisions still required and phase gate

Do not re-ask confirmed repository/phase-0/Kajenn/Docker/Mac-LAN-HTTPS/future-Hetzner choices. Biometric plugin is also confirmed. Remaining: confirm official-plugin baseline; confirm bounded operation/lifecycle contract and extension path/naming under GC-225; select supported toolchain/TLS/address/port, then resolve device/signing readiness. Request decisions one at a time.

Propose App.getInfo as first native probe across iPhone/iPad, with Haptics supplementary: upstream haptics may resolve with no physical effect. This refinement is not yet approved. Kajenn supports avatar/tag checks but a scaffold does not provide a test identity system automatically; auth fixture policy remains open. APNs prerequisites need disposition before phase 5, not fabricated success.

Phase 0 ends after contract/ownership acceptance and recorded prerequisites/blockers; phase 1 needs its own start instruction. No package install, container implementation/start, certificate/trust/signing change, native project or deployment from this note alone.

<a id="gcp-010-040"></a>
## 040 · Verification and sources

Inspected eleven npm metadata records/published archives without executing/installing them, eight plugin Swift manifests, local tool/Docker versions, redacted devices and Kajenn/Gramlot source. No app build, native test, TLS connection or container health check.

Sources checked 2026-10-24: [npm registry](https://registry.npmjs.org), [Capacitor setup](https://capacitorjs.com/docs/getting-started/environment-setup), [configuration](https://capacitorjs.com/docs/config), [plugins](https://github.com/ionic-team/capacitor-plugins), [Node schedule](https://github.com/nodejs/Release#release-schedule)/[EOL](https://nodejs.org/en/about/eol), [Xcode matrix](https://developer.apple.com/xcode/system-requirements), [App](https://capacitorjs.com/docs/apis/app), [Haptics](https://capacitorjs.com/docs/apis/haptics), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [Biometric Auth](https://github.com/aparajita/capacitor-biometric-auth).

Local evidence: gramlot-py-server README, docs/505-kajenn.md and src/gramlot_py_server/kajenn.py (avatar/tag auth, owner cookie, process-local registry); Gramlot js/src/gramlot.js, bootstrap.js and binding/logic.js (lifecycle and named logic). Observations do not approve new APIs.
