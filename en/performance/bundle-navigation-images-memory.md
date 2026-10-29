# Performance — bundle, navigation, images, memory, monitoring

```kit-cover
type: normative
part-of: README.md
binds: PERF-BIM obligations - code splitting, lazy navigator screens, the image pipeline, effect cleanup and release-artifact performance
open-when: shape:frontend-heavy, signal:render-performance, signal:bundle-size, signal:navigation-change
skip-when: signal:backend-only, signal:no-render-path-change
owns: PERF-BIM-M*, PERF-BIM-N*
```

Scope: Code splitting, lazy navigator screens, image pipeline, network dedupe at UI boundary, effect cleanup, and release artifacts for perf ([**PERF-G3**](./performance.md) ).

Rule prefix: **PERF-BIM-M\*** / **PERF-BIM-N\***.

Exceptions: [performance.md](./performance.md) **PERF-EX-1** only.

Compliance: Treat violations as defects and resolve them before release, following [performance.md](./performance.md) **PERF-C4** and **PERF-C11**.

References: [performance.md](./performance.md) GPERF8; [TanStack queries-and-transforms](../tanstack-query/queries-and-transforms.md) **QRY-M9**; [Logging policy](../logging-policy/logging-policy.md).

Code samples: [`../_meta/examples/performance-code-samples.md`](../_meta/examples/performance-code-samples.md) (non-normative).

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-BIM-M1** | The root navigator must avoid eagerly importing leaf screens when the app's bundler and navigation stack support lazy loading, unless **PERF-EX-1** documents the measured bundle impact. Keep navigator-level dependencies limited to what startup requires. | Perf / bundle bug. | Pass: review the configured root navigator and use the project's static checks, if available, to confirm leaf screens follow the chosen loading strategy or have a documented exception. |
| **PERF-BIM-M2** | Same requirement as **PERF-BIM-M1** (lazy screens ) ; kept as separate ID for N3 cross-reference. | Bug — must not ship. | Pass: Same as **PERF-BIM-M1**. |
| **PERF-BIM-M3** | Remote `<Image` `source={{uri` must include `width` and `height` (or `aspectRatio` plus one dimension ) on the element or its `style` unless **PERF-EX-1**. | Bug (layout thrash ). | Pass: If `rg` `'uri:'` `F` exits 0 and `rg` `'<Image'` `F` exits 0, then `(rg` `'width'` `F` exits 0 AND `rg` `'(height|aspectRatio)'` `F` exits 0 ) OR `rg` `'**PERF-EX-1**:'` `F` exits 0. |
| **PERF-BIM-M4** | On image-heavy mobile surfaces, use an image loader/cache strategy selected for the app when concurrency, list size, memory use, or measured scrolling performance exceeds the app's documented device and performance profile. Do not require a particular third-party package by default; retain **PERF-EX-1** for an approved exception to the selected strategy. | Bug — must not ship without an intentional image-loading strategy. | Pass: compare representative devices and image-heavy screens against the app's profile; confirm the chosen loader/cache strategy is applied or document **PERF-EX-1**. |
| **PERF-BIM-M5** | Search or filter inputs that issue network requests while the user types must avoid a request for every keystroke. Use the app's documented interaction budget for debounce timing, or another supported strategy such as `useDeferredValue` when the installed React version and data flow make it appropriate. Keep the previous useful results visible while a new request is pending when the data layer supports it. | Bug: excess requests and avoidable empty-result flicker. | Pass: review the input-to-request path and verify the shared debounce or equivalent strategy; use project checks when they can identify the actual pattern reliably. |
| **PERF-BIM-M6** | `useEffect` / `useFocusEffect` that registers `addEventListener`, `setInterval`, `setTimeout`, or `AbortController` must return a cleanup function that reverses that registration. | Memory leak bug. | Pass: run the hooks and lifecycle checks configured by the project, then review that each registration has a matching cleanup in the same effect. A text search alone is only a weak proxy. |
| **PERF-BIM-M7** | Same as [**PERF-G3**](./performance.md) for releases touching list / navigation surfaces. | Process bug. | Pass: Identical to [**PERF-G3**](./performance.md) Verify row. |
| **PERF-BIM-M8** | Debouncing required by **PERF-BIM-M5** must come from one shared authority (a hook or utility that owns both the mechanism and the delay) used by all relevant search inputs. Hand-rolled local timers are parallel implementations of one policy: the copies drift or are omitted, and a missing copy is invisible in review ([SSOT principles](../ssot/ssot-principles-and-precedence.md) **SSG-M8**). When an existing consumer already carries a local copy, migrating it onto the shared authority belongs to the same change that introduces the authority, up to the scope boundary; copies outside that boundary are recorded as deferred work. | Bug — a debounce that exists on 3 of 4 search screens is a latent defect on the 4th. | Pass: every consumer that calls the search trigger imports the shared debounce authority. Prefer static enforcement only when the project's tooling can identify the intended debounce pattern without flagging unrelated timers (auto-focus, auto-dismiss, async side-effecting search); otherwise verify consumer coverage by review. A delay supplied through a variable, or a function-call debouncer with its own default delay and consumers, is a different policy and needs separate analysis. |

**PERF-BIM-M8** controlled input (normative): A controlled search field commits raw text synchronously through its single field-state writer. Debounce delays only the derived query/filter input, never that writer. Clear, selection and close/reset actions write the raw empty value immediately; a pending delayed publication must not write it back. The query/filter and result-empty copy consume the same delayed value. The shared value-delay authority prevents a delayed callback from replaying old text by owning a separate derived value and cancellation. A lexical setter-name check would be rename-bypassable; verify by review of the field-state writer.

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-BIM-N1** | Unmounting without removing listeners, intervals, subscriptions, or pending work started in effects — forbidden (**PERF-BIM-M6**). | Bug — must not ship. | Pass: run configured hooks and lifecycle checks; review that each effect registration has matching cleanup. Document approved exceptions with **PERF-EX-1**. |
| **PERF-BIM-N2** | An image-heavy list must not bypass the app's selected image-loading and caching strategy when its documented profile calls for that strategy (**PERF-BIM-M4**). | Bug. | Pass: same as **PERF-BIM-M4**. |
| **PERF-BIM-N3** | Eagerly loading every leaf screen through the root navigator when the app's bundler and navigation stack support an appropriate lazy-loading strategy — forbidden (**PERF-BIM-M2**). | Bug. | Pass: same as PERF-BIM-M1. |

---

## Failure-path matrix (aid)

| Situation | Binding IDs |
|-----------|-------------|
| Search box shows nothing while the user types | **PERF-BIM-M5**, **PERF-BIM-M8** |
| Growing heap on navigation | **PERF-BIM-N1**, **PERF-BIM-M6** |
| Cold start regression | **PERF-BIM-M2**, **PERF-BIM-M1**, **PERF-G3** |
| Image scroll jank | **PERF-BIM-M4**, **PERF-BIM-M3** |
