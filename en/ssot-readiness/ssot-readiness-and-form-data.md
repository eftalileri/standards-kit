# SSOT readiness and form data (multi-source forms)

```kit-cover
type: normative
part-of: README.md
binds: the core SSOT philosophy M11-M15 and M19-M21, the authority lifecycle and the agent execution contract for multi-source form and selection flows
open-when: shape:frontend-heavy, shape:full-stack, signal:multi-source-form, signal:readiness-gate, signal:selection-state
skip-when: signal:no-form-surface
owns: C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, M11, M12, M13, M14, M15, M19, M20, M21
```

Scope

- Included: Core SSOT philosophy (**M11**) and authority lifecycle (**M12**–**M15**, **C10**–**C12**); client form screens and flows fed by multiple async sources (lists A/B, external init, guides); readiness gate (single derived `isReady`); selection SSOT; day string contract (**YYYY-MM-DD**); normalization entry points; validation message shape for user-facing field errors; offline-first / cache strategy for form-bound lists.
- Excluded: Backend API design (see [error policy](../error-policy/error-policy.md)); Zod schema and form field patterns (see [forms](../forms/forms.md)); repository and transaction rules.
- Document type: Normative standard for behavior and state on the client. The readiness-gate rows **M1**–**M10**, **M16** and the prohibitions **N1**–**N10** live in [ssot-readiness-rules.md](ssot-readiness-rules.md); the write-side rows **M17**, **M18**, **N11**, **N12** live in [readiness-writes-outcome-and-seed.md](readiness-writes-outcome-and-seed.md).

Environment: Applies — browser or app UI, query cache/persistence where used, and the client error-reporting flow on relevant surfaces.

Binding principle: Bypass of the readiness gate, dual normalization paths, silent validation/normalization failure, violations of core SSOT philosophy (**M11**), or skipped authority lifecycle (**M12**–**M14**) is a bug. Remedy: fix code or update standards — no informal exceptions. No deferred refactor, no "we will consolidate later" without an explicit user-recorded exception per [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) **M15**.

References:

- [ssot-readiness-rules.md](ssot-readiness-rules.md) — **M1**–**M10**, **M16**, **N1**–**N10**
- [readiness-writes-outcome-and-seed.md](readiness-writes-outcome-and-seed.md) — **M17**, **M18**, **N11**, **N12**
- [Error handling](../error-handling/error-handling.md) — client errors, **M3** message shape alignment, **N1**
- [Error policy](../error-policy/error-policy.md) — throw/API shape where server is involved
- [Decision functions](../decision-function/decision-function.md) — `validate*` callers
- [Logging policy](../logging-policy/logging-policy.md) — operational logging (backend); client logger discipline in error handling
- [Decision matrix](../decision-matrix/decision-matrix.md) — forms, TanStack, Zustand rows
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [Forms](../forms/forms.md) — Zod, field errors, submission, controlled state
- [TanStack Query](../tanstack-query/README.md) — queries, persist, background refetch
- [SSOT governance](../ssot/README.md) — **KAT-1**–6, guard registration; backend field writes and domain SSOT (SSG-*); complements SSFR- / readiness rules here without duplicating stack SSOT
- [Phone (E.164 SSOT)](../phone/README.md) — phone/contact normalization detail
- The adopting project's architecture documentation for screen-specific contracts

Code samples: [`../_meta/examples/ssot-readiness-code-samples.md`](../_meta/examples/ssot-readiness-code-samples.md) (non-normative).

---

## Core SSOT philosophy (normative)

> SSoT ≠ "put everything in one place." A single screen file, mega-hook, or global store that holds unrelated domains (e.g. selection + unrelated list cache + navigation + validation) is not SSOT — it is unbounded coupling.
>
> SSoT = each protected semantic has exactly one authority. Examples on form surfaces: one `isReady` derivation; one selection read/write handler set; one day-string helper; one phone normalization entry; backend field writes still governed by [SSOT governance](../ssot/README.md) (**SSG-M1**, **KAT-1**–6).

**M11**: Philosophy binding: Apply **SSG-M0** from [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md). Form / selection work **must** use separate documented authorities per semantic — not one undifferentiated state object "because it is one screen."

