# Transactions (database atomicity)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** atomicity, session or transaction context, service-owned lifecycle, rollback, persistence


## Agent TL;DR

This index routes definitions; select the part owning the affected question.

- [Lifecycle and session scope](transaction-policy.md) — C1–C6, TX-M-1–8, TX-N-1–5, TX-REC-1–2.
- [Decision gates](transaction-decision-gates.md) — TX-G1–3.
- [Contention and unit limits](transaction-contention-and-unit-scope.md) — TX-M-9/10/12–14/22/24.
- [Callback failure/retry](transaction-callback-failure-and-retry.md) — TX-M-11.
- [Session serialization](transaction-session-serialization.md) — TX-M-15.
- [Attempt state, enqueue and driver identity](transaction-callback-attempt-state.md) — TX-M-16–18.
- [Write context](transaction-write-context.md) — TX-M-19.
- [Read session join](transaction-read-session-join.md) — TX-M-20.
- [Writer-owned accounting](transaction-write-set-accounting.md) — TX-M-21.
- [Conflict materialization](transaction-conflict-materialization.md) — TX-M-23.
- [Long hard delete](transaction-long-hard-delete.md) and [resume/completion](transaction-long-hard-delete-completion.md) — TX-M-12 boundaries.

Related: [repository](../repository/repository-contract.md), [error policy](../error-policy/error-policy.md), [logging](../logging-policy/logging-policy.md).
