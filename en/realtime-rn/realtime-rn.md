# Realtime transport (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: client realtime transport obligations - one WebSocket authority, reconnect policy and authenticated session handling
open-when: shape:frontend-heavy, signal:websocket-client, signal:live-updates, signal:reconnect-backoff
skip-when: signal:backend-only, signal:polling-only
owns: RT-RN-C*, RT-RN-D*, RT-RN-M*, RT-RN-N*
```

References: [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket); React Native supports WebSocket in Hermes environments used by Expo.

---

## Definitions

| ID | Definition |
|----|------------|
| **RT-RN-D1** | Default transport means `WebSocket` constructor with explicit URL from config ([build environment](../build-environment/build-environment.md)). |
| **RT-RN-D2** | Reconnect policy means exponential backoff + jitter, cap max delay, reset on app foreground if product requires fresh session. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **RT-RN-C1** | Must not add Socket.IO client unless server protocol requires it -- document in Decisions / facts. |
| **RT-RN-C2** | Must close sockets on logout and clear listeners on unmount (no leaks). |

---

## **MUST**

| ID | Rule |
|----|------|
| **RT-RN-M1** | **MUST** use **RT-RN-D1** for new WebSocket clients unless **RT-RN-C1** exception applies. |
| **RT-RN-M2** | **MUST** implement **RT-RN-D2** or cite library that implements equivalent behavior. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **RT-RN-N1** | Must not send secrets in WebSocket URL query strings -- use headers / first message per server contract ([security](../security/README.md)). |
| **RT-RN-N2** | Must not duplicate REST authoritative state in WS only without TanStack cache alignment ([tanstack query](../tanstack-query/README.md)). |
