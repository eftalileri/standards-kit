# Monorepo boundaries — scenarios (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — training only. Normative rules: [`../../monorepo/monorepo-architecture.md`](../../monorepo/monorepo-architecture.md).

---

## Example CI tools (illustrative)

Projects often implement **MRP-M11** with one or more of:

- `eslint-plugin-boundaries` with zone definitions for `packages/shared`, `apps/web`, `apps/api`
- `dependency-cruiser` rules that forbid `from apps/web to apps/api`
- Nx `enforce-module-boundaries` tags

The exact config is project-owned; the standard requires fail on error, not warn-only, for illegal cross-imports (**MRP-N8**).

---

## Contract-first PR shape

1. Add or change DTO types under shared types root (**MRP-M1**).
2. Add or change Zod schema under shared schemas root if both tiers validate the same payload (**MRP-M2**).
3. Update consumer in the same merge series (**MRP-M4**).

---

## Frontend API client typing

HTTP client modules should import request/response types from shared only (**MRP-M6**), not duplicate interfaces under `apps/web/src/types/api.ts` for the same routes.
