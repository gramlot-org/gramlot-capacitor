# 095 · Photo library through device Data

Document ID: **GCP-095**. Updated: **2026-10-24**.

<a id="gcp-095-005"></a>
## 005 · Scope and contract

Owner requests “bene, proviamo ora a scegliere foto dalla libreria, sempre passando dai dati gramlot”. Single-photo selection extends the existing camera result and pending gate. Source.FIRE('gramlot.device.camera?choose') calls DeviceProvider.choosePhoto(signal). Reads and ordinary writes never open the library. gramlot.device.camera retains its Bag {url,format}; both acquisition methods update the existing image and transform bindings. Capture remains a distinct explicit command. No arbitrary plugin dispatcher, photo resolver, multiple selection, video, editing or upload is introduced.

While either command is pending, additional capture/choose commands are ignored. Pending, cancellation and errors preserve the last valid image, as in the capture contract. Status/error report pending, success, cancelled, denied, unavailable or error; cancellation has no error object. A new successful choice replaces the image. Disposal aborts result delivery and ignores late native completion. It cannot dismiss an already open SDK panel; the preview uses a native temporary URL, without a durable-storage guarantee.

<a id="gcp-095-010"></a>
## 010 · Native provider

The already installed @capacitor/camera 8.2.6 exposes chooseFromGallery. The provider passes mediaType=Photo, allowMultipleSelection=false, editable=no, quality=85 and includeMetadata=true. Exactly one Photo with a nonempty webPath and metadata.format is required. Only {url,format} enters Data: actual format is retained, while private URI, thumbnail and EXIF are not exposed or logged. Missing metadata is an error, without guessed formats or alternative acquisition APIs.

Installed iOS source (IONCAMRFlowBehaviour/IONCAMRPermissionsBehaviour) handles library authorization inside the SDK, accepting limited or full access. The provider does not request camera permission. OS-PLUG-CAMR-0005 maps to PERMISSION_DENIED and OS-PLUG-CAMR-0020 to CANCELLED; other errors keep the existing mapping. Existing native Info.plist photo-library usage descriptions are present. The owner handles any iOS authorization panel. No new dependency or native rebuild was needed; the existing app includes this Camera API.

<a id="gcp-095-015"></a>
## 015 · Verification and iPhone trial

73 focused core/handler tests, all 3,931 core tests and 63 provider/page tests pass. Synthetic tests cover explicit-only execution, image binding, capture/choose exclusion, errors and retry, disposal, SDK options, result cardinality/type/format and filtering of private metadata. Python syntax, runtime/provider rebuild and local container refresh pass. Browser “Scegli dalla libreria” reports unavailable through the bound camera status, without a browser file-picker fallback. Hardware selection, limited access and cancellation remain unverified until owner feedback.

On iPhone open Gramlot PoC, choose “Scegli dalla libreria” in “Fotocamera e libreria foto”, authorize the desired library access and choose one non-sensitive test photo. Expect success, format and the shared preview. The same photo is available in the transform section. Open the picker again and cancel: expect cancelled and the previous image retained. No image is sent to the server.

Final local checkpoint: HTTP 200 after container refresh. Automatic iPhone relaunch failed because the device connection was reset; no reinstall was attempted. The owner can reopen the app on the same LAN for the pending selection/cancellation trial.
