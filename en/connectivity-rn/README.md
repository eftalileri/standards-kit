# Connectivity (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** NetInfo, offline, online, reachability, retry UX


Purpose: Normative single source of truth for network-reachability signals and connectivity-aware user experience in React Native / Expo applications. Select one maintained connectivity provider compatible with the supported runtime and route all consumers through it.

Normative part file: [`connectivity-rn.md`](connectivity-rn.md).

---

## Scope (hub)

- Included: Subscription lifecycle, initial `fetch()`, offline banners / disabled actions, integration hints with [TanStack Query](../tanstack-query/README.md) networkMode (cite TanStack hub, do not duplicate server cache rules here).
- Excluded: HTTP client implementation -- API service layer. Server availability probing. WebSocket lifecycle -- [realtime RN](../realtime-rn/README.md).

---

## Reading order (normative)

1. [connectivity-rn.md](connectivity-rn.md) -- Definitions (**NET-RN-D\***), **MUST** / **MUST NOT** (**NET-RN-M\*** / **NET-RN-N\***), agent contract (**NET-RN-C\***).
2. [retry-rate-limit-ux-rn.md](retry-rate-limit-ux-rn.md) -- retry / 429 UX (**RRX-RN**-\* ) ; TanStack alignment.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **NET-RN-C\*** | Agent execution contract |
| **NET-RN-D\*** | Definitions |
| **NET-RN-M\*** | **MUST** |
| **NET-RN-N\*** | **MUST NOT** |
| **RRX-RN-M\*** / **RRX-RN-N\*** | Retry / rate-limit UX (retry-rate-limit-ux-rn.md ) |

---

## Related

- [TanStack Query](../tanstack-query/README.md) -- persist, refetch, networkMode.
- [Offline sync strategy RN](../offline-sync-strategy-rn/README.md) -- domain outbox rules.
- [Error handling](../error-handling/error-handling.md) -- user messaging when offline.
