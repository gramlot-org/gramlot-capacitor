# 005 · Capacitor client proof of concept

Document ID: **GCP-005**. Date: **2026-10-24**.

[Expanded counterpart](../docs/005-poc-plan.md). [Repository overview](../README.md).

**Phase 0 in progress; implementation not started.** Owner authorized phase 0 and selected a dedicated Kajenn site in Docker on the Mac over LAN HTTPS. Hetzner is a future destination, not deployment authorization. [GCP-010](010-phase-0-preparation.md) records evidence, proposals and open decisions; phase 1 and new APIs remain unapproved.

<a id="gcp-005-005"></a>
## 005 · Purpose and owner direction

Owner direction, originating conversation of 2026-10-24: minimize store updates, serve mutable application code from the site, share container code across separately identified apps, and explore camera, Face ID, notifications and location through Gramlot bindings. Owner explicitly chose gramlot-capacitor and requested (English translation): “OK, create the gramlot-capacitor repository and save the PoC plan before starting implementation.” Subsequent owner confirmations (English translations): “OK, let us start phase 0 of the plan in gramlot-capacitor”; “Kajenn with a dedicated test site”; “On the Mac, on the local network”; “I would put it in Docker, still using Kajenn. Later we can put it on Hetzner with my servers.” The LAN choice answered an HTTPS/device-trusted certificate proposal. Remaining technical choices below are proposals.

<a id="gcp-005-010"></a>
## 010 · Proposed architecture and responsibilities

Installed: Capacitor, selected plugins, minimal native bridge/connection handling, identity/icon/trusted URL and native permissions. Remote: Gramlot runtime/dependencies, Python-authored pages, Source/Data, browser application logic, styles and server services.

Proposed primary path: HTTPS site in the main WebView through server.url. Prove bridge access and loading under actual CSP; bundled files do not automatically become remote-page imports, and a local page's JavaScript context does not survive navigation by assumption. Capacitor documents server.url for development, not production.

Dependency direction: gramlot-capacitor → Gramlot/integrations. No core Capacitor dependency. Core owns general runtime contracts; host/application owns HTTP, identity and push sending. Kajenn in Docker on the Mac is confirmed; connected edits, TLS details and bridge contract remain separate decisions. Use Python-first Source/Data/bindings/controllers/resolvers/components; no parallel UI, manual DOM wiring, ad hoc page requests or workarounds for missing library capabilities.

<a id="gcp-005-015"></a>
## 015 · Scope and prerequisites

Required: remote rendering/RPC, capability discovery, camera preview, foreground location, real biometrics, local notification, real remote push/navigation and web-only updates with unchanged binary. Supporting: permissions, network/lifecycle, cleanup and trusted navigation. Proposed first bridge probe: haptics.

Deferred: Android qualification, offline data synchronization, background location, silent pushes, exhaustive plugins, stores and production guarantees. Biometric server sign-in is separate from local authentication.

Resolve devices/OS (physical Face ID device; physical iPad coverage or explicit limitation), signing identity, HTTPS site, Python host/session model, APNs credentials/environment, plugin licenses/maintenance/SPM, and synthetic test data. No paid purchase assumed. APNs absence blocks push acceptance only. Observed baseline: Apple Silicon, Xcode 26.1.1, Node 23.11.0; recheck supported versions at setup. No first-party dependency pins.

<a id="gcp-005-020"></a>
## 020 · Phase 0 — Contract and preparation

Inventory/select plugins and define inputs/results, permission denial, cancellation, unavailability and failure. Distinguish installed capability, device availability and permission. Official-plugin candidates: Camera, Geolocation, Push/Local Notifications, App, Network and Haptics; the owner selected @aparajita/capacitor-biometric-auth for local biometrics; remaining baseline/contract decisions are in GCP-010.

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
## 060 · Deliverables, progress and next action

Completed: repository skeleton, paired plan, phase-0 plugin/manifest inspection, prerequisite checks and paired GCP-010 proposal. No implementation, installation, signing, device app execution, public remote, release or deployment. Phase 0 in progress; phases 1–6 not started.

Future: reproducible container, site configurations, Python demo pages, reusable integration, plugin inventory, contracts, focused checks/hardware report, unresolved gaps and production assessment.

Repository, Kajenn, Docker and Mac/LAN HTTPS are confirmed. Next settle plugin selection, bridge contract and remaining prerequisites in GCP-010, one decision at a time. Credentials are requested when needed; phase 1 has not started.

<a id="gcp-005-065"></a>
## 065 · Evidence and references

Read-only observations 2026-10-24: Gramlot checkout HEAD d01bf3d (bootstrap.js, http-transport.js, server/gramlot-server.js, GC-230) uses server bootstrap/resource URLs and same-origin HTTP credentials; not full commit qualification. Genropy checkout HEAD fa35e5adfa (genro_cordova.js, connection.py, gnrstatichandler.py) shows UA detection, Cordova loading and events into Data; native project unverified. Preserve behavioral evidence, no bulk port.

Apply core constitution §§1–7, 9–10, 13, GC-005 and GC-225. References checked 2026-10-24: [configuration](https://capacitorjs.com/docs/config), [historical maintainer explanation](https://github.com/ionic-team/capacitor/discussions/5183), [Camera](https://capacitorjs.com/docs/apis/camera), [Geolocation](https://capacitorjs.com/docs/apis/geolocation), [Push](https://capacitorjs.com/docs/apis/push-notifications), [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [App](https://capacitorjs.com/docs/apis/app), [Security](https://capacitorjs.com/docs/guides/security), [Biometric Auth candidate](https://github.com/aparajita/capacitor-biometric-auth). Standard geolocation has no direct background support; standard push has no silent iOS support; plugin selection remains open.
