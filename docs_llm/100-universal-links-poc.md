# 100 · Universal Link to a gallery example

Document ID: **GCP-100**. Updated: **2026-10-25**.

<a id="gcp-100-005"></a>
## 005 · Authorized scope

Owner: “Per la prima prova usiamo https://gallery-py.gramlot.dev: un link a un esempio della gallery deve aprire quell’esempio nell’app.” Follow-up: “Android lo proviamo dopo. Completiamo ora il ramo Mobile application e il link alla gallery che apre l’esempio nell’app su iPhone.”

Only `https://gallery-py.gramlot.dev/pages/01-inputs/04-colorpicker` is admitted. No account transfer, login token, arbitrary site selection or preferences persistence is implemented by this trial.

<a id="gcp-100-010"></a>
## 010 · Data and ownership

Core owns the backend-neutral `links` capability, `DeviceLinkRequest`, provider `startLinkEvents(callback, signal)` and `gramlot.device.links.request` Bag `{id,url}` with `listening`/`listenerError` attributes on `links`. Cleanup aborts delivery and releases native listeners. Requests are deduplicated by id; malformed payloads do not replace the last valid request.

The app owns the associated-domain entitlement, LinkStore and native plugin. LinkStore admits the exact HTTPS URL, stores one pending request for at most five minutes and consumes it once. A native link returns the WebView to the bundled `index.html`; it does not select application content directly. The provider delivers the request into Data. Python-authored embedded Source declares the controller; Logic validates the exact destination and calls `gramlot.dom.navigate`.

The embedded entry uses the existing `Gramlot`/`startSource` path with `transport:false`. Runtime, Source and provider are included in the app. This entry loads without the Mac or the gallery; buttons that open network pages still require their servers. `npm run ios:sync` now rebuilds this entry before synchronizing. The app uses an explicit `server.appStartPath` so native delivery checks and the actual entry URL agree.

<a id="gcp-100-015"></a>
## 015 · Association and deployment

The public AASA is served at `/.well-known/apple-app-site-association` by nginx with no redirect. Its application identifier was derived from the signed app, and its component matches only the admitted example path. The maintained location fragment is `deploy/universal-links/nginx-location.conf`; server configuration and the deployment template both contain it. No private signing key is uploaded.

Deployment holds the existing gallery update lock, backs up previous files, validates nginx, reloads it and checks public JSON. Verification allows the reload to become effective; immediate checking against a previous worker caused earlier attempts to roll back. Public HTTPS and Apple's association CDN now return matching JSON. Association publication does not prove iOS user-choice routing.

<a id="gcp-100-020"></a>
## 020 · Verification and outstanding acceptance

Core: 3,933 full tests and 75 focused checks passed in the link increment. Provider/page: 66 tests pass. Foundation LinkStore checks cover rejection, one-shot consumption, expiry, future timestamps and persistence. Signed native build, codesign verification, installation and launch succeed. The local embedded entry renders in the browser.

Hardware trial pending: scan the exact link QR with the iOS Camera, tap it and verify the color example opens inside Gramlot PoC. Repeat from a terminated app after the warm trial. Typing into Safari's address bar is not this test. The temporary test QR is a public URL, not an authentication credential. Android, login, preferences and broad navigation remain unimplemented/unverified.


Owner hardware acceptance, 2026-10-25: “Sì, apre l’esempio nell’app” confirms the external Camera QR opens the official color example in Gramlot PoC. “Sì, pagina separata e dati corretti” confirms Gallery → Mobile application → App information opens the separate page with native name/version/build. The supplied iPhone screenshot independently shows the native-only branch. Cold-start link routing and every reorganized feature are not separately qualified by these confirmations.