**M12**: Read before code: For any in-scope task, the agent reads the rules that apply to it — this topic's, and the [SSoT](../ssot/README.md) ones when the task touches backend writes, shared types, or guard-covered fields — and cites them in the deliverable References.

**M13**: Use existing authority: If a documented authority, handler set, or helper already exists for the semantic, the agent **must** use it — no parallel write path, no second normalization function, no duplicate selection `setState` (**SSG-M6**).

**M14**: Create or refactor (no deferral): If authority is missing, create exactly one before consumers (**SSG-M7**). If authority exists but is insufficient, refactor to a single path in the same change — **must not** leave a temporary bypass (**SSG-M8**, **N9**). Refactor **must not** break other registered SSOT entries ([ssot-guard-and-agent.md](../ssot/ssot-guard-and-agent.md) **SSG-P1-2**, **SSG-N16**).

**M15**: Code shape: All new or changed code **must** route reads/writes through the identified authority only. Derived UI may compose authorities — it **must not** become a second writer for the same semantic.

**M19**: Tenant-owned display settings (currency, timezone, locale-of-record, and similar values) **must** come from their authority and be gated on readiness — never defaulted to a fixed literal while unresolved. A fallback such as `settings?.currency ?? DEFAULT_CURRENCY` is a bug even though it never throws: it renders a wrong but believable value, so the reader takes it for truth and decides on it without an error signal. While the setting is unresolved, the consumer shows its loading state (M1–M4); once resolved but empty or invalid, the authority fails loudly. The same defect can hide in a default parameter on a formatting helper or a named constant used in a fallback branch. Representing unresolved state explicitly is not this defect; it is the readiness signal M1 requires. A project may mechanically check recognizable fallback shapes, but the existence of a correct readiness gate generally requires review because one syntax tree cannot establish that the consumer's loading branch is reachable.

M20: An asynchronously loaded collection must not be coalesced to an empty collection while its source is unresolved (`data ?? []`, or a destructuring default such as `const { data: rows = [] } = useQuery()`). An empty collection reads as a *legitimate answer* ("there are no rows"), so every downstream derivation may consume it without raising anything. Preserve the unresolved state until readiness is established (M16), and do not run a consumer that derives from the collection until it is ready (M2 / M4). Otherwise *"the source has not arrived"* and *"the source is genuinely empty"* become indistinguishable, and a later derivation may silently use stale or incomplete data.

