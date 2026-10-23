> Last verified: 2026-10-23 at commit 7dd6478

# Experimental Zalo User Bridge Specification

## Scope and reason for a separate spec

The Zalo User bridge is an opt-in, session-based experimental component. It is separate from the official Zalo Official Account connector and from the main API process. Keep its session material, credentials, and control surface isolated. The current capability is limited to events and explicit group actions described below.

See apps/zalo-user-bridge/src/, apps/api/src/zalo-user/, packages/connector-zalo-user/src/, and docs/operations/zalo-user-group-bridge-experimental.md.

## Entry points and data flow

1. The separate process starts from apps/zalo-user-bridge/src/main.ts and obtains an account session through its QR flow. Its local runtime configuration is validated before the bridge starts.
2. The bridge normalizes supported non-self group text events and posts a canonical envelope to the experimental API event route with a separate bearer credential.
3. The API validates the bridge envelope, verifies the registered connection identity, and writes accepted events through the same domain and PostgreSQL boundaries used by other connectors.
4. An optional authenticated operator UI shows session status and currently observed groups. A separate authenticated control path permits one explicit text or checked image action only for a group observed in that running session.
5. The bridge applies request-size and send-rate limits, and rejects unknown group references. Raw group identifiers are not rendered in the operator UI.

## Contracts and invariants

- This is not an official Zalo integration and must remain labeled experimental.
- The bridge is opt-in and isolated from the official API connectors.
- Events are normalized and validated before persistence.
- Outbound group actions require an explicit operator action and a group observed in the current bridge session.
- Direct messages, bulk sending, automatic replies, session persistence, fingerprint spoofing, CAPTCHA bypass, and provider-limit evasion are outside the documented scope.
- Session and QR material are not part of the API runtime connection document or PostgreSQL event ledger.

## Extension playbook

1. Preserve the separate process and authenticated bridge boundary when changing the session adapter.
2. Add synthetic tests for accepted and rejected event shapes, group references, image types, body limits, and rate limits.
3. Update docs/02-api.md, service.manifest.yaml, the security threat model, and the existing experimental operations guide when a contract changes.
4. Run <code>npm run check</code> when preparing a full change candidate.

## Limits and open questions

- Real account login, live event receipt, send behavior, and reconnect behavior require separate owner-authorized acceptance and are not established by local synthetic checks.
- Session persistence, multi-instance coordination, production hosting, and retention are not implemented or documented.
