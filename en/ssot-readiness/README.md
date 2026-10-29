# SSOT readiness and form data

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** form data, multi-source, readiness gate, selection, authority, not one place

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

SSOT: [ssot-readiness-and-form-data.md](ssot-readiness-and-form-data.md) — core philosophy (**M11**), authority lifecycle (**M12**–**M15**), agent execution contract (**C1**–**C12**), anti-patterns and checklist. Part file [ssot-readiness-rules.md](ssot-readiness-rules.md) — multi-source readiness gate (**M1**–**M10**, **M16**), selection SSOT, **YYYY-MM-DD** day contract, normalization entry, validation copy, cache UX, and the prohibitions **N1**–**N10**. Part file [readiness-writes-outcome-and-seed.md](readiness-writes-outcome-and-seed.md) — the write side: an outcome flag records the outcome, not the attempt (**M17**, **N11**), and a route/navigation parameter is a seed that is derived, never written into the selection it seeds (**M18**, **N12**).

> Core philosophy (binding): SSoT ≠ "put everything in one place." SSoT = exactly one authority per protected semantic. Global rules: [SSOT governance](../ssot/ssot-principles-and-precedence.md) (**SSG-M0**, **SSG-M6**–**SSG-M8**). This hub applies that philosophy to multi-source forms and selection — no escape via "simple screen" or "temporary" duplicate paths.

## An assertion that cannot change the output is not a gate (reading aid for **M1** / **SSG-M8**)

A readiness `throw` placed inside a render derivation is easy to defend and easy to get wrong,
so test it with one question: *does removing this check change what the function RETURNS for any
input?* If the answer is no, the check authorizes nothing and narrows nothing — it merely asks
"is the session/source ready yet?" a second time, in the one place where the honest answer is
"wait", not "fail". Inside a memoized derivation that answer becomes a render-time crash during the
ordinary hydration window (restored persisted session, silent re-auth, first paint), which is
exactly the `pending != failed` breach **M1** forbids, and a second authority over a question the
readiness resolver already owns (**SSG-M8**).

The repair is not to soften the check but to relocate it: the readiness authority stays the one
that already gates the fetch (the same predicate the query's `enabled` reads), the derivation drops
the duplicate question, and a genuinely broken — as opposed to merely unready — session keeps its
loud, user-visible reason through that authority. Deleting the assertion loses nothing when its
removal cannot change the returned value; keeping it costs a crash. Delete the now-dead inputs in
the same change ([**DCD-M2**](../dead-code/dead-code-rules.md)), or the signature keeps advertising an
authority it no longer consults.

Symptom to search for: a helper whose parameters are read only by its own guard clause, whose
result is computed from the remaining parameters, and whose caller is a `useMemo`/`useCallback`.

## Agent TL;DR

- Single isReady gate for multi-source screens (**M1**–**M2**). One handler set per selection (**M8**). **YYYY-MM-DD** for day strings (**M5**). Phone normalization entry point (**M6**).
- Authority lifecycle mandatory: read existing (**M12**), use it (**M13**), create if missing (**M14**). No deferred refactor (**N9**).
- Decision gates: None separate from SSG-* governance gates.

Related: [SSoT governance](../ssot/README.md), [SSoT Registry template](../ssot/ssot-registry.md), [Forms](../forms/README.md), [TanStack Query](../tanstack-query/README.md), [Error handling](../error-handling/error-handling.md), and [Decision functions](../decision-function/decision-function.md). The registry lookup obligations are **SSG-M6** in [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) and **SSG-R1** in [ssot-registry-rules-and-protocol.md](../ssot/ssot-registry-rules-and-protocol.md).
