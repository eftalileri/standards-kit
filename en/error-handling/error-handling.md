# Error handling (behavior / client)

```kit-cover
type: normative
part-of: README.md
binds: the client-side error-handling model - file-local C, M and N obligations for how a server error becomes UI, logging and recovery, plus the operational route/deploy 404 checklist
open-when: shape:frontend-heavy, shape:bug-fix, signal:client-failure-path, signal:error-classification, signal:global-error-net, signal:raw-error-text
skip-when: signal:backend-only, signal:no-client-failure-path
owns: C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, N1, N2, N3, N4, N5, N7
```

Scope: Client and behavior-layer error handling: how errors surface in UI, integrate with the consuming project’s selected client-query and form libraries, recovery, and operational checks (e.g. 404 after route changes). Backend throw shape, API payload contract, and semantic codes are defined in [error policy](../error-policy/error-policy.md) — client code must map responses without inventing codes, without changing the meaning of server codes for logic, and without overriding server classification (see **M2**, and **N6**, **N8**–**N10** in the sibling band [server-contract-and-display-authority.md](server-contract-and-display-authority.md)).

Environment: Applies to browser and app presentation and client logger discipline. Server-authoritative error codes and DTO shape remain governed by [error policy](../error-policy/error-policy.md).

Binding principle: This document is the single correct client-side error-handling model for this kit. Standard = one valid path. Deviation = bug. Remedy: fix code or update standards first — no improvised patterns.

References:

- [Error policy (backend)](../error-policy/error-policy.md)
- [Decision matrix](../decision-matrix/decision-matrix.md)
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- The project’s selected client-query library (for example, [TanStack Query](../tanstack-query/README.md) where used) — mutations, error callbacks, invalidation, and retry
- [Forms](../forms/forms.md) — field-level errors and submission; use the project’s selected schema library (for example, Zod where used)
- [Mobile UI patterns](../mobile-ui-patterns/mobile-ui-patterns.md) — does not replace **M3**/**M4**/**M5**; use for help copy i18n and tappable a11y alongside alerts
- [SSOT readiness and form data](../ssot-readiness/ssot-readiness-and-form-data.md) — readiness gate, no silent catch on validation/normalization
- [Editable persistent attributes](../editable-persistent-attributes/README.md) — cascade and persistence errors
- [Decision functions](../decision-function/decision-function.md) — only SSOT for decision vs retrieval, `validate*`, guard expectations
- [Logging policy](../logging-policy/logging-policy.md) — levels and structured logging
- The consuming project's architecture contract when changing screens

Code samples: [`../_meta/examples/error-handling-code-samples.md`](../_meta/examples/error-handling-code-samples.md) (non-normative).

---

## Agent execution contract

C1: Apply [shared **C1**](../_meta/agent-contract.md).

C2: Apply [shared **C2**](../_meta/agent-contract.md).

C3: When standards conflict, follow the consuming project’s precedence ladder for state, behavior, UI, and the selected client libraries. This document governs error-handling behavior within that architecture.

C4: Apply [shared **C4**](../_meta/agent-contract.md).

C5: Apply [shared **C5**](../_meta/agent-contract.md).

C6: Apply [shared **C2**](../_meta/agent-contract.md).

C7: This document defines the only valid client error-handling model here. Alternative UI/error patterns are forbidden.

C8: Apply [shared **C3**](../_meta/agent-contract.md): no undocumented client error UX exception beyond this document and its explicit cross-references.

C9: Never ship client code that contradicts error policy for consumed API fields (semantic error code, required shapes).

C10: If the shared API contract for errors is unknown or inaccessible, STOP client mapping work — do not invent codes or shapes.

Verification: Inspect UI and mapper code; confirm root-cause logging on the client (**M11**) and observe runtime HTTP / Query error paths using the consuming project's verification policy.

---

## Technology

Pattern: Architectural discipline — not replaceable by a single component library.

Server state errors: Follow the consuming project’s selected client-query library and its normative guidance.

Form validation: Follow the consuming project’s schema and form standards (for example, Zod and the Forms standard where selected).

Logging: Project logger per logging policy — not console.log / console.error for operational paths.

---

## Error categories (client-facing strategy)

