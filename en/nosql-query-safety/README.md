# NoSQL query safety (hub)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** MongoDB, Zod, sanitizeFilter, injection, query safety


English SSOT for MongoDB / Mongoose injection defense: Zod-first, per-query `sanitizeFilter` only when needed, global `sanitizeFilter` forbidden.


Normative files (reading order). Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list.

1. [nosql-zod-and-sanitizefilter.md](nosql-zod-and-sanitizefilter.md) — **NOSQL-GC-1**–**NOSQL-GC-3**, **SEC-M-NOSQL-1**–**SEC-M-NOSQL-4**, **SEC-M-NOSQL-WH-1**, **SEC-N-NOSQL-1**–**SEC-N-NOSQL-5**, **GSEC-NOSQL1** — operator injection at the boundary: Zod-first validation, the per-query `sanitizeFilter` layer, the global-`sanitizeFilter` prohibition, projection/`select` shapes, the guard-outcome policy, the webhook carve-out and the decision gate.
2. [nosql-declaration-index-and-destructive-writes.md](nosql-declaration-index-and-destructive-writes.md) — **SEC-M-NOSQL-5**–**SEC-M-NOSQL-9** — the failures nothing reports: a partial-index expression MongoDB silently skips, an ODM projection prefix forwarded verbatim so the field arrives empty, an unscoped or wrong-field bulk destructive filter, an unbounded request- or fan-out-derived array, and a unique-constraint conversion whose drop/recreate order leaves the constraint absent for a window.

Related: [Security backend](../security/security-backend-controls.md) (**SEC-M-BE-NOSQL-1**, webhooks **SEC-M-WH-1**); [Forms](../forms/forms.md); [Repository](../repository/README.md) (**REP-M-5** — persistence layer must stay behind validated boundaries).

Non-normative: [`../_meta/examples/nosql-query-safety-code-samples.md`](../_meta/examples/nosql-query-safety-code-samples.md).

---

This hub is not normative — rules live only in the two normative files above.
