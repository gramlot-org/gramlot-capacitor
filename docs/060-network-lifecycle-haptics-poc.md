# 060 · Network, lifecycle and haptics Data PoC

Document ID: **GCP-060**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser verified, signed and installed on iPhone. Haptic impact is owner-accepted after enabling System Haptics; network/lifecycle hardware checks remain pending. Later diagnostic entries below supersede earlier pending observations.

<a id="gcp-060-005"></a>
## 005 · Scope and direction

Owner explicitly requests network, app lifecycle and haptics following acceptance of Code 128 and cancellation. The seven official plugins, including Network, App and Haptics, were previously approved. Scoped naming follows GC-225 §100 and the owner's earlier delegation to proceed without repeated implementation-detail questions. These are foreground, page-owned integrations; no browser emulation, background task service or automatic reconnection policy is added.

<a id="gcp-060-010"></a>
## 010 · Data contract

- gramlot.device.network: null, then Bag {connected, type}. connected is boolean; type is none, unknown, wifi or cellular. This describes a network link, not Internet or server reachability.
- gramlot.device.lifecycle: Bag {active:null, event:null, sequence:0}. Initial state and state events update active:boolean. Pause/resume update event and increment sequence; active=false does not by itself imply background. No history or cross-session persistence is retained.
- Both expose status (idle/pending/success/unavailable/error), error and listening attributes. Attach subscribes automatically and reads initial state, with no timer. A native state event supersedes an in-flight snapshot. Missing capabilities become unavailable; failed setup cleans up owned handles. Disposal ignores callbacks and removes all handles, including late setup completions. Malformed events report error without replacing valid state; valid later events recover.
- gramlot.device.haptics: null or Bag {style, acknowledged:true}. Attributes style=medium (light/medium/heavy), impact=null, status=idle, error=null. FIRE('gramlot.device.haptics?impact') executes; ordinary writes and reads do not. It snapshots style, clears old result, rejects unsupported styles, deduplicates pending work and ignores late results after disposal. Success confirms native acknowledgement only; unsupported hardware may resolve without a physical effect.

Provider boundaries: DeviceNetwork, DeviceLifecycleEvent, startNetworkEvents(callback, signal), startLifecycleEvents(callback, signal), impact(style, signal). Lifecycle callbacks carry {kind:state, active} or {kind:pause/resume}. Each subscription returns asynchronous cleanup. Native SDK types stay in gramlot-capacitor.

<a id="gcp-060-015"></a>
## 015 · Fixture and hardware checks

Python declares bound fields and haptic command buttons. A dataController reacts to lifecycle.sequence and updates page-local view.lifecycle.pauses/resumes counters. They reset on a new page. The callback bridge only writes Data; the controller implements the application reaction.

Load the page while the Mac is reachable. Change the phone's network without reloading, then restore Wi-Fi; connected/type should reflect native events. This does not test reachability of the Mac. Go Home and return: pause/resume counts should increase and active return true. Native JavaScript may receive queued events only after resumption. Tap each haptic intensity and verify both Data acknowledgement and actual feedback on supported hardware. Safari should report unavailable, without fabricated native state.

<a id="gcp-060-020"></a>
## 020 · Verification

- Core: 53 focused Device/handler tests and 3,895 full-suite tests pass. Coverage includes reactive network fields, lifecycle controller events, inactive/background distinction, malformed-event recovery, missing capabilities, setup failure, disposal during subscription, and explicit/deduplicated haptic commands with style snapshot and no late writes.
- Capacitor suite: 44 tests pass, including native state projection, initial snapshot versus newer event races, partial listener setup cleanup, disposal while a handle arrives, removal failures attempting all handles, and haptic mapping/error/abort cases.
- Browser: all three Python sections render without console errors. Network/lifecycle show unavailable. Explicit haptic command shows unavailable with no fabricated acknowledgement.
- Native: official Network 8.0.1 and Haptics 8.0.2 installed; App 8.1.2 already present. SPM sync, signed build, strict signature verification and device installation pass. Network/Haptics/App plugins are present in the built bundle. Automatic launch is blocked by the locked phone; the owner is asked to open the app and verify initial Wi-Fi state, Home/return counters and tactile feedback. Network changes and hardware acceptance remain pending.
- An initial full-suite invocation during the runtime rebuild, without local server permissions, failed bundle freshness and reference-server startup checks. The settled build with the required local-server access passes all 3,895 checks. No production deployment or release is performed.

