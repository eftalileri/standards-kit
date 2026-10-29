# Connectivity (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: network reachability obligations - one NetInfo authority and connectivity-aware gating of critical flows
open-when: shape:frontend-heavy, signal:network-reachability, signal:offline-ui, signal:connectivity-gate
skip-when: signal:backend-only, signal:no-connectivity-branch
owns: NET-RN-C*, NET-RN-D*, NET-RN-M*, NET-RN-N*
```

References: [NetInfo (Expo)](https://docs.expo.dev/versions/latest/sdk/netinfo/).

---

## Definitions

| ID        | Definition                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NET-RN-D1** | Selected provider means the single maintained connectivity module chosen for the application runtime. In Expo, use the SDK-compatible package version and documented installation workflow. |
| **NET-RN-D2** | Connectivity-aware UI means user-visible indication or action gating when **NET-RN-D1** reports no Internet or unknown state for critical flows. |

---

## Agent execution contract

| ID        | Rule                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **NET-RN-C1** | Must not poll HTTP endpoints solely to detect offline when **NET-RN-D1** suffices -- reduces battery and server noise. |
| **NET-RN-C2** | Must unsubscribe NetInfo listeners on unmount (no listener leaks).                                                     |

---

## **MUST**

| ID        | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NET-RN-M1** | New reachability logic **MUST** consume the application selected provider (**NET-RN-D1**) through one shared authority. |
| **NET-RN-M2** | **MUST** map unknown / transition states to safe UX (retry, disabled submit) per [error handling](../error-handling/error-handling.md) -- no silent failure on ambiguous network. |
| **NET-RN-M3** | **MUST** bridge the server-state library reachability gate to **NET-RN-D1** when the client uses TanStack Query with `networkMode: 'offlineFirst'` / `refetchOnReconnect` ([query-client-and-keys **CLI-M1**](../tanstack-query/query-client-and-keys.md)): wire `onlineManager.setEventListener` to NetInfo in one authority module. On React Native the default `onlineManager` has no browser `online`/`offline` events, so without this bridge it reports online forever -- `refetchOnReconnect` never fires and queries never pause when truly offline (the declared offline-first policy is inert). The online predicate must follow **NET-RN-N1** (prefer `isInternetReachable`) and **NET-RN-M2** (ambiguous / unknown -> safe, non-blocking) -- must not treat unknown as offline (would freeze all requests). A second `setEventListener` wiring is forbidden (single authority). Application note — this predicate is not a classification discriminator. A bridge that resolves ambiguity to online is doing exactly what **NET-RN-M2** requires; but any layer that feeds it into an *error category* decision inherits a branch that is, by construction, almost never taken — and more so when the flow being classified already sits behind its own reachability gate, because that gate has proven the device online moments earlier. A "definitively offline -> expected" branch built this way is unreachable in practice while reading as coverage. The fix belongs in the classifying layer, which must pick a discriminator no upstream gate has already decided (for example repetition across process lifetimes -- [app lifecycle](../app-lifecycle-rn/app-lifecycle-rn.md) **ALS-RN-M5**); the bridge itself is not narrowed to make that branch fire, since narrowing it would pause every request on an ambiguous network. |
| **NET-RN-M4** | **MUST** classify no-response HTTP client errors (for example Axios `ERR_NETWORK` / `ECONNABORTED`) as connectivity/transport unless a backend response or app stack proves otherwise. They may be logged as WARN with endpoint/method/timeout metadata, but they must not create crash-reporting events in the application's selected observability provider; retry state and cached UI are the recovery surface. |
| **NET-RN-M5** | **MUST** show user copy that blames the user's internet ("check your connection", "no internet") only when the **NET-RN-D1** authority reports the device definitively offline (the bridge's online predicate is false) at the time of the failure; a transport failure while online or unknown (server down/redeploy, timeout, DNS/TLS) gets server-side copy ("the server can't be reached right now, try again shortly"). Transport-ness and offline-ness are separate decisions read from the single classifier and the single connectivity authority — never re-derived from error text or a second NetInfo read per screen. A deliberate request cancellation is neither and shows no message. Reason: a transport failure says nothing about the device's network; blaming it sends users to fix the wrong thing. |


---

## **MUST NOT**

| ID        | Rule                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **NET-RN-N1** | Must not assume Wi-Fi means Internet -- validate with **NET-RN-D1** isInternetReachable semantics per library docs. |
| **NET-RN-N2** | Must not block UI thread with synchronous heavy work in NetInfo handlers.                                       |
