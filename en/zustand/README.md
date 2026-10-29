# Zustand (kit hub)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** client state, store, selector, useShallow, persist, hasHydrated

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: ZSB- / ZST- boundary index and client reading order).

English source of truth for client state with Zustand.

This file is not normative. Binding rules live only in the linked files below.

## Agent TL;DR

- Zustand for client UI state only (ZSB-*: no authoritative server state, no API calls). The server-state system selected for the project owns server-backed data; TanStack Query is that owner when it is the selected system. Follow **ZST-G1** for compatibility with the installed version.
- Selectors + `useShallow` follow ZSS-*. Persist through the adapter chosen for the platform (MMKV for applicable React Native projects; ZSP-*); local `hasHydrated` **must** never stand in for current remote/bootstrap readiness (**ZSP-M7**/**N5**). Actions **must** throw on invalid input (ZSA-*).
- Decision gates: GZ1–GZ6 (in zustand.md).

---

## Reading order

1. [zustand.md](zustand.md) — Core: **ZST-C**\*, **ZST-G**\*, **ZST-N**\*, Decision gates (GZ1–GZ6), version gate, precedence, rule-prefix map.
2. [store-boundaries.md](store-boundaries.md) — Server-state ban, this kit's TanStack-specific alignment, forbidden async/API (ZSB-\*); apply the relevant server-state boundary for the system selected by the project.
3. [store-persist-and-module.md](store-persist-and-module.md) — File layout, persist/rehydration, hasHydrated, reset, UI vs domain split (ZSP-\*).
4. [selectors-and-hooks.md](selectors-and-hooks.md) — Selectors, `useShallow`, subscription rules (ZSS-\*).
5. [store-actions-logging.md](store-actions-logging.md) — Actions, null/decision throws, TSDoc, logger (ZSA-\*).

Code samples (non-normative): [`../_meta/examples/zustand-code-samples.md`](../_meta/examples/zustand-code-samples.md).

---

## Related standards

- [Decision matrix](../decision-matrix/decision-matrix.md)
- [TanStack Query](../tanstack-query/README.md) — relevant when selected as the project's server-state system
- [MMKV (persist backing)](../mmkv/README.md)
- [Forms](../forms/forms.md)
- [Code modularity](../code-modularity/code-modularity.md)
- [Error policy](../error-policy/error-policy.md) / [Decision functions](../decision-function/decision-function.md)
- [Logging policy](../logging-policy/logging-policy.md)
- [Auth (client integration)](../auth/README.md) — auth slice + tokenManager vs TanStack mutations

---

Older local Zustand guidance is historical; use this folder as the current source.
