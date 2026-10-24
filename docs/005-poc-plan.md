# 005 · Capacitor client proof of concept

Document ID: **GCP-005**. Date: **2026-10-24**.

[Concise counterpart](../docs_llm/005-poc-plan.md). [Repository overview](../README.md).

**Status: saved proposal; implementation not started.** Repository creation and plan persistence are authorized. Phase execution, public API names, unresolved architecture choices and product adoption are not authorized by this document.

<a id="gcp-005-005"></a>
## 005 · Purpose and owner direction

Demonstrate a native iPhone/iPad container that opens a remote Gramlot site, exposes camera, biometric authentication, notifications and location to its pages, and receives application changes from the site without reinstalling the native binary.

Owner direction in the originating conversation, 2026-10-24 (English translations of the Italian messages):

- Prefer updating the served site and avoiding frequent store updates.
- Use the same container implementation for separate applications with different icons and site URLs.
- Explore camera, Face ID, notifications, geolocation and their integration with Gramlot bindings.
- Repository placement: “I would see it as a gramlot-capacitor repository.”
- Current authorization: “OK, create the gramlot-capacitor repository and save the PoC plan before starting implementation.”

These statements establish the objective, repository and current documentation scope. They do not approve every proposed technical choice below. Store publication and a production architecture are outside the current authorization.

<a id="gcp-005-010"></a>
## 010 · Proposed architecture and responsibilities

| Installed application | Remote site |
| --- | --- |
| Capacitor runtime and selected native plugins | Gramlot browser runtime and its web dependencies |
| Minimal native bridge and connection/error handling | Python-authored pages, Source and Data |
| App identity, icon and trusted site configuration | Application browser logic, CSS and resources |
| Native permissions and platform configuration | Services, identity integration and push sender |

One container codebase produces separately identified apps. Begin with one site and one iOS app; later validate a second configuration without copying or diverging the container implementation.

Proposed primary path: load the HTTPS site in Capacitor's main WebView using server.url. Verify that remote page modules can access installed plugins under the site's actual CSP. Capacitor documents server.url for development, not production; this experiment does not resolve distribution or production support.

The packaging and loading mechanism for the minimal bridge remains to be proved. Files bundled with the app are not automatically available as imports to a remote page. Do not assume loading the website preserves a JavaScript context previously created in a local page.

Dependencies point from gramlot-capacitor toward Gramlot and its integrations. Core receives no Capacitor dependency. General runtime contracts remain in core; HTTP hosting, identity and server push delivery remain in the appropriate server/application layer. The exact host for the PoC and any connected-repository changes require a bounded decision.

Keep demonstration pages Python-first and based on Source, Data Bags, bindings, controllers, resolvers and shared components. No parallel UI, DOM/event machinery or application-local transport workaround. Prefer existing extension/resource mechanisms; report missing lifecycle or extension points before proposing a bounded owning-project change.

<a id="gcp-005-015"></a>
## 015 · Scope and prerequisites

Required demonstrations: remote Gramlot rendering and RPC; native capability discovery; camera with bound preview; foreground location; real biometric prompt; local notification; real remote push with navigation; web-only update with unchanged installed binary.

Supporting scope: network and app lifecycle, permission/error states, listener cleanup, trusted navigation and app/bridge capability reporting. A simple haptic operation is the proposed first bridge probe.

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

Prepare the plugin inventory, select the host and devices, and settle the minimal bridge contract before implementation. Ask one unresolved owner decision at a time. Camera, Geolocation, Push Notifications, Local Notifications, App and Network are official-plugin candidates; Haptics is the proposed initial probe. Biometric Auth is a third-party candidate, not a selection already made.

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
## 060 · Deliverables, progress and next action

Current completed work: local repository skeleton, this plan and its concise mirror. No runtime implementation, dependency installation, signing setup, device execution, public remote, release or deployment.

Future deliverables: reproducible container setup; site configuration format; Python Gramlot demonstration pages; reusable native integration; plugin inventory; contract documentation; focused checks and hardware verification report; explicit unresolved gaps and production-readiness assessment.

Phase status: 0 through 6 are **not started**. Next action after the owner requests implementation: confirm the bounded execution contract, starting with the host/site and phase-1 bridge probe. Repository placement is already confirmed and must not be asked again. Credentials and unresolved ownership choices are requested only when needed; unaffected work can continue.

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