Validation: Field-level (and form-level on submit) per FORMS; message shape below

API / network: Map error policy codes; user-safe message; log rootCause (**M11**); never show rootCause to end users unless explicitly allowed

Business logic: Same as API — use semantic code + friendly copy

System / unexpected: Generic user copy + retry; full detail in logs

Each category must have a distinct UX path (not one undifferentiated alert for everything).

---

## **MUST**

M1: For critical failures, ensure root cause is captured in logs and, where throws occur on the client, follow error policy Required message shape for developer/operator text.

M2: API errors from the backend must be read using the same semantic fields as error policy (error, message, rootCause, etc. per shared contract). Do not ignore the error code.

M3: Validation messages shown to users must follow: [Field label] — [validation text]. Root cause: [why]. Solution: [one action]. (align with SSOT readiness **M7** and forms **M4**).

M4: Error UI must be understandable in the product language, without raw HTTP codes or stack traces for end users. Must include what happened and how to recover (or where to get help).

M5: Blocking load errors (initial data required): show a dedicated error state (screen or region) with a Retry (or equivalent) action.

M6: Background refetch errors when stale data is shown: may be non-blocking; must not corrupt displayed state; log per logging standard.

M7: Form submission errors must show form-level summary when the server rejects; field-level when mapping allows.

M8: Recovery must exist where the user is blocked: at minimum Retry on error screen; form guidance on validation; network retry policy per the selected client-query library’s standard where applicable. An acknowledgeable rejection is a recovery the client **MUST** offer: when a route rejects with a conflict whose contract names an acknowledgement flag in the request (the user may knowingly proceed), the client ships — in the same release as the rejection — a confirm dialog that shows what conflicts (the server returns the conflicting items as structured response data, not prose) and re-sends the same body plus the flag; cancel leaves nothing written. A rejection shipped without that path turns a former silent behaviour into a dead end. Clients released before the path exists keep seeing the rejection message; say so where the change is recorded.

M9: After backend route add/change, if the client gets 404 while the path looks correct: verify backend route file, mount in app entry, and that the running process uses the latest build — instruct to restart or redeploy backend (see Operational 404 below).

M10: Decision vs retrieval definitions and all decision-function null/throw rules: only decision functions — do not duplicate normative tables here.

M11: rootCause from API (or equivalent): **MUST** be written to logs when handling a failure (per logging standard). **MUST NOT** be shown in end-user UI unless error policy or an explicit product appendix states that field is user-visible for that surface — default is operator-only.

M12: Callers of validate* that receive a non-null error string **MUST** throw with error policy Required message shape or map to form/API errors per FORMS and the shared contract — silent pass (continuing the success path) is forbidden (aligned with error policy **M10**).

---

## **MUST NOT**

N1: Silent failure on validation or normalization (no user signal, no log) — see SSOT readiness **N2**, **M3**.

N2: Fake defaults (?? / ||) to hide missing required user or server data on decision paths.

N3: Show raw 500 / Network request failed / stack text as the only user message.

N4: Skip logging for handled errors that indicate a defect or user-blocking failure.

N5: Use console.* instead of the project logger for operational diagnostics.

N7: Improvise a different error architecture (e.g. global store for all errors) if it violates the selected client-query or form standards, or this document.

---

## Operational 404 (route / deploy mismatch)

When the client calls the expected URL but receives 404, and the route exists in source:

1: Confirm route definition in the route module file.

2: Confirm route is mounted in the server entry.

3: Confirm the running backend process is built from current code (restart or redeploy).

Must communicate to the user/operator that stale processes commonly cause this symptom after route changes.

---

## Implementation checklist

- [ ] Categories mapped to UI paths (load / background / form / global)
- [ ] API errors mapped via semantic `error` + user-safe `message`; `rootCause` logged, not shown to users unless explicitly allowed
- [ ] No client-invented codes; no semantic remapping of server codes for logic
- [ ] Validation copy follows **M3**
- [ ] Error states include recovery (retry / guidance)
- [ ] Logger used; no silent critical failures
- [ ] The selected client-query and form standards are applied for data and mutations
- [ ] Decision vs retrieval: [decision-function](../decision-function/decision-function.md) only

