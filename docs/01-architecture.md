> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Architecture

## Boundaries and components

| Component | Responsibility | Calls or owns | Evidence |
|---|---|---|---|
| apps/api | Builds the Fastify application and connects configured features to routes | packages/domain, provider connectors, PostgreSQL storage | apps/api/src/app.ts, apps/api/src/server.ts |
| packages/domain | Owns use cases and ports for messages, events, connection registration, dashboard sessions, and reply commands | Contract and domain interfaces | packages/domain/src/ |
| packages/contracts | Defines canonical message, connector, capability, and provider-command shapes | Shared by adapters and domain | packages/contracts/src/ |
| packages/connector-sdk | Supplies shared adapter errors and connector support | Used by provider adapters and API features | packages/connector-sdk/src/ |
| packages/connector-* | Implements provider-specific connection and event behavior | Provider APIs and domain ports | packages/ |
| packages/storage-postgres | Implements persistence ports and forward-only schema migrations | PostgreSQL | packages/storage-postgres/src/ |
| apps/zalo-user-bridge | Runs the separate experimental Zalo User session process and its explicit group control surface | Zalo User session library and the API bridge endpoint | apps/zalo-user-bridge/src/main.ts |

## Main flow

The API process reads runtime configuration, creates the configured feature catalogs, registers only the routes for enabled features, then starts Fastify. apps/api/src/app.ts is the composition boundary; apps/api/src/server.ts is the process entry point.

For inbound events, a provider route validates the request, checks the provider-specific webhook credential or signature, and passes normalized events to the feature. The feature sends canonical data through a domain port. The PostgreSQL adapter performs idempotent storage. Reader routes select an account or inbox from configured authorization and return bounded cursor pages.

The optional dashboard uses the same configured inbox scope. It can create an immutable reply intent when the configured principal has the explicit write grant. The command remains queued. Append-only attempt and receipt records provide local evidence when recorded; they do not run a dispatch worker.

The Telegram direct text route is separate. It validates a recipient and message, selects one configured connection from the bearer credential, and checks connection state and the declared message.send.text capability before using the Telegram adapter.

The Zalo User bridge is a separate opt-in process. It posts normalized events through the experimental authenticated intake route and has a separate explicit group-send control path. Its scope is documented in docs/specs/zalo-user-bridge.md.

## Startup and persistence sequence

1. apps/api/src/server.ts loads environment-backed configuration and constructs configured connector and storage features.
2. apps/api/src/app.ts registers health, readiness, source-offer, provider, inbox, and optional dashboard routes.
3. In Docker Compose, the one-shot migration service completes before the API service starts. Direct development has a separate migration script.
4. Readiness checks PostgreSQL and the expected migration state. Liveness does not establish database readiness.

Evidence: package.json, compose.yaml, apps/api/src/server.ts, apps/api/src/app.ts, and apps/api/src/health/.

## Important invariants

- Adapters depend inward through shared contracts and domain ports.
- Provider input and HTTP input are untrusted until validated at the boundary.
- Connector actions require their declared capability.
- Account and inbox scopes are chosen by server-side configuration, not caller-supplied connection IDs.
- Event-feed cursors are opaque scope-bound positions, not authorization credentials.
- Schema migrations are forward-only, transactional, and checked against stored checksums.
- A queued reply intent is not equivalent to provider acceptance or delivery.

## Change impact

| Change area | Likely affected components | Evidence to inspect |
|---|---|---|
| Provider event shape | packages/contracts, provider normalizer, API feature, storage mapping, reader response | packages/contracts/src/, apps/api/src/, packages/storage-postgres/src/ |
| Connector capability | contract declaration, connector adapter, runtime registration, direct action route | packages/contracts/src/connector.ts, packages/connector-*/src/, apps/api/src/ |
| Database schema | migration, adapter, migration tests, readiness, operations guide | packages/storage-postgres/src/, compose.yaml, docs/operations/postgresql-phase-2a.md |
| Inbox or dashboard authorization | runtime catalogs, route, source-bound command store, dashboard session layer | apps/api/src/inbox/, apps/api/src/dashboard/, packages/domain/src/ |
| Zalo User bridge | experimental connector, API intake, separate process configuration and controls | apps/zalo-user-bridge/src/, apps/api/src/zalo-user/, docs/operations/zalo-user-group-bridge-experimental.md |

## Open questions

- No external downstream repository consumer is identified in this repository.
- Production topology, multi-instance behavior, and operator ownership are Unknown (not found in repository).
