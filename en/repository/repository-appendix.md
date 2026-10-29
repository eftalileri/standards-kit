# Repository contract — appendix (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [Repository contract](repository-contract.md). This file carries the explicitly non-normative layer illustration only: it defines no rule ID, adds no obligation, and is not part of the reading path. Every row it names is defined in [repository-contract.md](repository-contract.md), [repository-boundary-and-atomic-claims.md](repository-boundary-and-atomic-claims.md) or [repository-index-migrations-and-validated-reads.md](repository-index-migrations-and-validated-reads.md).

---

## Layer reference (non-normative illustration)

Route / handler: Validate transport input with the application's boundary schema. For HTTP APIs, pass extracted, validated values rather than raw request objects. When using MongoDB or another document database, build filters through the applicable query-safety guidance.

Service: Own business decisions, transaction lifecycle where needed per [transaction policy](../transactions/transaction-policy.md), required-entity handling, and mapping persistence failures into application/API outcomes. Keep decision logic separate from retrieval logic per [error policy](../error-policy/error-policy.md) and [decision functions](../decision-function/decision-function.md).

Repository: Expose the persistence operations and result types needed by callers. In a typed stack, represent filters, updates, projections, and transaction/session context using that stack's supported types (**REP-M-4**, **REP-M-9**, **REP-M-8**); never start transactions (**REP-N-8**). Keep transport validation, authorization decisions, business policy, and HTTP mapping outside this layer.
