# Retry and rate-limit UX (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: user-visible retry and rate-limit obligations - what the screen shows while a query retries and on HTTP 429 or 5xx
open-when: shape:frontend-heavy, signal:retry-ux, signal:rate-limit-response, signal:offline-ui
skip-when: signal:backend-only, signal:no-retry-surface
owns: RRX-RN-D*, RRX-RN-M*, RRX-RN-N*
```

Scope: User-visible behavior when TanStack Query retries, HTTP 429 / 5xx, or connectivity flaps — complements [connectivity-rn](connectivity-rn.md) (reachability ) and [TanStack Query](../tanstack-query/README.md) (retry / refetch ).

Document type: Normative part file under [README](README.md).

References: [connectivity-rn.md](connectivity-rn.md); [TanStack Query](../tanstack-query/README.md); [error-handling](../error-handling/error-handling.md).

---

## Definitions

| ID | Definition |
|----|------------|
| **RRX-RN-D1** | Automatic retry means library-driven retry (TanStack `retry`, fetch wrapper ) without an extra user tap. |
| **RRX-RN-D2** | Rate-limited means HTTP 429 or documented equivalent (Retry-After ). |

---

## **MUST**

| ID | Rule |
|----|------|
| **RRX-RN-M1** | **MUST** surface **RRX-RN-D2** to the user as non-blocking (**EHX-D1** per [error display UX](../error-handling/error-display-ux.md)) or inline status — must not spin forever without copy ([error-handling](../error-handling/error-handling.md) M4 ). |
| **RRX-RN-M2** | **MUST** cap automatic retries per [TanStack Query](../tanstack-query/README.md) defaults or documented project policy — after cap, show Retry action (**EHX-D3** ) for blocking loads. |
| **RRX-RN-M3** | **MUST** disable all controls that can launch the same submission class while mutation is pending ([forms](../forms/forms.md) alignment ) and acquire a synchronous single-flight gate in the outermost CTA handler, before the first await/state-render boundary or any asynchronous preflight/referral/downgrade callback for payment/store commands — the authoritative gate **MUST** outlive a screen/hook mount and remain process-scoped (or stronger) until the store promise settles, so back-navigation/remount cannot reset it. The gate input **MUST** carry the exact actor + tenant scope rendered by that CTA and fail closed unless it still equals the current authenticated actor + active tenant; after provider identity readiness completes and immediately before the native store call, the same exact scope **MUST** be re-read and revalidated to close stale-render/scope-switch races. A screen-local ref MAY provide immediate UI suppression but is not the command authority. Disabling only the selected button or relying on React state, a serialized provider queue, or retry alone does not prevent a same-frame, another-card, stale-render, or remount-triggered double purchase. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **RRX-RN-N1** | Must not fire unbounded automatic retries on 401 / 403 without [auth / security](../security/README.md) token policy (refresh vs logout ). |
| **RRX-RN-N2** | Must not show “ Network request failed ” alone without recovery path ([error-handling](../error-handling/error-handling.md) M8 ). |
