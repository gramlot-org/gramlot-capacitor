# 125 · Native screen orientation and motion

Document ID: **GCP-125**. Date: **2026-10-25**.

<a id="gcp-125-005"></a>
## 005 · Confirmed scope

Owner requests orientation, gyroscope and accelerometer through Gramlot Data and enabled sensor attributes, then answers “ok” to the proposed concrete contract. The iPhone implementation uses UIKit/Core Motion without a third-party dependency. Android remains unqualified. The separately requested native SQLite/Asqueel persistence probe remains pending, not cancelled by this increment.

<a id="gcp-125-010"></a>
## 010 · Data contract

| Node under gramlot.device | Value | Control/state attributes |
| --- | --- | --- |
| orientation | type (portrait/landscape), direction (primary/secondary), timestamp | listening, status, error |
| gyroscope | x, y, z in rad/s; timestamp | enabled, watching, status, error |
| accelerometer | x, y, z in g including gravity; timestamp | enabled, watching, status, error |

Values are Bags. Timestamps are Unix milliseconds. Motion axes are device-fixed, not screen-rotated; the gyroscope reports angular velocity, not absolute attitude. Orientation describes the actual interface and respects the user's rotation lock. UIKit portrait and landscapeLeft are primary, their opposites secondary.

Sensors start disabled. Writing enabled=true starts native updates at a target interval of 100 ms; no exact delivery frequency is promised. watching reports effective activity. Background/inactive state suspends measurements without clearing intent; foreground resumes requested streams. Last samples remain visible when paused or disabled; timestamp identifies their age. Status is pending while awaiting measurements, success on a sample, idle while stopped/suspended; native failure uses existing unavailable/denied/error states. A failed stream requires an explicit disable/enable to retry. No browser simulation or fallback.

<a id="gcp-125-015"></a>
## 015 · Ownership and lifecycle

DeviceHandler owns Data writes and subscriptions. Provider methods startOrientationEvents/startGyroscopeUpdates/startAccelerometerUpdates return async disposers; the existing exact-origin, Source-owned iframe broker carries them. Closing an iframe or page aborts pending startup, releases its own native callback and ignores late events. Disabling/re-enabling waits for prior cleanup.

GramlotMotionPlugin owns one CMMotionManager and callback resources shared across consumers. Native stops when no remaining consumer requests a sensor. Main-WebView navigation releases all old streams. UIApplication activity suspends/resumes sensors; UIKit layout/transition completion updates orientation. NSMotionUsageDescription is included. No data is sent to a server.

The Python page pages/motion.py and catalogue entry motion belong to this module, independent of the gallery. Use the local app entry “Device examples on Mac”, then “Orientation and sensors”. This development route still requires the Mac/LAN. No deployment or TestFlight upload is part of this increment.

<a id="gcp-125-020"></a>
## 020 · Verification and remaining acceptance

Verified: 3,951 core tests, provider/entry tests (71 after the startup regression check), three Python module tests and signed iOS Debug compilation. The native development build is installed on the configured iPhone. Local browser rendering exposes the expected unavailable orientation and disabled sensor controls. Core/frame tests cover independent consumers, background state, invalid values, unavailable/denied capability, pending-start cancellation, synchronous controller cancellation, rapid restart and late events. Native iPhone measurement/rotation/background acceptance remains pending.

The first installed entry was blank: native console identified an unresolved @gramlot/gramlot import in the bundled provider. shell/index.html now supplies the import map to the embedded gramlot.js; an entry regression check covers it. An earlier local site import failure exposed the missing MobileEnvironment export in this worktree; the established shared export was restored. Full-suite Python failures on the first invocation were environment configuration, resolved using the project's venv and source path. These failures are not hardware acceptance.

Hardware checklist: rotate with rotation lock off; enable each sensor and inspect x/y/z/timestamp; disable and confirm watching=false; go Home then return and confirm desired updates resume; leave and reopen the page and confirm both sensors default disabled.


Native startup verification after the import-map correction: devicectl installs and launches successfully; the native console reports WebView loaded and an orientation callback with type portrait / direction primary. Sensor movement and background acceptance remain pending. Owner then requires English-only UI; GCP-110 §055 records the copy update.


<a id="gcp-125-025"></a>
## 025 · Delayed native sensor activation correction — 2026-10-25

Owner reports empty axis fields and watching=false on iPhone. Native console confirms startGyroscope/startAccelerometer each initially report watching=false, followed by real samples without a later state transition. Core correctly ignores samples while watching=false; the defect belongs to the native provider.

GramlotMotionPlugin now reports each session's transition to watching=true before delivering its first measurement. Per-session state deduplication avoids repeated metadata writes. Disabling, background suspension and page resource ownership are unchanged. The same correction applies to both sensors.

Verified: seven motion tests pass, including an added real Source-binding test for delayed activation and visible axis values; signed Debug compilation, installation and launch succeed. Native hardware acceptance of the corrected values is pending. No public deployment, beta regeneration or upload.


Owner hardware confirmation, 2026-10-25: “Sì, ora vedo i valori dei due sensori” confirms displayed gyroscope and accelerometer values after the delayed-activation fix. This does not establish background/resume or orientation acceptance. The owner also observes changing values at rest and suggests a threshold; a configurable Data update threshold is under discussion, not implemented or approved.
