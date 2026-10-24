# gramlot-capacitor working instructions

## Current authorization

The owner requested creation of this repository and saving the PoC plan **before implementation**. Read README.md and both plan views. Do not start implementation, scaffold Capacitor, install packages, configure credentials, publish, or deploy from this planning instruction alone.

The plan is a proposal, not an approved API contract. Record concrete owner confirmations and distinguish proposed, implemented, verified and accepted work. Ask one unresolved design question at a time; do not re-ask confirmed decisions.

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
