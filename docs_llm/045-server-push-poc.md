# 045 · Server push Data PoC

Document ID: **GCP-045**. Updated: **2026-10-24**.

**Status:** implemented, signed and installed on iPhone. Owner confirms server registration success and the real push title in received Data. APNs accepted foreground and background test sends (HTTP 200). After initially reporting no banner, the owner explicitly disabled Focus, returned to Home and requested another push. APNs accepted it (HTTP 200); the owner answered “funziona” to the check for both banner and actionId=tap. Background display and tap-to-Data are accepted for this slice. Owner also confirms cold-start opening and actionId=tap after closing the app and tapping a new real push.

<a id="gcp-045-005"></a>
## 005 · Authorization and boundary

Owner: “Funziona, vedo la notifica e il tocco aggiorna i dati. Proviamo ora le push dal server, sempre con la stessa filosofia.” This accepts the local notification slice and authorizes real remote push. The existing instruction to proceed without repeated implementation questions covers coherent bounded details; names are recorded in GC-225 §100. The owner supplied an APNs key locally and confirmed native/server registration with “Sì, success”. Receipt was confirmed with “Sì, il titolo compare nei dati”.

Core owns the provider-independent Data contract; this repository owns Capacitor integration, the Python page and the operator-only APNs sandbox sender. One anonymous LAN test-device slot is used. There is no production identity/account association, logout handling, general authorized routing, silent push, Firebase or public send endpoint. This slice does not complete every phase-5 acceptance gate in GCP-005.

<a id="gcp-045-010"></a>
## 010 · Data contract

All paths below are under gramlot.device.push.

| Path | Meaning |
| --- | --- |
| ?register | Transient FIRE command; plain reads/writes do not register |
| registration | null or Bag containing token; never rendered in the fixture |
| received | Last foreground event Bag: id/title/body/messageId/destination |
| action | Last user interaction Bag: same fields plus actionId |
| ?status / ?error | Registration state and structured error |
| ?listening / ?listenerError | Event listener readiness and errors |

Source.FIRE('gramlot.device.push?register') clears the previous registration and starts one pending operation. Completion requires the native token event, not merely the register() promise. Duplicate pending commands are ignored. The 30-second timeout reports TIMEOUT; a later genuine token event can still update Data. Token replacement updates the same node. Permission denial and unavailable capability retain the shared denied/PERMISSION_DENIED and unavailable/UNAVAILABLE contract. A native registration failure reports error/FAILED. Late promise failure cannot overwrite an already accepted token.

Provider registerPush(signal) initiates registration. startPushEvents(callback, signal) returns asynchronous cleanup. Attachment installs listeners without prompting for permission. Pending registration waits for listener setup. Disposal aborts pending work, clears the timer, ignores late callbacks and removes only page-owned handles, including handles arriving after disposal; all removals are attempted. Page disposal does not unregister the app from APNs. No public watch/unwatch or push resolver is introduced.

The Python page binds token="^gramlot.device.push.registration.token" to dataRpc("pushRegister", ..., _if="token", _delay=200). The endpoint stores the token, topic and development environment atomically in a private server file, replacing the dedicated slot. Its response contains registration acknowledgement, topic and environment, not the token. view.push.serverStatus/serverError expose RPC outcome independently of native registration. Ordinary bindings/controllers react to received/action; payloads never execute JavaScript or navigate arbitrary URLs.

<a id="gcp-045-015"></a>
## 015 · Local server and native setup

The official Push Notifications plugin is synchronized into the iOS project. AppDelegate forwards registration success/failure to Capacitor. The signed build has aps-environment=development and the matching provisioning profile. Foreground presentation requests banner/list/sound; actual iOS presentation remains subject to system settings.

The ignored .local/apns directory has mode 700 and contains AuthKey.p8 and config.json with mode 600. Configuration contains keyId and teamId. Compose mounts the directory read-only at /run/gramlot-apns; only the operator CLI reads credentials. The web process cannot read those root-only files. Tokens live in /var/lib/kajenn/push/device.json, not in browser output, logs or tracked source. The credential-free status command reports file presence, not Apple validation.

The sender uses TLS-verified HTTP/2, ES256 provider authentication, the fixed sandbox topic dev.gramlot.capacitor.poc, alert push type and priority 10. Payloads contain aps.alert, sound, a new messageId and destination=device. Maximum payload is 4096 UTF-8 bytes. Expiration is zero: APNs does not retain the message for later delivery. HTTP 200 means acceptance, not proof of display. APNs rejection reasons are sanitized; network errors omit tokens and authorization. No automatic account/token lifecycle is claimed for this one-device fixture.

From the repository root, with the local containers already running:

```sh
docker exec -u root local-https-kajenn-1 python /site/push_service.py status
docker exec -u root local-https-kajenn-1 python /site/push_service.py send \
  --title 'Gramlot push test' --body 'Tap to return to the device page.'
```

Before sending, register on the real iPhone and check both native status and server registration success. Synthetic test tokens must never replace the live slot. Do not copy secrets or tokens into documentation.

<a id="gcp-045-020"></a>
## 020 · Runtime alignment and checks

Refreshing first-party packages during the container rebuild exposed an old local bootstrap expecting collection URL strings while the current server returns collection identity records. This caused a blank page. The fix rebases only the Device integration onto current core main in a separate managed worktree, retaining the current bootstrap and leaving the original checkout intact. No dependency downgrade, pin or compatibility fallback was added.

Startup now reads one explicit absolute core checkout path from ignored .local/core-path. Prepare that checkout with npm --prefix js install --package-lock=false and npm --prefix tools/gramlot-builder install --package-lock=false. For core tests create its .venv and install -e '.[test]'. npm run device:start builds that core runtime and the provider, then starts the existing local Compose environment without replacing the Caddy CA. Keep the selected worktree available while this fixture uses it.

Verified evidence:

- Current-core full JavaScript run: 3,880 passes and four environment failures caused by the missing worktree .venv. After creating the virtualenv, all 25 tests in the three affected files pass, resolving all four failures. Device/handler focused run: 42 pass.
- Provider suite: 29 pass. APNs sender suite: six pass using synthetic credentials/tokens and mocked HTTP/2, covering atomic replacement, JWT/signature/headers, rejection, payload limits and redaction.
- Current runtime builds; browser page and push controls render after alignment. iOS signed build, strict signature/profile checks, installation and relaunch pass.
- Owner confirms real native registration and server RPC success. First APNs send returns HTTP 200; owner confirms the title in received Data. The second send from Home also returns HTTP 200, initially without a visible banner. After the owner disabled Focus and returned to Home, the third send was accepted and the owner confirmed “funziona” when asked to verify banner and actionId=tap.

The requested real push-to-Data slice is owner-accepted. Cold-start opening and actionId=tap are also owner-accepted after a separate real push with the app closed. The fixed device destination is descriptive Data, not a general authorization/navigation protocol. Other plan gates remain open.

[Apple delivery diagnostics](https://developer.apple.com/documentation/usernotifications/testing-notifications-using-the-push-notification-console) distinguishes APNs acceptance from delivery. [APNs request headers](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns) defines expiration behavior.


<a id="gcp-045-025"></a>
## 025 · Cold-start hardware acceptance

On 2026-10-24 the owner reported “ho spento app”. The operator sent “Gramlot: avvio da app chiusa”, accepted by APNs with HTTP 200. Asked to tap it and verify that the app opens and Ultima interazione push shows actionId=tap, the owner confirmed “funziona”. This qualifies real push opening and native action delivery into the new page Data on the tested iPhone. It does not qualify authenticated destination routing, other devices or every OS lifecycle condition. No source change was needed for this check.
