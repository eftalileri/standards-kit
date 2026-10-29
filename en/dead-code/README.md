# Dead code (unused files, exports, dependencies)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** dead code, unused export, orphan file, phantom dependency, knip, ts-prune, verify-before-delete, wire surface, published client, compatibility alias

**Purpose:** Normative policy for **detecting and removing dead code** — locally unused **imports/variables** and whole-graph candidates such as orphan **files**, unused **exports**, and unused or undeclared dependencies. Defines the **two-layer detection model**, the **verify-before-delete** protocol (the compiler and the project's required verification checks are the final judges), and conditional guidance for configuring a whole-graph analyzer.

**TL;DR — the one thing that is not decidable here:** both detection layers see **one snapshot of one repository**. For a **wire surface** (route/endpoint, response field, request parameter, event name, published contract), that snapshot is **not** the consumer set: a released client or third-party integration may still call what the current source no longer references. Deleting on "zero callers in the source tree" can silently break consumers. Check the oldest supported consumer release and other external consumers first — **[DCD-M8](dead-code-rules.md) / [DCD-N5](dead-code-rules.md) / gate [GDCD4](dead-code.md)**; if still called, keep it as a **delegating compatibility alias**, never a second authority.

**Scope boundary:** This hub owns *whether and how* dead code is detected and removed safely. It does **not** redefine import-path rules ([imports](../imports/README.md) **IMP-**\*), file-split baselines ([code modularity](../code-modularity/README.md) **COD-**\*), dependency placement ([monorepo](../monorepo/README.md) **MRP-**\*), or `package.json` policy ([build & environment](../build-environment/README.md)).

## Reading order (normative)

1. **[dead-code.md](dead-code.md)** — Scope, agent contract, two-layer model (**DCD-M1**), decision gates (**GDCD1**–**GDCD4**), verify-before-delete checklist, CI, and the two **residues** a deletion leaves outside the compiled program (each defines no identifier): the **enforcement-side** one — a lint rule's locked-name set or a guard's config still naming a symbol that no longer exists, a lock that advertises coverage it lost (binds via **DCD-M2** / **DCD-M7** / **DCD-M9**) — and the **query-side** one, a database predicate still keyed on a **retired field**, which matches nothing while the query keeps reporting success, so a list silently loses records and a destructive filter silently deletes none (binds via **DCD-M2** / **DCD-M9**).
2. **[dead-code-rules.md](dead-code-rules.md)** — the **DCD-M2**–**DCD-M9** / **DCD-N1**–**DCD-N5** rows, including the wire-surface pair **DCD-M8** / **DCD-N5** and the zero-consumer-leftover row **DCD-M9** (which also binds how "zero consumers" is measured: follow relays to a terminal reader, and treat an unreachable relay as blocking the deletion, not disproving it).
3. **[dead-code-wire-surface-horizon.md](dead-code-wire-surface-horizon.md)** — **reachability horizon for wire surfaces**: why one snapshot is not the consumer set, the activation direction, the **published wire-contract record**, and the split between its guard-enforced half and the half that stays out-of-band. Defines no identifier; it is the reasoning **DCD-M8** / **DCD-N5** rest on.
4. **[knip-usage.md](knip-usage.md)** — Conditional operational guide for whole-graph analyzers: project configuration, task commands, output interpretation, and false-positive categories.
5. **[knip-optimization-playbook.md](knip-optimization-playbook.md)** — the 13 finding categories and their standard config/structural resolution.

## Related

- [Imports](../imports/README.md) (**IMP-**\* — barrels and re-exports are a common dead-code source).
- [Code modularity](../code-modularity/README.md) (**COD-**\* — splits create orphan files if old paths aren't deleted).
- [Styling](../styling/README.md) (**STY-M / no-unused-styles** — dead `StyleSheet` keys).
- [Monorepo](../monorepo/README.md) (**MRP-**\* — workspace boundaries shape knip workspaces and cross-package usage).
- [Build and environment](../build-environment/README.md) (`package.json` dependency declarations — unlisted/unused deps).
- [SSOT governance](../ssot/README.md) (**SSG-M8** — no parallel/duplicate paths; migration must delete the superseded one).

**Precedence:** STATE > BEHAVIOR > UI (same as [TanStack TSQ-C3](../tanstack-query/tanstack-query.md)); this topic never weakens functional correctness — when uncertain whether code is dead, it is **kept**. For a wire surface, "uncertain" is the **default** until the oldest field release has been checked ([DCD-M8](dead-code-rules.md)).
