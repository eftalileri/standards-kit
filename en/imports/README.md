# Imports (components, modules, boundaries)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** import path, barrel, shared UI, cross-feature, re-export


Normative rules for import paths, shared vs feature-local UI, cross-feature boundaries, presentation / data layering, barrels, and bundler failure handling.

- [Component and module imports (SSOT)](component-and-module-imports.md)

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: IMP-\* index and topic mirror). [Code modularity](../code-modularity/README.md) (COD-\* file splits); [Dead code](../dead-code/README.md) (DCD-\* — unused barrels / re-exports / orphan files, knip); [TanStack Query](../tanstack-query/README.md) (data hooks); [Zustand](../zustand/README.md) (**ZST-N4**).
