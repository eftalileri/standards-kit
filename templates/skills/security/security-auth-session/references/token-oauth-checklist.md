# Token, refresh and OAuth/OIDC checklist

Each item: what to verify and where to look. Answer with file:line or configuration evidence. Mapped loosely to ASVS 5.0 chapters V6 (authentication), V7 (session management), V9 (self-contained tokens) and V10 (OAuth and OIDC).

Kit: where an item below and a kit row cover the same point, the kit row decides — §A: SEC-M-JWT-1, SEC-M-JWT-5, SEC-M-JWT-8, SEC-N-JWT-3, SEC-N-JWT-4, SEC-M-LIFE-2; §B: SEC-M-JWT-3, SEC-N-JWT-1, SEC-D2-M2, SEC-D2-M3; §C: SEC-M-CRYPTO-6, SEC-M-CRYPTO-7 (stored provider credentials); §E: SEC-M-CSRF-1. In particular, how a revocation or limiter store behaves during an outage is decided by kit RDS-D1 and RDS-M8, not by item B4.

## A. Self-contained tokens (JWT and similar)

1. Verification, not decoding, guards every protected route; search for decode helpers used in request paths.
2. The accepted algorithm list is fixed in code; the token header cannot choose it. `none` is never accepted.
3. One key type per token type. An RSA/EC public key is never usable as an HMAC secret (key-confusion).
4. Key lookup by `kid` uses a fixed in-memory map or a pinned JWKS URL; header values never become file paths, queries or URLs. `jku`/`x5u` from the token are ignored.
5. `exp` is present and short for access tokens; `nbf`/`iat` sanity and a small clock-skew allowance.
6. `aud` and `iss` are checked; tokens minted for another service, environment or purpose are rejected. Separate token types (access, refresh, reset, email-verify, invite) carry a distinct type claim or audience and are not interchangeable.
7. HMAC secrets are long random values from a secret store, different per environment and per token type; no literal fallback.
8. Payloads carry no secrets or personal data beyond the subject id; payloads are readable by anyone holding the token.
9. Key rotation is possible without downtime (multiple active keys, `kid`), and the rotation procedure is written down.

## B. Refresh tokens and revocation

1. Refresh tokens are opaque, random, stored hashed server-side, bound to user, device/client and (where relevant) tenant.
2. Rotation on every use; presenting an already-used refresh token revokes the whole family (reuse detection).
3. Revocation triggers: logout, password change or reset, MFA change, role change, removal from tenant, account deletion, admin "sign out everywhere", suspected theft.
4. Revocation state lives in the database or a shared cache; checks fail closed when the store is unavailable for privileged operations.
5. Absolute lifetime exists even with rotation.

## C. OAuth 2 / OIDC as a client (social sign-in, enterprise SSO)

1. Authorization code flow; implicit flow not used.
2. PKCE with S256 for every public client (mobile, SPA) and preferably for confidential ones too.
3. `state` generated per request, bound to the user agent, verified on callback.
4. `nonce` sent and verified in the ID token for OIDC.
5. Redirect URIs registered exactly; no wildcard or prefix match; mobile prefers verified HTTPS app links/universal links over custom schemes, which any app can claim.
6. ID token verified server-side: signature against the provider's published keys, `iss`, `aud` contains one of your client ids (mobile apps often have separate iOS, Android and web ids), `exp`, `nonce`, and `azp` when multiple audiences are present.
7. Sign in with Apple: verify the identity token against Apple's keys, audience equals your bundle id or services id, nonce matches the hashed nonce sent; the email may be a private relay address and may appear only on first authorization.
8. Account linking: link to an existing account only when the provider asserts a verified email and policy allows it, or after the user proves control of the existing account. Otherwise attackers pre-register or link a victim's email (account pre-hijacking).
9. Access and refresh tokens received from providers are stored server-side encrypted or not stored at all when unused.
10. Third-party login uses the system browser (ASWebAuthenticationSession / Custom Tabs), never an embedded WebView that can read credentials.

## D. OAuth as an authorization server (if the project issues tokens to others)

1. Client authentication for confidential clients; secrets rotatable.
2. Exact redirect URI registration per client; consent screen cannot be framed.
3. Scopes enforced at the resource server, not only at issuance.
4. Authorization codes single-use, short-lived, bound to client and PKCE verifier.

## E. Cookies (when sessions or tokens ride in cookies)

1. `HttpOnly`, `Secure`, explicit `SameSite` (Lax or Strict unless cross-site is required), narrow `Path`, no broad `Domain` (prefer the `__Host-` prefix).
2. CSRF protection on state-changing requests when cookies authenticate (SameSite alone is not enough for all browsers and same-site subdomains).
3. Session id regenerated at login and privilege change; old id invalidated server-side.

## F. Reproduction write-up template (no execution)

- Precondition: attacker has X (e.g. victim's email address, a used refresh token).
- Steps: numbered requests with endpoint, relevant fields, and expected vs actual result according to the code at `path:line`.
- Gain: session as victim / persistent access after password change / MFA skipped.
- Environment: only a non-production environment the owner names; never production.
