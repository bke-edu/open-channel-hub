> Last verified: 2026-10-23 at commit 7dd6478

# Message Lifecycle Specification

## Scope and reason for a separate spec

Inbound normalization, durable event storage, scoped reads, direct Telegram sends, dashboard reply intents, and delivery evidence have different authorization and delivery guarantees. Keep these paths distinct when changing behavior. See apps/api/src/app.ts, packages/domain/src/, packages/storage-postgres/src/, and docs/security/threat-model.md.

## Entry points and data flow

### Inbound events

1. A provider webhook handler validates its request shape and provider credential or signature.
2. The provider adapter normalizes only supported events. Unsupported event shapes are discarded or rejected according to the adapter contract.
3. The API feature invokes the domain event-store port. The PostgreSQL adapter uses the configured connection scope and provider event identifier for idempotent insertion.
4. Account-scoped or inbox-scoped readers select scope from a configured bearer credential and return a bounded page with an opaque cursor.

Primary sources: apps/api/src/http/, apps/api/src/_/, packages/connector-_/src/, packages/domain/src/ports/inbound-event-store.ts, packages/storage-postgres/src/postgres-inbound-event-store.ts.

### Direct Telegram text send

POST /v1/telegram-bot/messages is a direct provider action. The API resolves the connection from the account bearer credential, validates recipient and text, and invokes the domain use case. The use case checks connection identity, connected state, and message.send.text before the Telegram adapter sends. A provider receipt is returned after provider acceptance.

Sources: apps/api/src/telegram-bot/telegram-bot-message-route.ts, packages/domain/src/send-message.ts, packages/connector-telegram/src/.

### Inbox reply intent and delivery evidence

POST /v1/inbox/outbound-commands records a durable source-bound intent. It checks the configured inbox scope, source event, text, and idempotency key. The command state remains queued. The dashboard path may submit the same kind of intent only when a configured principal has an explicit write grant. Immutable authorization, Telegram eligibility, delivery-authorization, attempt, and receipt rows record local evidence. None of these rows invokes a provider dispatcher.

Sources: apps/api/src/inbox/, apps/api/src/dashboard/, packages/domain/src/ports/outbound-reply-command-store.ts, packages/storage-postgres/src/postgres-migrations.ts.

## Contracts and invariants

- Provider and HTTP payloads are validated at the boundary.
- Canonical events are unique within a connection and provider event identifier.
- The raw provider webhook body is not stored in the canonical event ledger.
- Inbox scope is selected by server configuration. A caller cannot widen it by submitting another connection identifier.
- Cursors are opaque pagination state and do not replace bearer authorization.
- A queued command, an attempt record, a provider acceptance receipt, and delivery or read state are distinct facts.
- Connector actions are rejected when the capability is absent.

## Extension playbook

1. Add or update the provider contract, normalizer, and synthetic boundary behavior under packages/contracts/ and packages/connector-*/.
2. Wire the feature and account-scoped routes under apps/api/src/. Preserve configured scope and error boundaries.
3. Update any forward-only storage migration and the relevant operations guide, then update docs/02-api.md, docs/03-database.md, and service.manifest.yaml.
4. Run <code>npm run check</code> when preparing a full change candidate.

## Limits and open questions

- No generic queued-command dispatcher, retry worker, or delivery/read state machine is documented.
- Retention, deletion, backup, and restore for stored events and reply text are Unknown (not found in repository).
- Production TLS and live-provider behavior are not verified by the synthetic source checks.
