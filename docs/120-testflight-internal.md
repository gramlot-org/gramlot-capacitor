# 120 · Internal TestFlight preparation

Document ID: **GCP-120**. Updated: **2026-10-25**.

<a id="gcp-120-005"></a>
## 005 · Owner scope and current result

Owner: “ok prepara la configurazione beta per TestFlight, collegata alla gallery pubblica e senza dipendere dal Mac. Per ora prepariamo tutto senza pubblicare. mi basta per gli interni per ora.” Icon: “per l'icona usa quaella degli asset di gramot”. This authorizes local preparation for internal testers, using the existing Gramlot artwork. No upload, App Store Connect changes, tester invitations or public deployment are authorized.

The isolated beta project is prepared and a **local unsigned Release archive compiled successfully**. This is build evidence, not a distributable signed beta or Apple approval. The existing development app/project and its local probe remain available separately. No beta has been installed or tested through TestFlight.

<a id="gcp-120-010"></a>
## 010 · Target and ownership

`config/testflight/internal.json` selects the existing `dev.gramlot.capacitor.poc` identity, Gramlot PoC name, version 1.0 and build 2. Before a future upload, check App Store Connect and choose an unused build number; no remote build-number check has been performed.

The bundled Python-authored entry uses Gramlot Source, Data controllers and ordinary Logic. Its Gallery action opens `https://gallery-py.gramlot.dev/`; the existing exact Universal Link opens `/pages/01-inputs/04-colorpicker`. No generic link expansion or authentication transfer is introduced. The beta Source omits the Mac-probe action, its target has no local URL, and Capacitor allows in-WebView navigation only to the public gallery domain. There is no `server.url`, cleartext navigation or WebView debugging in the staged configuration. This allowNavigation setting is not a general network firewall for resources loaded by the site.

The icon is rendered at 1024 × 1024, opaque, from Gramlot `assets/branding/icons/app-icon.svg`, using the existing dark background. No new logo or image-generation dependency is introduced. Its digest and source are recorded in the local preparation receipt.

Runtime needs the public service and internet access, not the developer Mac, local Docker, LAN certificate or local IP. Build-time references to installed dependencies and the core checkout are normal preparation inputs; they are not remote runtime services. Offline gallery operation and native preferences remain separate, unimplemented scope.

<a id="gcp-120-015"></a>
## 015 · Reproduce locally

Prerequisites: the configured Node 24 runtime, installed Capacitor dependencies, the current built Gramlot runtime and Python environment selected by `.local/core-path`, Xcode, and an existing asset-renderer `node_modules` directory containing `sharp`. Refresh first-party dependencies through the normal setup/update process; do not pin them for this beta.

```sh
export PATH="$(cat .local/node/runtime-path)/bin:$PATH"
export GRAMLOT_ASSET_NODE_MODULES=/path/to/asset-renderer/node_modules
npm run beta:prepare
npm run beta:check
npm run beta:archive
```

`beta:prepare` builds the provider, creates `.local/testflight/build-2`, renders the icon, generates the public-only Source/target and synchronizes Capacitor in that isolated project. It refuses to overwrite an existing output. For another preparation, first update the profile's build when appropriate, run `npm run device:build`, then invoke `python3 scripts/prepare-testflight.py --output .local/testflight/<fresh-directory>`. The latest successful preparation is recorded in `.local/testflight/current.json`.

`beta:check` checks both staged web assets and synchronized native configuration. `beta:archive` compiles Release with code signing explicitly disabled, saving `App-unsigned.xcarchive` and `archive.log` inside that project. It neither exports nor uploads. A second archive requires a fresh preparation output.

`config/testflight/ExportOptions.plist` is prepared for a future **local export**, with `method=app-store-connect`, `destination=export` and `testFlightInternalTestingOnly=true`. The unsigned archive cannot be uploaded as-is: distribution signing and provisioning must be completed in a later authorized step. No automatic provisioning changes are performed by these scripts.

