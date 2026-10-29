# Repository (data access layer)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** data access, persistence, repository pattern, ORM, ODM

Purpose: Normative rules for the repository layer: persistence responsibilities and boundaries that keep routes, services, and security decisions correctly separated.

Reading order (routing). Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list. This README routes and defines no rule rows.

1. [repository-contract.md](repository-contract.md) — agent execution contract (C1–C6), precedence, and every **REP-N**-\* prohibition.
2. [repository-boundary-and-atomic-claims.md](repository-boundary-and-atomic-claims.md) — **REP-M-1**–**REP-M-11**, **REP-M-21**: validated inputs, typed queries and projections, failure propagation, transaction participation, and live-topology reads.
3. [repository-atomic-claims.md](repository-atomic-claims.md) — **REP-M-13**, **REP-M-14**: durable inbox/outbox claims, leases, and atomic creation under a natural-key uniqueness constraint.
4. [repository-index-migrations-and-validated-reads.md](repository-index-migrations-and-validated-reads.md) — **REP-M-12**, **REP-M-15**–**REP-M-17**, **REP-M-26**: unique constraints, one DDL authority, safe migration modes, topology verification, and validated-read types.
5. [repository-historical-adoption-and-readiness.md](repository-historical-adoption-and-readiness.md) — **REP-M-18**, **REP-M-20**: safe adoption of new persisted fields and readiness evidence for existing data.
6. [repository-boot-readiness-prerequisite-proof.md](repository-boot-readiness-prerequisite-proof.md) — **REP-M-19**, **REP-M-29**: bounded boot-time readiness checks, durable prerequisites, and ownership of declared structures.
7. [repository-topology-excess-and-verdict-severity.md](repository-topology-excess-and-verdict-severity.md) — **REP-M-30**, **REP-M-31**: compare live topology with declared structures and resolve unowned structures with evidence.
7a. [repository-unowned-structure-resolution.md](repository-unowned-structure-resolution.md) — **REP-M-31**: decide whether an unowned live structure should be adopted or removed.
8. [repository-retention-and-irreversible-operations.md](repository-retention-and-irreversible-operations.md) — **REP-M-22**, **REP-M-24**, **REP-M-27**: one retention authority and evidence before irreversible cleanup.
9. [repository-irreversible-operation-evidence.md](repository-irreversible-operation-evidence.md) — **REP-M-23**, **REP-M-25**, **REP-M-32**, **REP-M-33**: authority-derived acceptance criteria, explicit targets, field-removal evidence, and redundant-prefix index removal evidence.
10. [repository-irreversible-operation-entry-point.md](repository-irreversible-operation-entry-point.md) — **REP-M-28**: one explicit, scoped entry point for irreversible maintenance operations.
11. [repository-appendix.md](repository-appendix.md) — non-normative layer illustration; defines no rule ID and is not part of the reading path.

Related: [Transaction policy](../transactions/transaction-policy.md) (**TX-M-2**, **TX-G2** — session participation with **REP-M-8**); [NoSQL query safety](../nosql-query-safety/nosql-zod-and-sanitizefilter.md) (input validation and query safety); [Security backend](../security/security-backend-controls.md); [Forms](../forms/forms.md); [Decision functions](../decision-function/decision-function.md); [Error policy](../error-policy/error-policy.md); [Code modularity](../code-modularity/code-modularity.md).

Out of scope here: Client state and browser-only data access; follow the relevant client-platform guidance instead.
