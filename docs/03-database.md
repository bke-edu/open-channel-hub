> Last verified: 2026-10-23 at commit 7dd6478

# Open Channel Hub Data and Persistence

## Persistence overview

PostgreSQL is the durable store. The adapter and forward-only migrations are in packages/storage-postgres/. The main application stores normalized canonical events rather than raw provider webhook bodies. Docker Compose uses a named PostgreSQL volume. The experimental Zalo User bridge keeps its live session separate from the API database.

## Tables and personal data

| Store and fields | Purpose | Personal data? | Retention |
|---|---|---|---|
| open_channel_hub.inbound_events: connection_id, provider_event_id, canonical_event_id, conversation_id, message_id, sender_id, message_text, telegram_chat_type, zalo_user_thread_type | Deduplicated canonical inbound text events | Yes. Provider, account, conversation, sender, and message identifiers can identify or link to a person or conversation; message_text can contain personal information. | Unknown (not found in repository) |
| open_channel_hub.connection_registry: connection_id, provider_identity_fingerprint | Stable configured connector identity and capability metadata | Potentially. The configured connection and provider identity fingerprint can be linked to an account. | Unknown (not found in repository) |
| open_channel_hub.dashboard_sessions: session_id, principal_id, session_token_hmac, csrf_token_hmac, issued_at, last_seen_at, expiry and revocation times | Server-side dashboard session state | Yes. These are pseudonymous operator-linked identifiers and activity metadata. Raw browser tokens are not stored here. | Session expiry is enforced; row cleanup and retention are Unknown (not found in repository). |
| open_channel_hub.outbound_commands: connection_id, source_provider_event_id, client_operation_id, reply_target_id, source_message_id, message_text | Immutable source-bound reply intents and queued history | Yes. The identifiers can link to a source person or conversation, and message_text can contain personal information. | Unknown (not found in repository) |
| open_channel_hub.outbound_delivery_attempts: command_id, attempt_id, recorded_at | Append-only local attempt evidence | Yes, indirectly. command_id links to the source event and reply text. | Unknown (not found in repository) |
| open_channel_hub.outbound_delivery_attempt_receipts: attempt_id, provider_message_id, observed_at | Append-only provider outcome evidence | Yes, indirectly. The provider message identifier links to a command and may identify a message. | Unknown (not found in repository) |
| open_channel_hub.outbound_command_authorizations: command_id, inbox_id, dashboard_principal_id, scope_fingerprint, recorded_at | Immutable authorization evidence | Yes. Inbox and principal identifiers and the scope fingerprint are linkable to an operator or conversation scope. | Unknown (not found in repository) |
| open_channel_hub.outbound_telegram_command_eligibility: command_id, bot_identity_fingerprint, source_chat_type, recorded_at | Immutable Telegram reply-eligibility evidence | Yes, indirectly. The command and bot identity fingerprint link to an operator or conversation. | Unknown (not found in repository) |
| open_channel_hub.outbound_telegram_delivery_authorizations: command_id, inbox_id, dashboard_principal_id, scope_fingerprint, bot_identity_fingerprint, authorized_at | Immutable Telegram authorization evidence | Yes. The principal and fingerprints are linkable to an operator, configured account, or conversation scope. | Unknown (not found in repository) |
| open_channel_hub.dashboard_google_identities: subject_hmac, principal_id, bound_at | Link one verified sign-in subject to an existing configured principal | Yes, pseudonymous identity data. The raw subject, email, and provider tokens are excluded from the table. | Unknown (not found in repository) |
| open_channel_hub.schema_migrations | Applied migration identifiers, checksums, and timestamps | No direct personal data | Not applicable |

Evidence: packages/storage-postgres/src/postgres-migrations.ts, packages/storage-postgres/src/postgres-inbound-event-store.ts, and docs/security/threat-model.md.

## Access patterns and migrations

- Read and write paths: apps/api features call domain ports implemented by packages/storage-postgres.
- Inbound events are unique within the configured connection and provider event identifier. A stable ledger sequence supports cursor pagination.
- Migrations are forward-only, transactional, protected by an advisory lock, and recorded with checksums. Docker Compose runs the migration service before the API.
- Backups, restore drills, encryption-at-rest assurance, retention, and deletion workflows are Unknown (not found in repository). README.md and docs/maintainers/current-phase.md explicitly say these are not implemented.

## Open questions

- What retention period and deletion process should apply to inbound text, identifiers, queued reply text, and delivery evidence?
- What backup and restore process is required before real customer data is operated?
- How should retained dashboard session and identity-link rows be purged after expiry or account removal?
