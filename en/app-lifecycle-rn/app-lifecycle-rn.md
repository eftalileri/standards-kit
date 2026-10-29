# App lifecycle (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: foreground and background transition obligations - one AppState handler, subscription cleanup, refresh policy and when a downloaded over-the-air update may restart the runtime
open-when: shape:frontend-heavy, signal:appstate-transition, signal:background-foreground, signal:subscription-cleanup
skip-when: signal:backend-only, signal:no-lifecycle-subscription
owns: ALS-RN-C*, ALS-RN-D*, ALS-RN-M*, ALS-RN-N*
```

References: [React Native AppState](https://reactnative.dev/docs/appstate).

---

## Definitions

| ID | Definition |
|----|------------|
| **ALS-RN-D1** | A transition handler is one module or a documented set coordinating `AppState` cleanup and refresh. A set **MUST** have one named authority listing every member, the OS lifecycle fact it measures, and why canonical focus/connectivity cannot carry that fact. Membership follows the datum, not timing: consumers needing only refetch focus use the canonical authority (**ALS-RN-M4**); consumers requiring the OS fact may read it directly. Any membership check SHOULD read that same set authority ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). |
| **ALS-RN-D2** | Sensitive connection means an open WebSocket ([realtime RN](../realtime-rn/realtime-rn.md)) or long-lived subscription (NetInfo, push token watchers ) that must not leak across unmount / background without policy. |


---

## Agent execution contract

| ID | Rule |
|----|------|
| **ALS-RN-C1** | Must unsubscribe `AppState` listeners on unmount (no duplicate subscriptions on hot reload without cleanup ). |
| **ALS-RN-C2** | Must not duplicate [TanStack Query](../tanstack-query/README.md) focus refetch policy in ad-hoc `useEffect` without documented reason (Decisions / facts ). |

---

## **MUST**

| ID | Rule |
|----|------|
| **ALS-RN-M1** | **MUST** route **ALS-RN-D2** cleanup through **ALS-RN-D1** or document why a subsystem owns its own listener (and prove unsubscribe ). |
| **ALS-RN-M2** | **MUST** close or pause WebSocket clients on background when the product policy requires (battery / privacy ) — record the policy in the project's lifecycle documentation or architecture (default : keep connection only if server / product requires real-time while backgrounded ). |
| **ALS-RN-M3** | **MUST** invalidate or refetch TanStack Query data on foreground when stale data could mislead the user (align with [TanStack Query](../tanstack-query/README.md) persist / staleTime ). |
| **ALS-RN-M4** | When authenticated foreground/reconnect is a durable business-resume signal, the client **MUST** consume the existing canonical session, focus, and connectivity authorities instead of opening parallel `AppState`/NetInfo state. It **MUST** wait for runtime-validated backend acceptance before treating the signal as durable, keep offline/unaccepted work retryable at the next safe connectivity transition, and deduplicate by a server-owned session identity. Sampled or fire-and-forget analytics **MUST NOT** substitute for the operational command. |
| **ALS-RN-M5** | Downloaded updates **MUST** follow clauses (a)–(i) below: one update authority, background-only restart, classified step failures, durable counters, bounded check opportunities and a native launch wait for the newest update. |

<a id="als-rn-m5--update-authority"></a>

### Update authority — [**ALS-RN-M5**](#must) clauses

(a) The runtime **MUST NOT** restart in the foreground. The update authority downloads once, applies only inside the single `AppState` listener on transition to `background`, registered once per process (**ALS-RN-N1**), or leaves application to the library's next cold start. It **MUST NOT** re-check or re-download while application is pending. If requests or mutations remain in flight, skip restart and keep the listener armed for the next transition.

(b) Check, download and restart failures **MUST** use a typed carrier containing step, structural library code and category from the single client's total classification map ([**COB-RN-M6**](../client-observability-rn/classification-authority-and-outbound-links.md)). A discriminator **MUST NOT** reuse a fact already decided by an upstream gate. Behind a reachability gate, connectivity at failure time is diagnostic only; message text is not evidence of a native cause that JavaScript cannot receive.

(c) The update authority alone writes a persistent per-step consecutive-failure counter and last-success time, resetting on every successful step. Check/download with that step's own code below threshold is `OPERATIONAL`. Reaching threshold, exceeding the success-staleness bound, unreadable/unwritable counters, any restart rejection or any other code is `SYSTEM`; an unproven state **MUST NOT** be demoted. Threshold and staleness bound **MUST** be recorded at their definition as chosen, measurable and reviewable, and included in events.

(d) Check cadence **MUST NOT** depend only on process-start flags. Cold start and return to foreground are opportunities; foreground comes from the canonical signal (**ALS-RN-M4**), not a second listener. The authority alone decides the minimum interval; callers merely report opportunities ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

(e) The chosen interval's definition states what would raise it (update-server request volume), what would lower it (published-update delivery delay), and when those values cannot be measured from source. The waiting window starts only when a check actually starts; reachability rejection does not consume it. The window remains process-local so cold-start checks are not suppressed. An in-flight gate prevents coincident opportunities from duplicating a step or failure count.

(f) Thresholds count check opportunities, not cold starts. A cadence change **MUST** update that meaning at the definition and measure the fastest path to threshold. A source that accelerates only the slowest path may keep the number; one shortening the fastest path may not.

(g) Background-guarded restart syntax and update-library loading should be fenced by the adopting project's enforcement mechanism; record its actual scope and limits. Counter single-writer ownership remains the update authority's obligation. In-flight exclusion, one registration and total step mapping are held by its code and types. Aliased restart references and computed member names are outside a syntax lock's coverage.

(h) A static total map does not prove its discriminator fires in released operation. Release telemetry answers whether classification branches fire; syntax proves only ownership and map totality.

(i) A cold start **MUST** load the newest published update before JavaScript runs through the update library's own bounded launch wait (Expo `updates.fallbackToCacheTimeout` > 0, `checkAutomatically: ON_LOAD`). Otherwise a fresh store install runs the binary's stale embedded bundle exactly during onboarding. On timeout the library launches the cached bundle and applies the download on the next cold start. Startup **MUST NOT** emulate this with a JavaScript check-then-restart, because that is a foreground restart under (a). The wait is a native binary setting, so a change reaches users only with a new store build. Update checks **MUST NOT** be restricted to Wi-Fi; any proven-reachable network qualifies, and unknown reachability does not.


---

## **MUST NOT**

| ID | Rule |
|----|------|
| **ALS-RN-N1** | Must not leave duplicate NetInfo / `AppState` listeners after navigation unmount (memory / duplicate events ). |
| **ALS-RN-N2** | Must not run heavy synchronous work on the JS thread in `AppState` handlers without yielding (blocks UI ). |
