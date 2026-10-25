# 025 · Device Data PoC

Document ID: **GCP-025**. Updated: **2026-10-24**.

[Contract](020-device-integration.md). [Gallery milestone](015-gallery-poc.md).

**Notifications follow-up:** GCP-040 adds local notification scheduling and native event-to-Data binding. The owner accepted native display/action. Real APNs registration and receipt are now verified; background banner and tap-to-Data are owner-accepted after disabling Focus (GCP-045).

**Biometrics follow-up:** GCP-035 adds explicit Data-triggered Face ID verification. The signed build is installed/launched and the owner confirmed “funziona”. Camera capture/preview is also accepted (“Funziona, vedo la foto”).

**Camera follow-up:** GCP-030 adds explicit Data-triggered capture; its signed build is installed and launched on iPhone. Owner feedback on the previous device page was positive (“mi pare vada benone”), without itemized native observations.

**Appinfo/location checkpoint:** implemented and tested in the connected local Gramlot checkout and this repository. The iOS application builds and passes signature verification. The new device increment was installed and launched successfully on the physical iPhone after reconnection. Native app information, permission interaction and location values still require user-visible verification; only the earlier official-gallery milestone has owner acceptance.

<a id="gcp-025-005"></a>
## 005 · Try the page

- iPhone/iPad, on the Mac LAN with the previously trusted local Caddy CA: https://192.168.5.115:8443/device/
- Mac browser preview: http://127.0.0.1:8085/device/
- The browser shows unavailable for native features. No browser geolocation or fabricated app details stand in for the native provider.
- The signed app now targets the local device page. Its link opens the official gallery; no official gallery content was changed or deployed.

The page is authored in Python with Gramlot Source, Data, binding, a checkbox component and named Logic. Field bindings initiate resolver reads, so opening this particular native probe can request location permission. The toggle writes location?enabled; watching reports actual listening. The page never sends acquired coordinates to its server. The source link exposes the Python fixture. A shared inspector launcher is not yet integrated into this standalone fixture: the available gallery launcher is coupled to gallery/frame ownership; no application DOM workaround was introduced.

<a id="gcp-025-010"></a>
## 010 · Start and build locally

Use the isolated Node 24 installation recorded in .local/node/runtime-path, or an already selected Node 24. Dependencies and the reusable Kajenn/Caddy base image must already be installed as described in GCP-015.

```sh
PATH="$(cat .local/node/runtime-path)/bin:$PATH" npm run device:start
PATH="$(cat .local/node/runtime-path)/bin:$PATH" npm test
PATH="$(cat .local/node/runtime-path)/bin:$PATH" npm run ios:sync
```

The startup command builds the Gramlot checkout explicitly selected by its absolute path in ignored .local/core-path and the Capacitor provider, then starts the existing Compose project with the device overlay. It preserves Caddy's CA and site volumes. The development runtime is mounted read-only into the current Python 3.12 image's Gramlot resource location; this overlay is for that local image, not a portable deployment recipe. The additional HTTP port is published on Mac loopback only. Device access remains HTTPS on the existing LAN address/port.

The native project now includes App, Geolocation, Camera (GCP-030) Biometric Auth (GCP-035) and Local Notifications (GCP-040). Location usage descriptions are present in Info.plist. Signed build products/logs remain under ignored .local/device-build and .local/device-native-build.log. No signing identity or personal device identifier is recorded here. Native plugins require rebuilding the binary; the provider/page logic is served live.

<a id="gcp-025-015"></a>
## 015 · Implemented boundary

Core owns DeviceHandler and DeviceResolver, with no Capacitor dependency. gramlot.dvc.attach(provider) installs the device map once per opted-in page; unrelated pages acquire no device Data nodes. invalidate/refresh return no result: values, progress and errors are observed in Data. The provider owns native permission calls and error translation.

The provider declares capabilities and implements readAppInfo(), readLocation() and startLocationUpdates(callback, signal). The last operation resolves with its asynchronous cleanup function. The abort signal prevents obsolete permission/startup completion from enabling updates. There are no public watch/unwatch methods.

cacheTime is a node attribute in seconds: -1 caches indefinitely, 0 reacquires on explicit reads, positive values provide TTL. Own completion/status notifications cannot recursively trigger a fresh acquisition. Successful receipt updates cache age. Invalidation during a pending read retains its result but leaves the cache stale. A location measurement with an older timestamp cannot replace a newer one; a late point failure cannot replace an intervening successful update. Active monitoring supplies ordinary reads. Native cleanup is serialized before restarting; watching becomes false only when cleanup completes. Failed cleanup is reported instead of claiming successful stopping.

Scope: one owning page, foreground location, no cross-frame relay, background-location guarantee, persistent request queue or server synchronization. Device integration is explicitly attached by the Python page's companion Logic during initialization. No dependency sources, installed Builder/Bag copies, or remote gallery were edited.

<a id="gcp-025-020"></a>
## 020 · Verification and next check

- Full Gramlot suite: 3,688 passed. Includes the device state machine and actual Source/widget/attribute bindings.
- Capacitor provider: seven passed, using plugin mocks only in tests; covers permission deduplication, denial, cancellation, error mapping and cleanup.
- Browser preview: page renders; refresh buttons run without console errors; enabled can be true while watching remains false with unavailable native capabilities.
- HTTPS: page, provider, runtime, stylesheet, Python source and existing gallery return 200 using the actual local CA.
- iOS: App and Geolocation sync, signed build and strict codesign verification pass.

After the phone reconnected, its provisioning coverage was checked and devicectl installation and launch both returned success. The owner confirmed that the phone was connected and unlocked. Remaining: verify real app information, the permission prompt, a real location and enabled/watching transitions on screen. The app is installed and launched; native result acceptance and production readiness are not claimed.
