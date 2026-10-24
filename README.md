# gramlot-capacitor

A planned Capacitor client for remote Gramlot sites, with native device capabilities exposed to Gramlot pages.

**Status: phase 0 in progress, 2026-10-24.** The owner authorized contract/preparation work and confirmed a dedicated Kajenn test site in Docker on the Mac, reachable over the local network using HTTPS. Hetzner is a future target, not a deployment instruction. No application, container image or native project has been implemented.

- [PoC plan](docs/005-poc-plan.md)
- [Concise plan](docs_llm/005-poc-plan.md)
- [Phase 0: decisions, plugin inventory and contract proposal](docs/010-phase-0-preparation.md)
- [Working instructions](AGENTS.md)

The intended model is one shared container codebase, with a separate application identity, icon and site URL for each site. Gramlot runtime, pages, browser application logic and styles are served by the site. Native plugins and the minimal native integration are shipped in the app. Remote code updates cannot install new native plugins.

This repository depends on Gramlot; Gramlot core must not depend on Capacitor. Framework or adapter gaps are reported to their owning projects, not bypassed in demonstration pages.

No public remote, package release, store submission or deployment is established by this local planning repository. New work starts on `develop`; `main` becomes the consolidated reference after verification and owner acceptance.
