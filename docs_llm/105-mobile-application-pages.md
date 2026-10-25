# 105 · Mobile application: separate device pages

Document ID: **GCP-105**. Updated: **2026-10-25**.

<a id="gcp-105-005"></a>
## 005 · Owner request

The owner names the branch “Mobile application”, restricts it to “Solo nell’app Capacitor”, and asks: “invece di un unica pagina densa di esempi fammi piu pagine.” Android qualification is deferred explicitly.

<a id="gcp-105-010"></a>
## 010 · Pages and navigation

The former `/device/` form is now a catalogue. Fourteen independent Python pages cover clipboard, transforms, audio/sharing, network, lifecycle, haptics, shortcuts, app information, location, camera/library, barcode, biometrics, local notifications and server push. Shared declarations live in `site/device_pages.py`; sidecar Logic delegates to the existing Data contract. A page displays only its own feature. Transform declares its own camera pending binding. Navigation leaves the page and uses existing disposal to release listeners and active operations.

The official gallery adds a navigation Bag branch only when Capacitor reports native iOS/Android. User-agent strings do not enable it. This is presentation, not an authorization check. Each entry has explanatory Markdown and a normal same-window link to the corresponding dedicated page. This intentionally avoids gallery iframes: Capacitor injects its bridge into the main frame only. The separate gallery-link entry opens the official color example.

For this bounded trial, the native examples remain on the already-authorized Mac Kajenn/Caddy service at `https://192.168.5.115:8443/device/`. The phone needs the same LAN and the trusted local CA. They have not been deployed as anonymous public native services; APNs keys and token registration remain on the Mac.

<a id="gcp-105-015"></a>
## 015 · Deployment and evidence

The local development gallery contains unrelated changes, so the trial was prepared in the isolated `mobile-application-gallery` worktree, isolated from current public main. Its gallery initialization adds the navigation helper; existing catalogue behavior is preserved. The earlier preparation in the development checkout is not a deployed release.

Build and 264 gallery tests pass. A further real-renderer regression verifies native selection produces a same-document link and no iframe; 32 focused checks pass. All 14 local pages were opened in the browser and each rendered one feature section. Camera choice correctly reports unavailable outside the native app. Public gallery loading has no console errors and the native branch is absent in the browser.

The reviewed gallery bundle is served by a temporary exact nginx route for `/gallery/dist/gallery.js`, only on the Python domain. Deployment checks the current published baseline, takes the updater lock, preserves the previous config, and verifies the public SHA-256 after reload. The normal release template does not retain this temporary asset override: consolidate the source increment before the next normal deployment or it will be replaced. No npm/PyPI publication is claimed. The AASA route is maintained separately in the deployment template.

Physical acceptance of the new branch and separate-page navigation is pending. Previous individual feature acceptances remain historical evidence, not a claim that every reorganized page has been retested on hardware.

<a id="gcp-105-020"></a>
## 020 · Preferences boundary — proposal, not implementation

DeviceHandler, Data schemas, resolvers and lifecycle contracts belong to Gramlot. The Capacitor provider and platform bindings belong to this integration repository; native plugins are in the app build. The present remote probes load the JavaScript provider from the site, while the embedded entry carries its own copy. Application pages remain site-owned and live-updatable.

Device preferences must persist in native storage, independently of a site session. A settings interface that must work offline must itself be included in the app. Gramlot Data can project those values, but a Data write alone is not durable storage. The official MIT Capacitor Preferences plugin uses UserDefaults on iOS and SharedPreferences on Android; it is a proposed dependency, not installed in this increment. The exact Data contract and editable keys remain to be agreed. Credentials/login tokens do not belong in plain preferences.

An in-app settings page is distinct from iOS Settings.bundle. A QR camera action belongs to the in-app page; Settings.bundle supplies system settings controls. No Settings.bundle, preference plugin or QR login protocol is claimed implemented.

Reference: https://capacitorjs.com/docs/apis/preferences


Owner hardware acceptance, 2026-10-25: “Sì, apre l’esempio nell’app” confirms the external Camera QR opens the official color example in Gramlot PoC. “Sì, pagina separata e dati corretti” confirms Gallery → Mobile application → App information opens the separate page with native name/version/build. The supplied iPhone screenshot independently shows the native-only branch. Cold-start link routing and every reorganized feature are not separately qualified by these confirmations.


Owner hardware acceptance, 2026-10-25: “Sì, ora le icone sono raggiungibili”, answering the explicit iPhone check after reopening Gramlot PoC and its gallery. The bounded bottom-toolbar clearance correction is verified and accepted. This answer does not approve the separately proposed framework-wide automatic safe-area adaptation or native device access from child frames; those architectural changes remain pending explicit confirmation.


<a id="gcp-105-040"></a>
## 040 · Integration work awaiting the separate-module boundary — 2026-10-25

The owner authorized automatic core mobile adaptation and iframe native delegation. A provisional integration bundle now uses the core DeviceFrameHost/FrameDeviceProvider and MobileEnvironment modules. Native page Logic attaches asynchronously; the existing Data commands remain unchanged. Provider/page tests: 66 pass. Local assets are rebuilt. The isolated gallery prototype opens probes directly in iframes and its 32 focused checks pass, but its absolute integration import breaks three full-suite editor tests; this entry coupling needs redesign before publication. No public deployment of this increment occurred; automatic approval review rejected the nginx/asset update pending explicit publication authorization.

The owner subsequently explains that another chat is revising the gallery and requests separately managed mobile examples integrated into the gallery. Keep this gallery prototype unpublished; a separate module/catalogue with host registration is proposed, not an implemented or approved extension API. Exact origins and Source frame ownership remain mandatory. Cross-origin iframe sessions and native media display remain hardware qualification items. The APNs opening alert was accepted (HTTP 200); the owner's tap/delivery confirmation is outstanding.
