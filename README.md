# gramlot-capacitor

A planned Capacitor client for remote Gramlot sites, with native device capabilities exposed to Gramlot pages.

**Status: planning only, 2026-10-24.** The repository and PoC plan are created at the owner's request. There is no application, native project, installed dependency, or verified mobile integration yet. Implementation has not started.

- [PoC plan](docs/005-poc-plan.md)
- [Concise plan](docs_llm/005-poc-plan.md)
- [Working instructions](AGENTS.md)

The intended model is one shared container codebase, with a separate application identity, icon and site URL for each site. Gramlot runtime, pages, browser application logic and styles are served by the site. Native plugins and the minimal native integration are shipped in the app. Remote code updates cannot install new native plugins.

This repository depends on Gramlot; Gramlot core must not depend on Capacitor. Framework or adapter gaps are reported to their owning projects, not bypassed in demonstration pages.

No public remote, package release, store submission or deployment is established by this local planning repository. New work starts on `develop`; `main` becomes the consolidated reference after verification and owner acceptance.
