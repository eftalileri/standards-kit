# Auth — client behavior and credential bridge

```kit-cover
type: normative
part-of: README.md
binds: AUTH-M and AUTH-N client obligations - auth state split, token bridge, refresh orchestration, client RBAC UX and the GAUTH gates
open-when: shape:frontend-heavy, signal:client-auth-integration, signal:token-refresh, signal:client-state-store
skip-when: signal:backend-only, signal:server-session-auth-only
owns: AUTH-M-STATE-1, AUTH-N-STATE-1, AUTH-N-STATE-2, AUTH-M-TOKEN-1, AUTH-N-TOKEN-1, AUTH-N-TOKEN-2, AUTH-M-TQ-1, AUTH-N-REFRESH-1, AUTH-N-REFRESH-2, AUTH-M-REFRESH-3, AUTH-M-ZOD-1, AUTH-M-RBAC-1, AUTH-N-RBAC-1, AUTH-M-ERR-1, AUTH-M-AUTO-1, AUTH-M-GSEC-1, GAUTH1, GAUTH2, GAUTH3
```

Scope

- Included: AUTH-M- / AUTH-N- rows for client auth presentation state, the application's selected server-state/request mutation layer, the credential bridge to Security, request validation, RBAC UX, session restoration, GAUTH decision gates, and AUTH-M-GSEC-1 (GSEC1–GSEC6 when auth touches those surfaces).

Document type: Normative — AUTH-M- / AUTH-N-\*; GAUTH1–GAUTH3; AUTH-M-GSEC-1.

Environment: Client runtimes that consume an API; all build configurations **must** respect SEC-LOG / SEC-M-LOG-1 where applicable.

References: [Auth governance](auth-governance.md); [Security decision gates](../security/security-decision-gates.md); [Security secrets](../security/security-secrets-and-logging.md); [Zustand store boundaries](../zustand/store-boundaries.md); [TanStack mutations](../tanstack-query/mutations-cache-sync.md); [Forms](../forms/forms.md); [Error handling](../error-handling/error-handling.md).

Code samples: [`../_meta/examples/auth-code-samples.md`](../_meta/examples/auth-code-samples.md).

---

## State split — client presentation vs server state

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-STATE-1** | Client-only authentication presentation state (such as signed-in UI status and profile fields approved for client use) belongs in the application's selected client-state authority, if one is used; it **must** not become a competing source of canonical server session or authorization truth. | Wrong layer / state drift. | Review state ownership and the server's session authority. |
| **AUTH-N-STATE-1** | Do not treat a server-state cache as the sole owner of session truth. The credential/session mechanism and client presentation state **must** stay aligned through the application's documented auth transition boundary. | Drift / ghost sessions. | Review login, refresh, logout, and restore flows end to end. |
| **AUTH-N-STATE-2** | Do not place auth network operations solely inside a presentation-store action. Use the application's selected server-state/request layer for network round-trips; when TanStack Query is adopted, use its mutation API for login, registration, and logout writes. | Layering violation. | Review network-operation ownership against the app architecture. |

---

## Token bridge (Security SSOT)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-TOKEN-1** | Route credential reads, writes, refreshes, and clears through one documented credential/session authority (a token manager or equivalent boundary) that follows applicable SEC-D1, SEC-D2, and platform-specific Security storage rules. | Security violation; shippable bug. | Audit the credential boundary against the applicable Security checklist. |
| **AUTH-N-TOKEN-1** | Do not persist session credentials in general-purpose storage or client-state persistence unless the applicable platform-specific Security authority explicitly permits it for that credential type. | Security violation. | Review storage configuration against the current Security authority; do not infer safety from an encryption option alone. |
| **AUTH-N-TOKEN-2** | Do not retain long-lived plaintext credentials in rehydratable client state. Use only storage and lifetime patterns approved by the applicable Security rules for the platform. | Credential exposure / stale-session risk. | Audit persisted keys, credential lifetime, and logout cleanup against Security. |

---

## Mutations and refresh orchestration

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-TQ-1** | Login, registration, logout, and refresh network orchestration **must** use the application's selected server-state/request boundary. If TanStack Query is adopted, use mutations for write operations and follow its mutation/cache synchronization guidance. | Stack drift / inconsistent session transitions. | Review request ownership and cache synchronization against the app's selected data layer. |
| **AUTH-N-REFRESH-1** | **Must not** fire unbounded parallel refresh calls — **must** implement single-flight / SEC-D2 (one attempt then deterministic path). | SEC-D2 violation. | real-run observation + code review. |
| **AUTH-N-REFRESH-2** | Do not require a manual user action for ordinary access-token expiry when a valid refresh mechanism exists; automate recovery through the credential boundary using the Security-approved session flow. | UX / security inconsistency. | Review normal expiry, refresh failure, and retry behavior against SEC-D2. |
| **AUTH-M-REFRESH-3** | Coordinate session repair and refresh through one transition authority so concurrent requests or component lifecycle changes cannot start duplicate work for the same session transition. Before applying a result, verify that the session and subject are still current; discard stale results without logging out a newer session or emitting duplicate failures. | Cross-session logout / duplicate repair / secret retention. | Review transition ownership, concurrency handling, and stale-result behavior. |


---

## Zod and requests

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-ZOD-1** | Login, register, and password/OTP/verification request payloads **must** be validated with Zod (or documented equivalent) at the UI/API client boundary per [forms](../forms/forms.md). | Injection / bad UX. | Schema review. |

---

