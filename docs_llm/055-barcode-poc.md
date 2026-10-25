# 055 · QR and barcode Data PoC

Document ID: **GCP-055**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser tested, signed and installed on iPhone. Owner confirms the synthetic QR returns text=GRAMLOT-POC-QR-001 and format=QR_CODE. Owner also confirms Code 128 (GRAMLOT-POC-128-001 / CODE_128) and cancellation with the old result cleared. Other formats and native denial remain separately unverified on hardware.

<a id="gcp-055-005"></a>
## 005 · Direction and scope

After the QR/barcode, network, app lifecycle, haptics, sharing, keyboard and link proposals, owner replied “si tutte utili” and then “passiamo alle altre funzioni”. The announced next increment is QR/barcode scanning. Scoped details follow the earlier instruction to proceed without repeated implementation questions; names follow the established camera/biometrics conventions in GC-225 §100. This is one explicit foreground scan, with no continuous scanner, server upload, automatic URL opening, product database lookup or browser emulation.

The official @capacitor/barcode-scanner package was examined: MIT, Capacitor 8 peer support and Swift Package Manager support. The tested package is 3.1.3. Its native dependency OSBarcodeLib is resolved through SPM. Existing camera usage authorization text remains in the iOS project. Camera permission is requested by the scanner when explicitly invoked.

<a id="gcp-055-010"></a>
## 010 · Data contract

The reserved node gramlot.device.barcode starts with null value and attributes status=idle, error=null, scan=null. Source.FIRE('gramlot.device.barcode?scan') starts a scan. Reading the node or writing scan as an ordinary attribute does not open the camera. Duplicate commands while pending are ignored. Every accepted attempt clears the previous result and error before acquisition.

Success replaces the value with a Bag containing text (nonempty decoded string) and format (nonempty standard symbology name, for example QR_CODE, CODE_128 or EAN_13), setting status=success. Native enum values are translated in the provider; the core does not depend on Capacitor. Returned text is rendered as text, never interpreted as markup, URL or executable code. Ordinary bindings and controllers can consume the result; this fixture sends none of it to the server.

User cancellation yields cancelled/error=null; native camera denial yields denied/PERMISSION_DENIED; absent native capability yields unavailable/UNAVAILABLE. Invalid results and other failures yield error/FAILED. There is no fabricated success or retained previous scan after failure. Core disposal aborts the request and ignores late completion. The SDK exposes no public scanner-dismiss method, so disposal cannot promise to close a scanner already presented by iOS; use the native cancel control. No extra close API or camera-lock subsystem is invented.

DeviceBarcode and provider scanBarcode(signal) define the generic result boundary. The provider checks abortion before and after the native call, requests ALL formats through the plugin, and validates numeric native format results against the SDK enum before projecting the standard name. It maps the documented iOS cancellation and denial error codes. iOS symbology limitations belong to the plugin; this PoC does not claim every listed format works on every device.

<a id="gcp-055-015"></a>
## 015 · Page and test inputs

The Python page adds QR code e codici a barre, a Scansiona codice button disabled by the pending Data formula, bound text/format fields and shared status/error display. Logic deviceScanBarcode only emits FIRE. The synthetic QR is served at /device/barcode-test.png and contains GRAMLOT-POC-QR-001. Its image is generated locally; no payload is sent to an external image service. An additional Code 128 fixture, site/assets/barcode-test-code128.png, contains GRAMLOT-POC-128-001 and is generated locally with Core Image for the hardware check.

On iPhone open Gramlot PoC, scroll to QR code e codici a barre and press Scansiona codice. Point at the QR shown on the Mac or the chat image. Verify text, format and success. Repeat with the Code 128 fixture. Start another scan and dismiss it to verify cancelled with no stale result. Denied permission and other camera availability cases remain separately qualified; automated tests do not prove physical observations.

<a id="gcp-055-020"></a>
## 020 · Verification

- Full core JavaScript suite: 3,890 pass. Focused Device/handler tests: 48 pass, including FIRE-only activation, pending deduplication, real field/button binding, rendering unsafe-looking text as text, result clearing, cancellation, denial, invalid format, unavailable capability and late result disposal.
- Capacitor repository suite: 36 pass (35 provider tests plus the shortcut page policy test). Barcode cases cover QR/Code 128/EAN-13 projection, unchanged URL-like text, malformed native formats, native error mapping and abortion before/after acquisition.
- Browser: the Python page and QR image render; explicit scan returns unavailable with no camera prompt or fabricated output. The QR served through CA-verified LAN HTTPS exactly matches the local fixture.
- Native: build, SPM synchronization, plugin inclusion, strict signature validation and iPhone installation pass. Automatic launch was refused because the phone was locked; the owner opened it manually.
- Hardware: owner answered “Sì, testo e formato sono corretti” to the exact QR payload/QR_CODE check. Owner subsequently confirms “Sì, Code 128 e annullamento funzionano” for the exact Code 128 payload/format and cancelled status with the previous result cleared.

[Official Barcode Scanner API](https://capacitorjs.com/docs/apis/barcode-scanner). [Source and license](https://github.com/ionic-team/capacitor-barcode-scanner).
