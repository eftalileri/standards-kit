# Decision functions (validation and domain decisions)

```kit-cover
type: normative
part-of: README.md
binds: how a validation or domain decision function signals failure, what it may return, and the decision wrapper for critical paths
open-when: shape:backend-heavy, shape:full-stack, signal:validation-function, signal:domain-decision
skip-when: signal:no-decision-function
owns: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, N1, N2, N3, N4, N5, V1, V2
```

Scope: Decision-making and validation functions: forbidden `null`/`undefined` failure signaling (except the `validate*` contract), false vs throw, async rules, the `decision()` wrapper for critical paths, and guard expectations. Which functions this standard governs — the naming, folder, JSDoc, body-signal and critical-initialization criteria — and the agent execution contract (C1–C10) are in [decision-function-scope-and-contract.md](decision-function-scope-and-contract.md). Retrieval (`find*`, `get*`) nullability and API error wire shape live in [error policy](../error-policy/error-policy.md) and [error handling](../error-handling/error-handling.md).

Environment: N/A for logging transport or hosting — those sit in [logging policy](../logging-policy/logging-policy.md) at call sites that log; this document governs function semantics and throw shape.

Binding principle: This document, with [decision-function-scope-and-contract.md](decision-function-scope-and-contract.md), is the single SSOT for decision-function rules in this kit. Standard = one valid path. Deviation = bug. Remedy: fix code or update standards first.

References:

- [decision-function-scope-and-contract.md](decision-function-scope-and-contract.md) — the companion normative file of this topic's band set ([**KIT-ADD-4**](../authoring/kit-rule-addition.md)), this file being the entry one: C1–C10, decision-function classification, enforcement and verification.
- [Error policy](../error-policy/error-policy.md) — required message shape; [error model, registry and boundary](../error-policy/error-model-registry-and-boundary.md) — `validate*` caller M10, retrieval M6 / M8
- [Error handling](../error-handling/error-handling.md) — client-side alignment, M12
- [Decision matrix](../decision-matrix/decision-matrix.md)
- [False positive prevention](../false-positive/README.md) — guard behavior and `validate*` ignore patterns where applicable (FP-\*)

Code samples: [`../_meta/examples/decision-function-code-samples.md`](../_meta/examples/decision-function-code-samples.md) (non-normative).

---

## **MUST**

