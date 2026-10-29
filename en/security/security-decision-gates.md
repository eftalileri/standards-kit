# Security — decision gates (tokens, refresh) and the GSEC index

```kit-cover
type: normative
part-of: README.md
binds: SEC-D1 and SEC-D2 with their SEC-D*-M rows and GSEC1 to GSEC6 -- the binary routing over token validity and refresh strategy, and the gates every security-touching change answers before it ships
open-when: shape:backend-heavy, shape:frontend-heavy, signal:security-gate-routing, signal:token-storage, signal:authorization
skip-when: signal:no-security-surface
owns: SEC-D1, SEC-D1-M1, SEC-D2, SEC-D2-M1, SEC-D2-M2, SEC-D2-M3, SEC-D2-M4, GSEC1, GSEC2, GSEC3, GSEC4, GSEC5, GSEC6
```

Scope

- Included: SEC-D1 token validity, SEC-D2 refresh vs logout with the silent token deletion ban, and the GSEC1–GSEC6 index for authentication, cryptography, secrets, and CI changes.
- Excluded: the SEC-D3 authorization decision and its SEC-D3-M1–SEC-D3-M5 rows, defined in the sibling band [security-authorization-decision-gates.md](security-authorization-decision-gates.md) — the two files are the complete SEC-D band set, and both carry the same `open-when` tokens, so any declaration that opens one opens both.

Environment: Applies to authenticated client-server flows (mobile, web, API handlers that issue or validate tokens).

Document type: Normative — SEC-D1–SEC-D2 tables, GSEC1–GSEC6.

References: [Authorization decision gate](security-authorization-decision-gates.md) (SEC-D3, SEC-D3-M1–SEC-D3-M5); [Governance](security-governance.md); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [Secrets and logging](security-secrets-and-logging.md); [Cryptography](security-cryptography.md); [CI and monitoring](security-ci-and-monitoring.md); [Backend controls](security-backend-controls.md); [Error policy](../error-policy/error-policy.md).

---

## SEC-D1 — Token validity decision

| Question (proceed only if YES) | If YES | If NO |
|--------------------------------|--------|-------|
| Access token signature / `exp` / `iss` / `aud` (if used) valid per server or trusted library? | Continue request / operation | Go to SEC-D2 |
| Client uses only `exp` cache and server returned 401? | Go to SEC-D2 | Do not continue; **must not** proceed without server validation path |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-D1-M1** | Client and server **must** treat invalid or expired access tokens per this table before performing protected operations. | Security defect; possible SEC-D2 logout path. | Review and runtime verification of the single token authority. |

---

## SEC-D2 — Refresh vs logout

| Condition | Decision | Required action |
|-----------|----------|-----------------|
| 401 + valid refresh exists + first attempt | Refresh once (single-flight); on success retry request | Parallel refresh storm forbidden |
| Refresh 401/403 or repeated network failure after attempt | Logout required | Clear secure storage + unauthenticated UX |
| 403 + `insufficient_scope` or business-rule unauthorized | Do not refresh | Product-approved error / re-consent flow |
| Server `token_revoked` / `session_invalid` semantics | Logout required | Mitigate TM-2 / TM-7 |
| Suspicious session flag (server or device integrity) | Logout required | Log to security channel per SEC-M-MON-1 |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-D2-M1** | Silent token deletion forbidden — user or error path **must** be understandable (product copy separate from this standard). | Bug — UX/security trust failure. | Review + real-run observation. |
| **SEC-D2-M2** | Token removal on: user logout; failed refresh; revoke; mandatory security event; app reset per policy — **must** align with this table. | Bug. | Review the single token authority against the table. |
| **SEC-D2-M3** | User sign-out **must** end the session on the server, not only on the device: one authenticated server command revokes the session the request carries and every session-bound device credential (such as the push binding) in one unit, after re-proving inside that unit that this session is still current — a session already superseded elsewhere is left untouched. A write that binds a credential to the session **must** re-prove the session in its own unit, so it cannot outlive a concurrent sign-out. A sign-in that supersedes another session **must** also release that session's device credentials, fenced on the new session still being current. The client **must** send the sign-out command with a credential captured before its own sign-out gate closes; a request routed through the gate it has just closed never leaves the device. A failed or offline call **must not** block local sign-out. | Bug — a captured token stays valid after sign-out (TM-2 / TM-7) and the signed-out account's notifications keep reaching the device. | Review. |
| **SEC-D2-M4** | A sign-out command that got no server answer (no response, or a response that authorizes a replay) **must** be kept durably and replayed until the server answers: the retired session's own credential is kept only in the device-bound secret store, used for that one command and nothing else, and deleted on any terminal server answer. The replay runs only while no session is signed in on the device; a new sign-in drops the record instead, because its own credential registration then owns the device binding. The replayed request **must** declare that it carries a retired credential, so its session-integrity rejection cannot sign out a live session or show its forced sign-out notice. Where the client cannot delete the session credential itself (an HttpOnly cookie), every local sign-out **must** set a credential-free marker that blocks restoring that session until the server shows it ended (a session read answers signed out, the replay succeeds, or the credential is already invalid); any other refusal keeps the marker — otherwise a reload restores the signed-out session from the surviving cookie. | Bug — an account signed out offline keeps its server session and keeps sending notifications to a signed-out device indefinitely; an undeclared replay's 401 signs out whoever is signed in now. | Review. |

