# Idempotency — partial failure, reconciliation and what may be sealed as a completed replay (IDEMP-M7, IDEMP-M28)

```kit-cover
type: normative
part-of: README.md
binds: atomic mutation completion, reconciliation, claim release and cause-permanence sealing
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:duplicate-suppression
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M7, IDEMP-M28
```

Part of [the topic index](README.md).

References: [Idempotency SSOT](idempotency.md); [key-scope-and-replay-contract.md](key-scope-and-replay-contract.md); [idempotency-prohibitions.md](idempotency-prohibitions.md); [transaction-policy.md](../transactions/transaction-policy.md); [error-policy.md](../error-policy/error-policy.md); [registry-cause-permanence-fact.md](../error-policy/registry-cause-permanence-fact.md); [durable-fenced-lease-unit.md](durable-fenced-lease-unit.md); [error-category-provenance-and-client-text-set.md](../error-policy/error-category-provenance-and-client-text-set.md); [change-acceptance-bar.md](../implementation-verification/change-acceptance-bar.md).

---

<a id="must-normative--idemp-m7-idemp-m28"></a>

## Reconciliation and sealing — [IDEMP-M7/M28](partial-failure-and-sealing-contract.md)

**IDEMP-M7**: A handler that can crash between effect and completed-record persistence **MUST** either (a) durably record pending before irreversible effects, then complete after durable commit; or (b) reconcile retry through exactly one of: (b1) unique-key UPSERT/ON CONFLICT, (b2) stable-id overwrite/PUT semantics, (b3) append-only ledger deduplication by scoped action key. Same transaction-capable store means mutation and completion join one transaction/session. Post-commit completion is forbidden because it leaves a crash gap.

An unknown commit after body completion **MUST NOT** release/delete the claim blindly: reconcile durable state and fence cleanup to the exact pending claim. Retryable failure never seals completed replay; release/expire for reconciliation. A route-owned durable `FAILED + retryable=true` intent reclaims that exact natural-key row atomically to pending, never creates a parallel intent; terminal handled failures do not reclaim.

`retryable:false` is not cause permanence. A rejection derived from mutable authorization, membership, subscription, ownership or quota **MUST** release, because a later legitimate same-key request may deserve another answer. Only request-derived permanent rejection may seal. The sealing predicate **MUST NOT** use transport retryability as its authority. If cause permanence is not classified, record the gap and move decidable actor/permission gates before claim/replay. **MUST NOT** return inconsistent success/failure for one key without (a/b1/b2/b3).

For non-transactional dispatch, sink deduplication decides the mechanism. A provider/durable downstream ledger deduplicating the effect forbids a first-attempt-only gate, which could lose delivery. A non-deduplicating sink requires both a first-attempt live gate and a queued durable unique dedup key. The residual crash window after outbound start and before durable recording **MUST** be named where the route is documented and **MUST NOT** be described as closed. Any syntax check must distinguish sink capability rather than enforce opposite polarities on both classes.

IDEMP-M7 single-predicate and definite-abort clarification (normative):

- (a) Every rejection-sealing claim store **MUST** use one shared predicate reading the registry's [cause-permanence fact](../error-policy/registry-cause-permanence-fact.md). Store-local copies or named-code exceptions are second authorities. A success-only store that never seals failures makes no such decision.
- (b) Proven rollback, including exhausted retry/deadline with no commit outcome pending, releases the exact claim; holding it locks the same caller out for the whole lease and protects nothing. Unknown commit, takeover loss or an unrecognized state keeps it; never guess in the irreversible direction.

Any project check on the completion seam holds only that local seam; record its actual scope and limits.

**IDEMP-M28**: A sealing criterion borrowing HTTP status class as a durable-write proxy **MUST** cite the [M36 class contract](../error-policy/error-category-provenance-and-client-text-set.md) and explicitly declare its review boundary ([IV-M13](../implementation-verification/change-acceptance-bar.md)). Pre-write refusal asserts no write attempted; uniqueness/CAS persistence conflict belongs to conflict class. A release predicate using pre-write refusal/server fault/transport-retry classes is valid only under those meanings.

- (a) Cite the borrowed class where the criterion lives so registry status changes are reviewed as sealing changes.
- (b) Establish when each classified code is raised relative to attempted durable writes. A raise site's syntax cannot see callee writes or unit boundaries, so a green local check does not prove this dependency.
