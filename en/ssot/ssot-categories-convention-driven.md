# SSOT governance — convention-driven categories (**KAT-5** and **KAT-6**)

```kit-cover
type: normative
part-of: README.md
binds: KAT-5–KAT-6 convention-driven category obligations (SSG-K5, SSG-K6)
open-when: signal:schema-parse, signal:cache-lifecycle, signal:new-semantic
skip-when: signal:no-ssot-surface
owns: KAT-5, KAT-6, SSG-K5-1, SSG-K5-2, SSG-K5-3, SSG-K5-4, SSG-K5-5, SSG-K6-1, SSG-K6-2, SSG-K6-3, SSG-K6-4, SSG-K6-5, SSG-K6-6, SSG-K6-N1, SSG-K6-N2
```

Scope

- Included: **KAT-5** input validation gate (handler scope: `req.body` + schema parse), **KAT-6** cache lifecycle for optimistic updates — local minimums and enforcement types per [**SSG-P2**](ssot-precedence-and-enforcement.md). Full normative detail for TanStack mutations, bridge, invalidation, and persist is in linked stack SSOT.
- Excluded: Per-endpoint Zod field shapes — [forms](../forms/forms.md) / project schemas; full **KAT-6** text duplicated here — [TanStack Query](../tanstack-query/mutations-cache-sync.md) MUT-*, [MMKV](../mmkv/README.md) MMR-\* where persist applies.

Document type: Normative — **SSG-K5**-\*, **SSG-K6**-\* minimums.

Environment: Static (lint rules and a request-body check where the adopting project has one) + runtime (**KAT-5** `.data` usage); **KAT-6** lint rules for rollback context and row bridge where the project has them + review + TanStack normative rows. A second warning-level mechanism that duplicates an existing **KAT-6** rule is retired rather than kept alongside it ([**ENA-N18**](../enforcement-architecture/enforcement-anti-patterns.md)).

References: [Principles](ssot-principles-and-precedence.md); [Error policy](../error-policy/error-policy.md); [Decision functions](../decision-function/decision-function.md); [TanStack Query mutations and cache sync](../tanstack-query/mutations-cache-sync.md); [MMKV](../mmkv/mmkv-retention-limits-and-buster.md) (buster / stale optimistic).

---

## **KAT-5** — Input validation gate

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K5-1** | No mutation handler may pass a raw request body to business logic or persistence: a schema `safeParse` / `parse` of that payload must run before the handler's logic, at exactly one of four named sites — (i) the handler's own scope; (ii) a validating middleware in the route chain that mounts the handler, which must also replace the raw body with the validated output so no later reader can reach the unvalidated value; (iii) a named validator function in the handler's file wired into that same chain; (iv) a named validator in a separate module, invoked from the handler's own scope with the payload as an argument. The obligation is the barrier, not the address. Binding this row to the handler's own scope alone is a mechanism preference; enforcing it literally would delete the declarative route-level contract — a quality regression, not a tightening. What stays forbidden is a handler with no such site, or two of them for one payload (a second validation authority, [**SSG-M8**](ssot-principles-and-precedence.md)). | Lint / check fail / bug. | A check that decides this row must satisfy the following, so its scope is stated rather than re-derived; use the enforcement mechanism the adopting project documents, and a reference to a check is not evidence that it exists or covers the full rule. Mechanism is forced by the predicate, not chosen: three of the four sites live in files other than the handler's, so a single file's syntax tree cannot decide the row — a predicate bound to the handler's own scope accuses every route-validated handler and is born red on correct code ([**FP-M18**](../false-positive/check-design-rules.md)); the deciding fact is cross-file residue and therefore a cross-file check, not a linter rule ([**FP-MS4**](../false-positive/mechanism-selection.md)). The check asks the obligation, never the address — *is the payload parsed before business logic reaches it?* It resolves the handler, then accepts a parse in the handler's own scope, in a function the handler calls with the payload, or in a chain element that parses and writes the validated value back over the raw one. No middleware, schema or file name is an anchor ([**FP-M27**](../false-positive/check-verification-rules.md)). Every hop resolves through the declaring file's own import statements, never by name: a validator and an unrelated helper may share a name, and a name-matching engine reports a fence it never read (**SSG-G-3**). The reconciliation **FP-M19** demands is printed, not assumed — the run states resolved-handler count against route count, and an unresolved hop is carried as a declared limit, never as a finding, so "0 findings" and "never looked" cannot read alike. Two predicate errors are typical of such a check being wrong about itself. (1) Looking for the parse token inside the delegate's body fails, because the payload arrives there as a parameter: the trace must be positional — which argument carried the payload, which parameter received it. (2) Treating "the payload appears anywhere in this expression's subtree" as taint marks a call's return value as payload, so a *response* schema's parse reads as a *request* barrier and a fence-removal probe returns green — propagation must follow assignment and projection, never argument passing. Probe the fence against the real tree to catch both. Two stated limits remain (**KIT-INV-8**(b); shape fixed by [**IV-M13**](../implementation-verification/change-acceptance-bar.md)) and are written in the check's own body. (a) It measures a body read; a handler that hands the whole request object to a domain function moves the read outside the predicate, and following it would mean modelling the call graph. (b) The second-authority half of this row — two barriers for one payload — is not fenced, because deciding that two parses validate the *same* payload needs schema identity across modules; the check's finding id is therefore check-local, so this row is not reported as wholly enforced on the strength of a half. |
| **SSG-K5-2** | Must use validated output: after `safeParse` / `parse`, use `.data` (transformed) for downstream calls — must not persist or pass raw `req.body` where schema exists. | Bug — must fix; runtime incorrect data. | Code review + tests + project checks where applicable. |
| **SSG-K5-3** | Must not use `req.body as SomeType` (or equivalent type assertion) to bypass schema validation — forbidden. | Check fail / bug. | Project check + review. |
| **SSG-K5-4** | Must not call `safeParse` only to throw without using `.data` for the success path when the handler continues with the payload — forbidden (discarded transform). | Bug — review / test. | Review + static check patterns. |
| **SSG-K5-5** | After a successful `safeParse` / `parse` for the request payload, validated `.data` **MUST** be the only data passed to business logic, persistence, and nested handlers for that code path — raw `req.body` (or equivalent) **MUST NOT** be passed alongside or instead of `.data` where the schema applies. | Bug — must fix; review **MUST** reject merge if raw body is passed past parse. | Review + tests + runtime trace. |

