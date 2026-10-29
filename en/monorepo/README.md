# Monorepo (workspace boundaries)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** workspace, package boundary, shared types, cross-package


Normative rules for shared packages, frontend and backend import edges, CI boundary enforcement, and production client bundles.

- [Monorepo architecture (SSOT)](monorepo-architecture.md) — **MRP-C1**–**MRP-C5**, GMR1–GMR5, failure-path routing, checklist
- [Monorepo failure paths](monorepo-failure-paths.md) — shared-contract and import-boundary failure resolution
- [Monorepo rules](monorepo-rules.md) — **MRP-M1**–**MRP-M16**, **MRP-N1**–**MRP-N9**
- [Cross-repository contract mirror rules](monorepo-contract-mirror-rules.md) — **MRP-M17**

Related: [Code modularity](../code-modularity/README.md); [Imports](../imports/README.md) (within-app paths); [Forms](../forms/README.md), [TanStack Query](../tanstack-query/README.md) (shared schema consumers).
