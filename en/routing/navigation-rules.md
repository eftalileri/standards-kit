# Routing — **MUST** / **MUST NOT** rows and failure paths

```kit-cover
type: normative
part-of: README.md
binds: RTG-M and RTG-N obligations - navigation call sites, central route typing, sync guards, param validation, session reset, flow ownership, idempotency, hardware back and the failure paths those rows drive
open-when: shape:frontend-heavy, signal:navigation-change, signal:deep-link-open, signal:route-guard, signal:route-params, signal:hardware-back
skip-when: signal:backend-only, signal:no-navigation-change
owns: RTG-M1, RTG-M2, RTG-M3, RTG-M4, RTG-M5, RTG-M6, RTG-M7, RTG-M8, RTG-M9, RTG-M10, RTG-M11, RTG-M12, RTG-M13, RTG-M14, RTG-M15, RTG-M16, RTG-M17, RTG-M18, RTG-M19, RTG-N1, RTG-N2, RTG-N3, RTG-N4, RTG-N5, RTG-N6
```

Scope: The **RTG-M** / **RTG-N** rule pair for React Native navigation, the normative failure-path list those rows route to, and the two one-row policy sections that restate **RTG-M10** (modal vs push) and **RTG-M14** / **RTG-M15** / **RTG-N6** (hardware back). Predicates (**RTG-T-STAB**-\*), gates (GRTG\*), the agent contract (**RTG-C\***) and the guard model live in [routing.md](routing.md).

Document type: Normative part file under [README](README.md) — **RTG-M1**–**RTG-M19**, **RTG-N1**–**RTG-N6**.

Compliance: Violations of **RTG-M** / **RTG-N** are bugs; must not ship; STOP dependent work until fixed, as required by [routing.md](routing.md) **RTG-C6** and **RTG-C11**.


References: [README.md](README.md); [routing.md](routing.md); [navigation-flow-and-layout.md](navigation-flow-and-layout.md) (call order, deep linking, file layout, hardware back).

---

## **MUST** (normative) — **RTG-M**

