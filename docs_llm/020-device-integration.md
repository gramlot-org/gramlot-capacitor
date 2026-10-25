# 020 · Provider-independent device integration

Document ID: **GCP-020**. Updated: **2026-10-24**.

[Paired view](../docs/020-device-integration.md). [PoC plan](005-poc-plan.md). [Installed gallery milestone](015-gallery-poc.md).

**Current status: first implementation and automated/browser verification completed; installed and launched on iPhone, native-result verification pending.** See [GCP-025](025-device-poc.md). Dated decisions below preserve their original implementation status; the implementation checkpoint is §105.

<a id="gcp-020-005"></a>
## 005 · Owner decisions and names

Owner, 2026-10-24 (translated): “This philosophy is important. I would only change it to gramlot.dvc (device) and DeviceHandler; the reserved Data path gramlot.device is where I will map everything.” Follow-up: “If we are agnostic, in the future we could use something other than Capacitor.”

| Boundary | Confirmed name | Responsibility |
| --- | --- | --- |
| Runtime proxy | `gramlot.dvc` | Common device integration surface |
| Handler class | `DeviceHandler` | Implements that device responsibility through a provider contract |
| Data subtree | `gramlot.device` | Device values, state and the agreed request/event map |
| First provider | Capacitor in gramlot-capacitor | Connects the common contract to the installed native plugins |

GC-225 §100 records these names under the existing naming conventions. gramlot.device is a path in Data; the runtime proxy is gramlot.dvc. Exact children of the reserved subtree are not selected by approving its root.

The owner intends that a future implementation may replace Capacitor. Application declarations and shared contracts therefore must not depend on Capacitor plugin names, objects or provider-specific return types. Provider-specific details stay behind the integration boundary. The actual common operation schemas still need agreement; this direction does not authorize permissive conversion or guessed fallbacks for unknown inputs.

<a id="gcp-020-010"></a>
## 010 · Data, resolvers and controller orchestration

Owner-proposed model, refined in the conversation:

- A read of a resolver-backed device Data node starts the corresponding native lookup when needed. The resolver supplies the result and agreed cache behavior. App information and on-demand location were discussed as examples.
- Native listeners update agreed state nodes or generate Data triggers/events. Widgets and dataControllers react through ordinary pointers.
- A publish activates a normal subscribing dataController. That controller creates/enqueues the request in a Data Bag; publish itself is not the queue. Controllers process the queued request and write its status/result/error through the normal Data mechanisms.
- An ordinary dataRpc can use a reactive `^` pointer to device Data to notify the server. Its existing debounce/lifecycle semantics remain unchanged; no separate application fetch layer is introduced.

Existing-source evidence: Bag has asynchronous resolvers and cache invalidation; Gramlot's RpcResolver/dataRemote uses a nonblocking current-value model and updates reactive consumers after completion. The native nonblocking read/completion contract is explicitly approved in §030 below; error and invalidation rules are not implicitly chosen by this observation. In particular, cacheTime=0 and reactive binding interactions need an explicit contract to avoid feedback loops.

Existing dataRpc `_delay` is debounce in milliseconds, not a periodic delivery guarantee. Its latest-call behavior does not guarantee server-side cancellation of work already started or reliable delivery of every location sample. A reliable sample queue would need explicit acknowledgment/retry semantics.

<a id="gcp-020-015"></a>
## 015 · Provider and page boundaries

DeviceHandler exposes a provider-independent contract. The Capacitor provider belongs to gramlot-capacitor; Gramlot core remains independent of Capacitor. Future providers must explicitly declare supported capabilities and preserve agreed semantics; absent capabilities remain unavailable rather than being silently emulated. No second provider is being implemented now.

The index page was discussed as a possible host for subscribers, native listeners and the queue. Existing Gramlot publish can target a direct parent or selected child iframe, but requires a ready target and supplies no built-in queue, replay or acknowledgment. Each page owns its Data Bag; the proposed device subtree does not make values globally shared between frames. Exact owner/consumer routing, request correlation, disposal and late-result handling remain to be specified.

