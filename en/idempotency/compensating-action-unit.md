# Idempotency — compensating a completed effect as one unit (IDEMP-M24, IDEMP-M25)

```kit-cover
type: normative
part-of: README.md
binds: compensation identity, irreversible-provider outcome, published counter meaning and reconciliation feasibility
open-when: shape:backend-heavy, signal:idempotency, signal:provider-integration, signal:webhook, signal:derived-field, signal:compensating-action
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M24, IDEMP-M25
```

Part of [the topic index](README.md).

**Keywords:** compensating action, reversal, clawback, refund, void, chargeback, irreversible provider effect, ledger-only reversal, conditional CAS, counter semantics, derivation input

References: [README.md](README.md); [idempotency.md](idempotency.md); [key-scope-and-replay-contract.md](key-scope-and-replay-contract.md); [partial-failure-and-sealing-contract.md](partial-failure-and-sealing-contract.md); [ledger-scheduler-and-membership-predicate.md](ledger-scheduler-and-membership-predicate.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md); [ssot-must-authority-and-derivation.md](../ssot/ssot-must-authority-and-derivation.md); [ssot-must-provider-projection.md](../ssot/ssot-must-provider-projection.md); [redis-connection-keys-and-authority.md](../redis/redis-connection-keys-and-authority.md).

---

<a id="must-normative--idemp-m24-to-idemp-m25"></a>

## Compensation identity and counters — [IDEMP-M24–25](compensating-action-unit.md)

**IDEMP-M24**: A compensation **MUST** have its own identity within the record of the effect it compensates:

- (a) Bind the triggering compensation event plus the discriminator separating its parties/roles, rather than reuse the original effect's consumed key. Enforce that key by a durable unique constraint and a not-yet-compensated CAS; a lease cannot prove uniqueness.
- (b) Extend the operation's durable record and existing projection writer. **MUST NOT** introduce a parallel reversal collection, service or counter.
- (c) An irreversible provider effect permits an explicitly named ledger-only outcome such as `reversal_unrecoverable`, never a second approximate undo command or a claim that reversal occurred.
- (d) **MUST NOT** invent negative balances, future deductions or carried debt without an existing named product authority. An unsettled target is retryable; ambiguous targets or compensation by another event are explicit conflicts, never silent skips.

**IDEMP-M25**: Compensation **MUST** add an input to the existing single derivation rather than repurpose a published cause counter or decrement a total whose published meaning is monotone. Widen the invariant (for example exclusions plus compensations cannot exceed total) and enforce the same bound in the increment filter. Impossible combinations fail loud. One exported normalizer owns absent-value interpretation: absence may mean zero only when the counter and its sole writer were introduced together and the increment commits atomically with its counted fact. A counter predating its writer retains fail-loud gap semantics.

IDEMP-M24 retry side and reconciliation feasibility (normative):

- (a) Release **MUST** be fenced on the pre-provider phase in the store's own conditional write. A may-clear cause does not authorize releasing provider-started/outcome-unknown work. Inspect the actual client retry predicate: the unknown-outcome response class can otherwise automatically repeat the irreversible call after a timeout or `5xx`.
- (b) Before designing reconciliation, read the published provider surface and establish one of: a provider read keyed on a value held before the call; a durable pre-call baseline/target comparable to current provider state; or documented idempotent command replay. A post-call minted identifier cannot reconcile an outcome that never returned it. Without these capabilities the unknown phase is terminal, never repeated or guessed into success. Record the surface and missing capability beside the code.

## Stated enforcement limits

The unique constraint, compensation CAS and widened arithmetic invariant hold their respective boundaries. Key provenance, truthful undo classification and published counter meaning require the event/provider/UI contracts. A route-name fence is not sufficient because a sibling route may reach the same provider adapter without a claim; adapter reachability does not establish the claim contract. The persistence authority's pre-provider-only release and required fenced-lease input hold it. A filter-shape lock is weaker than the single authority and type.
