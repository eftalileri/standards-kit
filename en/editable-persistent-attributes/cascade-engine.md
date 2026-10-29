# Cascade engine (editable persistent attributes)

```kit-cover
type: normative
part-of: README.md
binds: CAS-C, CAS-M and CAS-N -- the single cascade module, when it runs relative to the SSoT write, word-boundary body replacement, type targeting, call-site documentation, ordered transition accumulation in a deferred queue and durable acceptance delivery
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:denormalization
skip-when: signal:no-denormalized-copy, signal:client-only
owns: CAS-C1, CAS-C2, CAS-C3, CAS-C4, CAS-M1, CAS-M2, CAS-M3, CAS-M4, CAS-M5, CAS-M6, CAS-M7, CAS-M8, CAS-M9, CAS-M10, CAS-N1, CAS-N2
```

Scope

- Included: Single domain cascade module layout; call after successful SSoT write; `data.\*` and `body` together; word-boundary replace for `body`; type-based targeting when one field serves multiple entity kinds; entity resolution when ID is missing on some documents; call-site documentation.
- Excluded: HTTP request budget and async trigger ([execution](execution-async-batch-logging.md)); index creation ([mongo cascade indexing](mongo-cascade-indexing.md)). Zod schemas ([validation](validation-types-and-migration.md)).

Document type: Normative — part of `editable-persistent-attributes/` hub.

Decision gates: Applies — [decision gates](decision-gates.md) (**GEPA**\*) route here.

Environment: Applies to server-side persistence paths using MongoDB or an equivalent document store.

References: [README](README.md); [SSoT, denormalization, and copy declaration](ssot-denormalization-and-impact-matrix.md) (**EDM-\***).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **CAS-C**\* | Agent execution contract. |
| **CAS-M**\* | **MUST**. |
| **CAS-N**\* | **MUST NOT**. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **CAS-C1** | This file is mandatory when implementing or reviewing cascade for editable persistent attributes. |
| **CAS-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **CAS-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **CAS-C4** | STOP if `body` replace is required by GEPA5 but implementation only updates `data.\*`. |

---

## **MUST** — **CAS-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| CAS-M1 | Cascade behavior **MUST** live behind one documented domain entry point; per-attribute or per-entity behavior **SHOULD** be split into functions that respect the adopting system's module-size guidance (for example [code modularity](../code-modularity/code-modularity.md)). | Unmaintainable / duplicate cascade — bug. | One documented entry point; no second cascade root for the same domain. |
| **CAS-M2** | The code path that successfully updates SSoT **MUST** invoke the cascade entrypoint after commit success (same transaction policy as [transactions](../transactions/transaction-policy.md) if used). | Missing cascade — bug. | Static inspection: or review: after SSoT update, cascade trigger exists. |
| **CAS-M3** | When a document stores both structured fields (for example `data.customerName`) and `body`, and any UI or template renders `body` for the user, cascade **MUST** update `data.\*` and apply `body` old→new string replace per **CAS-M4**–**CAS-M7**. | User sees stale text — bug. | GEPA5; test with fixture that only changes `body`. |
| **CAS-M4** | When text replacement is part of the domain contract, use token-aware matching so a value is not replaced inside a longer token. Escape input if a regular expression is used and choose boundaries appropriate to the text's language and tokenization rules. The replace **MUST** also be idempotent ([**EXE-M5**](execution-async-batch-logging.md)) when the new text contains the old text as a whole token (`Alpha` → `Alpha Plus`, `Pro Alpha`): a match that lies inside a whole-token occurrence of the new text is already renamed and **MUST NOT** be replaced, otherwise a retried run — or a document created under the new name before the cascade ran — becomes `Alpha Plus Plus`. The guard lives in the single replace function, never in each caller. | Data corruption — bug. | Review representative names and substrings under the product's supported text conventions. |