The reusable native integration still owns actual platform calls/listeners. Python-authored pages, Source, Data, resolvers, pointers and controllers own the application behavior. Generic framework gaps must be addressed in their owning repository under a bounded design, not hidden by constructor patches or application-local DOM/event/state workarounds.

<a id="gcp-020-020"></a>
## 020 · Superseded proposals and next bounded work

Superseded discussion names: gramlot.capacitor, gramlot.cap and grmlt.capacitor. The old native.app fixture destinations are superseded by the new reserved gramlot.device map direction; retain their historical approval in GCP-010, but do not implement them as compatibility aliases. The get-info capability remains the first small native proof; the old Logic.readAppInfo wrapper is no longer the mandatory public architecture.

Next design work: choose the first leaf schema beneath gramlot.device, native resolver/cache/error behavior, provider attachment and page cleanup; define only the command/event/queue contracts required by the first increment. Exact handler installation and repository placement of its generic implementation must be resolved against core ownership before source changes. This record does not implement or validate the new interface, change the installed gallery shell, publish packages or deploy changes to the official gallery.


<a id="gcp-020-025"></a>
## 025 · Result values and operational attributes

Owner confirmation, 2026-10-24: “puoi uaare degli atibuti” (translated: “You can use attributes”), answering the clarification that a device node holds its result in its value and operational metadata in its Bag node attributes.

Confirmed scope: application information and location results belong in their respective node values; operational metadata belongs in the attributes of those same nodes. Do not introduce a parallel status subtree for that metadata. This records the storage decision only. Initial result fields are subsequently approved in §045. Exact attribute names, state/error vocabulary and permission representation still require definition. The asynchronous read contract is subsequently approved in §030 and initial cache policies in §035. No DeviceHandler or native resolver has been implemented by this decision.


<a id="gcp-020-030"></a>
## 030 · Nonblocking resolver reads

Owner confirmation, 2026-10-24: “ok”, answering the four-step proposal to return the current value immediately, refresh through Data updates and avoid duplicate pending requests.

Approved behavior for application information and on-demand location:

1. Reading the resolver-backed node starts a native lookup when a refresh is needed.
2. The read immediately returns the available value, or null before the first result; it does not wait for the native operation.
3. A successful completion updates the node value and notifies ordinary reactive consumers using ^ pointers.
4. Further reads of the same resolver while that lookup is pending do not start duplicate requests.

This establishes the read/completion contract; §035 subsequently selects cache defaults and refresh-on-read behavior. Result preservation on failure is subsequently approved in §040; retry rules remain open. In particular, the cacheTime=0 interaction with reactive rereads still needs a defined rule that prevents feedback loops. Exact DeviceHandler methods, permissions, monitoring and provider lifecycle remain to be specified. This is an approved design contract, not an implementation or a successful runtime test.


<a id="gcp-020-035"></a>
## 035 · Initial cache policies

Owner confirmation, 2026-10-24: “ok”, answering the proposal for configurable appinfo and location cache defaults and explicit monitoring for continuous updates.

- appinfo: one lookup for the lifetime of the page, unless explicitly invalidated.
- location: reuse the result for five seconds; a read after expiration starts a new lookup under §030.
- Both defaults are configurable.
- Expiration alone does not start a lookup. Continuous updates require explicit monitoring; §070 defines its current desired/effective-state contract, superseding the initial methods in §065.

This approves the default policies, not concrete configuration/invalidation method names, the full set of supported cache settings or a cacheTime=0 feedback-loop rule. Result preservation on failure is subsequently approved in §040; retry and cache behavior after failure remain open. No native implementation or runtime verification is claimed.


<a id="gcp-020-040"></a>
## 040 · Failed refresh and retained result

Owner confirmation, 2026-10-24: “ok”, answering the proposal to keep the last valid result on refresh failure, report the failure in node attributes and retain null when no result has ever arrived.

A failed refresh preserves the last valid value. Operational attributes indicate that the latest attempt failed and carry its error. If no successful result exists, the value remains null. Consumers must distinguish an available previous result from a successful latest refresh through those attributes.

