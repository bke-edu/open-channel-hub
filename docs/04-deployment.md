> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Build and Deployment

## Prerequisites and configuration

| Name | Purpose | Required where | Evidence |
|---|---|---|---|
| Node.js | Local runtime; CI and containers pin 24.18.1, while package support is >=22.22.0 and <25 | Local development and build | package.json, .github/workflows/ci.yml, Dockerfile |
| SOURCE_OFFER_URL | Corresponding-source offer for a production-mode API | Production configuration | README.md, apps/api/src/source/ |
| PostgreSQL configuration | Database bootstrap and application connection | Durable API and Compose | .env.example, compose.yaml |
| Runtime connection document | Provider accounts and operator scopes, held through the documented secret-file configuration | Configured integrations | docs/operations/runtime-multi-connection-2c.md |
| Dashboard configuration | Optional dashboard principals, browser origin, and session settings | Dashboard-enabled API | docs/operations/operator-dashboard-4b.md |

Configuration names and storage locations are documented; this profile contains no values.

## Local build and run

Install dependencies with <code>npm ci</code>. Copy <code>.env.example</code> to the local ignored <code>.env</code> when local configuration is needed. Start the API with <code>npm run dev</code>. Build with <code>npm run build</code>. Run all repository checks with <code>npm run check</code>.

The development migration command is <code>npm run db:migrate:dev</code>. For the local container stack, use <code>docker compose up --build</code>. The Compose definition starts PostgreSQL, a one-shot migration service, and the API. It does not configure TLS or register provider webhooks.

Source: package.json, README.md, and compose.yaml.

## Delivery flow

The repository provides a local Docker Compose setup and GitHub workflows for checks and code scanning. Production deployment, public TLS termination, production backups, restore, and rollback steps are Unknown (not found in repository). Do not infer a production host from local configuration.

## Health, rollback, and recovery

- Liveness check: GET /health.
- Readiness check: GET /ready. It depends on PostgreSQL and the expected migration state.
- Rollback: Unknown (not found in repository).
- Related operations guide: docs/operations/postgresql-phase-2a.md.
- Data warning: docker compose down retains the named database volume. Removing volumes deletes the stored ledger and reply intents. Backup and restore are not implemented.

## Open questions

- What production deployment and TLS arrangement will be supported?
- What rollback, backup, and restore procedure should be approved before production use?
- Who owns production secrets, rotation, and monitoring? Unknown (not found in repository).
