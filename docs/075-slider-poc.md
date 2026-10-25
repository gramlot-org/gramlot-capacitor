# 075 · Slider binding and release publication

Document ID: **GCP-075**. Updated: **2026-10-24**.

<a id="gcp-075-005"></a>
## 005 · Scope and contract

Owner: “ok proviamo uno slider collegato ai dati gramlot, con una publish al rilascio”. The Python device page uses the existing horizontalSlider with live=True, range 0–100, step 1 and value bound to view.slider.value (initially 25). No device plugin or new core API is introduced.

connect_onchange invokes sliderReleased, which reads the bound Data value and publishes sliderReleased with {value}. The subscribed dataController invokes sliderReceived, storing view.slider.lastReleased and incrementing view.slider.releases. The subscriber has no reactive value argument: intermediate live edits must not invoke it. All displayed values use ordinary Data bindings.

A native range change means a committed user edit: touch/mouse completion or keyboard change. It is not an unconditional pointerup event; a release without changing the value does not publish. Programmatic Data writes project back into the slider without publishing. There is no server call, device-wide gesture service or manually wired application DOM.

<a id="gcp-075-010"></a>
## 010 · Verification and trial

A diagnostic with the real Gramlot runtime, shared slider component and actual page Logic verifies live intermediate Data writes without publication, one publication per change with final payload, reverse Data binding without publication and subscription cleanup on branch removal. Python syntax and live Kajenn page loading pass after using the existing dataSetter declaration for initialization. Browser keyboard and pointer edits update both current and published values: 25 → 26 (publication 1), then 50 (publication 2). A coordinate-based browser drag was inconclusive; physical iPhone dragging remains owner verification. No complete regression run is claimed for this page-only change.

In the device page, drag the slider while observing the current value. The last published value and counter should change only on release. Repeat in both directions. This is a site-only update; no native rebuild or installation is required.

The existing iPhone app relaunch was attempted without rebuilding; iOS refused because the device was locked. Owner must unlock and reopen Gramlot PoC to complete the touch trial.


<a id="gcp-075-015"></a>
## 015 · Requested pinch extension — decision checkpoint

Owner requests a pinch on a photo and rectangle sharing the slider Data value, with a publication at completion. Current core has no reusable pinch recognizer. Proposed pinchPane would own two-pointer recognition and write its value through the existing Source parameter binding; min/max/step would agree with the slider. A named onEnd callback would call the same publication Logic as slider change. The photo and rectangle would derive their visual scale from Data, not direct application DOM manipulation. The panel stays a generic component, not a device plugin or a photo-specific parallel state model.

This framework addition is awaiting explicit owner confirmation under constitution §3. No pinch implementation or hardware acceptance is claimed; precise cancellation/lifecycle details must be recorded before implementation.

Owner subsequently confirms “Sì, aggiungi pinchPane nel core e prepara la prova”. The approved implementation and current checks are tracked in GCP-080; the pending text above records the earlier checkpoint.
