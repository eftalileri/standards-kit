# Zustand — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: ZST-C / ZST-G / ZST-N cross-cutting client-state obligations and the zustand version gate
open-when: shape:frontend-heavy, signal:client-state-store, signal:zustand-store
skip-when: signal:backend-only, signal:no-client-state-change
owns: ZST-C3, ZST-C7, ZST-G1, ZST-G2, ZST-G3, ZST-G4, ZST-G5, ZST-N1, ZST-N2, ZST-N3, ZST-N4, GZ1, GZ2, GZ3, GZ4, GZ5, GZ6
```

Scope

- Included: Cross-cutting rules for Zustand as client state: precedence, agent contract, technology version gate, global **MUST** / **MUST NOT**. Server state and TanStack rules are not duplicated — see [store-boundaries.md](store-boundaries.md).
- Excluded: Per-store persist shape (ZSP-\*), selector mechanics (ZSS-\*), action error shape detail (ZSA-\*). Form field rules: [forms](../forms/forms.md). MMKV adapter and retention: [mmkv](../mmkv/README.md) (MMK- / MMI- / MMA- / MMR-\*).

Document type: Normative — core for the Zustand topic.

Environment: Applies to browser and native applications using Zustand for client-side state, with optional persistence.

Binding principle: Mirroring TanStack Query cache into Zustand, fetching inside `create()`, or bypassing the version gate is a bug. Remedy: fix code or update these documents.

---

## Rule identifiers (normative)

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| **ZST-C**\* | This file only | Agent execution contract. |
| **ZST-G**\* | This file only | Global **MUST**. |
| **ZST-N**\* | This file only | Global **MUST NOT**. |
| ZSB-\* | [store-boundaries.md](store-boundaries.md) | Server ban, orchestration boundary — only there. |
| ZSP-\* | [store-persist-and-module.md](store-persist-and-module.md) | Persist, module layout, reset, UI/domain split — only there. |
| ZSS-\* | [selectors-and-hooks.md](selectors-and-hooks.md) | Selectors, useShallow — only there. |
| ZSA-\* | [store-actions-logging.md](store-actions-logging.md) | Actions, throws, TSDoc, logger — only there. |

Citations **must** use these IDs (e.g. **ZSB-M1**, not a bare **M1**).

Rule locality: A behavior class **must not** be split across two part files. The hub [README.md](README.md) has no **MUST** / **MUST NOT** rows. Each part file includes Compliance tying violations to **ZST-C4** / **ZST-C11**.

---

## References

- [README.md](README.md) — reading order (non-normative).
- [Decision matrix](../decision-matrix/decision-matrix.md) — when Zustand applies.
- [TanStack Query](../tanstack-query/README.md) — server state SSOT.
- [Forms](../forms/forms.md) — form state vs Zustand per matrix.
- [Code modularity](../code-modularity/code-modularity.md) — COD-\* for store modules.
- [Error policy](../error-policy/error-policy.md), [Decision functions](../decision-function/decision-function.md) — null / validation semantics for ZSA-\*.
- [Logging policy](../logging-policy/logging-policy.md) — structured logs (ZSA-\*).
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [Ui-persist-offline](../tanstack-query/ui-persist-offline.md) — isRestoring / loading union with hasHydrated
- The adopting project's architecture documentation for cache orchestration

Code samples: [`../_meta/examples/zustand-code-samples.md`](../_meta/examples/zustand-code-samples.md) (non-normative). Decision routing: [§ Decision gates](#decision-gates-normative-index).

---

## Agent execution contract

See [_meta/agent-contract.md](../_meta/agent-contract.md) for shared **C1-C12** rules, including the Resolution paragraph that defines the `ZST-C<n>` spelling. Hub-specific additions:

- **ZST-C3**: Precedence — STATE > BEHAVIOR > UI, then TanStack Query > Zustand > Form > Routing > Performance
- **ZST-C7**: Version compatibility is part of the standard — use the major version assumed by the APIs in scope, or document and verify equivalent behavior for the installed version.
- **ZST-N1**: No parallel client-state library for same concern per decision matrix

---

## Technology

| Topic | Rule |
|-------|------|
| Client state | `zustand` version compatible with the APIs used (**ZST-G1**). |
| Persist storage | [MMKV kit](../mmkv/README.md) for RN backing + project adapter; ZSP-\* for middleware shape. |

---

## **MUST** (global)

ZST-G1: The installed Zustand version **must** support the APIs and behavior relied on by the adopting codebase. If an in-scope rule depends on a version-specific API, use that version or document and verify an equivalent; do not silently apply assumptions from another major version (**ZST-C10**).

ZST-G2: Shipped store modules in scope **must** keep ESLint and TypeScript clean (zero new errors) for the project toolchain.

ZST-G3: Form composition (when the matrix sends you to forms) **must** follow forms — no duplicate form SSOT here.

ZST-G4: Do not add a new create() store for state scoped to one component subtree, with no persistence, and not shared across features — useState / useReducer. Where decision matrix assigns Zustand (UI state, local state, preferences, auth, selection, etc.), use Zustand per row and **ZST-G5**.

ZST-G5: New create() store **must** be justified by a decision matrix row, architecture doc, or Decisions / facts entry (store name + responsibility); prefer extending an existing domain store when the same aggregate boundary applies — no ad hoc store-per-screen without record.

---

## **MUST NOT** (global)

ZST-N1: Use another client-state library as the primary store for the same concern where the matrix assigns Zustand — forbidden (pick one stack per decision matrix).

ZST-N2: Scatter Zustand rules for one domain across ad hoc docs — store rules only in this folder's part files (Rule identifiers).

ZST-N3: Store fields that are purely computable from TanStack query data, route params, props, or other already-stored Zustand slices without independent mutating lifecycle — forbidden as persisted authoritative columns; derive with selectors, hooks, or inline memo (ZSS-* consumption).

ZST-N4: Store module A **must not** import store module B to call getState / setState on B inside A's action definitions — forbidden (hidden coupling, cycles); compose in React hook modules, event handlers, or a documented non-store orchestrator file that may read multiple stores at call time.

---

## Decision gates (normative index)

Purpose: Use the decision matrix to route a concern to Zustand, component/local state, form state, or the project's selected server-state system. These gates cite existing IDs and add no obligations; if no owner is clear, resolve the architecture before creating a store.

GZ1: Proceed with Zustand only if YES -> The decision matrix or architecture assigns client state to Zustand for this concern. [Binding: **ZST-G5**, **ZST-C1**] [If NO: Follow the matrix to the owning layer — component/local state, form state, or the selected server-state system.]

GZ2: Proceed with Zustand only if YES -> Either the matrix assigns Zustand for this concern or the state is truly single-subtree ephemeral (then useState, not a new store). [Binding: **ZST-G4**, **ZST-G5**] [If NO: Use the layer assigned by the decision matrix; do not open a Zustand store.]

GZ3: Proceed with Zustand only if YES -> The concern is not server-authoritative entity-list or API-payload state. [Binding: **ZSB-M1**, **ZSB-N1-ZSB-N4**] [If NO: Use the project’s selected server-state system; TanStack Query is appropriate only when the architecture selects it.]

GZ4: Proceed with Zustand only if YES -> Field is not pure derivative of other sources. [Binding: **ZST-N3**] [If NO: Derive only]

GZ5: Proceed with Zustand only if YES -> No store-to-store imports for sync logic. [Binding: **ZST-N4**] [If NO: Hook / orchestrator composition]

GZ6: Proceed with Zustand only if YES -> Persist subset passes partialize and **ZSP-N4**. [Binding: **ZSP-M2**, **ZSP-N4**] [If NO: Memory-only / narrow partialize]

---

## Implementation checklist (core)

- [ ] **ZST-G1** / **ZST-C10** version compatibility gate
- [ ] Decision gates GZ1–GZ6 for new stores / features
- [ ] **ZST-G4** / **ZST-G5** justification and useState default
- [ ] **ZST-N3** / **ZST-N4** derived and cross-store
- [ ] **ZST-N1** / **ZST-N2** stack and locality

---

Older local Zustand guidance is historical; use this folder as the current source.
