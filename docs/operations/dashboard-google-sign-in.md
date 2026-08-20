# Google sign-in for the operator dashboard

The operator dashboard uses Google-only sign-in for an already configured
principal. A deployment may name one exact verified Google email as a one-time
first-sign-in bootstrap for one existing principal. It is not public Google
registration and does not create a dashboard principal, inbox permission,
provider connection, or provider credential.

## Prerequisites

- The dashboard is already configured with a public HTTPS
  `dashboard.publicOrigin`, configured inboxes, a configured principal, and
  PostgreSQL. For a loopback-only Docker demonstration, the one deliberate
  exception is an exact `http://localhost:<port>` origin; raw IP addresses and
  every other plain-HTTP hostname remain invalid.
- Migration `0015_dashboard_google_identities` has run. Compose starts the
  migrator before the API.
- An owner-approved Google OAuth client exists. It may be the same client used
  by 360Connect, but its redirect URI list must include the exact derived URL:

  ```text
  <dashboard.publicOrigin>/operator/auth/google/callback
  ```

  Do not add a wildcard, a path prefix, a query string, or a different host.

- The Google client ID and secret are available to the deployment secret
  source. Never put either value in the runtime connection JSON, a command
  line, a browser, a screenshot, Git, or a log.

For the local Docker demonstration currently running on this machine, the
exact callback to add is:

```text
http://localhost:3460/operator/auth/google/callback
```

That localhost URL is a local demonstration only. It is not a public TLS or
production endpoint.

## Configure Docker Compose

Keep these values in the ignored deployment environment or another secret
manager:

```dotenv
GOOGLE_OAUTH_CLIENT_ID=<approved Google OAuth client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<approved Google OAuth client secret>
```

Compose mounts the values as `/run/secrets/google_oauth_client_id` and
`/run/secrets/google_oauth_client_secret`, mode `0400`, for the API process.
The API validates that both are present and distinct. Supplying only one makes
startup fail safely rather than leaving a half-enabled login path.

## Let the owner sign in directly for the first time

Add one optional object beside `dashboard.principals` in the same runtime
connection JSON. The email is deployment-local configuration only; use the
owner's actual address locally and never commit it:

```json
{
  "dashboard": {
    "googleBootstrap": {
      "email": "owner@example.test",
      "principalId": "support-agent"
    }
  }
}
```

`principalId` must already exist in `dashboard.principals`. On the first
**Đăng nhập bằng Google**, the server verifies the signed ID token, its
audience, nonce, and `email_verified: true`; only then does it compare the
canonical email to `googleBootstrap.email`. A match writes the same immutable
Google-subject HMAC link as a manual link and immediately starts that
principal's dashboard session. An email mismatch, missing/unverified email,
stale principal, or identity conflict has the same generic invalid-login
result.

The bootstrap object is singular: it is deliberately an owner convenience, not
a multi-user invitation system. Remove it after the first successful sign-in
if the deployment does not need it again; the durable HMAC link continues to
work.

## Google-only browser flow

1. Open `/operator/login` and select **Đăng nhập bằng Google**.
2. Complete Google's account selection and consent screen.
3. The callback returns to `/operator`. A generic failure means no identity
   link was written; do not infer whether an account exists or is linked to
   someone else.

The dashboard no longer accepts a principal ID or password form. The old
`POST /operator/session` path returns `404` so stale bookmarks cannot become a
second authentication mechanism. The header's Google-link action remains
available only as an account-recovery/rebinding entry point for an already
authenticated session.

The optional manual link has three independent checks: the current signed dashboard
session, the exact configured Origin, and the dashboard anti-forgery token.
The callback additionally consumes one short-lived state/PKCE/nonce transaction
and must return to the same linking principal.

## What is retained

`dashboard_google_identities` stores only an immutable, domain-separated
SHA-256 HMAC of the verified Google `sub`, the configured principal ID, and the
binding time. It intentionally excludes raw Google account data, email, name,
access tokens, refresh tokens, ID tokens, browser session values, inbox bearer
tokens, provider credentials, and provider data.

An unknown Google account cannot sign in. The one optional bootstrap email is
read only during the verified callback comparison and is not retained in the
identity table. The server never provisions an account or derives inbox scope
from Google. One Google identity and one configured principal have a one-to-one
immutable relationship.

## Session and failure behavior

The browser session and temporary OAuth transaction cookie are signed,
`HttpOnly`, and `SameSite=Lax`. Public HTTPS deployments also set `Secure`.
The deliberate `http://localhost:<port>` demonstration exception omits
`Secure`, and its CSP does not upgrade the loopback origin to HTTPS; this keeps
the real browser flow usable without weakening any public HTTPS deployment.
Lax permits the top-level redirect from Google to send the cookie back to the
dashboard callback. Every state-changing dashboard form continues to require
the exact Origin and its anti-forgery token.

The PKCE transaction lives only in process for ten minutes and is consumed
once. Restarting the API, waiting too long, replaying a callback, tampering
with a cookie, using a wrong state, an unlinked account, or an invalid ID token
all result in a generic login failure. Start again from the login page; no
OAuth detail or credential should be copied into logs or support tickets.

There is no self-service unlink or reassignment action. The identity table is
immutable. If a link must be changed, stop, document the incident, and make a
separate reviewed forward migration/operational decision instead of editing the
database manually.

The identity HMAC is derived within the OAuth-client boundary. Therefore a
Google client-secret rotation also needs that separate reviewed identity
transition; do not replace the secret during an incident and assume pre-existing
Google links will still resolve.

## Scope that remains excluded

This is a dashboard authentication convenience only. It adds no Google API
access beyond identity verification, no Google provider token retention, no
OAuth for Zalo/Facebook/WhatsApp, no connector authorization, no provider
request, no background worker, no retry, and no send/delivery/read claim.
