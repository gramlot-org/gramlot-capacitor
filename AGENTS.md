# gramlot-capacitor working instructions

## Current authorization

The initial instruction authorized repository creation and saving the plan before implementation. On 2026-10-24 the owner explicitly started **phase 0** and selected a dedicated Kajenn site in Docker on the Mac, reachable over the local network using HTTPS. Read README.md, both plan views and GCP-010. Phase 0 authorizes investigation, prerequisite checks and contract preparation; it does not start phase 1. Do not scaffold Capacitor, build/start containers, install dependencies, change trust/signing settings or deploy from this phase-0 instruction alone. Hetzner is a future target, not current deployment authorization.

The owner confirmed the minimal behavioral contract on 2026-10-24: explicit native commands, results/events in Data Bags, distinct permission/cancellation/error outcomes and cleanup of listeners/pending results at page closure. Public API names and the concrete extension/loading mechanism remain undecided; do not treat the whole plan as an approved implementation contract. Record concrete owner confirmations and distinguish proposed, implemented, verified and accepted work. Ask one unresolved design question at a time; do not re-ask confirmed decisions.

Owner, originating conversation, 2026-10-24 (translated from Italian): “Yes, I confirm: implement in kajenn/deploy/local-https and start the containers on the Mac to verify that it works.” This explicitly authorizes the reusable local HTTPS environment and its Docker verification, separately from the still-unstarted native phase 1.

Implemented and verified in `kajenn/deploy/local-https`: Compose with published kajenn packages, a non-root application process, Caddy internal CA, mounted site recipe and persistent site/CA volumes. Default endpoint: `https://localhost:8443/_server` (server information JSON, not a Gramlot test application). Verified HTTPS for localhost and an IPv4 address, certificate rejection without the CA, container health, dependency consistency, and data/CA survival across container recreation. The standard environment remains running on Mac loopback port 8443. Device LAN access and trust remain unverified; no Mac/device trust store, signing setting or Hetzner deployment was changed.

## Ownership and implementation boundaries

- This repository owns the proposed mobile container, native plugin integration, site-specific app configurations and bounded PoC fixtures.
- Core owns Gramlot runtime and general contracts; adapters own server technology and identity integration. Dependencies point toward core, never from core toward this repository.
- Before integration changes, read the owning repository's AGENTS.md. For Gramlot core also read docs/00-constitution.md, docs/01-overview.md and ports/README.md; the constitution is authoritative.
- Use existing Gramlot Source, Data Bags, bindings, controllers, resolvers and shared components. Author demonstration pages in Python first. Do not hide framework gaps with application DOM construction, manual DOM wiring, ad hoc requests or parallel state.
- Missing framework or dependency capabilities are reported to the owner. This repository's implementation does not authorize changes to core, server adapters, Builder or Bag.
- Define any new Gramlot proxy, API or marker under GC-225 conventions and obtain the required owner confirmation before implementation. Do not invent permissive dispatch, aliases or compatibility paths.
- Do not pin or cap first-party Genro/Gramlot dependencies, including lockfile entries. Record exact tested revisions as evidence, separately from dependency constraints.

## Documentation and delivery

Write maintained code and documentation in English; respond to the owner concisely in Italian. Keep tool output focused.

Use paired docs/ and docs_llm/ guides, three-digit prefixes and matching explicit anchors. This repository uses documentation namespace GCP (Gramlot Capacitor); the initial plan is GCP-005. This documentation identifier is not a runtime API name. Follow core GC-005; if a documentation site is added, use the classic Read the Docs theme.

Keep the plan status and its mirror current. No passing test or prototype behavior is owner acceptance. New work belongs on develop until verified and accepted for consolidation into main. No release, public repository creation, store submission or deployment without explicit authorization.

Do not commit signing material, provisioning profiles, APNs keys, passwords, tokens, personal device identifiers or user media. Use synthetic data for demonstrations and redact diagnostic evidence.

## Product language — owner, 2026-10-25

All application pages and authored user-facing text must be English: mobile catalogue, examples, bundled entry, controls, status/help messages, notification defaults, native permission descriptions and shortcuts. Do not introduce Italian pages. The owner explicitly states “tutto deve essere in inglese” and does not want Italian pages. This applies to future gallery integration as well; operating-system-owned interface text is outside the authored page content.


## Public source repository — owner, 2026-10-25

The owner explicitly authorizes publication of gramlot-capacitor in gramlot-org and chooses public visibility. This supersedes the initial local-only creation scope for this repository. Source publication does not authorize additional package releases, deployments or TestFlight uploads. Keep private build/signing material excluded and main as the consolidated public reference; continue new work on develop.