| **CAS-M5** | When the same structured field (for example `data.createdServiceOrPackageName`) can represent more than one entity kind, cascade **MUST** filter by record type (for example `data.type`) so only service or package contexts update when that entity changes. If `serviceId` / `packageId` exists on the document, **MUST** prefer ID match when the project adds those fields. | Wrong rows updated — bug. | Filter in query matches GEPA6; test two same-name entities. |
| **CAS-M6** | When a document lacks the entity ID, **MUST** document its resolution path in the value's registry row contract (**EDM-M5**) or the cascade module notes; implement that path before relying on batch performance fixes alone. | N+1 or wrong matches — bug. | Documentation and code review; **MCI** indexes for join fields. |
| **CAS-M7** | Cascade **MUST** process ID-known documents before or in separate batch from ID-resolved paths when documented ordering reduces risk; ordering **MUST** be written in the module or the value's registry row contract (**EDM-M5**). | Inconsistent partial updates — bug. | Written order; tests. |
| **CAS-M8** | Every production call site that triggers cascade **MUST** be listed in architecture or module README or the value's registry row contract (**EDM-M5**) (file path + function name). | Hidden routes — bug. | Review checklist finds all triggers. |
| **CAS-M9** | When cascade is deferred through a coalescing durable queue keyed by entity, the queued intent **MUST** accumulate the ordered sequence of transitions, not the last value — whenever the applier's selection predicate is expressed in terms of the PRE-transition value, which is exactly the case for the `body` replace **CAS-M4** mandates. Coalescing by overwrite (`$set` of a single old→new pair) is safe only when every consumer is selected by a stable identity; a document selected by the old label is invisible to a later transition whose `from` it never carried, so an A→B→C burst leaves every A-bearing document permanently stranded. The capacity bound on that sequence **MUST** fail loud; it **MUST NOT** drop the oldest entry, because that reintroduces the identical loss inside the mechanism meant to prevent it. | Permanently stale denormalized text with no error, no retry and no dead-letter row — the applier reports success having matched zero documents. Radius differs by entity kind: total where the only predicate is the old label, partial where an identity-scoped field self-heals but `body` does not. | Replay an A→B→C burst per entity kind and assert dependent documents reach C; assert the counterfactual (last-value) leaves A in `body`; assert the capacity bound raises a typed error and leaves the oldest transition in place. |
| **CAS-M10** | A deferred cascade producer **MUST** deliver the durable acceptance of the queued intent to its caller — the caller awaits the write receipt, never the cascade work (which is unbounded and belongs to the drainer). A producer surface typed `void` makes acceptance unprovable: the mutation returns success while the intent may never have been persisted. Where the producer also starts a best-effort early execution, the persistence half **MUST** sit outside any background-intake/shutdown gate and the execution half inside it — only the half that carries no guarantee may be silently skipped. | Mutation reports success, intent never written, dependent text stale forever — and the driver failure reaches no caller, ending at a log boundary. | Producer return type is a promise of a receipt and every call site awaits it; the durable write is not inside the background gate; failure of the write propagates to the caller ([**REP-M-7**](../repository/repository-boundary-and-atomic-claims.md), [**REP-M-13**](../repository/repository-atomic-claims.md) enqueue-parity). |

Stated enforcement limit: Whether a queue applier selects by pre-transition values depends on the queue schema, producer, and applier together; a single-file static check may not establish this. Review that selection predicate and verify that queued transitions preserve the information needed to find affected records.

A check for **CAS-M10** is declined under **ENA-A2** while the class has one measured defect and a single durable-queue producer.

Stated limit of the **CAS-M4** idempotence clause ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b), **ENA-GV3**): the strongest mechanism is the single replace function (**ENA-P1** — every caller shares it, so the class is unrepresentable per caller); no lint or guard is added, because a rule can only see that a caller uses that function, not what its text contains (fails **ENA-A1** (c)). The clause covers a new label that contains the old one. It does not protect text that is ambiguous by construction: a shrinking rename (old label contains the new one, `Yoga Plus` → `Yoga`) or neighbouring words that re-form the old label after replacement (`Alpha Plus Plus`) read as *new label + genuine neighbour word*, and no purely textual function can tell them from an un-renamed occurrence. The converse is the price of the clause and is accepted: a genuine old-label occurrence whose neighbouring words happen to spell the new label already (`Pro` + `Alpha` when renaming `Alpha` → `Pro Alpha`) is left unchanged, because it is character-for-character identical to an already-renamed occurrence. Matching is case-sensitive (no case folding).

---

## **MUST NOT** — **CAS-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **CAS-N1** | Must not apply plain global substring replace on `body` (for example `split(old).join(new)` without word boundaries) when **CAS-M4** applies. | Bug — EDM wrong data. | grep for forbidden pattern / lint rule if exists. |
| **CAS-N2** | Must not duplicate cascade root logic outside **CAS-M1** module (wrappers that call the module are OK ). | Drift — bug. | One import graph root. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Body renders old value after SSoT change | STOP — implement **CAS-M3** + **CAS-M4**; GEPA5. |
| Same name two entities, wrong cascade | STOP — **CAS-M5** + GEPA6. |

---

Part of: [README.md](README.md).
