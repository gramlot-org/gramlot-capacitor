# 090 · Text clipboard through device Data

Document ID: **GCP-090**. Updated: **2026-10-24**.

<a id="gcp-090-005"></a>
## 005 · Scope and contract

Owner requests “bene, proviamo ora copia e incolla con la clipboard, sempre passando dai dati gramlot”, following the official Clipboard proposal. The native provider uses @capacitor/clipboard 8.0.1 (MIT, Capacitor 8/SPM). This bounded probe exchanges plain text only. Rich clipboard formats, images, Excel parsing and file import are not implemented.

The reserved node gramlot.device.clipboard has null or Bag {text} as result. Its attributes are text (copy input), copy/paste (explicit FIRE commands), operation (null/copy/paste), status and error. Source reads or ordinary writes never call the clipboard. Copy snapshots text at invocation, awaits the SDK write and returns that text; success is write acknowledgement, not a separate read-back. Paste reads once and writes the returned text. Empty strings and tabs/newlines are preserved without conversion. New commands clear previous result/error, and one pending gate suppresses concurrent commands.

DeviceProvider.copyText(text,signal) and pasteText(signal) keep the core independent of Capacitor. Capability absence yields unavailable. Native text/plain is accepted; other types fail without entering Data. The SDK's empty/unreadable clipboard rejection remains an error, not simulated empty text. The installed iOS implementation does not expose a reliable distinct permission-denial code for that case; do not infer denial from a generic error. Existing provider codes map to the established status/error contract when present.

Disposal aborts result delivery and prevents late Data writes. It cannot reverse a copy already completed or dismiss an OS prompt already opened. There are no polling listeners, automatic reads/retries, server uploads or clipboard diagnostics containing user content. Browser use reports unavailable; no Web Clipboard fallback is introduced.

<a id="gcp-090-010"></a>
## 010 · Python probe and verification

The Python page offers an editable Data-bound copy input initialized with synthetic GRAMLOT-CLIPBOARD-001, Copy/Paste buttons that only FIRE, and bound operation/status/error/result controls. iOS may ask the user to allow paste. Agent tests use synthetic data and mocked native Clipboard; they do not inspect the user's system clipboard.

68 focused core/handler tests and 59 provider/page tests pass. They cover explicit-only execution, request snapshots, shared pending gate, empty/Unicode/tabular text, invalid/nontext results, errors/retry and cancellation/disposal. Full core verification, browser unavailable behavior and the signed native build/install are recorded below when complete.

<a id="gcp-090-015"></a>
## 015 · iPhone trial

Open the Clipboard section. Press “Copia testo”, then “Incolla testo”: success and the synthetic text should appear in the result. To test external apps, the user may paste the synthetic text into a chosen scratch document, then copy another non-sensitive test phrase there and press “Incolla testo” in Gramlot. The user handles any iOS paste permission prompt. No recipient is selected and no message is sent by the agent.

Check errors using a clipboard without a readable text representation, if desired. Do not mistake a generic empty/unreadable error for a confirmed permission denial. Physical acceptance is separate from automated results.

Final verification checkpoint: full core suite 3,926/3,926, 68 focused core/handler tests and 59 provider/page tests pass. Python page syntax and live loading pass. Browser Paste reports unavailable with operation=paste and no result, without Web Clipboard access. Native SPM synchronization/build, codesign verification and ClipboardPlugin bundle inclusion pass. The new app installs successfully on iPhone; automatic launch is refused because the device is locked. Owner must unlock/open the app for the physical copy/paste test. Clipboard content was not read by the agent. Hardware acceptance remains pending.

Owner hardware acceptance, 2026-10-24: “Sì, copia/incolla funziona e il risultato è corretto”, answering the explicit iPhone trial of Copy then Paste with status success and GRAMLOT-CLIPBOARD-001 in the Data result. The bounded native text clipboard round trip is verified and accepted. External-app exchange, permission denial and rich formats are not independently verified by this confirmation.