| ID | Rule |
|----|------|
| M1 | A decision function must not use `return null` or `return undefined` to mean failure or invalid state (except `validate*` per V1). |
| M2 | Must not use `??` / `\|\|` on required decision inputs to fabricate a passing outcome — root cause first; throw if data is invalid (aligned with [error policy N2](../error-policy/error-policy-prohibitions.md)). |
| M3 | On throw, the message must follow [error policy Required message shape](../error-policy/error-policy.md) for policy-covered paths. |
| M4 | Every code path must either return a defined value (for allowed outcomes) or throw — no bare `return;` (implicit `undefined`). |
| M5 | `validate*` functions may return `string \| null`: `null` = valid, non-null string = validation error detail. |
| M6 | `validate*` must be pure — no state mutation, no API calls; logging only is allowed as a side effect. |
| M7 | Callers of `validate*` with a non-null string **MUST** comply with [error policy M10](../error-policy/error-model-registry-and-boundary.md) and [error handling M12](../error-handling/error-handling.md) — see V2 (no silent ignore). |
| M8 | Critical decision invocations **MUST** be wrapped with `decision(() => …)` (see Decision wrapper). Critical means any path where an inner helper may return `null`/`undefined` and that would corrupt the decision outcome if not converted to a shaped throw. Omitting `decision()` on such paths is forbidden. |
| M9 | Async decision functions must return `Promise<T>` where `T` is non-nullable per M10; failure is reject/throw, not implicit undefined; `resolve(false)` is only for a deliberate negative business outcome (see False vs throw). |
| M10 | Except `validate*` (V1 / M5), decision functions **MUST** use non-nullable declared return types for the primary outcome — not `T \| null`, `T \| undefined`, `Promise<T \| undefined>`, or `Promise<T \| null>` for domain decisions. Invalid or missing state **MUST** be signaled with throw, not with a nullable success type. |
| M11 | A verdict function — one mapping a measured figure to a judgement (level/label, suggested action, rank) — **MUST** receive the sample size that figure was computed from, and its first statement **MUST** be the zero-sample gate (`if (sampleSize <= 0) return <no-data result>`), so no call site can bypass it. A signature taking only the value cannot tell a measured zero from nothing measured; the zero then lands in whichever band contains it (an empty population read as a measured zero can earn an "ideal" verdict although nobody was observed). The result **MUST** carry two no-verdict states, distinct from the bad-verdict ones: no data (nothing to measure) and not yet mature (the observation window this metric needs has not elapsed). Both suppress the label and the action, emit the value as `null` not `0`, and are skipped by every downstream alerting/reasoning consumer; the elapsed-time input for maturity **MUST** come from the same cohort-anchor authority the metric itself uses ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). Maturity is per member, not per cohort: a member whose own window has not elapsed leaves the denominator — counted as a negative it makes a mixed-age cohort read as failing, and the whole-cohort gate is that same test over its oldest member. The window length is one authority the computation, the maturity gate and the sentence stating it on screen all read. Where the window comes from when nothing states one: first import an authority already existing in another domain — never a second copy ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). Only when none exists is the fallback the metric's own worst band boundary: bands judging *"n or more is bad"* already declare the shortest observation the metric can speak about, so gate and band read one constant. This fixes the window's existence, not its value's correctness — whether that boundary is the right number is a product question, not a tree one. *"Undocumented"* is not a reason to stop. A low-sample warning shaped `denominator > 0 && denominator < threshold` is forbidden — it excludes the one denominator that most needs it. A ranked list presented as derived from the reader's own figures **MUST** evaluate those figures; where it cannot be derived it is empty with a stated reason, and the derivation claim is removed rather than left standing over a fixed list. Past those two gates, the reliability bar is set per kind of figure from the estimate's own uncertainty, never one headcount for every figure: a rate by its confidence interval at x of n (and the figure always shows x / n), a cost per result by the result count k, a per-unit amount by the number of paying units it divides over, a difference between two arms by a test of that difference conditioned on each arm's exposure (unequal spend or time is not equal opportunity) — a fixed n hides a decisive small result and passes a noisy large one. A rate's x and n **MUST** count distinct units within the window (subjects, never events): one unit's repeated events are not independent trials, so an event-keyed rate narrows its own interval and lets one unit dominate it. A duration figure **MUST** be summarised by its median, never the arithmetic mean, which positive skew lets a few long observations pull upward. The interval or test **MUST** be one that holds at small counts (Wilson score, exact Poisson or binomial), never the normal approximation, which goes negative and under-covers exactly where the gate decides. Arms compared or ranked against each other **MUST** be observed under one measurement coverage, and an arm whose outcome was not measured is neither zero nor beaten: while any compared arm differs in coverage or is unmeasured, the winner verdict is withheld and at most a direction is shown — an arm whose outcomes are only partly observable (a platform or consent class that loses part of them) reads worse for that reason alone. A verdict that tests many figures at once **MUST** correct for multiplicity, and one whose input grows over time **MUST** be evaluated on a fixed, completed period, so random fluctuation and repeated looks never fire a recommendation. [Verify by: sample parameter + first-statement gate on every verdict function; distinct no-data/not-mature levels with `null` value; low-sample predicate including zero; ranking evaluated from those levels or absent with a reason; the first-statement gate is decidable on the single-file lint rung, but the zero-sample and maturity gates are mechanically fenced only where the adopting project admits such a check under **ENA-A1** (an internal analytics surface commonly fails **ENA-A3**); otherwise the shared no-verdict / not-mature helpers inside the verdict functions and review hold the class] |
| M12 | A reader that finds a required field missing **MUST** answer with the field's ABSENCE or with a registered failure — never with a literal drawn from the field's own value range. The reflex fill (`x ?? <literal>`, `x ? f(x) : <literal>`) is chosen because it type-checks and keeps the row renderable; that is precisely the harm. A placeholder inside the range — an empty string for a mandatory timestamp, an epoch date, `0` for an amount, a sentinel id — collapses *"unknown"* onto a value the reader cannot distinguish from a real one, so every downstream decision (sort, group, filter, compare, sum, display) is answered silently and wrongly, and no alarm fires because something was shown. Which answer is correct is decided by the field's own writer, not by the call site's convenience: read the schema/contract that writes it. Optional there ⇒ absence is legitimate and its representation is `undefined`/`null`, propagated to every consumer — the choice between the two is the serialization contract's (a key dropped from a fingerprint or an ordered payload is itself a collapse). Required there ⇒ absence is a defect, so it **MUST** raise a registered fail-loud error, and that judgement **MUST** live at one gate the field's consumers call rather than in a private branch per consumer ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). A gate whose error is raised inside a broader `catch` that degrades gracefully is not fail-loud — the registered fault is swallowed and misreported as the outer failure, so the gated mapping **MUST** sit outside it. Where a caller legitimately holds a representation adapter (unwrapping a provider's wire shape), it may run before the gate only if it forwards *absence* to the gate rather than resolving it. [Verify by: for each fill, the writer's schema/contract line; optional ⇒ absence type end-to-end; required ⇒ registered code raised from one shared gate, reachable outside any degrading catch] |
| M13 | A recommendation — an action sentence shown to the person who decides — **MUST** be emitted only by a signal whose verdict passed the gates of M11, **MUST** be selected from a closed mapping keyed by that signal (each signal kind maps to one action text), and **MUST** carry the evidence that fired it beside the sentence: x / n, the interval or test result, and the baseline or threshold it was judged against. Advice attached to a band level, to a composite score, or to no fired signal **MUST NOT** be emitted; below the gate the surface states how much evidence has accumulated against how much is required. A surface **MUST NOT** restate the same fired verdict as a second item of equal weight (a recommendation card and an alert row side by side). Reason: band- or score-attached advice reads as a diagnosis the data never made, and advice whose evidence is not shown beside it cannot be checked by the reader. [Verify by: review — every recommendation's mapping key is a fired, gated signal; its output carries x, n, interval or test, and baseline] |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| N1 | Silent swallow on critical paths: `catch` then continue without rethrow or mapped error (see [error policy N1](../error-policy/error-policy-prohibitions.md)). |
| N2 | `validate*` performing state updates or network I/O (violates M6). |
| N3 | Async: `return;`, `return undefined`, `return false`, bare `return` in `catch`, or `catch` that only logs (e.g. `console.error`) then returns without rethrow or mapped error — all forbidden unless explicitly mapped per policy. |
| N4 | Declare `validate*`-outside decision functions with return types that encode failure as `null` or `undefined` (e.g. `Promise<boolean \| undefined>` instead of `Promise<boolean>` + throw). |
| N5 | Represent a missing required value by an in-range placeholder — `''` for a timestamp, `0` for an amount, an epoch or sentinel — or keep a private presence test in front of the shared gate, which makes that gate's refusal unreachable and turns the fault into a legal value before it is ever asked (M12). Equally forbidden: widening the carrier type to optional so a fill type-checks, when the writer's schema declares the field required. | 

---

## False vs throw

| Situation | Behavior |
|-----------|----------|
| Valid business no (conscious negative) | `return false` (or typed equivalent) |
| Unexpected / system failure | `throw` |
| Required data missing | `throw` |
| Invariant broken | `throw` |

Rule of thumb: If the user cannot fix it by a normal product action, throw. If the answer is legitimately no under valid inputs, `return false` is allowed.

Do not use `throw` for every branch (that blurs valid no vs defect), and do not use `return false` when prerequisites are missing or corrupt — that is throw. Illustration: [`decision-function-code-samples.md`](../_meta/examples/decision-function-code-samples.md) (False vs throw).

---

## Async decision functions

- Forbidden: `return;`, `return Promise.resolve(undefined)`, swallowing errors in `catch` with `return false`, empty `return`, or log-only `catch` then `return` (N3).
- Required: failures reject or throw. `resolve(false)` only for a valid negative decision.

---

## Decision wrapper (`decision`)

Purpose: Avoid repeating the full message shape and centralize conversion of unexpected `null`/`undefined` from inner calls into a throw with traceable context.

Normative: M8 — on critical paths, always route possibly-null inner results through `decision()`; do not assign `inner()` directly to a variable that the rest of the flow treats as non-null without a guarantee.

Requirements:

- `decision(fn, context?, solution?)` — `context` SHOULD identify the inner function or operation for root cause text; `solution` SHOULD be the one-line fix hint.
- If `fn()` returns `null` or `undefined`, must throw using the same structural intent as [error policy](../error-policy/error-policy.md) (what failed, root cause, solution).

Non-normative reference implementation: [`decision-function-code-samples.md`](../_meta/examples/decision-function-code-samples.md).

---

## `validate*` contract (normative summary)

| ID | Rule |
|----|------|
| V1 | Return type `string \| null` only as defined in M5; never use `null` to mean validation failure. |
| V2 | Caller obligation: M7 — after a non-null string, **MUST** throw with [error policy](../error-policy/error-policy.md) shape or map to API/form errors per shared contract — silent ignore or continuing the success path is forbidden. |

---

## Guard and tooling expectations

When automated checks apply:

| Check | Severity |
|-------|----------|
| `return null` / `return undefined` (decision paths, non-`validate*`) | Error (or Warning in non-strict mode per project config) |
| `return ... ?? ...` / `return ... \|\| ...` masking invalid data | Error |
| Implicit `return;` on a decision path | Error |
| Async patterns in N3 (including log-then-return in `catch`) | Error |
| Nullable declared return types on non-`validate*` decisions (N4 / M10) | Error (where tooling can see types) |

References in guard output should cite this file and [error handling](../error-handling/error-handling.md) / [error policy](../error-policy/error-policy.md) for message shape.

---

## Summary

| Behavior | Required / forbidden |
|----------|----------------------|
| Decision function returns null/undefined for failure | Forbidden (except `validate*` valid path `null`) |
| `??` / `\|\|` to hide invalid input | Forbidden |
| `return;` (implicit undefined) | Forbidden |
| Async `catch` swallow | Forbidden |
| Failure → throw with root cause + solution | Required (shape: error policy) |
| Valid negative → `return false` | Allowed |
| `@non-decision` | Allowed (opt-out) |
| `validate*` valid → `return null` | Allowed |
| `validate*` side effects (beyond log) | Forbidden |
| Critical paths wrapped in `decision()` | Required (M8) |
| `Promise<T \| undefined>` / `T \| null` as decision outcome type (non-`validate*`) | Forbidden (M10, N4) |

---

## Implementation checklist

- [ ] Decision functions identified (name / folder / `@decision` / init)
- [ ] M10 / N4: non-`validate*` return types are non-nullable; failure → throw
- [ ] No null/undefined failure signaling except `validate*` V1
- [ ] Throws use [error policy](../error-policy/error-policy.md) message shape
- [ ] `validate*` pure; callers implement M7 / V2 (no silent ignore)
- [ ] M8: critical inner calls use `decision()` with context (and solution when helpful)
- [ ] Async: no implicit undefined; no catch swallow (including log-only `catch`)
