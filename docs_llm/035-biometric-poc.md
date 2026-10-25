# 035 · Biometric Data PoC

Document ID: **GCP-035**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser tested, signed, installed and launched on iPhone. The owner subsequently confirmed “funziona”; native Face ID verification is accepted for this local PoC.

<a id="gcp-035-005"></a>
## 005 · Owner direction

“Funziona, vedo la foto. Proviamo ora Face ID, sempre con la stessa filosofia dei dati.” accepts camera capture/preview and requests biometric verification using Data. The previously approved @aparajita/capacitor-biometric-auth plugin is used for local verification, with site login kept separate. The earlier request to proceed without repeated implementation questions covers the coherent details below; names were recorded in GC-225 §100 before implementation. This is not authorization for unrelated APIs or publication.

<a id="gcp-035-010"></a>
## 010 · Data contract

| Path | Meaning |
| --- | --- |
| gramlot.device.biometrics | Initially null; result of the most recent successful attempt |
| gramlot.device.biometrics.verified | true only after successful native completion |
| gramlot.device.biometrics?verify | Transient FIRE event; true requests verification |
| gramlot.device.biometrics?status | Shared idle/pending/success/cancelled/unavailable/error outcomes |
| gramlot.device.biometrics?error | null or the shared code/message object |

A Source node issues `node.FIRE('gramlot.device.biometrics?verify')`. Reads, ordinary SET/setAttr and rendering do not prompt. There is no biometric resolver, cacheTime, enabled/watching or public verification method on gramlot.dvc. refresh/invalidate remain appinfo/location operations.

One verification is pending per page; duplicate pending requests are ignored. Starting clears the previous result and error immediately. Success stores a Bag with verified=true. Every unsuccessful attempt leaves the result null, preventing a cancelled or failed retry from displaying an earlier success. Cancellation uses cancelled/error=null, unavailability uses unavailable/UNAVAILABLE, recognition/other failures use error/FAILED. The generic handler also supports the shared denied/PERMISSION_DENIED provider outcome. Retry is explicit. Page closure aborts startup and discards late success/failure; the SDK does not provide dismissal of an already-presented biometric dialog through this interface.

This is an observable local result, not a lasting authorization token, login session or server proof. There is no automatic expiry or protected-action gate. The server must not trust this JavaScript value as proof of identity. No biometric material, credential or token is collected, persisted or sent to the site.

<a id="gcp-035-015"></a>
## 015 · Provider and page

Core owns the Data event lifecycle and DeviceBiometrics result type. The explicit provider method verifyBiometrics(signal) resolves without a value only after successful native verification, or rejects with the shared error contract. CapacitorDeviceProvider checks the actual BiometricAuthNative registration; the upstream plugin's web simulation is never used, including through direct provider calls.

The provider uses checkBiometry immediately before authenticate. It passes a user-facing reason, allowDeviceCredential=false, iosFallbackTitle='' and an explicit cancel label. The app includes NSFaceIDUsageDescription. No passcode fallback, credential storage, automatic prompt or resume listener. The SDK's native implementation creates a fresh LocalAuthentication context for each attempt.

User/app/system cancellation and userFallback map to CANCELLED. Not enrolled, unavailable and lockout map to UNAVAILABLE while preserving the native message. The SDK uses biometryNotAvailable for several causes, including disabled app access; this implementation does not infer a distinct permission-denial code from that ambiguous result. Other failures, including authenticationFailed, map to FAILED.

Python authors the Face ID / Touch ID section. Named Logic deviceVerifyBiometrics emits FIRE, the existing devicePending formula disables the button, and ordinary bindings show verified/status/error. DeviceHandler remains provider-independent; Capacitor and the plugin remain in this repository. No Builder/Bag source modifications or alternate implementation paths.

<a id="gcp-035-020"></a>
## 020 · Verification and acceptance

- Full core suite: 3,699 passed, including 25 device tests. Biometrics checks cover explicit event versus passive read/plain write, duplicate pending requests, cleared prior success in real bindings, errors/cancellation/unavailable, page closure and late completion.
- Provider: 18 passed, including availability/enrollment/lockout, exact no-passcode policy, web-simulation exclusion, structured errors, cancellation before prompt and late completion after abort.
- Browser: idle before clicking, unavailable afterward, no positive verification or native fallback; no console warnings/errors.
- Local HTTPS: page/provider/Python source return 200 with the configured Caddy CA verified.
- Plugin 10.0.0 uses the already-installed Capacitor 8 runtime without duplicate core/ios/app instances. SPM sync, signed native build, strict signature verification, target provisioning and Face ID usage-description checks pass. Installation and launch on the connected iPhone both returned success.
- After delivery, owner confirmation: “funziona”. This accepts native Face ID in the current PoC. Touch ID/iPad and each native cancellation/lockout condition have not been individually tested by the owner.

Use Gramlot PoC → Face ID / Touch ID → Verifica Face ID / Touch ID. Successful completion shows verified=true and status=success. A new attempt clears that result; cancellation should show cancelled with no old success. Browser preview intentionally reports unavailable. No site login, store release or remote deployment is included.

[Local startup and page](025-device-poc.md). [Plugin documentation and source](https://github.com/aparajita/capacitor-biometric-auth).