[Network API](https://capacitorjs.com/docs/apis/network), [App API](https://capacitorjs.com/docs/apis/app), [Haptics API](https://capacitorjs.com/docs/apis/haptics).


Hardware diagnostic, 2026-10-24: owner reports haptics status=success with no felt vibration. Haptic hardware acceptance is therefore not achieved; network/lifecycle acceptance is still not individually confirmed. A diagnostic using the actual page Logic and real Gramlot button/runtime with a stub native provider verifies light/medium/heavy all reach the provider correctly and update Data. The installed Haptics plugin resolves impact after dispatching UIImpactFeedbackGenerator to the main queue; its success cannot prove tactile output. The cause remains undetermined; next checks are iPhone vibration/system-haptics settings and a repeated foreground heavy impact. No workaround or alternate vibration API is introduced.


Follow-up: owner again reports no tactile output. The installed plugin uses UIImpactFeedbackGenerator(style:) and resolves before its dispatched main-queue operation; SDK 27.1 also offers the view-associated initializer, but this alone is not evidence of the fault. No audio-session recording setup was found in the inspected app/plugin Swift sources; camera interference remains an unconfirmed hypothesis, not a diagnosis. Next diagnostic asks whether an iOS Settings haptic pattern physically vibrates, to separate app behavior from system/hardware conditions. No dependency patch, fallback or new device command is authorized or introduced by this investigation.


Native reproduction, 2026-10-24: owner confirms an iOS Settings ringtone haptic pattern vibrates. The app was terminated/relaunched under devicectl console and owner again reports success without tactile impact before opening camera/scanner. Private console records repeated Haptics impact native calls. This verifies bridge dispatch and reproduces the failure in a fresh app, not just after camera use; it does not identify the cause or prove completion on the native main queue. Official npm latest is still 8.0.2 and upstream impact code matches the installed implementation. Specific System Haptics toggle confirmation remains pending, distinct from ringtone-pattern output. No source behavior was changed.


Resolution and haptic hardware acceptance, 2026-10-24: owner reports “si va ma un slo tic” and explicitly confirms “Era disattivato: l’ho attivato e ora funziona” for System Haptics. The single brief impact is now physically perceived. The observed blocker was the disabled iOS System Haptics setting; ringtone-pattern vibration had remained functional. No plugin or Gramlot behavior change was required. Haptic impact is owner-accepted; separate network-change and lifecycle-counter checks remain pending. Temporary native console collection was stopped. Impact is a transient tactile event, not a sustained vibration command.


<a id="gcp-060-025"></a>
## 025 · Longer vibration through Data

Owner explicitly requests a longer vibration using Gramlot Data. GC-225 records the scoped contract: haptics?duration defaults to 600 integer milliseconds (accepted range 1–5000), and FIRE(haptics?vibrate) calls provider vibrate(duration, signal). Result: Bag {duration, acknowledged:true}. Impact and vibration share the pending gate, status/error and disposal behavior; each clears the earlier result. Plain reads/writes never execute either. Success acknowledges the native call, not completion of its physical effect. There is no SDK stop API and no timer-based repetition. Python adds a Vibrazione 600 ms button; Logic emits only FIRE. The installed Haptics plugin already implements this method. Verification: 55 focused core tests, full core suite 3,897/3,897 and Capacitor suite 46/46 pass. The served Python page renders without console errors; its vibration button reports unavailable in the browser. The iPhone app was relaunched successfully using the same installed native binary. Owner confirms “Sì, vibrazione più lunga e dati corretti” for longer physical vibration, duration=600, acknowledged=true and success. This is perceived-duration acceptance, not instrumented timing precision.
