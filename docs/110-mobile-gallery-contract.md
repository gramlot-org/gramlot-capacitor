# 110 · Mobile application module — gallery integration handoff

Document ID: **GCP-110**. Updated: **2026-10-25**.

<a id="gcp-110-005"></a>
## 005 · Owner scope and ownership

Owner: “ok separiamo gli esempi mobile in gramlot-capacitor e prepara il contratto di integrazione da passare alla chat che sta sistemando la gallery”.

This is the handoff for the chat maintaining the gallery. The mobile module is implemented in `gramlot-capacitor/examples/mobile_application`; the gallery is not edited by this increment. The receiver owns the generic registration mechanism. Do not assume that an extension-registration API already exists. Public deployment and a new native build are separate actions.

Owner follow-up, 2026-10-25: “ok aggiorna il contratto per l’altra chat includendo anche il tema Mela aggiornato, da applicare alla gallery e agli esempi negli iframe”. The handoff therefore covers both module integration and the updated Mela appearance across the complete gallery experience; see [§035](#gcp-110-035).

| Owner | Responsibility |
| --- | --- |
| Gramlot core | DeviceHandler, Data contracts, MobileEnvironment, DeviceFrameHost/FrameDeviceProvider, Mela theme |
| gramlot-capacitor | Native provider; Python mobile pages, companion Logic, catalogue and synthetic assets |
| Site host | Mount prefix, resources, allowed origins, module registration, coherent updated theme/runtime resources, optional private push backend |
| gramlot-examples gallery | Merge the registered catalogue, show the branch conditionally, create ordinary Source-owned iframes, apply updated Mela to its shell and synchronize presentation into examples |

The module imports Gramlot and Bag, not the gallery, Kajenn or the APNs service. The local host still uses the existing `/device` mount so installed app links continue to reach it. A real examples site can mount the same module at `/mobile-application`. There is one mounted path, not route aliases.

<a id="gcp-110-010"></a>
## 010 · Module artifacts and catalogue

Add `gramlot-capacitor/examples` to the host Python import path. Import `PAGES`, `ASSETS`, `ROOT`, `CATALOG` from `mobile_application`. Build the native integration resource with `npm run device:build` in gramlot-capacitor; its build reads the connected core checkout from `.local/core-path`.

- `PAGES`: all Python pages and relative JavaScript companions, including `index.py` and `index.css`.
- `ROOT / "catalog.json"`: the authoritative catalogue; do not duplicate the page list in the gallery.
- `ASSETS / "device-provider.js"`: generated integration module; exports the provider attachment and top-page broker installation.
- `ASSETS / "barcode-test.png"` and `barcode-test-code128.png`: synthetic scanner targets.
- Core themes: the **updated** Base/Compact/Mela resources, served by the host's existing theme-resource mechanism. Updating only the mobile page CSS does not update the gallery shell or its embedded theme payloads; follow [§035](#gcp-110-035).
- Core component collections: inputs and layout, including the accepted device/transform support. Use the corresponding current prepared resources; mixing runtime and collection revisions is not qualified.

Catalogue shape, implemented in this module:

```json
{
  "id": "mobileApplication",
  "title": "Mobile application",
  "visibility": "native",
  "entries": [
    {"id":"app","title":"Informazioni app","path":"app","capabilities":["appinfo"],"requires":[]}
  ]
}
```

`id` is stable within its catalogue. `path` is a relative page name, never a domain or executable script. `capabilities` describes the device function used, not permission to invoke it. `requires` lists host prerequisites: `pushRegistration` for the server-push page, `topLevelEntry` for the shortcut entry flow. The appearance page requires no hardware. The module currently has fifteen pages including that theme probe.

The host supplies a trusted mount prefix and catalogue to the gallery through its own registration mechanism. Join the mount prefix with the relative path once. Reject absolute/escaping paths; do not let page-provided data select an origin or load arbitrary integration scripts. No fixed Mac IP belongs in the catalogue or gallery source.

<a id="gcp-110-015"></a>
## 015 · Gallery behavior to implement in the other chat

1. Register this catalogue as a distinct branch named **Mobile application**, preserving normal catalogue ordering and other branches.
2. Show it only inside the native app. Native/platform detection is presentation, never an authorization boundary. Browser Safari/Chrome on a phone alone does not qualify. Retain the current owner-approved iOS/Android Capacitor detection for this PoC; a future backend-neutral availability contract needs its own design.
3. A leaf directly opens its page in the existing gallery panel's Source-owned iframe. Do not insert a Markdown landing page with another “open” button.
4. Serve module pages on the **same HTTPS origin** as the gallery. A separate repository does not imply a separate origin. Keep session ownership, CSP, authentication and CSRF protections intact.
5. Only offer entries whose host prerequisites are configured. The shortcut native request belongs to the bundled top-level app entry and is not delegated to a child frame. Its page can explain the test, but the gallery must not promise receipt of the entry request in that iframe.
6. Let core own mobile viewport and touch adaptation. Mela controls appearance. The gallery must not add another safe-area padding layer inside frames.
7. Apply the updated Mela appearance to the native gallery shell and to both ordinary and mobile examples in its iframes. Keep appearance, palette and light/dark state synchronized as specified in [§035](#gcp-110-035).
8. Keep native integration out of unconditional imports of the portable gallery entry. Load/install it through the trusted site's integration lifecycle. Ordinary gallery builds and editor tests must work without a mobile-provider asset.

The isolated previous gallery prototype had an absolute provider import in its entry and failed three full-suite editor tests. Do not copy that integration. Its direct-iframe selection test is evidence only; the receiver should implement the proper registration hook in the gallery it is already revising. No gallery change from this module-separation increment is published.

<a id="gcp-110-020"></a>
## 020 · Device attachment and lifetime

The top-level site's integration imports `installDeviceFrameHost` from its mounted `device-provider.js` and calls it with the top-level Gramlot page and an explicit origin list containing only the site's origin:

```javascript
const host = installDeviceFrameHost(page, {origins: [window.location.origin]});
```

This is site integration code, not a new API assumed to exist in the gallery. Install once for the top-level page, before native examples can connect. Dispose the host when that page is replaced; pagehide also releases it. Do not initialize one broker per selected lesson. This top-level integration also installs the shared mobile environment for the PoC's older published core; a current local core installs it automatically and the install operation is idempotent.

Each module page's Logic calls `attachDeviceProvider(page)`. At the top level it attaches the native provider; inside an iframe it connects only to its same-origin parent and passes the connection disposal callback to DeviceHandler. This does not fabricate native availability in a browser. The parent validates both exact origin and a real iframe owned by the top-level Source before accepting a transferred MessagePort.

No generic plugin-method dispatch exists: the broker exposes only the established DeviceProvider allowlist. Results/events enter the child's usual `gramlot.device` Data through DeviceHandler. Commands, resolvers, permissions and cancellation retain their existing semantics. Native entry link/shortcut capabilities are excluded. Native prompts/microphone use are serialized across frames; frame removal/navigation releases resources and suppresses late replies. Navigation or hiding a gallery panel are different operations: the gallery must define whether it retains or disposes a page, using its existing lifecycle.

<a id="gcp-110-025"></a>
## 025 · Private push service

The module does not import `push_service`, contain APNs keys, registration tokens or signing data. `DevicePage.push_register` is an explicit host-supplied callable. The local Kajenn host binds `staticmethod(register_token)` from its private service. Without a configured callable the existing `pushRegister` RPC reports an explicit configuration error.

A public host must register its own authenticated/authorized backend or omit the `pushRegistration` entry. Do not copy `.local/apns`, the local token store, `/site/push_service.py` configuration or device IDs into the gallery package. Provider code and synthetic scanner images are public artifacts; user images/audio and push tokens are not catalogue assets.

<a id="gcp-110-030"></a>
## 030 · Receiver acceptance checklist

- Ordinary browser gallery loads, edits code and navigates without requesting the mobile provider.
- Native gallery displays the registered branch, then opens App information in one selection inside the panel.
- Native name/version/build reach the child Data; another frame gets only its own responses.
- Camera/biometrics work from that frame; photo and recorded-audio preview URLs are verified on the physical device.
- Closing/reloading a frame releases listeners and any recording; the microphone cannot be reused until pending startup cleanup finishes.
- An unowned iframe, foreign origin, unknown method and stale connection cannot use the bridge.
- Same-origin host session survives page/RPC requests; security headers and cookie policies are unchanged.
- Portrait/landscape layout has one outer safe area; controls remain reachable with keyboard and enlarged text.
- Mela uses the updated resources in the gallery shell and both ordinary/mobile iframes; verify the shared foreground token on a filled Gramlot button, secondary/quiet variants, and readable light/dark states.
- Theme changes reach existing, lazily opened and reloaded frames without replacing their Source/Data or losing edits. The outer viewport owns safe-area space once.
- Native shortcut entry and push prerequisites are handled explicitly; unsupported configuration is not advertised as working.

Remaining receiver work: choose/implement the generic catalogue registration hook and its top-page integration lifecycle, then integrate/rebuild the updated Mela resources and shell/frame theme synchronization in the other chat. Physical iPhone iframe media verification and Android qualification are not established by this handoff.


<a id="gcp-110-035"></a>
## 035 · Updated Mela across gallery and iframe examples

### Required result

The owner wants the **gallery itself** to follow the updated Mela theme, not only `/device/appearance`. The gallery shell includes navigation tree, toolbar, panels, settings and content frame surroundings. Its ordinary lessons and registered mobile examples must receive the same effective Mela appearance, palette and light/dark selection. A screenshot of the standalone mobile probe is not acceptance of this integration.

Configure the native-app gallery presentation to use `appearance = "mela"` and the default palette for this trial. Retain the gallery's normal appearance/theme controls; a different explicit user choice remains a user choice. During qualification inspect saved presentation preferences: an old `compact` selection or custom palette can mask the intended result. Do not clear unrelated saved preferences. This instruction does not require forcing Mela on every desktop visitor or changing the documentation-site theme.

### Source and build handoff

The current prepared changes are in the connected core checkout the core checkout selected by `.local/core-path`:

- `themes/mela/theme.css`: canonical theme; generated copies under `js/themes` and `src/gramlot/resources/themes` are build outputs, not additional sources to edit.
- `js/src/components/buttons.js`: shared command Shadow DOM honors `--gramlot-button-color`, the existing `button--secondary` variant, press and accessibility states. Copying CSS alone to an older runtime does not provide this support.
- `js/src/mobile-environment.js`: outer safe-area ownership, child-frame distinction and the theme's `--gramlot-chrome-background`; theme typography is not replaced by a fixed viewport font size.
- `js/scripts/build-runtime.mjs`: prepares runtime resources, theme copies and the core index's embedded appearance styles from canonical themes.

Review and integrate these bounded changes into the receiver's current development baseline. Do not replace a newer runtime or the gallery under revision wholesale with the PoC checkout/bundle. Keep matching component resources and follow the repository's first-party dependency policy; a tested checkout reference is not a dependency pin.

Then rebuild the gallery's own theme payloads against that updated core. In the inspected gallery, `scripts/build-browser.mjs` reads theme CSS from its installed `@gramlot/gramlot` package and embeds it in `gallery/dist/theme-styles.js`. Its `appearanceStyles.mela` already concatenates Compact plus Mela. Consequently, changing a server `/themes/mela/theme.css` file alone leaves the gallery and its frame theme messages on the old embedded appearance. Regenerate rather than hand-edit generated CSS strings. If the other chat has reorganized this code, locate the equivalent build responsibility and preserve this requirement.

Standalone mobile pages load Base, Compact and Mela in order. For gallery-managed pages, reuse the existing appearance mechanism over Base; do not load Compact a second time when it is already included in the appearance payload. Ensure stale style blocks or independent per-page palette overrides do not win over the effective gallery presentation. Serve coherent rebuilt resources and use the host's normal asset-cache invalidation; no new package release or public deploy is authorized by this document update.

### Frame synchronization and lifecycle

Use the existing gallery/index theme bridge, not a second mobile-specific theme protocol. In the inspected implementation the shared messages are `index:theme-ready` and `index:theme-set`, carrying `theme`, `appearance` and `palette`. The gallery applies its Data-backed presentation state to its own document and sends it to owned frames; each child applies it through its theme integration. These are observed existing names, not a requirement to restore older gallery internals if the other chat has refactored them.

Ordinary gallery launch wrappers already install the frame theme integration. **The independently mounted mobile pages do not acquire that wrapper just by being put in an iframe.** The receiver must connect them to the same theme integration through its host/launch lifecycle. `attachDeviceProvider` and the native broker carry device operations, not theme updates; they do not replace this work. Reuse the established core/gallery integration boundary rather than putting DOM/theme-message handling into each example's Logic.

Apply the active presentation on initial readiness, later selection changes, lazy creation and frame reload. Reuse exact-origin and owned-frame checks for the hosted same-origin integration; arbitrary frames must not drive gallery state. Dispose message listeners and Source-created style resources with their owner. A theme change must not reload the example or reset Data, pending input, selection or draft text.

There is one outer safe-area treatment. Child frames receive appearance and control sizing but do not repeat the phone-edge padding. Match the outer bottom/chrome surface to Mela; the existing native appearance integration handles readable system indicators. CSS does not implement native Liquid Glass or guarantee complete Dynamic Type behavior: see [GCP-115](115-mela-mobile-theme.md).

### Receiver verification

Verify on iPhone inside Gramlot PoC:

1. Open the gallery and confirm updated Mela on the tree, toolbar and settings, before opening a mobile page.
2. Open an ordinary lesson and a mobile example directly in their gallery panels; confirm matching appearance, readable filled/secondary buttons and touch sizing.
3. Switch light/dark using the existing gallery control. Both the shell and existing frames update; a newly opened or reloaded frame receives the same state. If the current gallery has no system-following mode, do not claim it follows OS changes automatically.
4. Enter draft text, change the theme and switch panels: the existing Source/Data and draft survive.
5. Check portrait/landscape, keyboard, enlarged text and bottom-toolbar reachability without doubled iframe insets.
6. Confirm the ordinary browser gallery and editor tests still work without native integration assets.

Current evidence covers the updated core, local Mela probe and local iframe preview only. The official gallery's theme update, cross-example synchronization and physical-device result remain receiver integration/acceptance work.


<a id="gcp-110-040"></a>
## 040 · Receiving gallery integration — 2026-10-25

The receiving release candidate now stages the external catalogue and eligible
Python pages under `/mobile-application`, with a direct Source-owned iframe per
selection and native-only gallery visibility. No public deployment or TestFlight
upload has occurred. Receiver preparation and limits are documented as GE-020 and
GP-025 in the examples/Python-server candidate worktrees.

The module now declares its inputs/layout collections and its return links use
`./index`, the mounted Python page route. The generated provider imports
`MobileEnvironment` from the page's shared `@gramlot/gramlot` runtime; it no longer
bundles another copy of that viewport owner. This supersedes §020's older-core
installation accommodation: use the matching updated runtime export. The broker
releases its own appearance subscription and listeners; core disposes the shared
environment. The same new bundle must not be paired with an older runtime,
including the local prototype or currently published site.

Receiver tests cover exact-origin messages, Source-owned frames, native-only
registration, delayed loads/disposal, catalogue paths, public allowlisting and
presentation updates that retain Data. The provider's 64 tests pass. Physical
native plugin/media tests, rotation/keyboard/larger-text checks and off-LAN
Universal Link delivery remain pending on the deployed matching build.
Production push is unconfigured; the public staging omits push/shortcut entries
and explains their missing service/entry integration. Neither sandbox APNs nor
private Mac resources are included in the public artifact.


<a id="gcp-110-045"></a>
## 045 · Public gallery deployed — 2026-10-25

The owner explicitly authorized deployment to `https://gallery-py.gramlot.dev/`,
keeping Remote Edit disabled and excluding TestFlight upload. The receiving
Python gallery is now live as `mobile-20261025`, using the matching core runtime,
collections, rebuilt Mela/gallery and shared-runtime native provider.
This supersedes §040's not-yet-deployed status, not its hardware limits.

Public HTTPS checks pass the external catalogue, provider/runtime/gallery hashes,
all thirteen eligible mobile main responses, the ordinary color-picker route and
unchanged Apple association. The old gallery-only prototype override was removed;
no Mac/LAN endpoint is needed by the deployed web module. The sample IDE at
`/pages/07-tools/index` permits drafts but denies save/create on the server, and
exposes only a temporary directory of demonstration documents.

No package-registry release or TestFlight upload occurred. Physical iPhone testing
outside the Mac network remains pending: native iframe plugins/media, close and
reload cleanup, rotation/keyboard, appearance and Universal Link delivery.
Production APNs and shortcut entry remain unconfigured and omitted. Refresh the
app's gallery page before testing, so it loads the deployed matching resources.


<a id="gcp-110-050"></a>
## 050 · Additional motion example, local increment — 2026-10-25

The module adds entry motion (Orientation and sensors), requiring orientation, gyroscope and accelerometer capabilities, with no backend requirement. It is separate from the thirteen publicly deployed examples recorded in §045. Integration must include matching core DeviceHandler streams, frame allowlist and provider bundle; the iOS app must include GramlotMotionPlugin. Older native builds and ordinary browsers report unavailable, without simulated measurements. Data contract/lifetimes are GCP-125. Do not deploy just the page against an older core/provider. This increment does not authorize another public deployment or upload.


<a id="gcp-110-055"></a>
## 055 · English-only product UI — 2026-10-25

The owner explicitly requires all pages to be English and no Italian pages. The mobile module catalogue, all example pages, button/field/help/error text, bundled entry, native descriptions and shortcuts now use English. Gallery integration must preserve those English titles and display English content in both its shell and embedded examples. Do not translate labels into Italian based on device/browser locale. Keep the Mela theme name unchanged. Native system sheets remain owned by iOS.

This source update requires refreshing the deployed external module/catalogue/provider and rebuilding the native app for bundled descriptions and shortcuts. The existing public deployment in §045 predates these English-copy and motion changes; this chat has not deployed them. No new upload or public deployment is implied.


English-copy verification: all 71 provider/entry tests and three Python module tests pass; the signed Debug build succeeds and is installed on iPhone. The final automatic launch was blocked only because the phone was locked; open Gramlot manually. The local motion page renders English headings, help, switches and states. Public propagation and regeneration of the older signed beta remain outstanding. Sensor movement/background acceptance is still pending.


<a id="gcp-110-060"></a>
## 060 · Native SQLite increment — 2026-10-25

Owner approved native SQLite without SQLCipher, Asqueel JS and the page-owned openDatabase/query/execute/close contract. The module now adds `database` / **SQLite and persistent notes**, capability `database`, no server prerequisites. GCP-130 defines the Data contract and acceptance probe. Include this catalogue entry and Python/Logic page together with the freshly built device-provider.js (including Asqueel), the corresponding core DeviceHandler and DeviceFrameHost/FrameDeviceProvider database-resource implementation. Do not deploy only the page/provider against an older core. No database library or SQL model belongs in the gallery itself.

The iOS build must register GramlotSQLitePlugin and link Apple's system SQLite via NativeDatabase. Older native builds and ordinary browsers report unavailable. Saved note contents remain on the phone and are not server resources. Continue the English-only requirement in §055 and the motion handoff in §050.

Public read-only check on 2026-10-25: https://gallery-py.gramlot.dev/mobile-application/database returns HTTP 404. This increment is locally prepared and has not been deployed by this chat. The receiving gallery chat must deploy the matching module/runtime/provider before this example can be used in the public-only beta. TestFlight upload is not authorized.

<a id="gcp-110-065"></a>
## 065 · Common-base reconciliation — 2026-10-29

Owner approved integration into the common local base while preserving original
work, leaving Invoice out and handling Grouplets separately. The current English
module (17 catalogue entries, 15 eligible without server prerequisites) replaces
the older gallery worktree's LAN prototype; GE-020 and GP-025 own registration and
hosting. Build the provider with the common core's DeviceFrameHost implementation
and stage only the allowlisted public artifact. No native shell configuration,
private signing/APNs data or local service is part of that artifact.

The SQLite page attaches external database/query references to the `nativeNotes`
Source card. Logic contains behavior only. Current note text, results, readiness,
busy state and errors remain in Data. Reopening through another button on the
same card reuses its connection; a failed open clears busy state and permits a
retry. The existing DeviceHandler/broker closes resources with their page.

Verification: 75 provider/page tests pass, including Source ownership and retry
regressions; three Python module tests and seventeen page subtests pass. All
fifteen eligible pages render in the common local browser preview. Tests with
mocked native APIs are not physical-device acceptance. Off-LAN iPhone tests,
Universal Link delivery and a matching public deployment remain separate. No
TestFlight upload, public deployment or package release is part of this step.