This defines result preservation on failure only. Exact attribute names and error schema, retry triggers/backoff, cache validity after failure, and distinct permission/cancellation/unavailable outcomes remain to be specified. No implementation or runtime verification is claimed.


<a id="gcp-020-045"></a>
## 045 · Initial result fields

Owner confirmation, 2026-10-24: “ok”, answering the proposed provider-independent result map, field types and units, including the meaning of the location timestamp.

| Data node | Result fields |
| --- | --- |
| gramlot.device.appinfo | id, name, version, build: strings |
| gramlot.device.location | latitude, longitude: numbers in degrees; accuracy: number in metres; timestamp: number of milliseconds since the Unix epoch |

The location timestamp identifies when the position was measured, not when the result was written into Data. This lets consumers identify the age of a previous result retained after an update failure. Results occupy node values; operational metadata uses the node attributes as approved in §025. Provider-specific objects and field names are not part of this result contract.

This approves these initial paths and fields, not additional location fields, missing-field defaults, coercion or provider fallbacks. Exact operational attributes, state/error vocabulary, permissions, retry behavior and DeviceHandler methods remain open. No runtime implementation or verification is claimed.


<a id="gcp-020-050"></a>
## 050 · Operation status attribute

Owner confirmation, 2026-10-24: “ok”, answering the proposed common status attribute for appinfo and location and its seven values.

| status | Meaning |
| --- | --- |
| idle | No request has been executed yet |
| pending | A request is in progress |
| success | The latest request succeeded |
| error | The latest request failed |
| unavailable | The capability is unavailable |
| denied | Permission was denied |
| cancelled | The operation was cancelled |

status is an attribute of the appinfo/location node, not a child of its result Bag. It describes the latest request; the node value may still contain a previous result under §040. Capability unavailability, permission denial and cancellation remain distinct outcomes.

This approves the status name and vocabulary. The error attribute contract is subsequently approved in §055; detailed transitions/retry rules, permission acquisition and continuous-monitoring behavior remain to be defined. No runtime implementation or verification is claimed.


<a id="gcp-020-055"></a>
## 055 · Error attribute and common codes

Owner confirmation, 2026-10-24: “ok”, answering the proposal for the error attribute structure, common code mapping and clearing behavior on a new request.

error is an attribute of the appinfo/location node. Its value is null or an object containing code (a stable code usable by controllers) and message (a human-readable description).

| status | error |
| --- | --- |
| unavailable | Object with code UNAVAILABLE |
| denied | Object with code PERMISSION_DENIED |
| error | Object with code TIMEOUT or FAILED |
| idle, pending, success, cancelled | null |

Starting a new request clears the previous error while preserving the available result. The provider translates its errors into this common contract; applications do not depend on provider-specific codes. A failed refresh preserves the previous valid result as defined in §040.

This approves the attribute and initial error vocabulary. Detailed retry behavior, cache validity after failure, permission acquisition, monitoring and DeviceHandler method contracts remain open. No runtime implementation or verification is claimed.


<a id="gcp-020-060"></a>
## 060 · Explicit invalidation and refresh

Owner confirmation, 2026-10-24: “ok”, answering the proposal for DeviceHandler.invalidate and DeviceHandler.refresh and their behavior for appinfo and location.

| Method | Approved behavior |
| --- | --- |
| gramlot.dvc.invalidate(name) | Invalidates the cache. The next read initiates a refresh, while the previous value is retained. |
| gramlot.dvc.refresh(name) | Requests a refresh immediately, even with a valid cache. Does not duplicate a request already in progress for that resolver. |

The selected names for this increment are appinfo and location. Results and operational state remain in their Data nodes and attributes. Ordinary reads continue through the resolver and do not require a direct handler call. Existing nonblocking read and error contracts remain applicable.

This approves method names and responsibilities, not return values, exact interaction of invalidation with a pending completion, retry/cache-after-failure rules, continuous-monitoring behavior or provider attachment. No additional dispatch aliases or provider-specific methods are approved. No runtime implementation or verification is claimed.


<a id="gcp-020-065"></a>
## 065 · Continuous location monitoring

