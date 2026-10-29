# Error handling (behavior / client)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** client error, UX, recovery, toast, 404, semantic code

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: client stack map and **QRY-M7** pointer).

SSOT: [error-handling.md](error-handling.md) — client and cross-cutting error UX, client-query integration expectations, recovery, operational 404 checks (**C1**–**C10**, **M1**–**M12**, **N1**–**N5**, **N7**).

SSOT (the server's contract as the client's only error authority): [server-contract-and-display-authority.md](server-contract-and-display-authority.md) — **M13**–**M17**, **N6**, **N8**–**N12**: surfacing `traceId`, deriving retry affordance and UX class from the envelope, importing codes only from the shared contract, never inventing or remapping a code, the single client authority that turns a caught error into display text, and deciding on a registered code only from the carrier's structural field (never by searching the code inside a text field).

SSOT (display surfaces — toast vs inline vs blocking): [error-display-ux.md](error-display-ux.md) — EHX-\* ; pairs with **M4**–**M8** in error-handling.md (does not relax message / logging rules ).

Server contract: [Error policy (backend)](../error-policy/error-policy.md) — API error shape and semantic codes; do not contradict when mapping responses.

Code samples (non-normative): [error-handling-code-samples.md](../_meta/examples/error-handling-code-samples.md)

## Agent TL;DR

- Semantic error codes on every user-facing error (EH-*). Toast vs inline vs blocking per EHX-*. Never swallow + no user signal (**N1**). The selected client-query library’s error state per error-handling.md expectations.
- Consume the backend envelope: surface `traceId` for support correlation (**M13**); derive UX class from `category`, and permit automatic mutation replay through exactly one bounded owner only when an existing envelope carries exact `retryable === true` or, if no HTTP response exists, the canonical structural wire error is `kind === 'network'` (**M14**, per the selected mutation library’s retry standard). Import codes from the shared contract, never a client copy (**M15**, **N11**).
- One authority turns a caught error into display text; a project-owned warning travels as a catalog key on a typed carrier and its developer diagnostic stays in the log channel. Raw caught text never reaches a surface — alone or combined (**M16**, **N12**).
- The same text field is not evidence either: a branch that decides on a registered code reads the code from the carrier's structural field and compares by equality; searching the code inside the text is a branch that can never be taken (**M17**).
- Decision gates: None separate from error-handling.md internal flow gates.

---

## Reading order (normative)

1. [error-handling.md](error-handling.md) — categories, **MUST**/**MUST NOT**, client-query and form integration.
2. [server-contract-and-display-authority.md](server-contract-and-display-authority.md) — envelope consumption, code provenance and the one display-text authority.
3. [error-display-ux.md](error-display-ux.md) — EHX-\* surfaces when implementing new screens or error UI.
