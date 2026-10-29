# Transaction policy (atomicity and session scope)

```kit-cover
type: normative
part-of: README.md
binds: TX obligations for server persistence — transaction ownership layer, session flow to repositories, atomicity and cleanup
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: C1, C2, C3, C4, C5, C6, TX-M-1, TX-M-2, TX-M-3, TX-M-4, TX-M-5, TX-M-6, TX-M-7, TX-M-8, TX-N-1, TX-N-2, TX-N-3, TX-N-4, TX-N-5, TX-REC-1, TX-REC-2
```

References: [Repository contract](../repository/repository-contract.md); [Error policy](../error-policy/error-policy.md); [Logging policy](../logging-policy/logging-policy.md); [Security backend](../security/security-backend-controls.md); [Decision functions](../decision-function/decision-function.md).

---

## Agent execution contract

**C1**: Mandatory for multi-step server persistence or ODM/driver transactions.

**C2**: The shared [agent contract C2](../_meta/agent-contract.md) applies.

**C3**: Under REPOSITORY > TRANSACTION > ERROR, this topic owns unit/session scope; repository owns persistence seams and error policy owns boundary status/payload.

**C4**: The shared [agent contract C4](../_meta/agent-contract.md) applies.

**C5**: **MUST NOT** start repository transactions or bypass the service lifecycle from routes (TX-M-1).

**C6**: Transaction-rule changes identify and resolve impacted repository/error/logging/security standards before merge.

A project check, using the enforcement mechanism the adopting project documents, may reject direct registered cache/outbound calls in managed callbacks (TX-M-12); record its actual scope and limits, since a reference to a check is not evidence that it exists or covers the full rule. Indirect callee effects remain review-held: pre-commit invalidation can refill stale cache, dependency faults abort valid units and retries repeat outbound effects.

---

<a id="must"></a>

## Atomic lifecycle — [TX-M-1–8](transaction-policy.md)

**TX-M-1**: Database transactions **MUST** be opened, committed, aborted/rolled back, and session (or equivalent) lifecycle ended only in the service layer or in a single documented helper module that only services call (not from routes or repositories).

**TX-M-2**: Repository calls that participate in a service-managed atomic unit **MUST** thread one session (or documented driver client context) through the stack per repository contract REP-M-8 (including explicit optional session contracts where documented).

**TX-M-3**: All writes and any reads that **MUST** see consistent snapshot with those writes inside one atomic unit **MUST** use the same session instance.

Technical fence clarification of TX-M-3: A version increment used only to materialize a write conflict is not a domain edit. On a timestamped ODM model, its update options **MUST** disable automatic timestamps (for example `timestamps: false`); otherwise a reconciliation fence silently changes `updatedAt`, which consumers may treat as a real business change or use as an exact CAS input. A focused single-file check may enforce a known fence-counter increment shape. A different technical fence shape requires review because a syntax rule cannot infer business intent from an arbitrary update document.

TX-M-3 caller side is settled — [TX-M-20](transaction-read-session-join.md) decides it and is not restated here.

**TX-M-4**: Each service transaction **MUST** guarantee atomicity: either all persisted effects in the unit commit together or none do after abort/rollback.

**TX-M-5**: If any operation in the unit throws or signals failure before successful commit, the implementation **MUST** abort/rollback the transaction, end the session on all exit paths (e.g. finally), and **MUST NOT** continue the same business operation as if partial writes succeeded; surface failure to the caller per error policy (local minimum — no silent partial success).

Exhausted transient conflict uses the single unit owner's mapper and closed registered code set: sealed units ask same-key replay, plain units ask retry. Raw markers leave callbacks unchanged; per-item outcomes retain only facts a fresh retry cannot change. Published flow codes remain only where released clients consume this meaning. Return-form owners reuse the mapper; unknown commit is classified first. The single managed runner holds owner coverage, while a callback seam retyping a marker remains review-held ([TX-M-11](transaction-callback-failure-and-retry.md)).

**TX-M-6**: When TX-G1 is YES, the persistence steps **MUST** run inside one transaction boundary (TX-M-1 compliant); **MUST NOT** rely on best-effort ordering without atomic guarantees.

**TX-M-7**: Exported service or helper entry points that execute a database transaction **MUST** include TSDoc with @param for the session (or callback contract) passed to repositories, @throws or documented rejection, and a one-line statement of atomic scope.

**TX-M-8**: The project ODM/driver version **MUST** meet the documented minimum for transaction APIs (e.g. the documented minimum major version of the selected ODM); on mismatch, resolve through [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md).

[Long hard delete](transaction-long-hard-delete.md) and [resume/completion](transaction-long-hard-delete-completion.md) define TX-M-12's deletion boundaries.

---

<a id="must-not"></a>

## Prohibited lifecycle forms — [TX-N-1–5](transaction-policy.md)

**TX-N-1**: Repositories **MUST NOT** call startSession, startTransaction, commitTransaction, abortTransaction, or equivalent APIs that begin or end server-side transaction scope inside repository modules (see repository contract REP-N-8).

**TX-N-2**: **MUST NOT** leave a session open without commit or abort and final end on every exit path (including throw).

**TX-N-3**: **MUST NOT** mix writes inside the same business atomic unit where one path uses the transaction session and another omits it (split-brain unit).

**TX-N-4**: **MUST NOT** restate error message taxonomy, HTTP mapping, or decision/validation function rules in this file — use error policy and decision functions.

**TX-N-5**: **MUST NOT** open a database transaction when TX-G1 is NO (e.g. single independent write, read-only query, or unrelated writes that do not need atomicity).

---

## SHOULD (recommended)

Not merge-blocking under C4 — supplements TX-M-9 and TX-M-10 without new **MUST** obligations.

**TX-REC-1**: Keep each database transaction short-lived: minimize work inside the transaction boundary (especially slow network I/O or user waits) to reduce lock contention and driver/server timeout risk.

**TX-REC-2**: Before adding automatic retry around a state-changing transactional unit, treat duplicate delivery as likely and align with TX-M-9 and TX-M-10 (atomicity does not imply idempotent retries). When the driver's managed runner can no longer retry because the callback contains driver errors, TX-M-11 makes caller-owned bounded retry mandatory rather than optional.

---

## Layer reference (non-normative illustration)

See [lifecycle/session ownership](transaction-policy.md#must) and [repository boundary](../repository/repository-boundary-and-atomic-claims.md).
