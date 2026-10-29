# Repository contract — how an unowned live structure is resolved into an adoption or a removal (**REP-M-31**)

```kit-cover
type: normative
part-of: README.md
binds: which facts decide whether an unowned live structure is adopted into a spec or removed, and what evidence each side of that decision requires
open-when: shape:backend-heavy, signal:index-migration, signal:persistence-layer, signal:durable-inbox, signal:writer-cutover, signal:boot-readiness, signal:data-access-review, signal:repository-write
skip-when: signal:client-only, signal:no-migration-or-readiness-change
owns: REP-M-31
```

Part of [Repository contract](repository-contract.md) — the agent execution contract (C1–C6), the **REP-N-1**–**REP-N-8** prohibitions and the precedence statement are defined there and bind this row.

Scope: This band holds the resolution half of the undeclared-topology question: once a reading has named a structure no spec claims, which independent facts decide between adopting it into the spec and removing it, and what each side must prove first. Its sibling [repository-topology-excess-and-verdict-severity.md](repository-topology-excess-and-verdict-severity.md) holds the verdict half — that the excess verdict comes from the same reading as the missing one, and that the two verdicts never share a severity (**REP-M-30**).


References: [README.md](README.md); [repository-contract.md](repository-contract.md) (C1–C6, **REP-N-1**–**REP-N-8**); [repository-topology-excess-and-verdict-severity.md](repository-topology-excess-and-verdict-severity.md) (**REP-M-30** — the verdict this row consumes); [repository-boot-readiness-prerequisite-proof.md](repository-boot-readiness-prerequisite-proof.md) (**REP-M-19**, **REP-M-29**); [repository-retention-and-irreversible-operations.md](repository-retention-and-irreversible-operations.md) (**REP-M-22** — the order a removal obeys); [dead-code.md](../dead-code/dead-code.md) (**DCD-M8** — consumers no source-tree scan can see).

---

## **MUST**

**REP-M-31**: Resolve an unowned live structure using THREE independent facts — usage evidence, the source paths that may consume it, and whether its key fields remain in the declared data shape. No single fact decides adoption or removal. A usage counter usually covers a finite interval, such as time since the database process last restarted; zero means only “not observed in this interval,” not “never used.” A high counter also does not prove ownership: a cached query plan or background process may use a structure after the application consumer has changed. Prefer non-mutating plan inspection or other observational tools when probing usage, because executing a query solely to measure it may increment the counter and affect a removal gate.

A structure used by a database-managed background process, such as an expiry mechanism, may not appear in query-access counters at all. In that case, inspect the effect it is intended to produce (for example, whether records beyond the declared retention horizon remain) alongside the other evidence. This substitutes only for a counter known to be blind to that kind of consumer; it does not remove the need to review source consumers and the declared fields.

Default toward adoption, not removal, and adopt the MEASURED live shape. If a live consumer exists, add the exact live name, key, and behavior-changing options to the declared shape. Make any desired redesign a separate change so the adoption read-back proves the structure that actually exists. Remove only when both the consuming path and the fields that support it are gone. Immediately before destructive DDL, re-read the relevant usage evidence and stop if it indicates active use; for a background mechanism that the counter cannot observe, use its effect as the relevant evidence ([**REP-M-23**](repository-irreversible-operation-evidence.md), [**REP-M-24**](repository-retention-and-irreversible-operations.md), [**REP-M-28**](repository-irreversible-operation-entry-point.md)).

Keep the declared name set in a specification authority that can be consumed by both schema definitions and the topology reader without creating a dependency cycle. If moving the declaration changes the source shape examined by a check, re-anchor the check at the same predicate strength; do not replace an exact shape check with name-presence alone. Choose the missing-structure verdict's severity only after the structure is adopted or removed and topology has been read again, so the channel reflects the remaining state rather than an assumed cleanup result ([**FP-N13**](../false-positive/check-design-rules.md), [**FP-M18**](../false-positive/check-design-rules.md)). [Consequence: A live structure is removed because its consumer was not visible to a bounded usage counter, a stale plan is mistaken for a live application consumer, or adoption changes the shape before its read-back can prove what is deployed.] [Verify: For each unowned name, record usage evidence, inspect consumer paths, and compare required fields with the declared shape. Compare adopted spec name/key/options with the live description; repeat topology measurement before choosing the missing-verdict channel. For removal, verify both the consumer and supporting fields are gone and re-read applicable usage/retention evidence immediately before DDL. Check reach: usage evidence, source consumers, and declared shape span runtime and multiple files, so no single-file check can decide the outcome. Keep the evidence and decision reviewable; never let a measurement alone trigger destructive DDL.]