Note: **KAT-5** has no **KAT-1**–**KAT-4** table row — the convention check applies per the adopting project's setup (**SSG-K5-1**). Agent obligation: When authoring or changing mutation handlers, the agent **MUST** implement the parse barrier at one of the named sites, and `.data` usage, per **SSG-K5-1**–**SSG-K5-5** even though no config entry exists — forbidden to ship `safeParse(...)` followed by `handle(req.body)` or equivalent (**SSG-K5-5**).

---

## **KAT-6** — Cache lifecycle (optimistic mutations)

Local minimum in this file. Full obligations: [TanStack Query mutations and cache sync](../tanstack-query/mutations-cache-sync.md) and [MMKV](../mmkv/README.md) when persist is used.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K6-1** | Where `onMutate` adds optimistic data via `setQueryData` (or equivalent), `onSuccess` must perform explicit cleanup of optimistic entries, bridge injection with server-shaped data per TanStack MUT- rules, and targeted invalidation — not invalidate-only without bridge when that would empty UI. | Lint error where the row-bridge rule decides it; review **MUST** reject the PR if any other **KAT-6** violation is detected (this row or any MUT-\* row). Must not merge to a protected branch with a known violation. | Row-bridge lint rule + mandatory review + TanStack SSOT. |
| **SSG-K6-2** | `onError` must restore prior cache state (e.g. `previousData`) when optimistic updates were applied. | Same as **SSG-K6-1**: review **MUST** reject PR on detected violation; must not merge a broken rollback path. | Rollback-context lint rule + review. |
| **SSG-K6-3** | Optimistic and bridge writes must use the same canonical row shape builder per TanStack MUT- / format rules — no dual `id` / `_id` shapes in the same cache key. | Bug — must fix; review **MUST** reject PR if detected before merge. | Review + TanStack SSOT. |
| **SSG-K6-4** | Pagination / infinite query cache mutations must preserve `pages` / `pageParams` structure per TanStack SSOT — forbidden to break list shape. | Bug — must fix; review **MUST** reject PR if detected. | Review + TanStack SSOT. |
| **SSG-K6-5** | Bridge injection **MUST** use full server / mutation-response-shaped row data per project mapping. **MUST NOT** inject a partial client-only shape that drops fields present on the authoritative server response (SSOT bypass risk for security filters and invariants). | Bug — must fix; review **MUST** reject PR if detected. | Review + TanStack MUT-\* + response shape audit. |
| **SSG-K6-6** | `onMutate` and `onSuccess` **MUST** use the same single named canonical builder (e.g. `buildBackendLikeRow` or architecture-documented equivalent) for the same cache key — format dualism (separate ad hoc objects with mismatched `id` / `_id` or field sets) is forbidden. Normative depth: [mutations-cache-sync](../tanstack-query/mutations-cache-sync.md). | Bug — must fix; review **MUST** reject PR if detected. | Review + diff of optimistic vs success writers. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K6-N1** | Must not add optimistic entries without corresponding `onSuccess` cleanup and bridge rules per TanStack SSOT — forbidden. | Review **MUST** reject PR; bug if shipped. | Row-bridge lint rule + review. |
| **SSG-K6-N2** | Must not change persisted optimistic format without buster / invalidation policy per [MMKV](../mmkv/mmkv-retention-limits-and-buster.md) when persist applies — forbidden. | Review **MUST** reject PR if detected; bug if shipped. | MMKV + TanStack cross-review. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Handler uses `req.body` with no parse at any of the four named sites | Fix handler — **SSG-K5-1** / **SSG-K5-3**. Check the mounting route chain and any validator the handler calls with the payload before calling it a violation: the barrier is usually at one of those. |
| Handler parses then passes raw body to logic | STOP — fix per **SSG-K5-5**; must not merge until corrected. |
| Optimistic mutation ships without TanStack compliance | Fix per [mutations-cache-sync](../tanstack-query/mutations-cache-sync.md) — STOP until aligned (**SSG-K6-1**). |

---

Part of: [README.md](README.md).