> **Historical record — public methods superseded by §070.** The listening/update and cleanup responsibilities remain, now controlled through the enabled attribute.

Owner confirmation, 2026-10-24: “ok”, answering the proposed watch/unwatch contract, repeated-call behavior, page cleanup and watching attribute.

| Method | Approved behavior |
| --- | --- |
| gramlot.dvc.watch('location') | Starts listening. Each received position updates gramlot.device.location and notifies ordinary reactive consumers using ^ pointers. |
| gramlot.dvc.unwatch('location') | Stops listening while retaining the last position. |

A repeated watch call does not create another listener. Calling unwatch without an active listener has no effect. Page closure removes the listener, consistent with the previously approved lifecycle direction.

The location node attribute watching indicates whether listening is active. status continues to describe the acquisition outcome; it does not replace watching. This increment approves monitoring for location only, not appinfo.

Permission acquisition, interaction with cache-backed reads and explicit refresh, startup/stop races, method return values and provider attachment remain to be specified. The approved API does not establish background execution guarantees or a sampling interval. No runtime implementation or verification is claimed.


<a id="gcp-020-070"></a>
## 070 · Desired updates and effective listening state

Owner, 2026-10-24 (verbatim): “ok allora usiamo enabled per il desiderio e watching per lo stato effettivo, senza watch e unwatch pubblici”. Translation: “Use enabled for the desired state and watching for the effective state, without public watch and unwatch.”

This supersedes the public watch/unwatch methods of §065. There are no public watch/unwatch methods or compatibility aliases in the selected contract. The alternative enableUpdates/disableUpdates/updatesEnabled naming discussed in the conversation is not selected.

| Location node attribute | Responsibility |
| --- | --- |
| enabled | Application-controlled desired state: true requests continuous location updates; false requests that listening stop. DeviceHandler reacts to attribute changes through the Data model. |
| watching | Handler-reported effective state: whether listening is actually active. It does not merely mirror enabled. |

For example, enabled=true with watching=false and status=denied expresses a requested service that could not start because permission was denied. status and error retain their acquisition/outcome meanings; they do not replace the desired/effective state distinction.

Successful position updates write the location value and notify reactive consumers. Stopping retains the last position; repeated requests for the same enabled state must not create duplicate listeners. Page closure removes the listener as previously agreed. enabled controls continuous updates only; it does not disable the on-demand resolver. Neither enabled nor watching establishes a polling timer or sampling interval, and the five-second resolver cache is not an update frequency.

Permission acquisition when enabled=true is subsequently approved in §075. Initial attribute values, effective-state transitions during start/stop races, interaction with resolver reads/refresh and provider lifecycle remain design work. The previously proposed requestPermission method has not been approved. This is a documentation contract update, not runtime implementation or device verification.


<a id="gcp-020-075"></a>
## 075 · Permission acquisition for requested updates

Owner confirmation, 2026-10-24: “ok”, answering the proposal that setting enabled=true also initiates the system location permission request when necessary.

Setting the location node attribute enabled to true requests continuous updates and initiates the necessary system permission request. This is part of handling the desired state, not a separate approved public requestPermission method. enabled remains the application's desired state; watching reports effective listening rather than the mere fact that permission was requested or granted.

The existing permission-denial contract remains applicable: status=denied, error.code=PERMISSION_DENIED, and no active listening. A denied request does not itself withdraw the application's desired enabled state, as distinguished in §070.

This selects the permission-entry behavior for continuous updates only. Permission behavior for on-demand resolver reads and explicit refresh is subsequently approved in §080. Subsequent attempts after denial, changes to enabled during a pending prompt, initial attribute values and provider lifecycle remain to be defined. It does not guarantee that the operating system will display a new prompt after an earlier denial. No runtime implementation or device verification is claimed.


<a id="gcp-020-080"></a>
## 080 · Permission acquisition for on-demand location

Owner confirmation, 2026-10-24: “ok”, answering the proposal that an on-demand resolver lookup or refresh('location') requests permission when necessary, including a lookup initiated by a binding, without enabling continuous updates.