SSOT: Renewal, forced logout, and token removal **must** match SEC-D1 / SEC-D2 in one client authority — see [secrets and logging](security-secrets-and-logging.md).

---

## Authorization decisions — in the sibling band

The authorization decision table and its rows — [SEC-D3](security-authorization-decision-gates.md), [SEC-D3-M1](security-authorization-decision-gates.md)–[SEC-D3-M5](security-authorization-decision-gates.md) — are defined in [security-authorization-decision-gates.md](security-authorization-decision-gates.md); GSEC3 below routes there. This section is a pointer, not a second definition site ([KIT-INV-3](../authoring/kit-structural-invariants.md)).

---

## Decision gates (normative index) — GSEC

Purpose: Binary routing for high-impact security decisions. GSEC1–GSEC3 cite SEC-D\*; GSEC4–GSEC6 cite cryptography, lifecycle, and SEC-C1\*.

### Auth and authz (session / token path)

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|---------------------|-------------|-------|
| GSEC1 | Access token validity path satisfied | SEC-D1 | SEC-D2 or stop request |
| GSEC2 | Refresh vs logout resolved per SEC-D2 | SEC-D2 | Logout / product error flow |
| GSEC3 | Server authz defined and enforced for resource | [SEC-D3](security-authorization-decision-gates.md) | STOP — implement authz before ship |

### Cryptography and signing

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|---------------------|-------------|-------|
| GSEC4 | Change does not weaken TLS, password hashing, KDF, AEAD, or JWT policy vs documented baselines; SEC-N-CRYPTO-1 respected; if signing keys or TLS identity change, rotation / runbook (SEC-M-LIFE-2) updated | SEC-M-CRYPTO-1–SEC-M-CRYPTO-4, SEC-N-CRYPTO-1, SEC-M-JWT-1–SEC-M-JWT-3 | STOP — security note + crypto review before merge |

### Secret and token lifecycle

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|---------------------|-------------|-------|
| GSEC5 | Secret / token TTL, rotation, revoke, or storage location change has updated runbook; prod/dev separation and ACL (SEC-M-SECRET-ACL-1/2) still satisfied; no prod secret in dev paths | SEC-M-LIFE-1, SEC-M-LIFE-2, SEC-M-SECRET-ACL-1, SEC-M-SECRET-ACL-2, SEC-M-ENV-1, SEC-M-STORE-1 / SEC-M-WEB-1 as applicable | STOP — document lifecycle before deploy |

### CI security controls

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|---------------------|-------------|-------|
| GSEC6 | Pipeline / workflow change mapped to SEC-C1 matrix; any FAIL gate removed, downgraded, or skipped has SEC-NA-1 register entry or explicit security review approval in PR | SEC-C1-A–SEC-C1-F, SEC-S-C1-G | STOP — no silent weakening of CI security gates |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Ambiguous token path | STOP — align the client token authority with SEC-D1/SEC-D2 before release. |
| Missing authz on new endpoint | STOP — [SEC-D3-M1](security-authorization-decision-gates.md). |
| Crypto or JWT change without GSEC4 | STOP — complete GSEC4 checklist. |
| Secret lifecycle change without GSEC5 | STOP — complete GSEC5 checklist. |
| CI gate weakened without SEC-NA-1 / review | STOP — GSEC6. |

---

Migration note: When adopting this hub, map prior token and authorization guidance to these identifiers and remove duplicate definitions.

Part of: [README.md](README.md).
