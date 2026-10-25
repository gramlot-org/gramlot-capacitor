# gramlot-capacitor

A Capacitor proof-of-concept client for remote Gramlot sites, with native device capabilities exposed to Gramlot pages.

**Internal TestFlight, 2026-10-25:** Gramlot 1.0 (2) has been uploaded with explicit owner authorization, processed by Apple and assigned to Team interno. Six authorized internal testers are invited; the build is Testing. No external testing or App Store publication. Native SQLite/Asqueel persistence is owner-accepted in the development app; the matching public SQLite page deployment and TestFlight device acceptance remain separate. See [GCP-120 §055](docs/120-testflight-internal.md#gcp-120-055).

**Status, 2026-10-24:** official gallery, camera, Face ID and local notification display/tap are accepted on iPhone. Real APNs registration and receipt now update Gramlot Data; background banner and tap-to-Data are owner-accepted after disabling Focus; a separate cold-start opening and tap-to-Data test is also accepted. See [Server push](docs/045-server-push-poc.md) and [Device PoC](docs/025-device-poc.md).

- [Internal TestFlight: build available to invited internal testers](docs/120-testflight-internal.md)
- [Orientation and motion sensors: implemented, iPhone acceptance pending](docs/125-motion-poc.md)
- [Mela mobile theme and local preview](docs/115-mela-mobile-theme.md)
- [Mobile module: integration contract for the gallery](docs/110-mobile-gallery-contract.md)
- [Universal Link: owner-verified on iPhone](docs/100-universal-links-poc.md)
- [Mobile application: separate device pages](docs/105-mobile-application-pages.md)
- [Photo library: implemented; iPhone trial pending](docs/095-photo-library-poc.md)
- [Text clipboard: owner-accepted on iPhone](docs/090-clipboard-poc.md)
- [Translation, rotation and zoom sharing Gramlot Data](docs/085-transform-poc.md)
- [Slider binding and release publication](docs/075-slider-poc.md)
- [Audio sharing: owner-accepted on iPhone](docs/070-audio-sharing-poc.md)
- [Audio recording: recording/playback and cancellation owner-accepted](docs/065-audio-recording-poc.md)
- [Network and lifecycle: installed; haptic impact and longer vibration owner-accepted](docs/060-network-lifecycle-haptics-poc.md)
- [QR/barcode: QR, Code 128 and cancellation verified on iPhone](docs/055-barcode-poc.md)
- [Gallery App Shortcut: owner-accepted](docs/050-gallery-shortcut-poc.md)
- [Device integration direction](docs/020-device-integration.md)
- [Run the gallery PoC](docs/015-gallery-poc.md)
- [PoC plan](docs/005-poc-plan.md)
- [Concise plan](docs_llm/005-poc-plan.md)
- [Phase 0: decisions, plugin inventory and contract proposal](docs/010-phase-0-preparation.md)
- [Working instructions](AGENTS.md)

The intended model is one shared container codebase, with a separate application identity, icon and site URL for each site. The embedded app entry includes Gramlot runtime, Python-authored Source and its provider. Remote application pages, browser application logic and styles are served by the site. Native plugins and the minimal native integration are shipped in the app. Remote code updates cannot install new native plugins.

This repository depends on Gramlot; Gramlot core must not depend on Capacitor. Framework or adapter gaps are reported to their owning projects, not bypassed in demonstration pages.

Public source: [gramlot-org/gramlot-capacitor](https://github.com/gramlot-org/gramlot-capacitor). `main` is the consolidated reference; new work continues on `develop`. Internal TestFlight delivery is recorded above; no App Store publication is claimed.

This is the mobile integration repository, not a standalone copy of Gramlot core or the gallery. Building requires the matching Gramlot checkout and its Python environment, Node 24 and Xcode 27.1. Local scripts read the core checkout path from `.local/core-path` and the Node installation root (containing `bin/node`) from `.local/node/runtime-path`. These machine-specific files, native build outputs and signing configuration are deliberately not published. The separate gallery consumes the mobile module through [GCP-110](docs/110-mobile-gallery-contract.md).
