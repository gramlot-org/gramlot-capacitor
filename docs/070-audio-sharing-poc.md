# 070 · Sharing the recorded audio through Device Data

Document ID: **GCP-070**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser verified and installed/launched on iPhone. Owner confirms “funziona” for sharing. The specific destination, recipient delivery and native cancellation were not separately reported.

<a id="gcp-070-005"></a>
## 005 · Owner direction and scope

Owner explicitly requests “bene, proviamo ora a condividere la registrazione audio, sempre passando dai dati gramlot”. The selected official @capacitor/share 8.0.3 is MIT, compatible with Capacitor 8 and includes Swift Package Manager support. It shares the single completed audio file retained by the provider. It does not accept an arbitrary path, URL, recipient or application name from Data. The user chooses the destination and final action in the native share sheet; Gramlot sends no recording to its server.

<a id="gcp-070-010"></a>
## 010 · Data contract

FIRE('gramlot.device.audio?share') requests sharing after successful stop. Ordinary reads or writes do not open a panel. New attributes shareStatus, shareError and shareActivity describe this separate operation; recording status, MIME, duration and playable URL stay intact. Initial/reset sharing status is idle, with no error or activity. Activity/error use the established nullable Bag-attribute semantics; FIRE can remove null attributes.

shareStatus is pending while the panel is open; completed native activity yields success and shareActivity, a string that may be empty. This is not proof of delivery to a recipient. Native cancellation yields cancelled with no error; other failures yield error/FAILED or unavailable/UNAVAILABLE. A request without a completed recording reports an error without opening a panel. Each new share clears prior sharing metadata; cancellation/error leaves the recording playable and allows retry. A new recording or audio cancellation resets sharing metadata.

Duplicate pending shares are ignored. Start and audio-cancel commands do not invalidate the file while sharing; the corresponding Python buttons are disabled. DeviceAudioSession.share(signal) returns {activity:string}. The provider supplies Share.share with the retained native path converted to a properly encoded file:// URL, not the WebView playback URL. Raw filesystem paths never enter Gramlot Data. The exact iOS plugin rejection “Share canceled” is mapped at this boundary; there is no fuzzy cancellation heuristic or fallback sharing mechanism.

On page disposal, callbacks stop updating Data. The provider waits for the native sheet to settle before deleting the file. Share exposes no public dismiss API, so disposal cannot promise immediate panel dismissal. Cancellation of sharing does not delete the audio. An exported copy belongs to the selected destination; later cleanup of the PoC recording does not delete that copy.

<a id="gcp-070-015"></a>
## 015 · Python fixture and hardware check

Python declares Condividi audio and status/error/activity fields bound to audio attributes. Logic deviceAudioShare emits FIRE; formulas derive availability and protect the recording while the share is pending. No manual DOM events, application fetch or parallel state are added.

Record a short synthetic phrase and stop. Press Condividi audio, close the sheet, and check cancelled with playback still available. Reopen and select an appropriate destination yourself. A local Save to Files action can test export without messaging another person. Verify the completed activity is reflected in Data and the exported audio plays. The app does not automatically select or send to a recipient.

<a id="gcp-070-020"></a>
## 020 · Verification

- Focused core Device/handler tests: 63 pass, covering completed-recording requirement, pending deduplication, prevention of file invalidation during sharing, cancellation/error/retry, empty activity identifier, metadata reset and no late Data writes after disposal.
- Capacitor suite: 56 pass, including real-file URI encoding, preservation on cancellation, SDK result validation, missing native plugin, pre-aborted share and deletion deferred until sheet completion.
- SPM synchronization, Xcode build, strict signature and SharePlugin inclusion pass.
- Full core suite: 3,905 pass. Browser renders the share status and disables Condividi audio without a completed recording, with no console errors.
- iPhone installation and launch pass. Owner confirms “funziona” for sharing after installation. This is general sharing acceptance, not evidence of a named destination, recipient delivery, native cancellation or exported-file playback. Cancellation/file-lifetime cases have automated coverage and remain separately unverified on hardware.

[Official Share API](https://capacitorjs.com/docs/apis/share), [official plugin source](https://github.com/ionic-team/capacitor-plugins/tree/main/share).
