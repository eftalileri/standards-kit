# SSOT governance — principles and precedence (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: SSG-C agent contract and the SSG-M authority lifecycle (M0, M6–M8, M23)
open-when: shape:refactoring, signal:ssot-authority, signal:new-semantic, signal:duplicate-writer
skip-when: signal:no-ssot-surface
owns: SSG-C1, SSG-C2, SSG-C3, SSG-C4, SSG-C5, SSG-M0, SSG-M6, SSG-M7, SSG-M8, SSG-M23
```

Scope

- Included: Project-independent Single Source of Truth (SSOT) definition, cross-domain ownership, read-path integrity (minimum), deterministic precedence (**SSG-P1**), enforcement-type classification (**SSG-P2**), and agent obligations when this topic applies.
- Excluded: Full normative text for TanStack Query, Zustand, MMKV, and routing stacks — see [TanStack Query](../tanstack-query/README.md), [Zustand](../zustand/README.md), [MMKV](../mmkv/README.md), and the routing topics; local minimum for **KAT-6** cache lifecycle remains in [convention-driven categories](ssot-categories-convention-driven.md). Business meaning of pricing or legal copy — product source unless code enforces a single writer via [config-driven](ssot-categories-config-driven.md) **KAT-1**. Visual design tokens. General DB migration strategy beyond **KAT-3** mutation paths.

Document type: Normative — core SSOT governance (part of `ssot/` hub).

Environment: Applies wherever the project enforces these obligations: automated checks (lint rows and registrations, project checks), runtime validation (schema parse for **KAT-5** — see convention file), or human review as classified by **SSG-P2**.

Binding principle: Non-deterministic precedence ("either rule wins"), duplicate config owners for the same protected symbol, or skipping enforcement-type documentation is a bug — STOP.

References: [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (**M1**, **M15**); [Error policy](../error-policy/error-policy.md); [Decision functions](../decision-function/decision-function.md); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md); [Decision matrix](../decision-matrix/decision-matrix.md); [False positive prevention](../false-positive/README.md) (guard annotations, FP-*). Parts: [Measured shapes of a duplicate authority](ssot-must-duplicate-authority-applications.md), [Config-driven categories](ssot-categories-config-driven.md), [Convention-driven categories](ssot-categories-convention-driven.md), [Guard and agent](ssot-guard-and-agent.md), [Registry](ssot-registry.md).

Decision routing: [Decision gates](ssot-guard-and-agent.md#decision-gates-normative-index).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| SSG-C* | Agent execution contract (this file + hub README). |
| SSG-M* | **MUST** — principles (this file). |
| **SSG-P1**-* | Precedence — multi-KAT and config (this file). |
| **SSG-P2**-* | Enforcement type (this file). |

KAT rule IDs (**SSG-K1**-* ... **SSG-K6**-*) live in the category part files.

---

## Agent execution contract

**SSG-C1**: This topic (hub + parts) is mandatory when adding or changing SSOT-governed fields, functions, model mutation paths, KAT lint rows or registrations (owner globs, writer files), or **KAT-5** / **KAT-6** patterns in product scope.

**SSG-C2**: [Shared **C4**](../_meta/agent-contract.md) applies to SSoT violations.

**SSG-C3**: Apply SSG- rows as written; a gap or ambiguity is resolved by [gray Procedure](../agent-gray-decisions/gray-situation-decisions.md) steps 4b–5.

**SSG-C4**: Conflict with other standards follows [decision matrix](../decision-matrix/decision-matrix.md) and project precedence. If a guard produces false positives, use false-positive standard and annotations — do not weaken rules by deleting them without a normative change (**SSG-P1-5**).

**SSG-C5**: Edits to **SSG-P1** / **SSG-P2** or KAT semantics require checking [config-driven](ssot-categories-config-driven.md) and [convention-driven](ssot-categories-convention-driven.md) for consistency; an edit that breaks a binding ID updates every part in the same change.

Verification: Use the project's table validation and lint gate results where checks apply; review read-path and cross-domain obligations where **SSG-P2** assigns review.

---

## Core philosophy (normative)

> SSoT ≠ "put everything in one place." Consolidating unrelated domains into one file, module, store, or mega-hook is not SSOT.
>
> SSoT = each datum, operation, or canonical derivation has exactly one authoritative source. Different data will have different authorities (DB table + domain service, shared constant module, policy function, design tokens, documented form selection handlers).
>
> Authority vs derived: Backend persistence and registered write paths are authority. TanStack Query cache, Zustand UI state, URL query params, and denormalized copies are derived or ephemeral unless architecture explicitly documents otherwise. On conflict, authority wins — rehydrate or invalidate derived state; never treat cache as truth.

**SSG-M0**: The agent must not interpret SSOT as a mandate to centralize all unrelated state or logic in one location. SSOT means one authority per protected semantic, which requires multiple authorities across a real codebase. [On violation: Bug — must split or register per semantic] [Verify by: Review; architecture / registry]

**SSG-M6**: Before implementing or changing code for a protected datum in scope, the agent must locate the existing authority: search the project's registry ([ssot-registry.md](ssot-registry.md) describes its shape) and architecture documentation, inspect domain helpers and the relevant KAT lint row or registration, and read [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) for multi-source form / selection surfaces. [On violation: Bug — must not add parallel writers or consumers first] [Verify by: Deliverable cites the authority path and registry entry; source review]

**SSG-M6** application — consumer census. A task that adds a feature to, refactors or moves a protected datum or operation **MUST**, before its first source edit, list every consumer of that semantic across the whole repository — each screen, endpoint, job, notification and export that reads, shows or writes it — and mark whether each one goes through the authority. The search is by meaning, not only by importers of the authority, because a bypassing consumer never imports it. A consumer with its own derivation, a stale field or a literal is bound to the authority in the same change (**SSG-M8**); where no authority exists, it is created and registered first (**SSG-M7**) and every listed consumer is then bound to it. The census is written in the plan or chat summary. Reason: an authority adopted by only some of its consumers is a second answer on every surface it skipped, and a task that inspects only the surface it edits never sees them. [On violation: Bug — partial adoption ships two answers for one semantic] [Verify by: Review — the deliverable lists each consumer's path and status; a bypassing consumer found later that the census omitted is a finding]

**SSG-M7**: If no authority exists for the semantic, the agent must define exactly one authority path before adding consumers (shared module, domain service, documented handler set). When **KAT-1**–4 applies, add its lint row or registration per [**SSG-A-1**](ssot-guard-and-agent.md) (admission-gated) before merge. [On violation: Merge blocked / bug] [Verify by: PR + lint gate where a registration applies]

**SSG-M8**: If authority exists but is insufficient (duplicate writers, bypass paths, split selection, dual normalization), the agent must refactor toward a single authority without weakening other registered SSOT entries (**SSG-P1-2**, **SSG-N16** in guard file). Forbidden: leave a "temporary" parallel path for later. Where the authority NORMALISES before it composes — sorting the two sides of a symmetric pair, casefolding, canonicalising an order — that normalisation is not an implementation detail of the derivation: it IS the identity. A second producer that composes the same parts without it yields a different value for the same subject, so every equality-based protection built on that value (deduplication, uniqueness constraint, idempotency claim, cache hit) simply never fires — the duplicate is not rejected, it is not recognised. Nothing errors, and where the protected operation grants something the subject is granted it twice. Any precondition the authority enforces at the same point (rejecting a self-pair, an empty side) is skipped by the copy for free. [On violation: Bug — must fix before ship] [Verify by: Review + guard output; for a normalising authority, the composed shape is anchored mechanically so a second composition cannot be spelled at all]

**SSG-M8** shapes — name and test. Each is an application of **SSG-M8**, not a separate rule; when a test answers *yes*, the linked example file shows the measured case and its fix.

- Substituting twin — do two accessors answer one question and differ only in what they return when there is no answer? Delete the substituting one. → [stored shapes](ssot-must-duplicate-authority-applications.md)
- Trigger flag — does any path write an engine's trigger flag without the fields that are meaningful only while it is set? → same file
- Materialised eligibility flag — is a stored flag that is the product of several inputs patched from an event body instead of recomputed from every input's authority? → same file
- Relation-derived counter cache — is a count of a relation written back onto the relation's owner as a time-limited copy? → same file
- Gate that re-derives what it was given — does the gate match on a canonicalised identifier while its caller returns the raw argument? → same file
- Partial writer of a materialised derived value — does any path change an input field without calling the one seam that re-derives the stored value and the rules bounded by it? → same file
- Incomplete or same-file copy of a closed value set — is there a hand-written second list of a closed set's members (complete or not)? A same-file copy is fenced; a cross-file one is review. → [closed value sets](ssot-must-duplicate-authority-declaration-shapes.md)
- Consolidating authority narrower than its copies — can the authority accept every input the widest absorbed copy accepted? → same file
- Sentinel token instead of the value — does a producer ship a key for consumers to translate when it can resolve the value itself? → [single values and raw inputs](ssot-must-duplicate-authority-declaration-shapes-2.md)
- Sibling reading the raw input — does any screen read a derivation's raw input field instead of calling the derivation? → same file
- Insufficient classification predicate — is a fact with more than two classes decided by a comparator or an equality chain? → [classification predicate](ssot-must-insufficient-classification-predicate.md)
- Analytical copy — does a separate reporting store hold a fact the product itself owns, merge per row instead of replacing its window, or get read back as a source? → [read-path integrity](ssot-must-read-path-integrity.md)

**SSG-M8** application — scoped complete snapshots. A complete remote snapshot is still a scoped publication. Same subject and session credentials do not prove the same actor, global role, confirmed preference or requested target while an asynchronous read is in flight. Reader and publisher consume one original context lifetime and one complete-body validator; a context that was retired cannot revive merely because scalar values returned to their old values. Re-read the real authority under current proof instead of merging newer mirror fields into an older DTO. A committed server command and its later mirror/cache/UI work are separate outcomes: independently contain each required followup so one failure cannot reverse business acceptance or skip a directly impacted derived read. The existing typed/runtime authorities are stronger than a new lexical fence; complete SDK/caller/lifecycle ordering remains review-owned.

A funnel's base step **MUST** be derived from the funnel's population, never recounted from a second source (**SSG-M8** application). When the base is counted independently of the population every later step is compared against a number that was measured differently, and the funnel stops being monotonic: a sub-step can exceed its parent and the screen shows a conversion rate above 100%. Measured shape: a base counted by rescanning an event collection diverged from the population because one owner may hold several tenants, so a later step exceeded the base it is a subset of. Deriving the base from the population makes the invariant hold by construction — there is nothing left to drift. The mechanically decidable half is that a second definition of the base counter must not exist; use is free, since importing the single authority is not a copy. Whether some *differently named* function semantically recomputes the same base is an inventory claim no single file answers, and it stays with review.

A view that places records into a grid derived from configuration (time slots, columns, buckets) **MUST** take the grid from the same authority the server classifies those records against, **MUST NOT** shift or re-derive the grid from the records it shows, and **MUST** render a record whose key is not on the grid in its own row or card instead of dropping it (**SSG-M8** application). A grid that ends one step later, or moves after a longer record, offers empty cells the server will classify differently and hides records left behind by a configuration change, with no error. Where a client copy's divergence from that authority is exactly this defect, **SSG-M23** (b) does not carry it across as a mode.

A derived read-model **MUST NOT** write to an authority (**SSG-M8** application; fences the "derived value leaks back" defect). A file whose purpose is to *derive a view* — an analytics aggregate, a report projection, a dashboard metric, a totals roll-up — reads from authorities and must never persist to one. The moment it writes, it becomes a second writer of data the authority owns: *"what is the correct value?"* has two answers, they run on different cadences, and they diverge. The defect is silent by construction — the view always renders a plausible number, so the drift is discovered only much later, from a different question.

The enforcement trap here is worth naming, because the obvious rule is the wrong one. A repo that already forbids direct model access from outside its persistence layer will appear to cover this. It does not, and widening that rule to cover it is a regression: its predicate is *any* model access, whereas model reading is exactly what a derived read-model legitimately does — it is the file's reason to exist. The correct fence takes only the write subset and leaves the read surface untouched.

The enforcement scope must identify derived read-models explicitly, and the reason is a limit of the code, not a preference. The predicate *"this file is a derived read-model"* is not machine-readable: a file's name, directory, imports and signature do not distinguish a derived view from a write path, and in a real tree both live side by side under the same folder. A path glob therefore cannot make the distinction and would flag legitimate write paths. Enumerate the read-model files (or use an equally trustworthy declaration); adding one is a deliberate decision, and the list only ever grows. Resolve the receiver by import provenance, not by name — a locally defined object sharing a model's name is not that model, and name matching alone reports it. [On violation: Bug — a derived view becomes a second writer] [Verify by: single-file AST rule over an enumerated read-model list, matching only persistence methods and resolving the receiver to a model import binding]

**SSG-M23**: Before two parallel derivations are reduced to one authority (**SSG-M8**), their EQUIVALENCE is MEASURED — resemblance is not proof. Two derivations that appear to answer the same question are not thereby interchangeable, and "both narrow the same collection" is a resemblance. Deleting one and wiring its consumer into the other is a behaviour change on every input where the two disagree: the surviving derivation silently begins answering a *different* question for that consumer, no gate fails, and the output is not visibly wrong — it is plausible and wrong. The reduction is therefore decided by measurement, over the inputs the deleted side actually receives. (a) Equal → merge, and the deletion is a pure reduction. (b) Divergent → "just wire it to the authority" is a LOSS of behaviour and is refused — a quality regression, not a simplification. The correct move keeps one authority *and* carries the behaviour across intact: add an explicitly named branch/mode to the canonical authority that reproduces the deleted derivation exactly. A named mode is auditable and inherits every later protection the authority gains; a consumer silently absorbed into a neighbouring branch is neither. (c) The parallel copy is deleted in the SAME change that adds the mode ([**DCD-M2**](../dead-code/dead-code-rules.md)), or the reduction has produced a third state instead of removing the second. *Measured shape: a subject-facing list narrowed by the viewing subject's own identity across every tenant they belong to, while the canonical branch narrowed by the member who created the record inside one tenant — one collection, two different questions. A blind merge would have shown the subject a list that was not theirs.* [On violation: Bug — a silent behaviour change wearing a de-duplication's clothes] [Verify by: recorded equal output for both derivations over the deleted side's real input set, or a named mode in the authority plus the same-change deletion of the copy]

**SSG-M23** shapes — name and test (applications, not separate rules):

- Held input — does a consumer that already holds the authority's first-precedence input read it bare and skip what the authority does after choosing a source? → [re-spelled derivation](ssot-must-derivation-respelled-applications.md)
- Extraction declaration — does a module extracted to end N copies state in its header how many copies are still open? → same file
- Frozen contribution views — does a caller recompute an allocation or collapse frozen rows into an identifier-keyed map instead of using the contribution authority's named row and subtotal views? → [re-spelled derivation (3/3)](ssot-must-derivation-respelled-applications-3.md)

---

Parts:

0. [Measured shapes of a duplicate authority](ssot-must-duplicate-authority-applications.md), [declared, not stored (1/2)](ssot-must-duplicate-authority-declaration-shapes.md) and [(2/2)](ssot-must-duplicate-authority-declaration-shapes-2.md) — **SSG-M8** example files, opened from the shape list above; no rule identity
1. [**MUST** — authority, write access and derived fields](ssot-must-authority-and-derivation.md) — **SSG-M1**, **SSG-M2**; [**MUST** — read integrity and reported aggregates](ssot-must-read-integrity-and-aggregates.md) — **SSG-M3**, **SSG-M18**
1b. **SSG-M1** example files, opened from the shape list in [authority, write access and derived fields](ssot-must-authority-and-derivation.md): [wrong derivation source](ssot-must-derivation-source-applications.md), [(2/2)](ssot-must-derivation-source-applications-2.md), [re-spelled derivation](ssot-must-derivation-respelled-applications.md), [(2/3)](ssot-must-derivation-respelled-applications-2.md), [(3/3)](ssot-must-derivation-respelled-applications-3.md), [provider cache, wrong subject](ssot-must-provider-cache-subject-mismatch.md); no rule identity
2. [**MUST** — external provider projections](ssot-must-provider-projection.md) — **SSG-M9**–**SSG-M12**, **SSG-M19**
2b. [**MUST** — entitlement lifetime and capacity-gated admission](ssot-must-provider-entitlement-and-capacity.md) — **SSG-M13**, **SSG-M14**
3. [**MUST** — provider effective-access callback boundary](ssot-must-provider-access-boundary.md) — **SSG-M21**
4. [**MUST** — actor-class access and schema parity](ssot-must-access-and-schema.md) — **SSG-M15**, **SSG-M16**
5. [Precedence, enforcement type and failure path](ssot-precedence-and-enforcement.md) — **SSG-P1**, **SSG-P1-1**–**SSG-P1-5**, **SSG-P2**, **SSG-P2-1**
6. [Implementation checklist (appendix)](ssot-principles-appendix.md) — no rule identity
7. [**MUST** — read-path integrity (a query path does not write)](ssot-must-read-path-integrity.md) — **SSG-M20**
8. [**MUST** — no stand-in data on a production path](ssot-must-no-stand-in-data.md) — **SSG-M17**
