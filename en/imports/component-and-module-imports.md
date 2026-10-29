# Component and module imports (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the legal import paths, barrel and re-export policy, and the cross-feature boundaries inside one application package
open-when: shape:frontend-heavy, shape:refactoring, signal:client-source-change, signal:import-path, signal:barrel-export
skip-when: signal:no-source-file-change
owns: GIM1, GIM2, GIM3, GIM4, GIM5, IMP-C1, IMP-C2, IMP-C3, IMP-C4, IMP-C5, IMP-M1, IMP-M2, IMP-M3, IMP-M4, IMP-M5, IMP-M6, IMP-M7, IMP-N1, IMP-N2, IMP-N3, IMP-N4
```

Scope

- Included: TypeScript / TSX (or project equivalent) import paths and module boundaries for in-repo frontend code: shared vs feature-local UI, cross-feature rules, presentation vs data access, barrel usage, lazy / dynamic imports, and bundler resolution failures. Aligns with [code modularity](../code-modularity/code-modularity.md) (COD-\*).
- Excluded: Package version gates (use stack topics); cross-package workspace edges (frontend vs backend vs shared) — [monorepo](../monorepo/monorepo-architecture.md) (MRP-\*); exact path-alias matrix beyond **IMP-M1** / **IMP-C4** (project architecture owns the map). Test-only import relaxations: N/A here unless the project marks a test utility root in architecture — production boundary rules still apply to code under test when asserting integration shape.

Document type: Normative — single SSOT for import routing and forbidden dependency shapes.

Environment: Applies to the adopting project's frontend bundler and type-checking tools (for example Metro, Webpack, or Vite). Wrong paths or cycles must surface through its build or type-check workflow; cache clearing alone is not evidence of compliance (**IMP-C5**).

Binding principle: Shipping imports that omit the shared UI root segment for shared UI, violate feature isolation, or bypass the data-access layer is a bug — STOP and fix paths or structure.

References: [Code modularity](../code-modularity/code-modularity.md); [TanStack Query](../tanstack-query/README.md); [Zustand](../zustand/README.md) (**ZST-N4**); [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (M15).

Code samples / scenarios (non-normative): [`../_meta/examples/component-imports-scenarios.md`](../_meta/examples/component-imports-scenarios.md).

Decision routing: [Decision gates (normative index)](#decision-gates-normative-index).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **IMP-C\*** | Agent execution contract. |
| **IMP-M\*** | **MUST** — positive obligations. |
| **IMP-N\*** | **MUST NOT** — forbidden shapes. |
| GIM\* | Decision gates — binary routing only; cite existing IMP- rows. |

---

## Agent execution contract

**IMP-C1**: This topic is mandatory for new or changed frontend imports in product scope.

**IMP-C2**: Apply [shared **C4**](../_meta/agent-contract.md).

**IMP-C3**: [Shared agent contract C2](../_meta/agent-contract.md); apply **IMP-M** / **IMP-N** and GIM exactly (gray M15).

**IMP-C4**: Path aliases or absolute in-repo imports are allowed only when project architecture or tooling config defines them and they do not weaken **IMP-N2** or **IMP-M4**; otherwise use relative paths per **IMP-M1**.

**IMP-C5**: Clearing bundler cache or restart is diagnostic only — not evidence of compliance; after a resolution failure, verify **IMP-M2** and **IMP-M3** before relying on cache clears.

---

## **MUST**

**IMP-M1**: Default in-repo imports must use relative specifiers from the importing file unless **IMP-C4** applies.

**IMP-M2**: Shared reusable UI (buttons, forms, shared widgets) must live under the architecture's designated shared UI root (for example, `<shared-ui-root>/`). Consumer import specifiers must identify that root so the bundler does not resolve a same-named file under a screen or feature folder by mistake.

**IMP-M3**: Relative import depth must match the actual directory structure. Consumers at equivalent locations should use the corresponding path pattern to reach the shared UI root and its modules.

**IMP-M4**: Presentation code (screens, shared components) must reach remote HTTP / API behavior only via the project's selected server-state hooks or modules (TanStack Query where selected), documented feature data hooks (for example *.hooks.ts), or props from parents that already used those layers — not by importing raw client modules used for side-effect calls (for example apiClient, or a *.api.ts entry that performs those calls) directly into UI files.

**IMP-M5**: A barrel module (such as `index.ts`) may be used only when its exports form an acyclic graph with consumers, verified using the project's build, lint, or type-check tooling.

**IMP-M6**: Extensionless imports must follow project frontend rules (for example no .js suffix in TSX sources) where project standards already require it.

**IMP-M7**: Dynamic import() (lazy screens or splits) must target paths that satisfy the same **IMP-M2**, **IMP-N2**, and **IMP-M4** constraints as static imports.

---

## **MUST NOT**

**IMP-N1**: Must not import shared UI via a path that omits the shared UI root segment when that omission can resolve to a feature-local or screen-local homonym; ambiguous paths can fail resolution or bind to the wrong module.

**IMP-N2**: Cross-feature internal imports are forbidden: code under one feature root must not import implementation modules from another feature's private subtree. Allowed edges include the shared UI root, documented shared libraries, shared query modules, and explicit public API entry points declared by the architecture.

**IMP-N3**: Must not merge or ship a change that introduces a circular import between runtime modules when the bundler or TypeScript reports it — forbidden; refactor barrels or split modules (STOP).

**IMP-N4**: Must not use a barrel to re-export paths that would violate **IMP-N2** if imported directly — forbidden (hidden cross-feature coupling).

---

## Decision gates (normative index)

Purpose: Binary routing for import shape — no new obligations beyond cited IMP- rows.

GIM1: Proceed only if YES when: Target is feature-local UI (only this feature uses it) and lives under the same feature root as the importer. Binding rule IDs: **IMP-M1**, **IMP-M3**. If NO: Use shared UI root (GIM2) or STOP.

GIM2: Proceed only if YES when: Target is shared UI and the specifier includes the shared UI root segment per **IMP-M2**. Binding rule IDs: **IMP-M2**, **IMP-N1**. If NO: STOP — fix the path before cache-only diagnostics (**IMP-C5**).

GIM3: Proceed only if YES when: Dependency crosses feature roots only via allowed surfaces in **IMP-N2**. Binding rule IDs: **IMP-N2**, **IMP-N4**. If NO: STOP — expose a public API or move code to shared.

GIM4: Proceed only if YES when: Remote data is reached only through allowed layers in **IMP-M4**. Binding rule IDs: **IMP-M4**. If NO: STOP — add hook or query module.

GIM5: Proceed only if YES when: Barrel (if any) does not create cycles and does not launder **IMP-N2** violations. Binding rule IDs: **IMP-M5**, **IMP-N3**, **IMP-N4**. If NO: STOP — narrow exports or split modules.

---

## Failure path (normative)

Bundler resolution failure or wrong shared component at runtime: STOP — verify GIM2 (shared-root segment and **IMP-M3** path depth) before cache-only diagnostics (**IMP-C5**).

TypeScript, lint, or CI reports circular import or boundary violation: STOP — must not ship; fix graph (**IMP-N3**).

Unclear whether a path is another feature internal tree: STOP — confirm with architecture map or user (gray procedure).

---

## Implementation checklist

- [ ] GIM1–GIM5 for each new or changed import path
- [ ] **IMP-M2** / **IMP-N1** for shared UI
- [ ] **IMP-N2** / **IMP-N4** for cross-feature edges
- [ ] **IMP-M4** for screens / components calling remote data
- [ ] **IMP-M7** for lazy / dynamic imports

---

Older local import guidance is historical; use this file as the current source.

Part of: [README.md](README.md) — imports hub.