When the location resolver or gramlot.dvc.refresh('location') needs to acquire a position, it initiates the necessary system permission request. A binding-triggered resolver read may therefore initiate that request as well. This does not enable continuous updates and leaves enabled unchanged. Ordinary cache reuse and pending-request deduplication retain their previously approved behavior.

Permission denial uses the existing denied/PERMISSION_DENIED outcome. This extends §075 to on-demand acquisition; it does not introduce a separate public permission method or guarantee that the operating system will show a new prompt after a previous denial.

The interaction of active monitoring with resolver reads/refresh is subsequently approved in §085. Initial attribute values, retry/cache behavior after failure, pending permission/acquisition lifecycle and provider attachment remain to be defined. No runtime implementation or device verification is claimed.


<a id="gcp-020-085"></a>
## 085 · Active monitoring and resolver reads

Owner confirmation, 2026-10-24: “ok”, answering the proposal that active monitoring supplies resolver reads, while explicit refresh remains an on-demand acquisition and ordinary cache policy resumes when listening stops.

While watching=true, reading location returns the latest received position without initiating another acquisition, even when the five-second cache interval has elapsed. The listener supplies subsequent Data updates. The initial-value rule of §030 still applies when no result is available.

gramlot.dvc.refresh('location') remains an explicit on-demand acquisition request during monitoring; the pending-request deduplication contract of §060 remains applicable. Once listening stops, ordinary resolver cache policy resumes. This is a specific rule for effective monitoring, not merely enabled=true.

The latest-intent rule for asynchronous start/stop is subsequently approved in §090. Initial attribute values, cache age accounting, completion ordering between monitoring and explicit refresh, retry/cache behavior after failure and provider attachment remain to be defined. No runtime implementation or device verification is claimed.


<a id="gcp-020-090"></a>
## 090 · Latest monitoring intent and obsolete events

Owner confirmation, 2026-10-24: “ok”, answering the proposal that the latest enabled value prevails during asynchronous startup and late events from a stopped listener must not update Data.

DeviceHandler must honor the latest enabled state when asynchronous permission/startup work completes. In particular, if enabled changes from true to false while a permission request is pending, granting that permission later must not activate listening. Permission success alone is not sufficient to start an obsolete monitoring request.

Events from an already stopped listener must not update the Bag. A subsequent request to enable updates does not make events from that old listener current again. The effective watching state must reflect current listening, not completion of a superseded start operation.

This defines monitoring lifecycle semantics, not permission-dialog dismissal guarantees or cancellation of a separately requested on-demand acquisition. Existing page-closure cleanup remains required. Initial attribute values, retry/cache behavior after failure, cache age accounting, completion ordering between current monitoring and explicit refresh, and provider attachment remain to be defined. No runtime implementation or device verification is claimed.


<a id="gcp-020-095"></a>
## 095 · Retry after a failed on-demand acquisition

Owner confirmation, 2026-10-24: “ok”, answering the proposed retry rule for on-demand reads: retain the result after failure without repeating calls on subsequent reads; refresh retries immediately, while invalidate allows a retry on the next read. Updates from a still-active listener continue.

After an on-demand acquisition fails, further resolver reads return the retained value (null if there has been no successful result) without starting new attempts. Cache expiration alone does not override this failure rule. This prevents reactive reads from repeatedly starting a failing acquisition.

gramlot.dvc.refresh(name) explicitly retries immediately, subject to the existing pending-request deduplication rule. gramlot.dvc.invalidate(name) permits a new attempt at the next read, retaining the previous value. Starting that new request clears the prior error as defined in §055.

This rule applies to on-demand acquisitions. It does not stop updates from a still-active listener or establish an automatic listener restart/retry policy. Initial attribute values, cache age accounting, ordering between current monitoring results and explicit refresh, the interaction of a new monitoring result with an earlier on-demand failure, and provider attachment remain to be defined. No runtime implementation or device verification is claimed.


<a id="gcp-020-100"></a>
## 100 · Initial Data state and lazy acquisition

