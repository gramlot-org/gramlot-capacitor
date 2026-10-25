# 040 · Local notifications Data PoC

Document ID: **GCP-040**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser tested, signed, installed and launched on iPhone. Owner accepted native display and tap-to-Data: “Funziona, vedo la notifica e il tocco aggiorna i dati.” This local slice does not satisfy the real remote APNs gate in GCP-005 §045.

<a id="gcp-040-005"></a>
## 005 · Direction and scope

Owner: “Proviamo ora le notifiche, sempre con la stessa filosofia dei dati.” The announced first slice is local notifications using the previously approved official plugin. Coherent implementation details follow the earlier request to proceed without repeated questions. Names were recorded in GC-225 §100. Remote push registration, server credentials and authorized destination routing remain separate work; none is silently replaced by local scheduling.

<a id="gcp-040-010"></a>
## 010 · Data map

All paths below are under gramlot.device.notifications:

| Path | Meaning |
| --- | --- |
| request | Bag with id, title, body, delay |
| ?schedule | Transient true FIRE event that snapshots request |
| scheduled | null or acknowledged id/at (Unix milliseconds) |
| received | Last JavaScript receipt event: id/title/body |
| action | Last user action event: id/title/body/actionId |
| ?status / ?error | Scheduling progress and shared code/message outcome |
| ?listening / ?listenerError | Event listener readiness and setup/event error, separate from scheduling |

Request requires a positive signed-32-bit integer id, nonempty string title/body and a positive finite numeric delay in seconds. There is one canonical Bag representation; no coercion from strings or native SDK payloads. Source.FIRE('gramlot.device.notifications?schedule') is the command. Reading values, editing fields or plain attribute writes never schedules a notification. Duplicate pending commands are ignored. The input snapshot is taken at FIRE time; subsequent editing does not alter that attempt.

A new command clears scheduled and error, then sets pending. Permission denial yields denied/PERMISSION_DENIED; unavailable native capability yields unavailable/UNAVAILABLE; invalid input and scheduling/setup failures yield error/FAILED. Success stores id/at after native acknowledgement. It does not prove OS display or receipt. Previous received/action events remain independent and are not erased by a new scheduling attempt.

Native events replace the respective Bag and activate ordinary ^ bindings/controllers. No notification content is interpreted as code, URL or navigation. This slice has no upload, server RPC, persistent event queue, deduplication across sessions or automatic routing. The default notification ID is 1; scheduling the same ID replaces a pending notification, rather than creating an unbounded sequence.

<a id="gcp-040-015"></a>
## 015 · Provider lifecycle

Core owns the Data contract; CapacitorDeviceProvider owns LocalNotifications. Provider methods are scheduleNotification(request, signal) and startNotificationEvents(callback, signal), the latter resolving to an asynchronous cleanup function. Generic contract types are DeviceNotificationRequest, DeviceNotificationSchedule and DeviceNotificationEvent. No Capacitor dependency enters core.

Provider attachment starts event listeners without prompting for permission or scheduling. Readiness and failures are visible through listening/listenerError. A failed setup can retry on the next explicit schedule command. Scheduling waits for listeners, checks display permission and requests it only when necessary. Time is calculated after permission completion. The plugin acknowledgement must include the requested ID before success is published.

Listener callbacks project only the documented fields. Both foreground receipt and user action listeners are removed through their own handles; removeAllListeners is not used. Partial registration failure removes earlier handles. Page disposal aborts pending startup, ignores late callbacks/results and waits for arriving handles before cleanup. All handle removals are attempted and cleanup failure is observed. Already-accepted OS notifications are not cancelled when a page closes. An in-flight native schedule can complete after closure without a late Data write.

The iOS configuration requests banner/list/sound presentation while foregrounded; no badge count is changed. OS display settings still govern actual presentation. Foreground JavaScript receipt is distinct from background OS delivery; a background banner need not populate received. The native plugin retains action callbacks until a listener exists, but cold-start delivery is not qualified by this PoC. No new APNs entitlements or server credentials were introduced.

<a id="gcp-040-020"></a>
## 020 · Page and checks

The Python page provides bound title/body/delay inputs, a pending-disabled scheduling button, and separate scheduling, receipt and action output. Companion Logic only emits FIRE and initializes the request from Python-supplied parameters. There is no application DOM wiring or separate state system.

- Full core suite: 3,707 passed, including 33 device tests. Notification coverage includes snapshot semantics, no acquisition on reads/plain writes, validation, denial, real event bindings, setup retry, disposal/late completion and cleanup errors.
- Provider suite: 25 passed. Notification cases cover permission flow, native acknowledgement, time projection, structured errors, non-prompting event setup, received/action projection, partial registration cleanup and aborted startup.
- Browser: inputs/labels render, native-only command returns unavailable, no simulated notification or console errors. Local CA-verified HTTPS page/provider/source return 200.
- Local Notifications 8.3.1 synchronized; signed iOS build, strict signature, provisioning and foreground presentation configuration pass. devicectl installation and launch both returned success on the connected iPhone.

On iPhone open Gramlot PoC → Notifiche locali → Programma notifica. Allow notifications when asked. The default delay is five seconds after permission completes. First remain in the app to inspect received and the banner; tap the notification to inspect action. Then schedule another and return to Home to check background display and tap back into the app. Owner confirmed native display/action; foreground/background/cold-start scenarios were not individually itemized. Do not interpret an automated test, success status or foreground receipt as proof of all these native paths.

[Startup commands](025-device-poc.md). [Official Local Notifications API](https://capacitorjs.com/docs/apis/local-notifications).
