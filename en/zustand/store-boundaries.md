# Zustand — store boundaries (client vs server)

```kit-cover
type: normative
part-of: README.md
binds: ZSB obligations - what must never live in a client store, and the SSoT boundary between store state and the server cache
open-when: shape:frontend-heavy, signal:frontend-ui, signal:client-state-store, signal:server-cache-boundary, signal:duplicate-writer
skip-when: signal:backend-only, signal:no-client-state-change
owns: ZSB-M1, ZSB-M2, ZSB-M3, ZSB-M4, ZSB-N1, ZSB-N2, ZSB-N3, ZSB-N4
```

Scope: Only what **must not** live in Zustand (server state), SSoT vs TanStack cache, orchestrator boundary, and startup alignment with TanStack restore flags. Excluded: Persist file layout ([store-persist-and-module.md](store-persist-and-module.md)); selectors ([selectors-and-hooks.md](selectors-and-hooks.md)).

Rule prefix: **ZSB-M**\* / **ZSB-N**\* — rules in this file only.

Environment: Applies to client runtime and network boundaries in store code.

Compliance: Violations are bugs; **must not** ship; STOP dependent work — [zustand.md](zustand.md) **ZST-C4**, **ZST-C11**.

Version compatibility: Follow [zustand.md](zustand.md) **ZST-G1** / **ZST-C10** for the installed major version.

---

## **MUST**

| ID | Rule |
|----|------|
| **ZSB-M1** | Server-backed lists, entities, and API payloads **must** use [TanStack Query](../tanstack-query/README.md) per [decision matrix](../decision-matrix/decision-matrix.md) — not Zustand as authoritative copy. |
| **ZSB-M2** | Data already in TanStack Query cache **must not** be duplicated into Zustand for convenience — single SSoT for server rows (cache drift otherwise). |
| **ZSB-M3** | App bootstrap UI **must** treat Zustand `hasHydrated` (when persist applies) and TanStack `isRestoring` / persist restore per [ui-persist-offline **UIP-M2**](../tanstack-query/ui-loading-and-persist-options.md) as one loading union — no flash of stale client flags before rehydrate completes. |
| **ZSB-M4** | Post-mutation server cache sync **must** run through TanStack + domain orchestrators per [mutations-cache-sync.md](../tanstack-query/mutations-cache-sync.md) — orchestrators **must not** directly mutate Zustand as a substitute for invalidate / refetch. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **ZSB-N1** | `async` / `await`, Promise-based network work, or I/O inside `create()` store actions — forbidden; use TanStack + services. |
| **ZSB-N2** | `fetch`, `axios`, `apiClient`, or equivalent HTTP clients inside the store module — forbidden. |
| **ZSB-N3** | `useQuery`, `useMutation`, or `queryClient` inside store definition or store-owned modules — forbidden; hooks stay in components / hook modules. |
| **ZSB-N4** | Navigation (`navigate`, router, `useNavigation`) inside store actions — forbidden; UI layer or dedicated hook orchestrates navigation after set. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Unclear if data is server or client | STOP — resolve with [decision matrix](../decision-matrix/decision-matrix.md) or user ([gray-situation](../agent-gray-decisions/gray-situation-decisions.md)). |
| Detected cache mirror in Zustand | **ZSB-M2** violation — remove mirror, read from TanStack. |

---

## Implementation checklist

- [ ] **ZSB-M1** / **ZSB-N1**–**ZSB-N4** no server pattern in stores
- [ ] **ZSB-M2** no TanStack duplicate
- [ ] **ZSB-M3** bootstrap flags aligned with **UIP-M2**

Verification: Check the adopting project's store modules and import graph for asynchronous I/O, HTTP clients, TanStack hooks, and QueryClient access.

---

Part of: [README.md](README.md) — Zustand SSOT.
