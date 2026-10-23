> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Security

## Controls evidenced in the repository

| Control                                                                                                     | What it protects                                                                                | Evidence                                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Boundary schemas for HTTP, runtime configuration, and provider event shapes                                 | Rejects malformed or unsupported input before use                                               | apps/api/src/, packages/connector-*/src/                                                                        |
| Provider-specific webhook credentials and signatures                                                        | Rejects unauthenticated Telegram, Zalo OA, Facebook Page, and WhatsApp Business webhook traffic | apps/api/src/telegram-bot/, apps/api/src/zalo-oa/, apps/api/src/facebook-page/, apps/api/src/whatsapp-business/ |
| Account and inbox bearer catalogs                                                                           | Selects server-configured scopes and prevents callers from choosing a connection ID             | apps/api/src/inbox/, apps/api/src/http/account-bound-inbound-events-route.ts                                    |
| Capability checks before adapter actions                                                                    | Prevents actions that are absent from a connector's declared capability set                     | packages/domain/src/send-message.ts, packages/contracts/src/connector.ts                                        |
| Dashboard session, origin, and anti-forgery checks                                                          | Limits browser actions to configured principals and explicit inbox grants                       | apps/api/src/dashboard/                                                                                         |
| Parameterized storage, unique keys, migration checksums, transaction locks, and immutable evidence triggers | Protects database boundaries and append-only command and delivery evidence                      | packages/storage-postgres/src/                                                                                  |
| Container non-root execution and dropped Linux capabilities                                                 | Reduces container privilege                                                                     | Dockerfile, compose.yaml                                                                                        |
| Content security policy, frame denial, and no-store dashboard responses                                     | Limits browser execution and caching exposure                                                   | apps/api/src/app.ts, apps/api/src/dashboard/dashboard-routes.ts                                                 |
| Experimental bridge bearer separation, body limits, rate limits, and observed-group checks                  | Constrains the opt-in Zalo User bridge control surface                                          | apps/zalo-user-bridge/src/                                                                                      |

The Compose root filesystems are not read-only. README.md documents this limitation. Existing security decisions and threat boundaries are maintained in docs/security/threat-model.md and docs/adr/.

## Resolved issues and evidence

Security-related design decisions and previously verified changes are recorded in docs/adr/, docs/security/threat-model.md, and docs/maintainers/current-phase.md. This profile does not claim an independent security audit of the current code.

## Safe verification

- Run <code>npm run check</code> for formatting, lint, type checking, tests, and build.
- The repository defines GitHub CI and CodeQL workflows under .github/workflows/.
- Run <code>gitleaks git . --redact</code> locally to scan Git history without printing matched values.

## Open questions

- Production TLS, deployment secrets, rate limits across instances, backups, restore, and operational monitoring are not proven by repository configuration.
- Data retention and deletion controls are not implemented.
- Google-linked sign-in is present as a candidate in the owner checkpoint and is not described as a verified release capability.
