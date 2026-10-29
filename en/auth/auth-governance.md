# Auth — governance and scope (client integration SSOT)

```kit-cover
type: normative
part-of: README.md
binds: AUTH-GC obligations - which layer owns each client auth concern and where the binding token, crypto and server rules live instead
open-when: shape:frontend-heavy, signal:client-auth-integration, signal:authority-lookup
skip-when: signal:backend-only, signal:server-session-auth-only
owns: AUTH-GC-1, AUTH-GC-2, AUTH-GC-3, AUTH-GC-4, AUTH-GC-5, AUTH-GC-6, AUTH-GC-7, AUTH-GC-8, AUTH-GC-N1
```

Scope

- Included: Client-side authentication integration: how the application's chosen client-state and server-state layers divide auth concerns, mandatory Security alignment for tokens and decision gates, request validation at auth boundaries, client-only RBAC/permission UX, and error-shape alignment.
- Excluded (binding SSOT elsewhere): Token storage medium (SEC-M-STORE-1, SEC-M-WEB-1), token lifecycle tables (SEC-M-LIFE-1), SEC-D1/SEC-D2/SEC-D3 detail, password hashing, JWT signing, CSRF/CORS, server middleware, SEC-M-ZT-1 server enforcement — each of those identities is defined in a part file, not in the hub: token storage and lifecycle in [security-secrets-and-logging.md](../security/security-secrets-and-logging.md), the SEC-D1/SEC-D2 gates in [security-decision-gates.md](../security/security-decision-gates.md) and SEC-D3 in [security-authorization-decision-gates.md](../security/security-authorization-decision-gates.md), SEC-M-ZT-1 in [security-zero-trust-authority.md](../security/security-zero-trust-authority.md). Also [Error policy](../error-policy/error-policy.md) and [Backend security](../security/security-backend-controls.md).

Document type: Normative — AUTH-GC-\*.

Environment: Client applications that consume an API; server code **must not** use this file as a cryptography or credential-storage authority.

Binding principle: This topic defers to [Security](../security/README.md) for secrets, tokens, and session correctness. Any rule here that appears to conflict with SEC-\* is void — Security wins (AUTH-GC-3).

References: [Security decision gates](../security/security-decision-gates.md) (SEC-D1, SEC-D2, GSEC1–GSEC6) and [Security authorization decision gate](../security/security-authorization-decision-gates.md) (SEC-D3; auth-related crypto / secrets / CI changes: AUTH-M-GSEC-1); [Security secrets](../security/security-secrets-and-logging.md); [Zustand](../zustand/README.md); [TanStack Query](../tanstack-query/README.md); [Forms / Zod](../forms/forms.md); [Error handling](../error-handling/error-handling.md); [Decision matrix](../decision-matrix/decision-matrix.md).

Code samples (non-normative): [`../_meta/examples/auth-code-samples.md`](../_meta/examples/auth-code-samples.md).

---

## Rule identifiers

| Prefix | Meaning |
|--------|---------|
| AUTH-GC-\* | Auth client-integration governance (this file). |
| AUTH-M- / AUTH-N- | Client behavior rows in [auth-client-behavior.md](auth-client-behavior.md). |
| GAUTH\* | Decision gate index in [auth-client-behavior.md](auth-client-behavior.md). |

---

## Agent execution contract

AUTH-GC-1: Any change to login, logout, credential plumbing, client authentication state, or auth network operations **must** comply with this folder and Security. [Consequence: Bug — **must** fix] [Verify: change review]

AUTH-GC-2: [Shared agent contract C2](../_meta/agent-contract.md); soft wording in a legacy note **must not** override SEC-* rows. [Consequence: Mis-implementation] [Verify: Review]

AUTH-GC-3: Precedence: SECURITY (SEC-* hub) > STATE > BEHAVIOR > UI for tokens, secrets, and server trust. Client layering follows the application's architecture: use its server-state/request layer for network operations and its client-state layer for presentation state where those layers are adopted. [Consequence: STOP — wrong layer] [Verify: architecture decision + Security review]

AUTH-GC-4: [Shared agent contract C4](../_meta/agent-contract.md).

AUTH-GC-5: SEC-D* / SEC-M-STORE-1 Security tables are applied literally ([shared agent contract C2](../_meta/agent-contract.md)). [Consequence: SEC bug] [Verify: Diff vs Security]

AUTH-GC-6: Change impact: identify Security, Auth, and any affected client-state or server-state authorities; if Security rules are missing or conflicting, STOP and resolve Security first. [Consequence: STOP] [Verify: impact review]

AUTH-GC-7: **Must not** define server password algorithm (bcrypt vs Argon2id) or JWT signing here — SEC-M-CRYPTO-2, SEC-M-JWT-1. [Consequence: Doc / impl drift] [Verify: Server auth review]

AUTH-GC-8: Treat superseded migration notes as historical only; use the current authentication and security authorities. [Consequence: STOP — resolve from current standards] [Verify: Review]

AUTH-GC-N1: **Must not** persist session credentials in general-purpose client storage or state persistence unless the applicable Security authority explicitly approves that mechanism for the platform and credential type. [Consequence: Security violation] [Verify: compare implementation with the applicable Security storage rules]

---

## Failure path (normative)

Client rule vs SEC-M-STORE-1 / SEC-D2 → STOP — Security wins; amend Auth only.

Unclear whether data is server or client auth SSOT → STOP — assign to Security (secrets, verify, authz) vs Auth (integration) before coding.

---

Legacy migration notes are historical references only and do not override current security guidance.

Part of: [README.md](README.md).