Verification: 67 provider/Logic checks and four beta-profile checks pass; staged/native configuration checks pass; the 1024px opaque icon was inspected; Xcode reports `ARCHIVE SUCCEEDED` for the unsigned Release build. These checks do not qualify public native examples or TestFlight delivery.

<a id="gcp-120-020"></a>
## 020 · Remaining distribution prerequisites

Read-only public checks on 2026-10-25: the gallery root returns HTTP 200; its served gallery bundle still contains a LAN destination; `/mobile-application/catalog.json` returns HTTP 404. The receiving gallery chat must finish the independently hosted module and updated Mela/runtime integration described by [GCP-110](110-mobile-gallery-contract.md), remove developer-only destinations and verify ordinary/mobile iframe navigation. This preparation does not change or deploy that gallery. A public-only app configuration alone does not make the current website independent of the Mac.

TestFlight uses the **production APNs environment**. The staged entitlement is production, but the existing local PoC server still uses sandbox APNs and a single local device registration. It is not a public multi-tester push backend. Public push testing requires a production-authorized key and server registration/delivery implementation; the existing key's production scope is not assumed. No private APNs key, token or signing material is embedded. Until the public backend is implemented, push must not be advertised as working in this beta.

Before distribution: verify the public module and theme on the target build, select the actual internal testers and appropriate App Store Connect access, prepare distribution signing/App Store Connect app metadata and an unused build number, answer export-compliance questions after checking actual encryption use, and then request upload authorization. `ITSAppUsesNonExemptEncryption` has deliberately not been guessed. Account agreements and processing/compliance requirements still apply to internal testing. Existing hardware acceptance of the development build does not establish this beta's acceptance.

<a id="gcp-120-025"></a>
## 025 · Internal testers and future external beta review

Apple allows up to 100 eligible App Store Connect users as internal testers; an arbitrary team email is not automatically an internal tester. Internal-only testing does not require TestFlight Beta App Review. Builds remain testable for 90 days. A build exported as Internal Only cannot later be assigned to external testers or submitted to the App Store; prepare another eligible upload for that purpose.

For future external testing, prepare a working public backend and reviewable build, then provide beta description, feedback email, review contact details, what to test, review notes and a working demo account if authentication is required. Explain native capabilities and permission prompts, how to reach each example, and any required setup. The first external build requires Beta App Review; later builds may also be reviewed. Apple acceptance is not guaranteed by passing these local checks or by using Capacitor.

Review-notes draft to complete **after** public integration verification:

> Gramlot PoC is a demonstration client for Gramlot applications. Open the app and choose Open gallery. The public gallery provides ordinary examples and a Mobile application section with separate native-capability demonstrations. The bundled container supplies the native plugins; the public site supplies the demonstration pages. The color-picker Universal Link opens its matching example inside the app. Follow the example's explicit action to request the relevant device permission. [List only capabilities verified in the submitted build; add exact navigation, login if required, reviewer contact and feedback email.]

Do not submit placeholder notes or claim the public push service is ready. Permission descriptions, actual collected data, privacy disclosures and encryption declarations must match the submitted implementation. Store review and remote-code/content policies still need assessment for the final product architecture; internal testing is not approval of that architecture.

<a id="gcp-120-030"></a>
## 030 · Apple references