## RBAC and permissions (client)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-RBAC-1** | Role and permission types **must** be centralized (single module or generated types) — **must not** scatter magic strings. | Maintainability bug. | Types + grep. |
| **AUTH-N-RBAC-1** | **Must not** treat client-side role checks as authorization — server **must** enforce [SEC-D3](../security/security-authorization-decision-gates.md) / [SEC-M-ZT-1](../security/security-zero-trust-authority.md); client checks are UX only. | IDOR / false safety. | Security review. |

**AUTH-N-RBAC-1** application: A global account role and a tenant-scoped actor role may describe different relationships. Do not compare them as if they had the same scope. Derive client diagnostics from one explicit authority, use them only to shape the user experience, and require the server to verify both actor class and resource ownership before granting access. Renamed values, props, and cross-module provenance require review.

AUTH-M-RBAC-1 application — one decision function: a client control shown, hidden or disabled for a server-authorized action **MUST** call the same pure decision function the server gate calls (shared tier), fed with server-delivered actor facts, and **MUST NOT** re-derive the predicate in the client; the financial-visibility client twin of [PAY-UI-M8](../payment-ssot/ui-binding.md) is the money instance of this rule. Reason: two copies drift — a visible control the server answers with 403, or a hidden one the user is entitled to. Review-held: a check could only match function names, and no drift incident has been measured ([ENA-A1](../enforcement-architecture/enforcement-admission.md)).

---

## Errors and auto-login

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-ERR-1** | Auth failures **must** surface semantic error codes / shapes aligned with [error handling](../error-handling/error-handling.md) and [error policy](../error-policy/error-policy.md) for API errors — **must not** leak secrets in messages (SEC-N-LOG-1). | Trust / SEC violation. | Log + UI review. |
| **AUTH-M-AUTO-1** | On app resume or startup, validate the session through the documented credential boundary and SEC-D1 before presenting authenticated UI. An invalid session **must** transition to unauthenticated state according to SEC-D2; the navigation layer may then present its chosen unauthenticated route or screen. | Session confusion. | Verify startup, resume, and invalid-session transitions end to end. |

AUTH-M-AUTO-1 application — forced sign-out: a session the server declares invalid (token-integrity code) **must** retire the client data scope through the same logout teardown authority as a user-initiated sign-out, not by dropping the token flag alone. Reason: a flag-only drop lets the same identity's next sign-in inherit the ended session's tenant selection and cached tenant list, so a tenant deleted meanwhile reappears as a scope the server rejects. Review-held (the single writer of the forced sign-out is the check site).

AUTH-M-AUTO-1 application — other browser tabs: where several tabs of one origin share one cookie session but keep their own memory, a sign-out or a newly issued session (sign-in, identity change) in one tab **MUST** retire the client data scope of every other open tab through the same teardown authority, announced by a credential-free same-origin signal (the kind of change only); a tab that has retired follows the cookie's current session through the one boot path, never a second hydrator. The receiving tab **MUST NOT** repeat the device-wide purges, the credential purge or the server sign-out — the tab that changed the session owns them, and a late repeat can wipe or end the next person's session. A write refused for a CSRF token that no longer matches the cookie **MUST** be treated as the same signal once a fresh server session read confirms the session changed. Reason: a tab's memory outlives another tab's sign-out, so the previous person's cached screens stay visible while reads already travel with the next person's cookie. Review-held: whether a tab's memory outlives another tab's session change is runtime behaviour no single-file check can see; the teardown authority and its one channel are the review sites.


---

## Decision gates — GAUTH (normative index)

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|----------------------|-------------|-------|
| GAUTH1 | The credential/session boundary implements SEC-D1/SEC-D2 and the applicable platform-specific Security storage rules. | AUTH-M-TOKEN-1, SEC-D1, SEC-D2 | STOP — fix Security integration |
| GAUTH2 | Auth network work uses the application's selected server-state/request layer; client presentation state has one clear owner per AUTH-M-STATE-1. | AUTH-M-TQ-1, AUTH-N-STATE-2 | STOP — fix layer |
| GAUTH3 | RBAC on client is UX only; server authz documented for resources | AUTH-N-RBAC-1, SEC-D3 | STOP — SEC-D3-M1 |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **AUTH-M-GSEC-1** | Any auth-related change that touches token material (beyond GAUTH1 wiring), cryptography / JWT policy, secret or token lifecycle, or CI security workflows **must** pass the applicable GSEC1–GSEC6 gates in [Security decision gates](../security/security-decision-gates.md) before merge — GAUTH1–GAUTH3 do not replace GSEC4, GSEC5, or GSEC6 when those surfaces change. | STOP / merge blocked — SEC program gap. | PR checklist; GSEC row sign-off. |

Index: GSEC1–GSEC3 (session / token / authz path); GSEC4 (crypto / JWT change); GSEC5 (secret lifecycle); GSEC6 (CI gate change) — all in [Security](../security/security-decision-gates.md).

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| New auth flow without GAUTH1 | STOP — establish the documented credential/session boundary first. |
| Client role used to hide server-open API | STOP — AUTH-N-RBAC-1; fix server authz. |
| Auth change in scope of AUTH-M-GSEC-1 without GSEC satisfaction | STOP — AUTH-M-GSEC-1. |

---

## Enforcement

These rules describe behavior; they do not imply that a particular lint rule, guard, or CI workflow exists in an adopting project. Where a project adds enforcement, document the exact scope and known blind spots beside that project's configuration. Runtime ordering, cross-module ownership, server authorization, and review gates require evidence beyond a single-file check.


---

Security boundary: this client integration standard does not supersede the adopting project's security authority for storage, refresh semantics, or server cryptography.
