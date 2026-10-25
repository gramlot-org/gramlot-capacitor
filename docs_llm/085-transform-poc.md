# 085 · Translation, rotation and zoom in Data

Document ID: **GCP-085**. Updated: **2026-10-24**.

<a id="gcp-085-005"></a>
## 005 · Approved scope

Owner requests “potremmo anche traslare . in pratica x y rotate zoom” and confirms “ok” to the four-Data transformPane proposal. Core layout replaces unreleased pinchPane with transformPane, without aliases. GC-105 §965 and GC-225 specify the contract.

The Python fixture binds both camera photo and rectangle to view.transform.x/y/rotate/zoom, initially 0,0,0,1. A Data formula produces CSS translate/rotate/scale. Required numeric fields and a zoom slider edit the same values. Each fixed transformPane surface owns pointer recognition and writes only Data. One finger translates; two combine movement, rotation and zoom. A two-to-one finger transition continues the same gesture; only last lift completes.

The shared transformReleased Logic publishes {x,y,rotate,zoom}; a subscribed controller writes view.transform.last and increments releases. Intermediate changes do not publish. Cancellation retains the current tuple without completion. Rotation is unbounded; zoom is 0.5–3 with step 0.01. No native plugin, binary rebuild, arbitrary DOM wiring or server upload is introduced.

<a id="gcp-085-010"></a>
## 010 · Verification

22 focused JS checks, the full core suite (3,921/3,921) and five Python authoring/callback checks pass. Tests cover combined transforms, touch/mouse/pen translation, one/two/one pointer transitions, angular wrapping/full turns, zoom bounds, cancellation and cleanup. JSDOM capture support is test-only and does not establish physical touch acceptance.

The live Kajenn page loads the matching generated collection. Browser rotation input 45 changes both child transforms and publishes once. A real browser pointer drag adds x=30/y=25 while preserving rotate=45/zoom=1, updates both CSS transforms and increases publications from 1 to 2. This verifies page bindings and a single-pointer gesture. Physical combined two-finger acceptance remains pending; prior pinch-only acceptance does not cover the extension.

<a id="gcp-085-015"></a>
## 015 · Hardware trial

Open Gramlot PoC, section “Sposta, ruota e ingrandisci”. Drag the rectangle with one finger, then use two fingers to rotate, zoom and move. All four fields and both panes should track the same Data. Lift one finger and continue dragging, then lift the last: one publication should report the final tuple. The existing capture button supplies a photo for the other pane. No user photo is read/uploaded by the agent.

Scroll outside the gesture surfaces. Large translations may move content beyond the clipped preview; restore x/y to 0 in the fields. The component supplies a generic transform input, not panning inertia, crop/export or a native drawing layer.

Final checkpoint: 27 additional Python renderer tests pass; no active source/schema reference to the superseded pinch component remains. The existing iPhone app was successfully relaunched to load the updated site, without rebuilding/installing a native binary. Owner verification of combined touch transforms and the final publication is pending.

Owner feedback, 2026-10-24: “perfetto” after the successful iPhone relaunch accepts the bounded transform extension. This is general acceptance of the result, not an explicit report of each gesture/cancellation or photo-specific hardware case. Those distinctions remain as recorded above. The overall PoC gates remain separate.
