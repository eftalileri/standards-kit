# Offline sync strategy (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** outbox, mutation queue, TanStack persist, MMKV, conflict


Purpose: Normative single source of truth for domain offline sync patterns ( outbox, conflict policy hooks) on top of existing matrix rows: TanStack Query persist, MMKV, Zustand persist. Does not replace Data from API / Persist (server state) rows -- complements them.

Normative part file: [`offline-sync-strategy-rn.md`](offline-sync-strategy-rn.md).

---

## Scope (hub)

- Included: Mutation queueing when offline, idempotency keys alignment with [idempotency](../idempotency/README.md), server wins / client wins policy documentation.
- Excluded: Replacing TanStack Query with custom fetch layer. Backend sync engine design.

---

## Reading order (normative)

1. [offline-sync-strategy-rn.md](offline-sync-strategy-rn.md) -- Definitions (**OSS-RN-D\***), **MUST** / **MUST NOT** (**OSS-RN-M\*** / **OSS-RN-N\***), agent contract (**OSS-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **OSS-RN-C\*** | Agent execution contract |
| **OSS-RN-D\*** | Definitions |
| **OSS-RN-M\*** | **MUST** |
| **OSS-RN-N\*** | **MUST NOT** |

---

## Related

- [TanStack Query](../tanstack-query/README.md) -- [ui-persist-offline.md](../tanstack-query/ui-persist-offline.md).
- [MMKV](../mmkv/README.md).
- [Connectivity RN](../connectivity-rn/README.md).
- [Idempotency](../idempotency/README.md) -- server keys.
