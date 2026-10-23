> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Current State and Roadmap

## Current state

The owner-authored README and maintainer checkpoint describe an alpha source with verified Phase 4a through Phase 4j foundations and a locally verified, opt-in experimental Phase 5a Zalo User group bridge. Those verification records are source and synthetic-check evidence, not live provider or production proof. See README.md, ROADMAP.md, docs/maintainers/current-phase.md, and docs/maintainers/oss-readiness.md.

The source also contains a linked Google dashboard sign-in candidate. The owner checkpoint says it still requires frozen verification. This profile does not promote that candidate to a verified release feature.

## Owner-backed planned work

| Priority | Work | Source | Dependencies or impact |
|---|---|---|---|
| Owner-authorized acceptance | Verify selected real provider flows separately, without exposing accounts, sessions, messages, or tokens | ROADMAP.md, docs/maintainers/current-phase.md | Requires explicit owner operation and live provider access |
| Candidate verification | Freeze and verify the linked Google dashboard sign-in candidate | ROADMAP.md, docs/maintainers/current-phase.md | Dashboard auth boundary and existing configured principals |
| Owner decision | Decide whether to create the 0.1.0 release tag | ROADMAP.md | Owner decision; no release date is stated |

## Completed source work

| Work | Date | Evidence |
|---|---|---|
| Durable canonical inbound-event ledger, scoped readers, and cursor pagination | Recorded by owner in phase history | docs/maintainers/current-phase.md, docs/adr/0005-postgresql-inbound-event-ledger.md, docs/adr/0006-stable-inbound-event-pagination.md |
| Source-bound queued reply intents and append-only authorization and delivery evidence | Recorded by owner in phase history | docs/maintainers/current-phase.md, docs/adr/0012-source-bound-durable-reply-commands.md, docs/adr/0016-append-only-outbound-delivery-evidence.md |
| Experimental Zalo User group bridge | Recorded by owner as locally verified source | docs/maintainers/current-phase.md, [ADR-0020](adr/0020-experimental-zalo-user-group-bridge.md) |

## Open questions

- A public release date and the 0.1.0 tag decision are Unknown (not found in repository).
- A production rollout plan and supported hosting target are Unknown (not found in repository).
- Future provider integrations beyond the owner-backed roadmap are not inferred here.
