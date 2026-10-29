# Dead code detection and removal — global SSOT

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract, the two-layer detection model DCD-M1, the GDCD decision gates, the enforcement-side and query-side residue a deletion leaves behind, and the Verify checklist for every deletion
open-when: shape:refactoring, shape:backend-heavy, signal:source-file-change, signal:dead-code-removal, signal:unused-report, signal:wire-surface-removal
skip-when: signal:no-deletion
owns: DCD-C1, DCD-C2, DCD-C3, DCD-C4, DCD-M1, GDCD1, GDCD2, GDCD3, GDCD4
```

Scope

- **Included:** Binding policy for finding and removing dead code: local and whole-graph detection, the **reachability horizon** for published wire surfaces (**DCD-M8** — released clients are consumers no source-tree scan can see), the verify-before-delete protocol, false-positive handling, and project-gate integration. The examples use **ESLint** and **knip** where the consuming stack adopts them; use configured equivalents otherwise.
- Excluded: Import-path / barrel rules — [imports.md](../imports/component-and-module-imports.md) (IMP-\*); file-split baselines — [code-modularity.md](../code-modularity/code-modularity.md) (COD-\*); dependency placement across workspaces — [monorepo](../monorepo/README.md) (MRP-\*); ESLint rule authoring beyond the dead-code rule set — project ESLint config.

Document type: Normative — contract, detection model, gates and Verify for the dead-code topic. The **DCD-M2**–**DCD-M8** and **DCD-N** rows live in [dead-code-rules.md](dead-code-rules.md); operational detail in [knip-usage.md](knip-usage.md) and [knip-optimization-playbook.md](knip-optimization-playbook.md).

**Environment:** Examples assume a typed JavaScript/TypeScript repository with local linting and an optional whole-graph analyzer. Adapt source roots, extensions, commands, and CI wiring to the consuming project; derive them from that project's configuration authorities.

Binding principle: Shipping code that violates **DCD-M** / **DCD-N** is a dead-code-class bug — must not ship. But the inverse is equally binding: deleting code that is actually reachable is a correctness bug. When detection and certainty conflict, keep the code and record the candidate; never delete on a tool report alone.

> Scripts in analysis vs. fixing — the rule is the project’s; this kit names it and owns only the dead-code consequence. Whether a script may edit source, what stays permitted for read-only analysis, whether a user request can waive it, and the conditions of any deterministic rule-bound autofix exception are defined once, in the project's root agent-rule file ([**DCD-N2**](dead-code-rules.md) names it; [**KIT-LIM-7**](../authoring/kit-stated-limits.md) is why it is not restated here). Read the obligation there. Two consequences are dead-code-specific and bind here: (1) a scan that produces a candidate list writes its output to stdout or an analysis MD — source is never touched by the analysis step; (2) every removal is file-by-file, deliberate — read the file, then one deliberate editor action — and a whole-graph tool's own fixer (`knip --fix`) is a source-editing script, so it is never a removal path (**DCD-M3**).

References: [README.md](README.md); [dead-code-rules.md](dead-code-rules.md); [knip-usage.md](knip-usage.md); [imports](../imports/README.md); [code-modularity](../code-modularity/README.md); [ssot governance](../ssot/README.md) (**SSG-M8**).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **DCD-C*** | Agent execution contract. |
| **DCD-M*** | **MUST**. |
| **DCD-N*** | **MUST NOT**. |
| GDCD* | Decision gates — binary routing; cite **DCD-M** / **DCD-N** rows only. |

Citations must use full IDs (e.g. **DCD-N2**).

---

## Agent execution contract

**DCD-C1**: This topic is mandatory whenever code, exports, files, dependencies, or wire surfaces (routes/endpoints, response fields, request parameters, event names, published contracts) are removed as "unused", or when a dead-code scan (knip / ts-prune / ESLint) is run to drive deletions. For a wire surface the source tree is not the whole consumer set — **DCD-M8** / GDCD4 apply before any other check.

**DCD-C2**: Detection is two-layer and the layers are not interchangeable (**DCD-M1**). A tool report is a candidate list, never a delete list (**DCD-M3**).

**DCD-C3**: Precedence: functional correctness > cleanliness. If removal fails a required project verification check, investigate and fix the cause or revert the removal; do not bypass the check to force it through.

**DCD-C4**: Apply [shared **C4** and **C2**](../_meta/agent-contract.md); the guarantee the stricter reading keeps here is verify-before-delete.

---

<a id="the-two-layer-detection-model-dcd-m1"></a>

## The two-layer detection model — [**DCD-M1**](dead-code-rules.md) reading

| Layer | Tool | Catches | Reliability | Enforcement |
|-------|------|---------|-------------|-------------|
| **In-file** | Project's compiler or linter (ESLint in the example stack) | unused imports, variables, styles, and other locally decidable symbols | Depends on configuration; verify findings | Blocking at the project's chosen severity when the signal is reliable |
| **Whole-graph** | A configured analyzer (knip in the example stack) | orphan **files**, unused **exports/types**, unused and unlisted dependencies | Candidate quality varies; needs configuration and per-item review | Advisory until the project demonstrates that the relevant categories are sufficiently precise |

**DCD-M1**: Projects **MUST** distinguish locally decidable unused symbols from whole-graph reachability candidates and use suitable detection for each class. Configure the in-file layer at a severity justified by its measured precision. A whole-graph report remains advisory while its findings include known false positives; it MUST NOT gate merges in that state (DCD-N3).

---

## Decision gates

GDCD1: Proceed only if YES → The report is from a **configured whole-graph analyzer** (when the project adopts one) **and** the candidate's file class is demonstrably included in its graph. [Binding: DCD-M4] [If NO: configure or validate coverage first — an unconfigured report is noise, and an unscanned class is not "clean"].

GDCD2: Proceed only if YES → For this specific candidate, source references = 0 after excluding `node_modules` / `*.d.ts`, and no dynamic/string/cross-workspace consumer exists. [Binding: **DCD-M3**, **DCD-M6**] [If NO: keep it (**DCD-M6**)].

GDCD3: Proceed only if YES → After deleting this batch, the project’s applicable required verification checks pass. [Binding: **DCD-M3**, **DCD-C3**] [If NO: investigate or revert the batch; do not bypass required checks].

GDCD4: Ask before GDCD2 whenever the candidate is a wire surface (route/endpoint, response field, request parameter, event or message name, persisted schema key, published contract). Read the published wire-contract record first — if the surface is listed under any release whose status is still *in-field*, the answer is already NO and you stop here. Otherwise proceed only if YES → The oldest consumer release still in the field has been identified, its own source (release tag / build commit — not HEAD) was scanned, and it does not call this surface. Absence from the record is not a YES — an unlisted surface is unmeasured, not unused. [Binding: **DCD-M8**, **DCD-N5**] [If NO — it still calls it, or the field inventory cannot be established: do not delete; keep it as a delegating compatibility alias (**DCD-M8c**) or retain as uncertain (**DCD-M6**)].

---

## Enforcement-side residue of a deletion (binds via **DCD-M2**, **DCD-M7**, **DCD-M9**)

[**DCD-M9**](dead-code-rules.md) binds dropping every identifier that existed only to serve a deleted leftover, and names product-code examples (a member of an operation-name union, diagnostic constants, now-unused imports). A deleted symbol is frequently named somewhere else too: as a bare string inside an *enforcement artifact* — a lint rule's set of locked export names, a guard's registry or config entry, an allowlist, an ignore path. That half is bound by the same rows and is called out separately here because its harm is different in kind, which is why it survives deletions that were otherwise complete.

Why it is not caught. The entry is a string in a lint or guard artifact, outside the compiled program's name resolution, so no type error and no unused-symbol rule can see it. The artifact itself usually keeps working: a sub-predicate that tests for a name nothing exports simply never matches. Nothing turns red — the deletion looks clean in every gate.

Why it is still a defect. The artifact keeps advertising coverage it no longer has: a lock listed as protecting N symbols now protects N−1, and the next reader who asks *"is this seam locked?"* answers it by reading the list, which lies. That is the exact failure the kit treats as worse than an admitted gap — an unenforceable entry reads as *covered*, while a stated limit reads as what it is. The residue also mis-sizes the next change: an author extending the artifact reasons from a member set that includes a symbol with no definition.

**MUST**. A deletion that removes an exported symbol **MUST** search the enforcement tree for that symbol's name — lint rule sources, guard sources, and the config/registry files they read — and drop, in the same change ([**DCD-M2**](dead-code-rules.md)), every entry that named only the deleted symbol. Entries naming symbols that still exist stay; the artifact itself is not deleted merely because one of its entries died.

**MUST NOT**. Do not keep the entry "for when the symbol comes back", and do not widen the artifact's predicate to make the dead entry harmless. An entry for a symbol that does not exist is an unmeasurable lock: it cannot be proven to fire, so it cannot be counted as enforcement (this is why removing it does not weaken the artifact — there was nothing there to weaken).

Where the residue can be made self-detecting. An artifact that fails loudly on a configured path that no longer resolves often does *not* do the same for a configured name, because a path is answerable against the disk while a name is only answerable by loading the module. Where the host language lets the artifact enumerate the module's exports, extend the same fail-loud to names, and the residue becomes impossible rather than merely forbidden. Where it cannot, record it as a stated limit ([**KIT-LIM**](../authoring/kit-stated-limits.md)) naming what the check would need — never leave the gap silent.

---

## Query-side residue of a retired field (binds via **DCD-M2**, **DCD-M9**)

A field retired from a schema is usually also named outside the compiled program, as a bare string key in a query predicate. A filter is a plain object of unchecked string keys, so driver, ODM and compiler all accept a key no document can carry. The query runs. It matches nothing.

Why it is not caught. Emptiness is a legitimate answer: no exception, log, metric or failed request marks the moment the branch stopped contributing. The artifact keeps working; it stops meaning anything.

**Why the harm exceeds a crash.** A stale predicate can silently narrow or empty a query, or make a destructive operation match no records. The caller receives a plausible result or success response, so the defect can persist until the affected data is independently counted.

**MUST**. Retiring a field **MUST**, in the same change ([**DCD-M2**](dead-code-rules.md)), retire every query naming it in a predicate. The enumeration runs over predicate positions — filter keys, `$or` / `$and` branches, aggregation `$match` keys, index declarations — not merely read positions: a field can be absent from every read and still steer a query. Each survivor is rewired to the surviving authority for the same fact ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)); the field is not restored — the deletion was the decision, and a restored field is a second authority. An authority that cannot produce the sought state at all is omitted in writing: a branch left out in silence reads as one forgotten.

**MUST — the test is *declared*, not *retired*.** A key the schema **never** had (typo, rename, copied predicate) leaves the same always-empty filter, so enumeration runs against declared schema paths, not a removals list. When correcting such a predicate, verify its behavior against representative data and confirm it returns or affects the expected records.

**MUST** — the scope case. Where the retired field carried an authorization or tenant scope, the replacement predicate **MUST** be re-measured against real data for who it admits, not only for how many rows come back: a silently-empty gate and a silently-widened one look identical in review — one object key, compiling, raising nothing.

Enforcement limit (stated, not silent — [**KIT-LIM**](../authoring/kit-stated-limits.md)). The decision is cross-file — predicate in one module, schema declaration in another — so no single-file check reaches it; a whole-tree check comparing declared paths to filter keys does. Completeness is partly decidable and **MUST** be published as counts the check itself prints — a remembered share goes stale and then reads as coverage. A filter carried in a variable is reachable under a stated condition; call results, conditionals, parameters, imported constants and `$match` stages are not. The condition, and the argument-position trap that skips a whole method, sit in [nosql-declaration-index-and-destructive-writes.md](../nosql-query-safety/nosql-declaration-index-and-destructive-writes.md).

---

## Verify

- [ ] The configured in-file unused-code checks passed at the project's chosen blocking severity.
- [ ] No enforcement artifact still names a symbol this change deleted — lint rule sources, guard sources and their configs were searched by name, and every entry that named only the deleted symbol fell in the same commit.
- [ ] No query predicate still names a field this change retired — filter keys, `$or` / `$and` branches, `$match` stages and index declarations were enumerated, each survivor was rewired to the surviving authority, and where the field carried a scope the new predicate was re-measured against real data for who it admits.
- [ ] If a whole-graph analyzer is used, its configuration covers the relevant source classes and at least one real file from each class has been checked for inclusion.
- [ ] The deletion passed the verification and repository gates required by the consuming project; report any unavailable or prohibited method under the applicable policy.
- [ ] Suppressed false positives carry a recorded reason (config comment or doc).
- [ ] The touched flow has no superseded symbol, producerless key, no-op branch, stale reference, or ownerless compatibility path left by the change (**DCD-M7**).
- [ ] No wire surface was removed on a source-tree measurement alone — for each one, the oldest field release was named and its own source scanned (**DCD-M8** / GDCD4); anything still called was kept as a delegating alias, not re-derived (**DCD-N5**).
- [ ] The published wire-contract record was consulted before deleting any wire surface, and its guard is green (no recorded still-in-field surface went missing). A newly discovered field dependency was added to the record in the same change.

Part of: [Dead code README](README.md).