Declined check for **M20**: readiness and derivation provenance are cross-function facts; identical `??` syntax covers valid loaded-record emptiness and invalid unready async defaults. A syntax predicate over that shape would flag nearly every correct site for each real defect, so review is the enforcement method; do not imply that a clean syntax scan covers this rule (**FP-M18**/**FP-N13**).

M21: A readiness-shaped read is a defect only where its waiting window is reachable. Before ruling that a consumer conflates *not known yet* with *no* — for example, `if (!actor) return false` while a permission source is still loading — prove from the mount path that the consumer can render while the input is unresolved. An ancestor gate can make that window unreachable at every mount site; in that case, adding a waiting branch creates a surface that can never render. Cite the render chain and each relevant gate, not only the consumer source. Two outcomes are legitimate: if the unresolved state is reachable, gate it (M1–M4); if it is unreachable, leave behavior unchanged and record the invariant at the consumer, naming the gates. This lets a later mount outside those gates be recognized as a regression.

**M21** application — destructive confirmations. A destructive-action confirmation whose warning depends on an asynchronously selected source **must** withhold interactive confirmation until that source's existing query-layer readiness says ready; its effect handler reads the same decision again. Unknown source **must not** be converted into a legitimate no-warning result. Loading/error/retry/cancel remain available. The mount graph is cross-module and uses the **M2**/**M21** stated review limit; required modal props + handler gate are stronger than a syntax-shaped proxy, so no new check. The existing query-layer decision still honours enabled/current-scope prerequisites first; for an enabled query, usable current-scope cached data remains ready during a background-refetch error, while that error remains available to its existing reporting boundary. Consumers **must not** override that decision with raw query flags or prior-target placeholder data.

Declined check for **M21**: whether an ancestor blocks unresolved content requires a cross-module render graph, so a predicate over the consumer's own source would flag correct sites (**FP-M18**/**FP-N13**); review is the enforcement method. Record the evidence at the consumer so the invariant remains visible.

---

## Agent execution contract

General obligations: [shared agent contract](../_meta/agent-contract.md). Local identities below retain their citation handles.

**C1**: This document is mandatory for multi-source form and selection flows in scope.

**C2**: Apply [shared **C2**](../_meta/agent-contract.md).

**C3**: Apply [shared **C4**](../_meta/agent-contract.md).

**C4**: Apply [shared **C2**](../_meta/agent-contract.md).

**C5**: Apply [shared **C5**](../_meta/agent-contract.md).

C6: A screen-specific project contract may add stricter behavior, but may not weaken these rules.

**C7**: Apply [shared **C12**](../_meta/agent-contract.md).

**C8**: If required readiness inputs are unknown or ambiguous, [gray Procedure](../agent-gray-decisions/gray-situation-decisions.md) steps 4b–5 apply.

**C9**: Follow the consuming project's change-class verification policy.

**C10**: No skip: The relevant rules apply whether the form is "small", "temporary", or "only one screen" — scope is determined by multi-source / selection / normalization semantics, not size.

**C11**: No lazy duplicate: Forbidden to ship a second authority "for now" with intent to remove later — **M14** / **N9**. A user exception is a product decision (gray Procedure step 5) recorded in Decisions / facts.

**C12**: Discover -> use -> create -> refactor is mandatory per **M12**–**M14** before interactive UI or submit paths are added or changed.

Testability: Static review of gate conditions, handler boundaries, and message format.

---

## Anti-patterns (forbidden)

| Pattern | Why |
|---------|-----|
| "Set state directly here" for selection | Breaks **M8** — SSOT split. |
| "Use Date / ISO for this day" | Breaks **M5** — timezone skew. |
| "Swallow this validation error" | Breaks **N2** — no root cause visibility. |
| "Put everything in one store for this screen" | Breaks **M11** — not SSOT; unbounded coupling. |
| "Simple form — skip ssot-readiness" | Breaks **C10** / **M12**. |
| "Temporary second path; refactor later" | Breaks **M14** / **N9** — no authority deferral. |
| "Set the ready flag in `finally` so it always runs" | Breaks **M17** / **N11** — a failed run is reported as a successful one. |
| "One boolean is enough for this reason union" | Breaks [**M16**](ssot-readiness-rules.md) — a projection answers for one member; the next one added falls to a default nobody chose. |
| "Not ready, so draw a spinner" | Breaks [M16](ssot-readiness-rules.md) — not-ready can be permanent, and a loader promises an arrival that may never come. A terminal reason renders an explanation and an action, never a loader. Stated limit ([KIT-INV-8](../authoring/kit-structural-invariants.md)(b)): whether a condition ever resolves is a whole-program fact; no single-file check can separate this from a transient loader. |

---

## Implementation checklist

- [ ] **M11** / **SSG-M0**: separate authority per semantic — not one mega-state
- [ ] **M12**–**M14**: read standards; use / create / refactor authority (no parallel deferral)
- [ ] **C10**–**C12**: relevant rules read; no skip; lifecycle before UI/submit
- [ ] **M1** / **M2**: one `isReady`, no early interactive mount
- [ ] **M16** / **N10**: the gate is derived at the query layer (disabled + pending + error + no data); raw `isLoading` is presentation only
- [ ] **M17** / **N11**: success flags are written only on the success path (never in `finally`); the failing step opens the existing error+retry surface and its rejection has an owner
- [ ] **M4**: submit tied to gate
- [ ] **M5**: day format centralized
- [ ] **M6** + [phone normalization](../phone/normalization.md)
- [ ] **M7** + error-handling **M3**
- [ ] **M8**: selection handlers only
- [ ] **M9** cache/loading policy documented for the screen
- [ ] **M3** / **N2**: no silent failures

---

Part of: [README.md](README.md) — SSOT readiness hub.
