> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Interfaces

## Scope

The repository exposes an HTTP API and optional server-rendered operator dashboard. Provider webhooks are inbound interfaces. Provider-specific packages call provider APIs only where an implemented action requires it. The separate Zalo User bridge is experimental and is not an official provider integration.

## Interfaces provided

| Kind and path or name                                            | Inputs and protected shape                                                   | Auth or access                                                                                     | Consumers                                | Evidence                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| GET /health and GET /ready                                       | Health or dependency readiness result                                        | No operator data                                                                                   | Local health checks                      | apps/api/src/health/                                                               |
| GET /source                                                      | Configured corresponding-source offer                                        | Public by design                                                                                   | Network users of a running instance      | apps/api/src/source/                                                               |
| POST /v1/webhooks/telegram-bot and configured connection variant | Provider update; only validated supported updates enter the canonical path   | Telegram webhook secret header                                                                     | Telegram Bot webhook sender              | apps/api/src/telegram-bot/                                                         |
| POST /v1/webhooks/zalo-oa                                        | Signed webhook body                                                          | Configured Zalo OA signature                                                                       | Zalo Official Account                    | apps/api/src/zalo-oa/zalo-oa-webhook-route.ts                                      |
| GET and POST /v1/webhooks/facebook-page                          | Verification query or raw signed Meta webhook body                           | Configured verification credential and HMAC signature                                              | Facebook Page                            | apps/api/src/facebook-page/                                                        |
| GET and POST /v1/webhooks/whatsapp-business                      | Verification query or raw signed Meta webhook body                           | Configured verification credential and HMAC signature                                              | WhatsApp Business                        | apps/api/src/whatsapp-business/                                                    |
| GET and POST /v1/webhooks/meta                                   | Shared Meta webhook verification and signed event intake when configured     | Configured verification credential and HMAC signature                                              | Configured Meta integrations             | apps/api/src/http/meta-webhook-route.ts                                            |
| POST /v1/experimental/zalo-user/:connectionId/events             | Strict canonical bridge event envelope                                       | Separate configured bridge bearer and server-registered connection                                 | Opt-in Zalo User bridge                  | apps/api/src/zalo-user/zalo-user-bridge-events-route.ts                            |
| GET /v1/{provider}/inbound-events                                | Bounded page of canonical events and opaque cursor                           | Account-scoped bearer for the configured connection                                                | Local operator integration               | apps/api/src/http/account-bound-inbound-events-route.ts and provider route modules |
| GET /v1/inbox/inbound-events                                     | Bounded page across the configured inbox allow-list                          | Inbox-scoped bearer                                                                                | Local operator integration and dashboard | apps/api/src/inbox/inbox-inbound-events-route.ts                                   |
| POST /v1/telegram-bot/messages                                   | Recipient and text, with a bounded text shape                                | Telegram account-scoped operator bearer; connector must be connected and declare message.send.text | Local operator                           | apps/api/src/telegram-bot/telegram-bot-message-route.ts                            |
| POST and GET /v1/inbox/outbound-commands                         | Source-bound reply text and idempotency key; history returns queued commands | Inbox-scoped bearer                                                                                | Local operator integration               | apps/api/src/inbox/inbox-outbound-commands-route.ts                                |
| GET /operator/* and POST /operator/*                             | Optional HTML dashboard forms and session actions                            | Configured principal, session cookie, origin, anti-forgery token, and explicit inbox grants        | Configured local operator                | apps/api/src/dashboard/dashboard-routes.ts                                         |

The account-scoped event routes are GET /v1/telegram-bot/inbound-events, /v1/zalo-oa/inbound-events, /v1/facebook-page/inbound-events, /v1/whatsapp-business/inbound-events, and /v1/zalo-user/inbound-events. They accept a bounded limit and an opaque cursor. Callers cannot select a connection ID. The unified inbox routes bind pagination to the configured inbox and its fixed connection set.

The queued-command API records intent and authorization provenance. It does not call a provider. Separate append-only evidence may record a delivery attempt or receipt, but there is no queued-command dispatcher. The Telegram message route is a distinct direct-send interface. The legacy password-session endpoint returns 404; dashboard access is configured separately.

## Interfaces consumed

This section lists both outbound dependencies and external senders of inbound webhooks. A webhook-sender row does not mean the API calls that provider.

| Provider                | Kind or name                                                        | Data used                                                              | Failure behavior                                                     | Evidence                                                     |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Telegram Bot API        | Official webhook management and direct text send                    | Configured account, recipient, text, provider receipt                  | Typed connector failures map to safe API errors                      | packages/connector-telegram/src/                             |
| Zalo Official Account   | Inbound official webhook sender                                     | Supported signed event data                                            | Invalid signature is rejected before event handling                  | apps/api/src/zalo-oa/                                        |
| Meta services           | Inbound Facebook Page and WhatsApp Business webhook sender          | Raw request body and configured app/account identity                   | Invalid verification or signature is rejected before event handling  | apps/api/src/facebook-page/, apps/api/src/whatsapp-business/ |
| PostgreSQL              | Durable store                                                       | Canonical event fields, scoped command records, and immutable evidence | Storage failures are returned as typed boundary errors               | packages/storage-postgres/src/                               |
| Google sign-in provider | Optional candidate identity flow                                    | Verified subject is stored only as an HMAC association                 | Flow is limited to an existing configured principal                  | docs/operations/dashboard-google-sign-in.md                  |
| zca-js                  | Optional npm package used by the experimental session-based adapter | Session events and explicit group actions                              | Isolated in apps/zalo-user-bridge; not an official provider contract | apps/zalo-user-bridge/package.json                           |

## Compatibility and errors

- Event page limits are bounded from 1 to 100. Cursors are opaque and scope-bound.
- Webhook handlers validate raw input and reject invalid credentials or signatures before normalizing events.
- Inbox command creation returns a conflict when an idempotency key is reused with a different command.
- Missing and out-of-scope source events use the same not-found response.
- The dashboard route set is optional and absent unless configured.

See docs/operations/unified-inbox-4a.md, docs/operations/outbound-reply-commands-4c.md, docs/operations/outbound-command-history-4d.md, and [Telegram delivery authorization guide](operations/telegram-delivery-authorization-4j.md) for exact operational payload boundaries.

## Open questions

- Production API origin and deployed consumer inventory are Unknown (not found in repository).
- The Google-linked sign-in implementation is recorded as a candidate and is not a verified release capability.
