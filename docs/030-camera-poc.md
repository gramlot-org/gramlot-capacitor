# 030 · Camera Data PoC

Document ID: **GCP-030**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser tested, signed, installed and launched on the connected iPhone. The owner confirmed native capture and preview: “Funziona, vedo la foto.” Native cancellation has not been separately confirmed.

<a id="gcp-030-005"></a>
## 005 · Owner direction and scope

Owner: “proviamo ora con la fotocamera, sempre con la stessa filosofia dei dati” (try the camera with the same Data philosophy), then “continua”. The previous device page received positive general feedback, “mi pare vada benone”. Combined with the earlier request to proceed without repeated questions, this authorizes the following bounded implementation choices; they are not presented as individually confirmed proposals. GC-225 §100 records names before implementation.

One foreground photo capture, an ordinary Data result and an image binding. No gallery picker, video, upload, background acquisition or persistent command queue. Appinfo/location behavior remains documented in GCP-020 and GCP-025.

<a id="gcp-030-010"></a>
## 010 · Data map and trigger

| Path | Meaning |
| --- | --- |
| gramlot.device.camera | Initially null; last successful result Bag |
| gramlot.device.camera.url | Local WebView preview URL |
| gramlot.device.camera.format | jpeg, the explicitly requested encoding |
| gramlot.device.camera?capture | Transient FIRE event; true requests capture |
| gramlot.device.camera?status | idle, pending, success, cancelled, denied, unavailable or error |
| gramlot.device.camera?error | null or the shared code/message error object |

A Source node issues `node.FIRE('gramlot.device.camera?capture')`. FIRE resets the transient attribute using the ordinary Gramlot semantics. Plain SET/setAttr, reading the result and rendering its bindings do not open the camera. This is an action, so there is no camera resolver, cacheTime, enabled/watching, or public capture method on gramlot.dvc. refresh/invalidate still accept appinfo/location only.

Only one capture is pending per page. Repeated commands while pending are ignored; the sample disables its button through a dataFormula/status binding. Pending clears error and retains the old photo. Success replaces the result. Cancellation sets cancelled with null error; denial sets denied/PERMISSION_DENIED, unavailable uses UNAVAILABLE, other failures use FAILED. All non-success outcomes retain the last photo. Retry requires another explicit FIRE. Disposing the page aborts pending acquisition startup and ignores late results/errors; it does not promise programmatic dismissal of a native dialog already shown.

<a id="gcp-030-015"></a>
## 015 · Provider and Python page

DeviceHandler belongs to core; DevicePhoto is the generic url/format result type. The explicit provider advertises camera capability and implements takePhoto(signal). CapacitorDeviceProvider uses the official Camera.takePhoto API (introduced in 8.1), checks/requests camera permission only, requests JPEG quality 85 with saveToGallery=false and includeMetadata=false, and translates structured native error codes. No old getPhoto fallback or natural-language error matching.

The returned webPath becomes url. On iOS, Capacitor's portablePath builds the local app-scheme file URL; the site does not receive image bytes. The Bag contains a reference, not base64 or EXIF. The reference is for this page and the native temporary file; persistence across page/app sessions is not promised. The plugin controls its temporary storage. The PoC does not save to Photos. Info.plist includes the three usage descriptions required by the plugin; this slice requests only camera access.

Python authors the section, button, dataFormula and image. Companion Logic emits FIRE; `src="^gramlot.device.camera.url"` supplies the preview. Runtime/page/provider are served live by Kajenn; adding Camera to the binary required this native rebuild. The local HTTPS environment and trusted Caddy CA are reused.

<a id="gcp-030-020"></a>
## 020 · Verification and device check

- Full core suite: 3,693 passed, including 19 device tests. Camera tests cover explicit events versus passive reads/plain writes, duplicate pending commands, actual image and button bindings, cancellation/denial/error retention, malformed results, unavailable capability and late completion after disposal.
- Provider: 12 passed; camera tests cover exact options/result projection, permission prompting/denial, structured errors, abort before prompt, and absent preview URL.
- Browser: initial idle becomes unavailable only after Scatta foto; no native/browser fallback or simulated photo, no console warnings/errors.
- Local HTTPS: page, provider, Python source and gallery respond 200 with the actual CA verified.
- Camera 8.2.6 synced; signed iOS build, strict signature verification and target provisioning coverage pass. Device installation and launch both return success. Private logs and build products stay in ignored .local/.

On the iPhone, open Gramlot PoC, scroll to Fotocamera and tap Scatta foto. Grant Camera access if prompted, take a photo and confirm it. Check preview and success, then start another capture and cancel: the previous image should remain with cancelled status. Capture and preview are now owner-accepted; cancellation is still not separately confirmed. No real photo was acquired or uploaded by the agent. In Safari this native-only probe reports unavailable. The gallery link still points to the official gallery, which was not changed.

[Device page and startup commands](025-device-poc.md). [Official Camera API](https://capacitorjs.com/docs/apis/camera).


Photo-library follow-up, 2026-10-24: the owner now requests single-photo selection. [GCP-095](095-photo-library-poc.md) adds the explicit choose command and reuses this camera result/preview, superseding the earlier exclusion of gallery selection only for that bounded feature.
