# Transaction contention and the scope of one atomic unit

```kit-cover
type: normative
part-of: README.md
binds: expected-state concurrency, durable authorization fences, write budgets, queued effects and status-implied ledger effects in the status write's unit
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-9, TX-M-10, TX-M-12, TX-M-13, TX-M-14, TX-M-22, TX-M-24
```

References: [transaction-policy.md](transaction-policy.md); [transaction-decision-gates.md](transaction-decision-gates.md); [Repository contract](../repository/repository-contract.md); [Idempotency](../idempotency/idempotency.md).

---

<a id="must"></a>

## Contention, authority and write budget — [TX-M-9/10/12–14/22/24](transaction-contention-and-unit-scope.md)

**TX-M-9**: Merge-sensitive balances, inventory, quotas, stock and equivalent aggregates **MUST** prevent double application under parallel/retried requests by expected-state CAS, durable uniqueness, documented locking or equivalent conflict materialization. Without mitigation, do not ship.

A multi-document edited projection uses one server canonical-digest derivation for both read model and in-unit comparison, never a stored counter or client-derived digest. A single stored-document edit uses its own `updatedAt`. Echo the token verbatim, re-derive on-session before the first write and reject mismatch with one registered may-clear business conflict; the client reloads/re-seeds. Re-derive prepared provider-dependent decisions inside and compare. During released-client compatibility, token is optional and preparation supplies the expected state; make required only when the oldest supported release sends it. Post-condition verification runs on-session before commit, not a racing post-commit read. State-filtered writes assert all targets matched. A digest **MUST NOT** disclose hidden low-entropy fields: omit them or server-key the digest; plain digest is sufficient only when all inputs are visible to all its readers. Field coverage/disclosure remain review-held (ENA-A1(a)).

A create fanning out over a client-held collection member set **MUST** claim the collection before business writes with a technical `timestamps: false` fence and compare exact set equality on-session. A stale subset cannot silently omit newly added members or replace per-member user input. Use the same conflict/refresh path. An edit strategy prepared under “no dependents yet” compares the fence counter too, because dependent creation does not advance the edit token. Inventory all dependent writers against that fence.

**TX-M-10**: Transactions **MUST** also satisfy applicable idempotency/payment SSoT; atomicity does not replace duplicate suppression.

**TX-M-12**: A durable authorization snapshot racing a terminal write **MUST** be fenced in the same database unit. Its authority owns monotonic epoch/version advanced with authority-changing projections. Provider/cache preparation precedes the unit under one bounded shared deadline. Compare candidate epoch and real-write/touch the authority before terminal persistence; carry one opaque scope+session-bound authority and recheck time expiry immediately before each terminal write. Same-session touch conflicts with concurrent authority changes. No callback outbound/cache calls. A batch acquires/reuses one fence, without per-item coordination trips. A repeated fence or anchor touch in one transaction attempt adds no conflict, because the first write already holds the document in the attempt's write set; a writer that skips the repeat **MUST** decide it through the single attempt-write record keyed by the driver's attempt object (a retried attempt writes again) and **MUST** clear it on any same-attempt write that ends the touch's guarantee (e.g. a closing mark), because a second record or a stale entry would let a refused or retried write pass unfenced. Redis generations under **RDS-M19**/**RDS-M21** remain cache coordination rather than this authority.

**TX-M-13**: Reject over-budget targets before transaction work, then prepare/seal each serialized document/update/replicated payload before first business mutation. Bounded snapshot reads may prepare payloads; only an established rollback-bound authorization/epoch fence may precede seal. Terminal writers reassert aggregate count/bytes before each mutation so nested callers, transforms and retries cannot bypass it. Reset accounting per attempt; no cross-request authority. Excess aborts the whole unit, never independently committed chunks. Project aggregate and database single-document limits remain separate.

**TX-M-14**: Shared writers **MUST NOT** default to unaccounted writes. Handle-holding callers pass accounting; omission is legitimate only on paths without such a unit. Prefer required handles (TX-M-21). Check direct propagation rather than imply complete cross-file coverage.

**TX-M-22**: Durable queued work **MUST** obey three boundaries:

- (a) Read/derive every payload input once inside the unit on its session; the worker consumes that frozen fact rather than re-derive later state.
- (b) A side-channel-only payload unrepresentable under queue bounds is a named root-cause skip/log, not domain abort or swallowed error. If the payload describes the domain write itself, unrepresentability still aborts.
- (c) Return canonical per-item outcomes, not a success counter, so worker retry/terminal decisions see failures.

TX-M-20 owns direct read-session propagation; another check would duplicate it. A canonical worker result type holds per-item shape where available. A newly introduced post-commit side-effect producer remains outside hand-registered callback scopes until inventoried.

Identity transfer boundary: Re-keying ownership/membership/directory records means response lookups cannot be hoisted against the old identity. Every store-reaching read joins the session; legitimate read-path repairs use required write context rather than reject repairable accounts. Options types make sessionless-writing branches unreachable in session mode. Match a single-use proof against cache before the unit, consume it durably on-session so rollback leaves it unspent, then close cache after commit as accelerator. Route-specific driver mapping enters as a typed hook to the single lifecycle owner. Direct store reach is covered by TX-M-20.

**TX-M-24**: A ledger effect that a lifecycle status or a movement implies (stock consumption, entitlement, accrual) **MUST** be reconciled as desired minus applied inside the same atomic unit as the status or movement write, from that attempt's fresh document, through the ledger's single writer; a finer-grained projection of the same ledger (per lot, per location, per bucket) **MUST** be written by that writer in the same unit. Neither **MUST** be deferred to queued work (TX-M-22 governs effects that leave the store, not the store's own ledgers), nor kept by a second writer or a periodic rebuild as its primary path. Reason: a deferred or second path opens a window in which status, ledger and projection disagree, and every reader must then choose which to trust. The money form of this rule is [PAY-M22](../payment-ssot/status-economics.md) (occupancy and accrual clauses). Review-held ([ENA-GV3](../enforcement-architecture/enforcement-admission.md)); a check was declined because the set of status writers is cross-file ([ENA-A1](../enforcement-architecture/enforcement-admission.md) (c)).