Owner confirmation, 2026-10-24: “ok”, answering the proposed initial node values and attributes, with installed resolvers but no acquisition until a read, explicit refresh or enabled=true for continuous updates.

| Node under gramlot.device | Initial value | Initial attributes |
| --- | --- | --- |
| appinfo | null | status='idle', error=null |
| location | null | status='idle', error=null, enabled=false, watching=false |

Resolvers are installed at initialization. Initialization alone does not start acquisition. A read or refresh may initiate acquisition under the previously approved resolver/cache/permission rules; setting location enabled=true requests continuous updates. The initial disabled monitoring state does not disable on-demand location reads.

These are the selected initial values, not persisted state restored from an earlier page. No persistence mechanism or additional initialization parameters are approved here. Method return contracts, cache configuration/age accounting, ordering and recovery across monitoring and on-demand results, invalidation during pending work, and provider attachment remain to be defined. No runtime implementation or device verification is claimed.


<a id="gcp-020-105"></a>
## 105 · Bounded implementation under owner delegation

Owner, 2026-10-24: “mi are cge tu abbia capito,. non farmi trppo domande e vediamo cime viene” (translated: “I think you have understood; do not ask me too many questions, let us see how it turns out”). This authorizes implementation of the agreed appinfo/location PoC and coherent resolution of remaining implementation details, without repeated design questions. It is not a general waiver of architectural boundaries or authorization for publication.

Core now implements DeviceHandler/DeviceResolver; the Capacitor provider and Python-authored fixture live here. The methods invalidate/refresh are commands with Data-only outcomes. The explicit provider attachment, cache attributes, asynchronous ordering, cleanup and verified limits are described in GCP-025 §015–020. Earlier watch/unwatch proposals remain historical; enabled/watching is the implemented control model. The first implementation is tested but not yet accepted on the physical device.


Device checkpoint, 2026-10-24: the iPhone became reachable, provisioning coverage passed, and installation/launch of the new App/Geolocation build both succeeded. The owner confirmed “iPhone collegato e sbloccato”. This confirms device availability and delivery, not yet visible appinfo/location results or acceptance.


<a id="gcp-020-110"></a>
## 110 · Camera follow-up

On 2026-10-24 the owner requested camera capture with the same Data philosophy and then asked to continue. GCP-030 defines the bounded implementation: explicit camera?capture FIRE, local url/format result Bag, shared status/error attributes, one pending capture and no automatic acquisition on read. The previous instruction to avoid repeated implementation questions covers these coherent implementation details; this does not authorize unrelated APIs or publication. Core names are recorded in GC-225 §100. The signed Camera increment is installed and launched; real photo verification remains pending.


<a id="gcp-020-115"></a>
## 115 · Local biometrics follow-up

Owner requested Face ID with the same Data philosophy after accepting the camera preview. GCP-035 implements explicit biometrics?verify FIRE, verified=true after success, shared status/error attributes and cleared results at every new attempt. The selected plugin performs local biometrics with no passcode fallback or web simulation; site login remains separate. This follows the scoped instruction to proceed without repeated implementation questions. Names are recorded in GC-225 §100. After the signed build was installed/launched, the owner confirmed “funziona”; native Face ID is accepted for this PoC.


<a id="gcp-020-120"></a>
## 120 · Local notifications follow-up

The owner requested notifications with the same Data philosophy. GCP-040 records the announced local slice: request Bag, ?schedule FIRE, separate scheduling acknowledgement/receipt/action results and page-owned native listeners. No permission prompt on attach, no scheduling on read, no delivery claim from scheduling success. The signed build is installed and launched; native display and tap verification remain pending. Remote APNs, server association and authorized navigation remain separate planned work.


<a id="gcp-020-125"></a>
## 125 · Server push follow-up

Owner accepted local notification display/tap and requested server pushes with the same Data philosophy. GCP-045 records ?register, registration/received/action Bags, independent listener state, the reactive token dataRpc and an operator-only APNs sandbox sender. Real native/server registration and foreground receipt are owner-confirmed; background banner and tap-to-Data are owner-accepted after disabling Focus; a separate cold-start opening and tap-to-Data test is also accepted. The anonymous one-device fixture introduces no general account routing contract.