RTG-M1: Navigate only after GRTG1 would be YES for this orchestrator (**RTG-T-STAB-1-3** + notes). [Consequence: Bug — must not ship; STOP dependent work (**RTG-C11**)] [Verify: Confirm navigation cannot occur while a mutation or query required by the flow is unresolved, using the adopting project's configured checks or an explicit review predicate.]


RTG-M2: Navigation calls live only in UI components/hooks or one orchestrator/policy module per flow, not in raw service modules or API clients. [Consequence: Bug — must not ship] [Verify: Review the dependency boundary and use the adopting project's configured import-boundary checks where available. Any exception must be documented by the architecture.]

RTG-M3: All routes and parameter-list types are defined centrally (see File layout). [Consequence: Bug — must not ship] [Verify: Inspect the architecture's route-type authority and confirm callers use typed route names and parameters.]

RTG-M4: Protected routes use deterministic synchronous guards (Guard model). [Consequence: Bug — must not ship] [Verify: Confirm guards are synchronous, deterministic, and free of network, navigation, and store mutations.]

RTG-M5: Params are runtime-validated before the screen renders business UI (schema/predicate); invalid params lead to redirect/fallback, not a partial render with undefined identifiers. [Consequence: Bug — must not ship] [Verify: For each route with required params, confirm validation occurs before child data access.]

**RTG-M5** required-input entry application. An action on a read-only summary whose destination requires a user-selected input enters the existing selection surface; it must not treat the reporting period, current clock or arbitrary default as that user's command. Validate the required input at the common route entry before mounting the business child and its fetching/selection hooks. A later submit rejection cannot close a form the user cannot complete. Missing or invalid input yields an explicit, localized, completable route to the same role's selection authority; independently valid route params remain intact. The fallback's own diagnostic consumes the canonical no-throw classification entry so a reporting-sink fault cannot replace that selectable UI. A command coalescing latch belongs to the focused entry's lifetime: returning to a still-mounted fallback restores retry without writing any required input.

RTG-M6: Deep-link paths map to route names and params through one linking configuration; after parsing, **RTG-M5** applies. [Consequence: Bug — must not ship] [Verify: Confirm the configured linking authority uses the same route-parameter types as the navigator.]


RTG-M7: After login, logout, or session switch, use the stack reset/replace policy so Back cannot return to prior-session screens. [Consequence: Bug — must not ship; security/privacy defect if violated] [Verify: Inspect each session transition and confirm it removes routes belonging to the prior session.]

RTG-M8: The same guard, params, and relevant state snapshot must produce the same navigation decision (deterministic policy). [Consequence: Bug — must not ship] [Verify: Confirm the decision depends only on explicit inputs and has no clock, randomness, or hidden mutable-state dependency.]


RTG-M9: Multi-step conditional flows use one orchestrator hook or policy module, not scattered navigation chains inside presentational components. [Consequence: Bug — must not ship] [Verify: Confirm the flow has one navigation owner and presentational components delegate to it.]

RTG-M10: The application's navigator hierarchy (stack/modal/tabs) and push-vs-modal choice must be documented by its routing architecture; new screens follow that pattern. [Consequence: Bug — must not ship] [Verify: Consult the adopting project's routing or architecture documentation for the applicable hierarchy and policy.]

RTG-M11: Screen components and route keys follow one naming convention documented with the central route table. [Consequence: Process bug — align before shipping] [Verify: Review route declarations and screen exports against the adopted naming convention.]

RTG-M12: Single owner per navigation flow: exactly one module (component or orchestrator hook) may trigger navigation for that flow; do not create parallel triggers such as duplicate effects or a component plus a second orchestrator. [Consequence: Bug — must not ship; double-navigation risk] [Verify: Use the adopting project's flow map or code review to confirm one owner for each flow.]

RTG-M13: Idempotency: for one frozen guard/param/state snapshot, perform at most one equivalent navigation/reset for the same target. Use the navigator's current-state API, an in-flight guard, or an equivalent documented mechanism. [Consequence: Bug — must not ship; UI flash / stack-corruption risk] [Verify: Confirm duplicate invocation with the same inputs is ignored or coalesced by the selected mechanism.]


RTG-M14: Hardware back and platform equivalents must follow the adopting application's documented policy: (1) a focused modal/sheet dismisses first; (2) the inner stack pops next; (3) at a root tab/stack, exit or no-op follows product policy. Use navigation defaults or platform back handlers where needed. [Consequence: Bug — unpredictable back stack / modal traps] [Verify: Consult the routing policy and confirm custom back handlers follow it.]

RTG-M15: When a screen uses a custom back handler or `beforeRemove`, document the precedence order (modal > inner stack > tabs > root) and unregister the listener on unmount. [Consequence: Bug — ghost listeners / wrong pop order] [Verify: Confirm every registration has a corresponding cleanup in the owning component/effect.]

RTG-M16: A task that an application asks a user to complete must have a durable entry point in primary navigation; a dismissible prompt is a reminder, not the only way to reach the task. Entry visibility must follow the same authority that determines whether the task remains open. Derive any displayed progress count from the task's authoritative catalogue rather than a hard-coded total. The destination must clearly identify the task. [Consequence: Bug — a requested task becomes unreachable after its prompt is dismissed] [Verify: Review the navigation graph, entry-visibility condition, count source, and destination copy together. This graph and runtime predicate need product-aware review beyond a single-file check.]

RTG-M17: A screen's exit that runs later than the user's press on that screen — after an `await`, from a dialog button, from an effect or a route gate — **MUST** close only that screen's own route and only while it is the top of its stack; it **MUST NOT** call plain `goBack()` / `pop()` / `replace()` on the screen's `navigation`. In React Navigation 7 those actions carry `source` but no `target`, and the stack router then acts on whatever route is currently on top: a second or late exit from a screen that has already closed (double submit, the "OK" of a dialog that outlived its screen, a gate running during the closing animation) closes the screen underneath and the user lands one level too far back. Use the adopting project's own-route exit authority, which dispatches with `target` = the stack key and `source` = the route key. [Consequence: Bug — must not ship; user thrown out of the list they came from] [Verify: Review: deferred exits in a changed screen go through the own-route authority]

RTG-M18: In a browser build the address bar **MUST** carry only route paths and params that are not personal data; a param whose value is or can embed a phone number, a name or another person's identifier (including an entity id built from them) **MUST NOT** be written to the path or the query — the route gets an id-free path, and opening that path from the address bar opens the route's param-free parent. URL entry **MUST** be admitted only for the address the document was loaded with (typed, bookmarked, reloaded or opened while signed out) and only into the currently mounted role tree; any other history entry the mounted container does not know (one from before a sign-out, a session takeover or a tenant or panel switch) **MUST** open the role home with the root address. Reason: the address bar is kept in browser history, synced across devices and written to the static host's request log, and back/forward must never reopen another session's screen (**RTG-M7**). [Consequence: Bug — must not ship; privacy / session class defect if violated] [Verify: Review: every params schema in the linking map names only non-personal fields; the browser linking admits only the document entry path]

RTG-M19: Every presentation of a role's navigation (a phone menu list, a wide side navigation or rail) **MUST** read one menu source per role that owns each row's visibility, title, target and placement; a presentation **MUST NOT** add, hide or reorder rows on its own, and a row whose action needs a handler only one presentation can run **MUST** be absent from the others rather than drawn as a dead row. A wide navigation shell **MUST** wrap the same navigator (no second navigator), and opening a side-nav destination **MUST** return the stack to its home before pushing, so back never walks through side-nav hops. How a stack route is presented on a wide layout (page, centred window, detail panel, detail pane of its master, side navigation shown) **MUST** come from one route-presentation table applied once in the stack's screen options and screen layout; a screen **MUST NOT** draw its own scrim, window or panel box around its route, and closing that frame (close button, scrim, Esc) **MUST** run the screen's own leave path. A role's primary action in the wide shell **MUST** read the same visibility gate and target as its phone entry, and a stack whose route look depends on the neighbouring routes **MUST** keep the screen below every route attached (the library re-derives attachment only when the drawn route count changes, by position, so a same-count change leaves a master blank). Reason: two menu lists drift — a row hidden by permission on one surface stays reachable on the other; per-screen route frames drift into several window/panel looks and close paths that skip the unsaved-changes guard. [Consequence: Bug — must not ship; authorization class defect when a gated row leaks] [Verify: Review: side-nav entries are the menu source's primary rows; no menu array outside the source; no scrim/window/panel box drawn by a screen around its own route]


**RTG-M5** / **RTG-M12** verification requires static inspection; undocumented checklist sign-off **MUST NOT** substitute for the required validation/ownership evidence.


---

## **MUST NOT** (normative) — **RTG-N**

RTG-N1: No navigate/dispatch inside Zustand store actions, middleware, or subscriptions. [Consequence: Bug — must not ship; STOP] [Verify: Review the configured store modules and import boundaries for navigation calls.]


RTG-N2: No direct navigation inside TanStack `useMutation` callbacks (`onSuccess`, `onSettled`, `onMutate`) or `mutationFn`. [Consequence: Bug — must not ship; STOP] [Verify: Review mutation callback boundaries and use configured static checks where available.]

RTG-N3: Do not scatter magic route-string literals outside the central route/linking authority. [Consequence: Bug — must not ship] [Verify: Confirm route names are referenced through the central typed route definitions.]

RTG-N4: Do not base navigation on unresolved async (race) — GRTG1 must hold. [Consequence: Bug — must not ship] [Verify: Pass: **RTG-T-STAB-1** and **RTG-T-STAB-2** review on the orchestrator diff — binary pass / fail]

RTG-N5: Guards must not be async, fetch, or mutate stores; they make pure synchronous decisions. [Consequence: Bug — must not ship] [Verify: Review guard implementations and configured boundary checks.]

RTG-N6: Do not register multiple uncoordinated back-handler listeners for the same visible hierarchy; centralize priority in one owner or use the navigator's built-in primitives. [Consequence: Bug — must not ship; wrong pop/exit] [Verify: Review listeners by route context and check that the architecture documents any exceptions.]

---

## Failure paths (normative)

Unknown / undefined route key: Fallback screen or safe redirect; structured log per logging SSOT. [Consequence: Bug — must not ship]

Invalid / missing params: Do not render business UI; redirect / fallback (**RTG-M5**). [Consequence: Bug — must not ship]

Guard deny: Redirect route from guard (GRTG3). [Consequence: Authz / privacy bug if bypassed]

Navigation API throws: Catch at boundary; log; fallback route; no white screen crash. [Consequence: Stability bug — must not ship]

Deep link parse mismatch: Fallback; user message per error handling where applicable. [Consequence: Bug — must not ship]

Double tap / duplicate snapshot trigger: Second call ignored or coalesced (**RTG-M13**). [Consequence: Bug — must not ship]

---

## Modal vs push (normative)

- **RTG-M10** : Choose modal vs stack push per documented pattern ; do not mix both for the same user task without architecture approval.

---

## Hardware back (Android) and modal exit (normative)

- **RTG-M14** / **RTG-M15** / **RTG-N6** : Back behavior must match the documented policy ; modals must dismiss before popping underlying routes unless architecture documents an exception.

---

Part of: [README.md](README.md) — routing hub.
