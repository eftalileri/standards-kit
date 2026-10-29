# Security — secrets, token storage, lifecycle, and logging

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-STORE, SEC-N-STORE, SEC-M-WEB-1, SEC-M-KEY-1, SEC-N-KEY-1, SEC-N-KEY-2, SEC-M-ENV-1, SEC-M-ENV-2, SEC-M-LIFE and SEC-M-SECRET-ACL -- where a token may be stored on each client, the web session model, API keys and environment files, production personal data in the source tree, secret and token lifecycle, and who may read a secret
open-when: shape:backend-heavy, shape:frontend-heavy, signal:token-storage, signal:secret-handling, signal:api-key, signal:env-config, signal:pii-masking
skip-when: signal:no-secret-surface
owns: SEC-M-STORE-1, SEC-N-STORE-1, SEC-M-STORE-2, SEC-N-STORE-2, SEC-M-STORE-3, SEC-M-WEB-1, SEC-M-KEY-1, SEC-N-KEY-1, SEC-N-KEY-2, SEC-M-ENV-1, SEC-M-ENV-2, SEC-M-LIFE-1, SEC-M-LIFE-2, SEC-M-SECRET-ACL-1, SEC-M-SECRET-ACL-2, SEC-M-SECRET-ACL-3
```

Normative parts split out of this file: [logging — credential containment](security-logging-core.md) (SEC-M-LOG-1–SEC-M-LOG-5 and the two corollaries); [logging — correlation, access logging, prohibitions and the field-area map](security-logging-correlation-and-fields.md) (SEC-M-LOG-CORR-\*, SEC-M-LOG-ACCESS-1, SEC-N-LOG-\*).

Scope

- Included: SEC-M-STORE-1–SEC-M-STORE-3, SEC-N-STORE-1–SEC-N-STORE-2, SEC-M-WEB-1, SEC-M-LIFE-1, SEC-M-LIFE-2, SEC-M-SECRET-ACL-1–SEC-M-SECRET-ACL-3, SEC-M-LOG-1–SEC-M-LOG-5, SEC-M-LOG-CORR-1–SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1, SEC-N-LOG-1–SEC-N-LOG-4, sensitive data categories, API key rules, `.env` / `.env.example`, SEC-LOG field table, production `console` carve-out.

Document type: Normative — SEC-M- / SEC-N- rows in this file.

References: [Decision gates](security-decision-gates.md) (GSEC5); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [Governance](security-governance.md) (SEC-LIB-1, SEC-LIB-N1); [Logging policy](../logging-policy/logging-policy.md); [Error policy](../error-policy/error-policy.md). Client auth integration: [Auth](../auth/README.md) (AUTH-M-TOKEN-1, GAUTH1).

Code samples: [`../_meta/examples/security-code-samples.md`](../_meta/examples/security-code-samples.md).

---

## **MUST** / **MUST NOT** — storage and web token model

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-STORE-1** | Access and refresh tokens on mobile **must** use the operating system's protected credential store or an equivalent vetted platform facility selected and documented under SEC-LIB-1. | Security defect; SEC-C1-C may fail CI. | Storage review and platform verification against the selected provider and version decision. |
| **SEC-N-STORE-1** | **Must not** store tokens in general-purpose key-value stores, plain-text files, or browser local/session storage for persistent sessions (SEC-M-WEB-1). | Security defect / CI fail. | Static scan + review. |
| **SEC-M-STORE-2** | Device persistence is classified by FUNCTION, and the classification is an owned, recorded decision. Classify each query/state family by what its payload *does*, read from the fields of the type it returns — never from the family's name. (a) Credential class — absolute: a value granting access or authority when captured and replayed (session/refresh token, purchase or receipt token, OTP, reset token, single-use join or delegation code, signed URL or key) **must** never reach a general device cache, whatever encryption it has; it belongs in the platform secret store (SEC-M-STORE-1). A family carrying such a field is rejected whole. (b) Fact class — a risk decision, not a default: everything else (business records, names, financial rows, tenant identifiers) is persistable only on the project's named risk owner's acceptance against a written threat model, recorded and dated where the predicate lives. Absent that record it stays memory-only: silence is not consent, and an agent **must** never relax the boundary alone. (c) Mechanism, either way: one persist-policy authority decides the whole family; the allowlist stays closed so an unknown new root is never written; hashing the key protects nothing because the payload survives intact; and any change of classification invalidates already-written disallowed state in the same rollout through the buster or the fully proven targeted classification-retirement migration defined by [UIP-M22(c)](../tanstack-query/ui-startup-and-persistence-boundaries.md), or follows MMR-M11 for a retired dedicated instance. Encryption does not answer this question: it neither licenses the credential class nor is demanded of the fact class once (b) holds. An unauthenticated cipher — or one whose mode cannot be verified from the dependency as it ships — is defense-in-depth only (SEC-M-CRYPTO-3, MMR-M12/N5), and that boundary belongs in the storage module's own header, since an encrypted store is otherwise read as blanket permission to persist. Check reach: no static check decides a payload's class — that needs a field's *meaning* — so tooling fences only the shape (single authority, closed allowlist, whole-family rejection, buster). | Privacy/security bug; a replayable credential at rest, or a boundary relaxed with no owner, threat model or date. | Storage review + persist-policy AST rule + buster or UIP-M22(c) targeted migration or MMR-M11 lifecycle + the recorded decision. |
| **SEC-N-STORE-2** | **Must not** persist a credential-bearing family into any device cache, classify a family by its name instead of its payload fields, relax a family to persistable silently (no named risk owner, no written threat model, no date), rely on key hashing while leaving the value intact, remove a family from the allowlist without invalidating already-persisted blobs, or call a dedicated legacy instance “cleaned” after one unverified best-effort delete (SEC-M-STORE-2, MMR-M11/N4). | Privacy/security bug; local credential exposure, stale restore, or an unowned boundary change. | Static policy/buster scan + dedicated-instance cleanup lifecycle + device storage inspection. |
| **SEC-M-STORE-3** | The platform secret store's KEY grammar is narrower than the general device caches', and the key belongs to the access layer that calls it. A platform secret store (Keychain/Keystore wrapper) validates the key itself and rejects a key the general caches accept — so a key literal proven to work in one store proves nothing in the other, and rejection happens on every call, making read, write and delete fail together: the surface is not degraded, it never ran. Therefore (a) the key's single authority is co-located with the call that imposes the grammar, not in a shared/cross-tier constants module — a key whose value lives elsewhere cannot be checked where it is used, and if it does not cross the FE↔BE boundary it **must not** live in the shared tier at all (GMR1); (b) a derived key (prefix + digest) carries the grammar in its static prefix, which the producing helper owns; (c) changing such a key needs no migration when the old value was never writable — prove that from the store's own validator rather than assuming it, and state which way it was proven. Why this is a security row, not a style one: the failing call sits on the path that persists an identity or credential, and its only visible trace is a crash event whose own message can misdescribe the cause (an invalid-character key reported as "**must not** be empty"). Check reach: static analysis decides the grammar only for a key that resolves to a literal at the call site; a key returned by a helper is outside it by construction. | Bug — **must** fix; the whole persistence surface is silently dead. | Key-literal AST rule at the store boundary + co-location review. |
| **SEC-M-WEB-1** | Web client **must not** persist access or refresh tokens in localStorage / sessionStorage; **must** use HttpOnly Secure cookie (backend SSOT) or short-lived memory + BFF pattern — documented in architecture. | Bug — **must** fix. | Review + storage audit. |

---

## Sensitive data categories (normative)

| Tier | Examples | Storage rule |
|------|----------|--------------|
| Critical (replayable) | Access/refresh tokens, API keys, purchase/receipt tokens, single-use join or delegation codes, signed URLs, private keys, password material (even hashed at rest rules in crypto doc), PAN, government IDs, biometrics | SEC-M-STORE-1 / platform secret stores — never a general device cache (SEC-M-STORE-2(a)) |
| Sensitive business / PII | PII-derived tenant/viewer/staff identifiers, subject/staff names, financial balances or transaction/accrual rows, and query payloads containing them | Memory-only by default; persistable only on a recorded, dated risk-owner acceptance against a written threat model (SEC-M-STORE-2(b)) |
| Non-critical | UI preferences and non-sensitive UI flags | General-purpose client storage may be used |

---

## API keys and environment

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-KEY-1** | API keys **must not** be hardcoded. Keep server credentials in a secret manager or protected deployment configuration; client-visible configuration is never a secret. | Security defect; block release if a secret is committed. | Secret scan (SEC-C1-A) + review. |
| **SEC-N-KEY-1** | **Must not** log, throw in Error.message, or return API keys in responses. | Bug; SEC-N-LOG-1. | Review + logs. |
| **SEC-N-KEY-2** | **Must not** pass a credential (a connection string with a password, a key, a token) to a child process as a command-line argument; hand it over through an owner-only (0600) file in a per-run private directory that is removed afterwards, or through the child's stdin. The argument vector is readable by every process in the same container, and the runtime's spawn-failure error carries it as a field, so one failed start ships the secret to the log and crash sinks. The child's stderr is treated the same way: any connection string in it is masked before it reaches a log field. | Bug — secret leak into process listings, logs and the crash channel. | Review. |
| **SEC-M-ENV-1** | Local secret files **must** be excluded from version control; provide a safe configuration example containing placeholders only. Production secrets **must** come from the deployment platform's secret facility. | Security defect if a secret is committed. | Repository and deployment configuration review. |
| **SEC-M-ENV-2** | A value that identifies a real person or tenant — a live contact number, an account identifier, or any record key that carries one embedded — **MUST NOT** appear in the source tree, as a literal, a usage example, an error-message example, or a comment. A measurement copied out of production keeps its evidential value in its *shape* (how many, which category, which role); the identifying field rides along uninvited, and committing it makes the source tree a second store of production data that cannot be withdrawn — history cannot be rewritten once shared. The remedy is not deletion of the line, which destroys the example the line exists to give: an illustrative value **MUST** be one whose digit structure declares it synthetic (all digits equal, or a monotonic subscriber run), so nobody has to consult a list to know it is not live; a value the code actually needs at runtime belongs in configuration or operator input, never in a literal. Where the organisation's own deliberately published contact is concerned, the published constant is the single authority and holds the real value ([SSG-M8](../ssot/ssot-principles-and-precedence.md)); copies of it elsewhere are still copies and are removed or suppressed with a stated reason. | Bug — irreversible personal-data leak into version control; the same class as a committed `.env` (SEC-M-ENV-1). | Static: a single-file check, where the adopting project has one, scans string literals, template quasis and comments for a real-looking phone number and exempts only the structurally synthetic ones — the exemption is a digit-structure predicate, never a maintained allowlist, because an allowlist would be derived from the very data it audits and any new real number could be silenced by appending it. Check reach: the check sees only the configured identifier formats written without separators, and personal names cannot be mechanically detected at all — no authority in a source tree declares "this string is a person's name", so a detector would either flag every proper noun or miss the real one; that half is prose-bound. Documentation trees need their own check, because a lint engine that ignores them and cannot parse Markdown will report them clean. |

---

## Secret and token lifecycle

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-LIFE-1** | Access/refresh TTLs and refresh policy **must** be documented; client single refresh attempt then logout per SEC-D2. | Bug. | Docs + client code. |
| **SEC-M-LIFE-2** | Key / client-secret rotation and revoke procedure **must** be documented (event-triggered + periodic minimum) and ordered: generate, install at every place the old value is read, verify, then revoke. Each credential carries its own verification step — how the holder knows the replacement works before the old one is destroyed — and the revoke's named consequence ("this path stays broken until the new secret is set"). Where a credential is irrecoverable, that regime **must** be established and stated first; rotation **must not** be offered as a remedy before it is known. | STOP for prod key change without runbook. | Security note / runbook. |

Tables for token/session and API key rotation from legacy are satisfied by SEC-M-LIFE-1/SEC-M-LIFE-2 plus project docs; "old key rejection time" **must** be documented when rotation is not deploy-only.

---

## Secret access control (SEC-SECRET-ACL)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-SECRET-ACL-1** | Prod secrets only in platform secret store; RBAC for who can read/deploy documented; dev secrets **must not** equal prod; **must not** persist prod secrets on developer laptops as canonical workflow. | Compliance bug. | Process audit. |
| **SEC-M-SECRET-ACL-2** | CI: least-privilege deploy tokens; prod secrets **must not** appear in CI logs; break-glass access **must** be event-logged (who, when). | Incident / process failure. | CI log review. |
| **SEC-M-SECRET-ACL-3** | Third-party / support access to production (e.g. vendor, contractor) **must** use dedicated limited-scope credentials and documented time bounds where the platform allows; **must not** hand over long-lived shared prod admin credentials without review and offboarding procedure. | Supply-chain / insider class. | Access matrix review. |

---

## Logging (SEC-LOG) — moved

The credential-containment rows SEC-M-LOG-1–SEC-M-LOG-5 and their two binding corollaries are defined in [security-logging-core.md](security-logging-core.md). The correlation, access-logging and prohibition rows SEC-M-LOG-CORR-1, SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1 and SEC-N-LOG-1–SEC-N-LOG-4, together with the field-area map and the local-development carve-out, are defined in [security-logging-correlation-and-fields.md](security-logging-correlation-and-fields.md).

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Token found in a general-purpose key-value store or a web-forbidden store | STOP — migrate to SEC-M-STORE-1 / SEC-M-WEB-1. |
| A replayable credential field is found in a persisted query/state payload | STOP — exclude the entire family through the single persist-policy authority, invalidate legacy disallowed state through the buster or UIP-M22(c)'s proven targeted migration, or apply MMR-M11 physical-removal (file-level proof) bounded cleanup when the old data is in a dedicated instance; verify no cold-start/foreground restore (SEC-M-STORE-2(a) / SEC-N-STORE-2). |
| A business-data family is proposed for persistence | Allowed only with a named risk owner, a written threat model and a dated record next to the predicate; otherwise memory-only. An agent **must not** decide this alone (SEC-M-STORE-2(b)). |
| Secret in git history | Rotate secret; SEC-C1-A + process fix. |
| Driver / ODM write containing a live credential fails | Contain the raw driver error at the credential-aware domain boundary and emit only the sanitized semantic / typed failure from SEC-M-LOG-2; inspect logs / crash events for absence of the credential. |
| Inbound request-id is missing, repeated, non-string, or not in the documented canonical format | Generate a fresh server-owned identifier; do not log/echo/tag the rejected raw value (SEC-M-LOG-CORR-2). |
| Access logger cannot resolve a server-owned route template | Emit the fixed unresolved sentinel only; never fall back to raw URL/path/query (SEC-M-LOG-ACCESS-1). |

---

Migration note: Map prior token-storage, secret-lifecycle, and logging guidance to these identifiers and remove duplicate definitions when adopting this hub.

Part of: [README.md](README.md).
