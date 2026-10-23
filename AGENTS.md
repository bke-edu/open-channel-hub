> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Working Agreement

## Product boundary

- This repository is a public, self-hostable communication hub under `AGPL-3.0-or-later`.
- Build official provider integrations first. Any session-based or unofficial connector is opt-in, isolated, documented as experimental, and must never contain evasion, CAPTCHA bypass, fingerprint spoofing, or bulk-spam features.
- Never commit real account data, phone numbers, access tokens, cookies, webhook payloads, or customer messages. Tests use synthetic fixtures only.

## Architecture

- Keep business rules in `packages/domain`; adapters depend inward through contracts in `packages/connector-sdk`.
- Every connector declares its tier and capabilities. An action must be rejected before execution when a capability is absent.
- Treat all provider events and HTTP input as untrusted. Validate them at the boundary.
- Avoid speculative infrastructure: PostgreSQL, Redis, durable outbox, and the web dashboard land only when their vertical slice needs them.

## Code and verification

- Target Node.js `24.18.1` in CI and containers. Local development supports maintained Node.js `22.22.0` through `24.x`; pin all direct npm dependencies to exact stable versions; never use Docker `latest`.
- Use TypeScript strict mode. Prefer immutable values, explicit error types, and small feature-oriented files.
- Write behavior tests for every added use case and connector contract. Mock external providers; tests must not make network requests.
- Before a local commit, run the affected tests, `npm run typecheck`, `npm run lint`, and `npm run build` when dependencies are installed.

## Ownership while agents work

- The coordinator owns root configuration, `apps/api`, integration, package lock, and final verification.
- Do not modify another agent's assigned directory without first reporting the dependency to the coordinator.
- Keep public documentation honest about what is implemented versus planned.

## Repository profile

This is a TypeScript service repository with an npm workspace. The primary process starts at apps/api/src/server.ts. The optional experimental Zalo User process starts at apps/zalo-user-bridge/src/main.ts. Read docs/00-overview.md before broad changes.

## Dependencies and consumers

- Calls: PostgreSQL and the Telegram Bot API for configured webhook management and direct text send. The optional Google sign-in candidate calls its identity provider. The separate Zalo User process uses the optional zca-js package.
- Receives: configured webhooks from Telegram, Zalo Official Account, Facebook Page, and WhatsApp Business; the experimental Zalo User bridge uses its separate authenticated intake route.
- Called by: configured provider webhook senders and local operators using the HTTP API or optional dashboard. No external downstream repository consumer is identified in this repository.
- Shared resources: the open_channel_hub PostgreSQL schema and the runtime configuration and secret-file interfaces documented in README.md and docs/operations/.
- Change impact: apps/api composes feature modules; packages/domain owns use cases; packages/contracts and packages/connector-sdk define shared contracts; packages/connector-* implement adapters; packages/storage-postgres owns persistence. Update the relevant API, data, and security profiles when a boundary changes.

## Verification commands

| Purpose | Command | Evidence |
|---|---|---|
| Install | npm ci | README.md |
| Run the API locally | npm run dev | package.json |
| Run tests | npm run test | package.json |
| Run all repository checks | npm run check | package.json |
| Build | npm run build | package.json |
| Run the development migration | npm run db:migrate:dev | package.json |
| Start the local Compose stack | docker compose up --build | README.md |

Targeted test invocation is Unknown (not found in repository). The Compose migration service applies migrations before the API starts; direct development uses the migration command above.

## Change playbooks

### Add or change a provider interface

Follow an existing adapter under packages/connector-* and its feature wiring under apps/api/src. Keep contracts inward through packages/connector-sdk and packages/domain. Reject actions before execution when the configured connector lacks the required capability. Update docs/02-api.md, service.manifest.yaml, and the affected provider guide.

### Add or change persistent data

Add a forward-only migration in packages/storage-postgres/src/postgres-migrations.ts, update storage behavior and migration tests, and document personal-data fields and retention in docs/03-database.md. Update the PostgreSQL operations guide when local operation changes. Do not claim a rollback or retention policy that the repository does not provide.

### Change inbox replies or dashboard access

Preserve the fixed server-side inbox scope, source-event checks, immutable command history, and the separate authentication and anti-forgery boundaries. Read docs/specs/message-lifecycle.md and the linked Phase 4 operation guides before changing these flows.

### Change the Zalo User bridge

Keep it opt-in, isolated, and explicitly experimental. Read docs/specs/zalo-user-bridge.md and docs/operations/zalo-user-group-bridge-experimental.md. Do not add evasion, CAPTCHA bypass, fingerprint spoofing, or bulk-spam behavior.

## Key decisions and gotchas

- The modular monolith and inward contracts are recorded in docs/adr/0001-modular-monolith-and-inward-contracts.md.
- Official connectors are preferred and connector tiers and capabilities are explicit in docs/adr/0002-official-first-connector-tiers.md.
- PostgreSQL storage and stable pagination decisions are recorded in docs/adr/0005-postgresql-inbound-event-ledger.md and docs/adr/0006-stable-inbound-event-pagination.md.
- Telegram's direct text-send route is capability-gated. Inbox reply commands are durable queued intents and are not dispatched to a provider.
- The experimental Zalo User bridge is separate from official integrations and has a narrow explicit group-send path.
- Persisted event text and identifiers may contain personal data. No retention or deletion policy is documented.
- A green local check or synthetic provider fixture is not proof of a live provider integration or production deployment.

See docs/01-architecture.md, docs/02-api.md, docs/03-database.md, docs/04-deployment.md, docs/05-security.md, and docs/06-roadmap.md for the maintained profile.
