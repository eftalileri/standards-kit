# App lifecycle (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** AppState, foreground, background, cleanup, refresh


Purpose: Normative single source of truth for foreground / background transitions, subscription cleanup, and refresh policy hooks on React Native / Expo. Complements [realtime RN](../realtime-rn/README.md), [connectivity RN](../connectivity-rn/README.md), [offline sync strategy RN](../offline-sync-strategy-rn/README.md), [TanStack Query](../tanstack-query/README.md) — does not replace their **MUST** rows.

Normative part file: [`app-lifecycle-rn.md`](app-lifecycle-rn.md).

---

## Scope (hub)

- Included: `AppState` listeners, socket / listener teardown rules, foreground refetch alignment with TanStack.
- Excluded: iOS / Android OS background execution limits (document in architecture ); push payload handling — [expo notifications](../expo-notifications/README.md).

---

## Reading order (normative)

1. [app-lifecycle-rn.md](app-lifecycle-rn.md) -- Definitions (**ALS-RN-D\***), **MUST** / **MUST NOT** (**ALS-RN-M\*** / **ALS-RN-N\***), agent contract (**ALS-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **ALS-RN-C\*** | Agent execution contract |
| **ALS-RN-D\*** | Definitions |
| **ALS-RN-M\*** | **MUST** |
| **ALS-RN-N\*** | **MUST NOT** |

---

## Related

- [Realtime RN](../realtime-rn/README.md) -- WebSocket lifecycle.
- [Connectivity RN](../connectivity-rn/README.md) -- NetInfo listeners.
- [TanStack Query](../tanstack-query/README.md) -- refetchOnWindowFocus / focus behavior.
