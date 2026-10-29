# Idempotency (backend SSOT)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** idempotency key, replay, TTL, mutation, concurrency


## Agent TL;DR

This index routes definitions; select the part owning the affected question.

1. [Core and constants](idempotency.md) — IDEMP-C1/C5/C6, IDEMP-T-*.
2. [Key, scope, replay and retention](key-scope-and-replay-contract.md) — IDEMP-M1–6/M3b/M29.
3. [Partial failure and sealing](partial-failure-and-sealing-contract.md) — IDEMP-M7/M28.
4. [Boundary stores/provider callbacks](boundary-stores-and-provider-callbacks.md) — IDEMP-M8–15.
5. [Current authorization and intent](replay-authorization-and-intent-binding.md) — IDEMP-M16–17.
6. [Ledger, scheduler and membership](ledger-scheduler-and-membership-predicate.md) — IDEMP-M18–22.
7. [Identity migration](identity-migration-unit.md) — IDEMP-M23/M27/M31.
8. [Compensation](compensating-action-unit.md) — IDEMP-M24–25.
9. [Durable fenced leases](durable-fenced-lease-unit.md) — IDEMP-M26.
10. [Whole-event feasibility](whole-event-feasibility-unit.md) — IDEMP-M30.
11. [Prohibitions](idempotency-prohibitions.md) — IDEMP-N1–20.
12. [Decision gates](idempotency-decision-gates.md) — GIDEMP1–9, then [effect fences/atomic seal](effect-fence-and-atomic-sealing.md) — GIDEMP10.

Reference only: [appendix](idempotency-appendix.md), [code samples](../_meta/examples/idempotency-code-samples.md); never required by default.

Related: [repository](../repository/repository-contract.md), [error policy](../error-policy/error-policy.md), [logging](../logging-policy/logging-policy.md).
