# 080 · Pinch and slider shared Data PoC

> **Historical record:** this accepted pinch-only increment is superseded by [GCP-085](085-transform-poc.md). Current code uses transformPane.

Document ID: **GCP-080**. Updated: **2026-10-24**.

<a id="gcp-080-005"></a>
## 005 · Approved scope

Owner confirms “Sì, aggiungi pinchPane nel core e prepara la prova”. The reusable layout component accepts generic child content and value/min/max/step/onEnd. Its contract and naming are recorded in GC-105 §960 and GC-225. No native plugin or new DeviceHandler command is required.

The Python fixture binds a slider and two pinchPane instances to view.slider.value, initially 1 with range 0.5–3 and step 0.01. One pane contains the locally captured camera image, the other a rectangle. Their CSS transforms bind to the same scalar. The already approved camera action supplies the photo; no personal photo is read or uploaded by the agent. The rectangle is immediately available without camera permission.

Both pinch onEnd and slider connect_onchange call the existing sliderReleased Logic. It publishes sliderReleased with the current bound value. The subscribed controller updates lastReleased and releases; intermediate pinch movement only writes the shared scalar. No application DOM listeners, synthetic application touch events, arbitrary native dispatch or parallel UI state are introduced.

<a id="gcp-080-010"></a>
## 010 · Local serving and verification

The build copies the matching generated layout collection and grammar into ignored .local/collections, mounted read-only in the existing Kajenn container alongside the local core runtime. Fingerprinted assets and server restart keep code/schema coherent. These are local development artifacts, not package pins or a release. Builder/Bag installations remain untouched.

Implementation and automated verification are complete; physical iPhone touch acceptance is pending. The real Gramlot/JSDOM tests exercise two pointers, shared scalar/slider projection, bounds, completion count, cancellation, external changes and disposal. JSDOM supplies only a test pointer-capture implementation and does not qualify physical touch or native step rounding. Python checks callback isolation and child authoring. Browser and iPhone evidence are recorded separately.

<a id="gcp-080-015"></a>
## 015 · Device trial

Open the refreshed device page. Pinch the rectangle with two fingers: it and the slider must track the same scale. On lifting a finger, the publication counter increases once and the last published value matches the scale. Move the slider and verify the rectangle follows. Capture a photo with the existing button, then repeat on the photo; both panes share the same scale. Repeat a gesture in the opposite direction and at the bounds. A cancelled gesture retains the current scale without a completion publication.

The pane deliberately owns touch gestures within its fixed surface; scroll using the surrounding page. This increment does not add panning, rotation, global gesture interception or a native app build.

Verification checkpoint: 16 focused JavaScript tests and the full core suite (3,915/3,915) pass. Five focused Python authoring/callback tests and 27 renderer tests pass. The live Kajenn page loads the prepared collection; browser slider input changes the shared value to 1.01, both child CSS transforms to scale(1.01), and the publication count to 1. onEnd is absent from the DOM. Earlier callback-filter errors were corrected; no new error was observed during the final browser interaction. No real multi-touch claim is made from JSDOM/browser keyboard checks.

Existing iPhone app relaunch was attempted without a native build; iOS refused because the phone was locked. Owner must unlock and open Gramlot PoC to verify the two-finger gesture. No user photo was captured/read by the agent.


Owner acceptance, 2026-10-24: “si va bene ma si puo anche ruotare?” confirms the current pinch trial works. This accepts the bounded shared-scale interaction; it does not independently verify every cancellation case or confirm a photo-specific test. Rotation is a requested capability discussion, not yet an implemented or approved extension contract.

Explicit hardware confirmation: owner answers “Sì, pinch e slider sincronizzati, una publish alla fine”. Shared scale and one completion publication are now specifically owner-verified. Photo-specific behavior and all cancellation cases remain separately unconfirmed.