- [Internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers) and [eligible internal users](https://developer.apple.com/help/glossary/internal-testers/).
- [External testing and Beta App Review](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).
- [TestFlight test information](https://developer.apple.com/help/glossary/testflight-test-information/) and [complete review information](https://developer.apple.com/help/app-review/before-submitting-for-review/complete-review).
- [Export compliance](https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance).
- [APNs environment entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/aps-environment).
- [TestFlight overview and build lifetime](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).


<a id="gcp-120-035"></a>
## 035 · Signing and App Store Connect preparation — 2026-10-25

Owner asks: “intanto possiamo preparare la firma e la configurazione App Store Connect per i tester interni, senza caricare ancora la build?” This extends local preparation to signing and App Store Connect setup, while still excluding build upload. No testers have been selected and no invitation is authorized by this record.

Read-only checks with Keychain access find two valid Apple Development identities and no local Apple Distribution identity. The app has a matching-team development provisioning profile, expiring 2027-10-24, with development APNs. Certificate-name suffixes are not treated as reliable team membership evidence. The unsigned archive from §015 remains unchanged.

The isolated project's `SigningExportOptions.plist` now explicitly selects Apple Distribution, the existing private team identifier, automatic signing, local export and internal-only testing. The file stays under ignored `.local/`; it is a configuration artifact, not evidence of available distribution signing. The draft `config/testflight/app-store-connect.json` records the existing name/bundle ID, proposed Italian primary locale and bundle-ID SKU, and an empty Team interno group with automatic distribution disabled. The draft has not been created remotely; inspect existing records before creating an app or group, and confirm immutable metadata in the actual form if different.

An attempted Xcode archive command was rejected by automatic approval review before execution: it enabled remote provisioning updates and selected a development archive identity. No archive/signing/provisioning mutation resulted. The next account-changing operation needs explicit approval to create the necessary Apple Distribution certificate and App Store Connect provisioning profile for the existing bundle, without revoking other certificates. The scope excludes uploading any build. Do not substitute indirect execution for that approval.

The owner completed Apple login in Safari. Safari is not available to the browser tools in this session and its session is not shared with the Codex browser, which still shows the Apple login form. Login in the accessible App Store Connect tab is pending. No app record, internal group, users, certificates or profiles have been created or modified remotely in this increment.


<a id="gcp-120-040"></a>
## 040 · Gramlot signing and Connect setup verified — 2026-10-25

Owner explicitly confirmed certificate/profile creation if needed, without revoking existing certificates or uploading a build. After authenticating in the accessible browser, the owner selected the name **Gramlot** and the official Gramlot logo, and confirmed proceeding with signing and App Store Connect for internal testers only. This supersedes the pending authentication/authorization status in §035 and the earlier display name Gramlot PoC. The bundle ID remains dev.gramlot.capacitor.poc.

Created and visibly verified App Store Connect app **Gramlot**, Apple ID **6826770549**, iOS, primary locale Italian, SKU dev.gramlot.capacitor.poc, with limited app access. Existing administrators retain their account-defined access. Created **Team interno** with automatic distribution disabled, **0 testers and 0 builds**. No users were invited, no external group was created and no build was uploaded. The app icon on Connect is still a placeholder until the first build is uploaded; the official icon is already included in the local package.

A fresh isolated project at `.local/testflight/gramlot-build-2` uses the approved display name in native metadata and embedded Source. The official Gramlot SVG is rendered as an opaque 1024px icon. The original development project and previous unsigned preparation are retained.

Final verified artifact: `.local/testflight/gramlot-build-2/export-signed-internal/App.ipa`, version 1.0, build 2. Strict/deep signature verification passes with **Apple Distribution**. The embedded profile is App Store Connect, has no device list, includes beta reporting and expires 2027-10-25. Signed entitlements contain production APNs, `applinks:gallery-py.gramlot.dev`, the expected team and `get-task-allow=false`. The packaged display name and public navigation target pass. Verification evidence and SHA-256 remain in the private `signing-verification.json`. No local distribution private key export was performed; Xcode managed distribution signing during local export.

A first export from the unsigned archive succeeded mechanically but lost push and associated-domain entitlements. It was rejected by verification and moved to `rejected-export-missing-entitlements`, with a DO-NOT-USE marker. The correct sequence is a normally signed Release archive, followed by automatic App Store Connect distribution signing during **local export**. Do not use the unsigned archive from §015 as the input for a distributable package.

Reproduction after creating a fresh prepared project: use the configured team and automatic signing to archive Release to `App-signed.xcarchive` with the existing development identity/profile. Generate local `SigningExportOptions.plist` from the checked-in export options, adding the private team ID and `signingCertificate=Apple Distribution`. Run `xcodebuild -exportArchive` on that signed archive with the options file and a local export path; `-allowProvisioningUpdates` requires the owner's authorization for the necessary account changes, which was explicitly granted for this increment. Preserve `destination=export`, `testFlightInternalTestingOnly=true` and manual build numbering. Verify the resulting IPA's signature, profile and entitlements before any later authorized upload.

Checks: 67 provider/Logic tests and four beta-profile tests pass; staged/native configuration checks and the final IPA checks above pass. Public gallery integration, production push backend and export-compliance answers remain separate distribution prerequisites from §020. No public deployment, TestFlight delivery, new hardware acceptance or App Review is claimed. The prior automatic approval rejection is resolved by the owner's explicit certificate/profile authorization; no action remains blocked on that rejection.


<a id="gcp-120-045"></a>
## 045 · Confirmed encryption response and privacy API reasons — 2026-10-25

Owner confirms “Sì, registra questa risposta” to the concrete proposal ITSAppUsesNonExemptEncryption=false, and “Sì, completa anche il manifest” to UserDefaults CA92.1 and FileTimestamp C617.1. These decisions apply to the current beta and its inspected dependencies, not unimplemented future plugins.

The beta preparation now sets the Boolean ITSAppUsesNonExemptEncryption=false. The technical basis is operating-system encryption (including HTTPS); inspection of the current application, native plugin/Swift package sources and the barcode framework's system dependencies found no application-provided encryption implementation. This does not mean HTTPS is unencrypted. Apple's export documentation table says encryption limited to the operating system requires no documentation upload in App Store Connect. The documentation-upload wizard was inspected and cancelled without selecting its inapplicable proprietary/additional-algorithm categories or uploading documentation. No export-compliance code was invented.

The app-owned PrivacyInfo.xcprivacy is included in the native Resources build phase. It declares UserDefaults CA92.1 for the app-private pending-link and shortcut stores, and FileTimestamp C617.1 for local file metadata accessed by the Filesystem plugin. It does not assert that the public service collects no data. Privacy labels, public server logging/push registration, third-party content rights and age-rating declarations remain separate from these two confirmed technical declarations; they have not been submitted or guessed.

Verified final package: `.local/testflight/gramlot-build-2-compliance-final/export-signed-internal/App.ipa`, version 1.0, build 2, superseding the previous local IPA. Signed Release archive and local distribution export succeed. Strict/deep signature checks, Apple Distribution authority, App Store Connect provisioning, production APNs, gallery Universal Links, disabled debugging, correct name/public target, the encryption Boolean and the packaged privacy manifest all pass. Evidence is recorded in this project's private signing-verification.json. No build, document or tester invitation was uploaded/sent; the existing Connect group remains empty. Local verification does not claim Apple's upload validation or review approval.

Future Typst/WASM or native SQLite/Asqueel integration is under discussion only and has not changed this beta. In particular, capacitor-community/sqlite includes SQLCipher even for unencrypted databases; adopting it would require a new encryption assessment rather than automatically reusing the current declaration. A SQLite system-library integration is a possible alternative to evaluate, not a selected dependency.

References: [Apple encryption documentation table](https://developer.apple.com/help/app-store-connect/reference/app-information/export-compliance-documentation-for-encryption), [Info.plist encryption Boolean](https://developer.apple.com/documentation/bundleresources/information-property-list/itsappusesnonexemptencryption), [Apple API reasons](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitypereasons), [Filesystem manifest guidance](https://capacitorjs.com/docs/apis/filesystem).


<a id="gcp-120-050"></a>
## 050 · SQLite, motion and English beta verified — 2026-10-25

The owner explicitly authorizes native SQLite without SQLCipher, Asqueel JS and completing the internal beta without upload. The fresh isolated package `.local/testflight/gramlot-build-2-sqlite/export-signed-internal/App.ipa` (version 1.0, build 2) supersedes §045 as the current local beta. The pointer is `.local/testflight/current.json`. No build number has been consumed by an upload.

Signed Release archive and local Apple Distribution export succeeded. Verified strict/deep signature, App Store Connect profile, production APNs, gallery Universal Links, disabled debugging, official icon and Gramlot display name, existing exempt-encryption response and both approved privacy API reasons. The signed executable links /usr/lib/libsqlite3.dylib and contains GramlotSQLite/NativeDatabase/GramlotMotion runtime metadata; no SQLCipher dependency or runtime metadata was found. The authored embedded UI is English. The packaged JavaScript URL scan found no Mac/LAN/localhost endpoint. No signing material was exported or committed. Evidence and IPA SHA-256 remain in the private signing receipt.

The native development build was installed and launched on the iPhone after reconnecting. The owner confirms “Sì, la nota è ancora presente” after opening/creating the SQLite database, saving GRAMLOT-SQLITE-001, fully closing the app, reopening and reading without saving again. This accepts native persistence in the development app; it does not claim TestFlight delivery or a public-site SQLite test.

The public gallery itself responds over HTTPS. The new /mobile-application/database page currently returns 404: the receiving gallery chat must publish the matching module/catalogue, provider and core resource implementation (GCP-110 §060). English and motion integration remains part of that handoff. Production server-push infrastructure remains separate. The local beta is prepared; end-to-end public-only device acceptance is pending the matching public deployment. No build upload, tester invitation, external group, App Review submission or public deployment was performed in this increment.


<a id="gcp-120-055"></a>
## 055 · First internal TestFlight upload and invitations — 2026-10-25

The owner confirms “ok” to uploading Gramlot 1.0 (2) for internal TestFlight, explicitly superseding the previous no-upload restriction for this build. The owner requests an additional named existing team member, explicitly confirms the owner's own tester invitation, and confirms adding Gramlot to the additional user's existing App Manager access before inviting that user. No external testing or App Store publication is authorized.

Uploaded the previously verified signed archive using Xcode export with destination=upload and testFlightInternalTestingOnly=true. The local IPA SHA-256 was checked against the signing receipt before upload. Xcode reports Upload succeeded / EXPORT SUCCEEDED. App Store Connect subsequently showed build 2, internal-only, Ready for Testing, then Testing after assignment to Team interno. No duplicate upload was attempted.

Team interno visibly contains two authorized internal testers and one build; both testers show Invited. App-specific limited access was updated only for the authorized additional member; no role changes, global user access changes, new accounts or external groups were saved. A draft change in the global user screen was discarded; the saved change used Gramlot's own Limited Access user list. Automatic distribution was not enabled.

Automatic approval review initially rejected adding the owner as a tester because only the additional member had been explicitly named. The owner then explicitly authorized their own account and invitation; the action succeeded. That rejection is resolved, with no remaining approval block.

Private upload outcome, timestamps and verification receipt remain under the current .local/testflight project. Source documents intentionally omit tester email addresses and account identifiers. TestFlight installation and launch on tester devices are still to be accepted. The previously observed public SQLite 404/deployment prerequisite remains separate; this upload does not deploy or repair the public site.


Additional internal testers, 2026-10-25: owner requests four existing team members. Two already authorized for Gramlot were added and visibly show Invited; Team interno now has four testers and one build. The remaining two have the App Manager role but lack Gramlot access. Their addition to the app-specific Limited Access list is prepared but not saved, pending explicit confirmation of the expanded app-management access. No global role or all-app access changes are planned.


Additional invitations completed, 2026-10-25: the owner explicitly confirms “si abilitali” to granting the two remaining existing App Managers access to Gramlot and then inviting them to TestFlight. Saved the additions through Gramlot's own Limited Access user list, preserving existing roles and other app assignments. Both invitations succeeded. Team interno visibly contains six testers and one build. This supersedes the preceding pending-access status; no additional approval remains outstanding. No external group or new build upload was created.
