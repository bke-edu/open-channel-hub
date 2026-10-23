> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Overview

## Purpose

Open Channel Hub is an alpha, self-hostable messaging hub. It accepts provider events, validates and converts supported text events into a shared format, stores durable records in PostgreSQL, and exposes account-scoped or inbox-scoped read paths. A separate optional dashboard can record source-bound reply intents. The repository also contains a separately operated experimental Zalo User group bridge. See README.md, docs/maintainers/current-phase.md, and docs/operations/.

## Repository type and stack

| Area                          | Evidence-based value                                                               | Source                                               |
| ----------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Type                          | service repository with an npm workspace                                           | package.json                                         |
| Runtime                       | Node.js 24.18.1 in CI and containers; package support is Node.js >=22.22.0 and <25 | .github/workflows/ci.yml, Dockerfile, package.json   |
| Language and build            | TypeScript, npm workspaces, tsup                                                   | package.json, tsup.config.ts                         |
| HTTP framework                | Fastify                                                                            | apps/api/src/app.ts                                  |
| Durable store                 | PostgreSQL adapter and forward-only migrations                                     | packages/storage-postgres/src/postgres-migrations.ts |
| Primary entry point           | apps/api/src/server.ts                                                             | package.json                                         |
| Optional separate entry point | apps/zalo-user-bridge/src/main.ts                                                  | package.json                                         |

## Repository shape

| Path                                            | Responsibility                                                                 | Evidence                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| apps/api/                                       | API composition, routes, runtime configuration, and provider-specific features | apps/api/src/app.ts                                                      |
| apps/zalo-user-bridge/                          | Isolated opt-in Zalo User session and group bridge                             | apps/zalo-user-bridge/src/main.ts                                        |
| packages/domain/                                | Use cases and storage/provider ports                                           | packages/domain/src/index.ts                                             |
| packages/contracts/ and packages/connector-sdk/ | Shared connector shapes, capabilities, and errors                              | packages/contracts/src/connector.ts, packages/connector-sdk/src/index.ts |
| packages/connector-*/                           | Provider-specific adapters                                                     | packages/                                                                |
| packages/storage-postgres/                      | PostgreSQL persistence and migrations                                          | packages/storage-postgres/src/                                           |
| docs/operations/ and docs/adr/                  | Owner-maintained operation guides and architecture decisions                   | docs/operations/, docs/adr/                                              |

## Main flow

1. A provider webhook reaches apps/api. The handler validates its request and, where supported, checks the provider signature against the raw request body.
2. A provider adapter normalizes only supported events into the shared event shape. The API feature validates the event and sends it through a domain-owned port.
3. The PostgreSQL adapter stores the canonical record and enforces uniqueness within its connection and provider-event scope.
4. Account or inbox read routes select their scope from configured bearer credentials. Callers do not choose a connection identifier. Opaque cursors preserve a stable scoped traversal.
5. The Telegram text-send route invokes its provider adapter only when the configured connector is connected and declares the send capability. Inbox reply intents use a separate durable queued-command path and are not dispatched.

See docs/01-architecture.md and docs/specs/message-lifecycle.md for the detailed flow.

## Fast start

- Prerequisites: a supported Node.js version and npm.
- Install dependencies with <code>npm ci</code>.
- Copy the safe example configuration with <code>cp .env.example .env</code>.
- Start the API with <code>npm run dev</code>.
- Run all repository checks with <code>npm run check</code>.

See README.md for the local Compose path and data-volume warning.

## Three biggest traps

1. A queued inbox reply is an intent record, not a sent message. The direct Telegram route is a separate capability-gated interface. See docs/specs/message-lifecycle.md.
2. The dashboard uses configured local principals and fixed inbox scopes. It is not a general user, organization, or role-based access system. See docs/operations/operator-dashboard-4b.md.
3. Zalo User is an isolated experimental session-based connector. It is not an official Zalo integration and its narrow group-send path does not make the broader project production-ready. See docs/specs/zalo-user-bridge.md.

## Open questions

- A retention and deletion policy for persisted provider events and reply text is Unknown (not found in repository).
- Production deployment, public TLS verification, backups, restore drills, and production rollback evidence are Unknown (not found in repository).
- The owner decision on a 0.1.0 release tag remains open in ROADMAP.md.

<!-- Count command: No counts are included because they do not improve this qualitative overview. -->
