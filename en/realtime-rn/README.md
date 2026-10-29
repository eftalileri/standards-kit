# Realtime transport (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** WebSocket, reconnect, auth, STOMP


Purpose: Normative single source of truth for client realtime transport on React Native / Expo. Default path uses platform WebSocket (no mandatory npm wrapper). Socket.IO or STOMP only when server requires it (Decisions / facts).

Normative part file: [`realtime-rn.md`](realtime-rn.md).

---

## Scope (hub)

- Included: Connection lifecycle, backoff, auth handshake after REST session, cleanup on unmount.
- Excluded: Server WebSocket implementation. Push notifications -- [expo notifications](../expo-notifications/README.md).

---

## Reading order (normative)

1. [realtime-rn.md](realtime-rn.md) -- Definitions (**RT-RN-D\***), **MUST** / **MUST NOT** (**RT-RN-M\*** / **RT-RN-N\***), agent contract (**RT-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **RT-RN-C\*** | Agent execution contract |
| **RT-RN-D\*** | Definitions |
| **RT-RN-M\*** | **MUST** |
| **RT-RN-N\*** | **MUST NOT** |

---

## Related

- [Auth](../auth/README.md) -- token for subprotocol headers.
- [Connectivity RN](../connectivity-rn/README.md) -- offline behavior.
- [TanStack Query](../tanstack-query/README.md) -- REST remains SSOT for server state; WS events invalidate queries per TanStack patterns.
