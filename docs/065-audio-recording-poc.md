# 065 · Audio recording through Device Data

Document ID: **GCP-065**. Updated: **2026-10-24**.

**Status:** implemented, automatically/browser verified, signed and installed on iPhone. Owner confirms recording and playback: “Sì, registro e riascolto correttamente”. Owner also confirms cancellation and Home/return: “Sì, annullamento e uscita dall’app funzionano”, with cancelled status, recording=false and no playable result.

<a id="gcp-065-005"></a>
## 005 · Owner direction and dependency selection

Owner requests recording audio through Gramlot Data and specifies “Preferisco una dipendenza con licenza MIT”. The MPL-2.0 Capgo candidate was inspected but not adopted. The original capacitor-voice-recorder 7.0.6 lacks Package.swift; its upstream issue #133 documents Capacitor 8/SPM problems. The selected maintained MIT alternative, @independo/capacitor-voice-recorder 8.3.12, contains Package.swift and a Capacitor 8 native bridge. Official @capacitor/filesystem 8.1.5 supplies app-cache file deletion and satisfies its peer requirement. Its transitive capacitor-blob-writer 1.1.21 is also MIT. These versions record tested evidence; first-party dependency policy is unchanged.

This is a bounded foreground recording and playback test. No background recording mode, upload, server transcription, speech recognition, resume-after-interruption or durable recording library is added. NSMicrophoneUsageDescription explains the explicit local recording request. Only pressing Registra audio requests microphone permission.

<a id="gcp-065-010"></a>
## 010 · Data and provider contract

The reserved node gramlot.device.audio starts with null value and attributes start=null, stop=null, cancel=null, status=idle, error=null and recording=false. Source.FIRE on ?start, ?stop or ?cancel drives the operation. Plain reads and writes do not open the microphone.

Start clears the previous result and releases its owned file before opening a new session. status=pending covers startup; confirmed capture sets status=recording and recording=true. Duplicate starts and stops are ignored while their operation is pending. Stop produces a Bag {url, mimeType, duration}; duration is milliseconds, url is a playable native file URL and MIME type is audio/*. Successful stop sets success and recording=false. No raw audio/base64 or filesystem path is exposed as additional Data fields.

Cancel aborts pending startup or active capture, discards the result and requests native stop, listener removal and file deletion. Completion sets cancelled/error=null/recording=false. Interruption and App pause use the same cancellation path when their native event reaches the page. There is no automatic resume. Permission rejection is denied/PERMISSION_DENIED; missing native capability is unavailable/UNAVAILABLE; invalid result or native failure is error/FAILED. Cleanup failures remain errors and retain an acquired session for retry where possible; they are not reported as a successful cancellation.

DeviceAudio and DeviceAudioSession are generic. startAudioRecording(onInterruption, signal) returns a session exposing stop():Promise<DeviceAudio> and dispose():Promise<void>. The Capacitor provider owns permission handling, native listeners, app-cache recording paths, Capacitor.convertFileSrc and Filesystem.deleteFile. Core owns Data, operation ordering and page lifetime. Dispose ignores late results and waits for late session cleanup. Provider shutdown is idempotent and coordinates an already pending stop. No audio-specific DOM wiring or SDK dependency enters core.

<a id="gcp-065-015"></a>
## 015 · Python fixture and local-file lifetime

The Python section declares Registra audio, Ferma registrazione and Annulla audio, disabled states derived by dataFormula, recording/status/error fields and a native HTML audio element declared through Gramlot Source. Its src points to ^gramlot.device.audio.url and its controls are native browser media controls. Logic methods emit only FIRE. A new recording, explicit cancellation or ordinary page disposal releases the previous result file.

The file is in the app cache, with no server send. This does not guarantee cleanup after a process crash/forced termination or every native failure: the plugin must return the owned file path for specific deletion, and page cleanup depends on JavaScript/native lifecycle delivery. There is no broad deletion of unrelated cache files. This PoC is not a durable audio archive. iOS settings/audio-session behavior may affect playback volume and haptics; hardware evidence below is kept distinct from automated checks.

<a id="gcp-065-020"></a>
## 020 · Verification

- Core focused Device/handler tests: 60 pass. Full JavaScript suite: 3,902 pass. Audio tests exercise FIRE-only start, deduplication, a real Data-bound audio element, replacement cleanup, cancellation during startup, interruption, invalid output, denied/unavailable cases, disposal during stop and cleanup-failure retry.
- Capacitor suite: 52 pass. Audio tests cover cache-path options, URI/duration/MIME projection, one native stop, specific file deletion, permission denial, late native start after cancellation, foreground/interruption events, partial listener setup failure and concurrent stop/dispose with deletion retry.
- Browser: Python page renders without console errors; Registra audio yields unavailable without microphone access or fabricated media.
- Native: SPM sync, Xcode build, strict signature verification and iPhone install/launch pass. The built bundle contains VoiceRecorder and FilesystemPlugin plus the microphone purpose text.
- Hardware: owner confirms recording and successful playback with MIME/duration/success Data. Owner also confirms explicit cancellation and Home/return produce cancelled, recording=false and no playable result. Microphone-denial and external interruption hardware tests remain separately unverified; file deletion is covered by provider tests, not direct physical-device filesystem inspection.

[Selected MIT recorder](https://github.com/independo-gmbh/capacitor-voice-recorder), [original recorder SPM issue](https://github.com/tchvu3/capacitor-voice-recorder/issues/133), [Filesystem API](https://capacitorjs.com/docs/apis/filesystem).


Sharing extension: owner subsequently requests explicit sharing of the retained recording. GCP-070 adds a Data-triggered native share sheet. Earlier statements about no automatic upload remain true; the user may now explicitly choose an external destination in that sheet.
