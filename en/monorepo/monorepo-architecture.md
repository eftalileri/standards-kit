# Monorepo architecture — package boundaries (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract, GMR decision gates and implementation checklist; routes failure paths for workspace package boundaries
open-when: shape:full-stack, shape:backend-heavy, signal:source-file-change, signal:shared-type, signal:cross-package-import, signal:workspace-boundary
skip-when: signal:single-package-change
owns: MRP-C1, MRP-C2, MRP-C3, MRP-C4, MRP-C5, GMR1, GMR2, GMR3, GMR4, GMR5
```

**Scope**

- **Included:** Multi-package workspaces with separate client and server deployables, particularly TypeScript codebases: shared packages/folders for cross-boundary contracts, import rules between application tiers, forbidden dependencies, contract-first changes, boundary enforcement, and production client-bundle constraints. For other language stacks, use equivalent type/schema and dependency-boundary mechanisms.
- **Excluded:** Single-package repositories with no workspace (this layout has no package boundary to govern until a second deployable package or an explicit workspace is introduced); secret storage and authorization detail (use the adopting project's security authority; MRP-N3 still forbids secrets in shared); repository and ORM patterns — [repository/repository-contract.md](../repository/repository-contract.md).

**Document type:** Normative — package graph and layer boundaries. The **MRP-M** / **MRP-N** rows live in [monorepo-rules.md](monorepo-rules.md).

**Environment:** Applies to local development, the adopting project's required merge gate, and production client bundles where applicable (MRP-M10, MRP-M11).

**Binding principle:** Coupling the client to server implementation roots, or placing runtime secrets or persistence inside shared contract packages, is a bug — STOP and fix the graph or package boundaries.

**References:** [monorepo-rules.md](monorepo-rules.md) (**MRP-M1**–**MRP-M16**, **MRP-N1**–**MRP-N9**); [Code modularity](../code-modularity/README.md) (**COD-**\*); [Imports](../imports/README.md) (**IMP-**\* within each application package); [Forms](../forms/README.md), [TanStack Query](../tanstack-query/README.md) (consumers of shared schemas and types); [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (**M15**). **Precedence on conflict:** the adopting project's security authority takes precedence over this document, which takes precedence over UI-only conventions.

**Code samples / scenarios (non-normative):** [`../_meta/examples/monorepo-boundary-scenarios.md`](../_meta/examples/monorepo-boundary-scenarios.md).

**Decision routing:** [Decision gates (normative index)](#decision-gates-normative-index).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **MRP-C\*** | Agent execution contract. |
| **MRP-M\*** | MUST. |
| **MRP-N\*** | MUST NOT. |
| **GMR\*** | Decision gates — cite MRP rows only. |

---

## Agent execution contract

**MRP-C1**: This topic is mandatory when the repository uses a workspace (npm / pnpm / yarn workspaces, Nx, Turborepo, etc.) with separate frontend and backend packages, or an equivalent fixed tree with a documented shared contract root.

**MRP-C2**: Apply [shared **C4**](../_meta/agent-contract.md).

**MRP-C3**: [Shared agent contract C2](../_meta/agent-contract.md); apply **MRP-M** / **MRP-N** and GMR exactly (gray M15).

**MRP-C4**: Exact filesystem and package names are owned by the adopting project’s architecture — this standard binds obligations and forbidden dependency edges; the architecture or workspace configuration must document the actual roots.

**MRP-C5**: The agent must not propose colocating client and server implementation in one package to skip boundary rules.

---

## Decision gates (normative index)

Purpose: Binary routing for where code belongs — no new obligations beyond the cited MRP rows.

GMR1: Proceed only if YES -> The change crosses frontend and backend data contracts. [Binding: MRP-M1, MRP-M2, MRP-M4, MRP-M6, MRP-M12] [If NO: Keep types local to one tier only — do not duplicate cross-package DTOs for the same contract]

An internal dispatch command or provider-adapter payload remains tier-local even when its fields reuse shared domain types. Moving that internal shape must also move every source import and its boundary check; a stale check anchor falsely advertises protection. For a rule guarding a named interface, derive the gate scope from the source directory and recognize the declaration from the syntax tree so that a new sibling file cannot escape either scope list ([**BE-M17**](../build-environment/build-environment-config-and-runtime-floor.md)). A single-file AST rule cannot prove whether all cross-workspace consumers have disappeared; that requires dependency-graph review, including barrels and released wire consumers.

GMR2: Proceed only if YES -> The shared package is safe for both client and server: no database I/O, platform-specific UI runtime, or secrets. [Binding: MRP-N1–MRP-N3, MRP-M3] [If NO: Move the implementation to the owning package]

GMR3: Proceed only if YES -> Client imports stay on the allowed shared subpaths. [Binding: MRP-N5, MRP-N6] [If NO: STOP — adjust the import or shared exports]

GMR4: Proceed only if YES -> Shared packages do not depend on deployable application packages. [Binding: MRP-M9, MRP-N7] [If NO: STOP — invert the dependency]

**MRP-N7 enforcement guidance:** A shared source file's statically named relative import, re-export, type-only import, dynamic import, or `require` target can be resolved from that file alone. A single-file lint rule can reject a target outside the shared root, including type-only imports: erased JavaScript does not make a TypeScript dependency edge legal. When a converter genuinely needs an application model, move it into the application layer and keep the shared DTO as its input/output contract. A language profile’s exclusions must not narrow a boundary rule: register that rule over the entire shared source root and measure excluded profile files separately with the effective lint configuration and a temporary violation. **Stated limit:** computed module names and aliases whose targets are defined in another configuration file need dependency-graph review under MRP-M11.

GMR5: Proceed only if YES -> The adopting project's mandatory pre-merge gate checks package boundaries and fails on illegal imports. [Binding: MRP-M11, MRP-N8] [If NO: STOP — establish the required boundary gate before merge]

---

**Failure paths:** [Monorepo failure paths](monorepo-failure-paths.md).

## Implementation checklist (non-normative aid)

Use together with **MRP-M11** — not a substitute for CI.

- [ ] **MRP-M1** types root documented and used
- [ ] **MRP-M2** shared schemas for dual validation
- [ ] **MRP-M4** / **MRP-M1** every field declared on both tiers is carried by the bridge transformer, not only declared
- [ ] **MRP-M12** runtime schema output assignable under exact optional-property semantics
- [ ] **MRP-M13** closed enums derive shared type/options from one runtime schema
- [ ] **MRP-N9** no local union/enum/list/comparison copy of a shared closed enum
- [ ] **MRP-N5** / **MRP-N4** cross-import absent
- [ ] **MRP-N1** / **MRP-N2** in shared
- [ ] **MRP-M11** CI job fails on violation
- [ ] **MRP-M10** client production build checked where architecture requires

---

**Part of:** [README.md](README.md) — monorepo hub.