<a id="gcp-020-130"></a>
## 130 · Gallery shortcut follow-up

Owner requests a gallery shortcut through Gramlot Data and explicitly confirms shortcuts.request plus gramlot.dom.navigate. GCP-050 records the bounded native-to-Data handoff and fixed gallery controller. Implementation, automated checks and signed installation pass; after initial discovery difficulty, the owner confirmed “funziona” following the action-editor execution instructions. Shortcut invocation and gallery opening are accepted; cold start, automatic tile discovery and Siri remain separate checks. This is not a general Siri command dispatcher.


<a id="gcp-020-135"></a>
## 135 · QR and barcode follow-up

Owner requests continuing the useful device features. GCP-055 follows the established explicit trigger contract: barcode?scan, a text/format result Bag, shared status/error, one pending attempt and disposal of late results. The signed build is installed; the owner confirms the exact synthetic QR text and QR_CODE format. Additional symbology and native cancellation checks remain distinct. No scanned content is executed or uploaded.


<a id="gcp-020-140"></a>
## 140 · Network, lifecycle and haptics increment

Owner explicitly requests these capabilities after accepting Code 128 and cancellation. GCP-060 and GC-225 §100 define network connected/type snapshots and events; lifecycle active separately from pause/resume event/sequence; and explicit haptics?impact with style attribute and acknowledged result. The existing provider/Data boundary remains unchanged. Page-owned streams remove their listeners on disposal; no polling, background task execution guarantee or Internet reachability inference is introduced. Implementation, automated/browser checks and signed iPhone installation pass; hardware checks remain pending.


<a id="gcp-020-145"></a>
## 145 · Audio recording increment

Owner requests audio recording through Data and prefers an MIT dependency. GCP-065 defines gramlot.device.audio with explicit start/stop/cancel FIRE commands, recording/status/error attributes and a playable url/mimeType/duration Bag. DeviceAudioSession owns stop/dispose; the provider owns native recording, interruption listeners and app-cache file cleanup. Python supplies the Data-bound audio player. Recording/playback, explicit cancellation and Home/return cancellation are owner-accepted. Permission-denial and external audio-interruption hardware cases remain separately unverified.


<a id="gcp-020-150"></a>
## 150 · Recorded-audio sharing

GCP-070 adds audio?share, shareStatus/shareError/shareActivity and DeviceAudioSession.share(signal). The provider retains the file until the native share sheet completes. User cancellation preserves the audio; success means completed native activity, not delivery. No arbitrary file, recipient or server upload is added. Owner confirms sharing works on iPhone; native cancellation and delivery/export details remain separately unverified.


<a id="gcp-020-160"></a>
## 160 · Explicit text clipboard

Owner requests copy/paste through Data. gramlot.device.clipboard uses text input attribute, FIRE(copy/paste), operation/status/error and null or Bag {text} result. Reading Data never reads system clipboard. Copy snapshots input and reports native acknowledgement; paste accepts plain text only. A shared gate prevents concurrent commands. Disposal ignores late results but cannot undo an OS write. Core provider methods copyText/pasteText are backend-independent. Official MIT Clipboard is native-only in this PoC. GCP-090 records details, empty/unreadable limitations and hardware evidence.


<a id="gcp-020-165"></a>
## 165 · Photo library acquisition

Explicit camera?choose invokes provider choosePhoto(signal) and updates the existing gramlot.device.camera Bag {url,format}. Capture and choice share pending exclusion, status/error and disposal handling; cancelled/failed selection retains the previous image. Native SDK details remain in the provider. See [GCP-095](095-photo-library-poc.md) for the bounded contract and verification; iPhone acceptance is pending.


<a id="gcp-020-170"></a>
## 170 · Universal Link delivery and embedded entry

GCP-100 records the bounded links request Bag and provider/native queue. GCP-105 records separate native pages and the core/provider/app ownership boundary. The native app returns a validated link to the bundled entry; a Data controller chooses the exact allowed gallery example. Offline preference editing is proposed, not yet implemented.
