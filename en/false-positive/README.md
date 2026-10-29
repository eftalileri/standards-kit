# False positive prevention (guard scripts) — hub

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** guard, CI, context, false positive, fail-closed

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1**–**P8** when this topic is in scope (**P8** verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: audit entry point index).

Scope

- Included: Validation / guard scripts that match code lines or files, may ignore a hit only after context-aware checks, and must fail closed when validation does not pass.
- Excluded: Product runtime error handling (see [error policy](../error-policy/error-policy.md), [error handling](../error-handling/error-handling.md)); SSOT category registration (see [SSOT guard and agent](../ssot/ssot-guard-and-agent.md)) except where this standard binds guard behavior.

Environment: These rules apply wherever a check runs, locally or in automation. Where CI is used, FP-F / fail-safe outcomes **MUST** make the run fail (non-zero exit or equivalent); projects without CI apply their documented local enforcement process.

Document type: Routing hub — it defines no rule row. The normative files are listed in Topic map below.

Non-normative illustrations: [`../_meta/examples/false-positive-code-samples.md`](../_meta/examples/false-positive-code-samples.md).

Index: [`../_meta/legacy-mapping.md`](../_meta/legacy-mapping.md).

Decision routing: GFP1 and GFP2 in [`rules.md`](rules.md).

---

## Agent execution contract

1. Rows FP-M / FP-N / FP-F / FP-O / FP-D in [`rules.md`](rules.md) and its part files (see Topic map) are binding; prose examples do not add obligations.
2. A check fails on every finding, makes every excuse visible and never swallows its own error (**FP-M4**).

---

## Rule identifiers (normative summary)

| Prefix | Meaning |
|--------|---------|
| FP-M\* | **MUST** — required behavior |
| FP-N\* | **MUST NOT** — forbidden behavior |
| FP-F\* | Failure — condition and mandatory outcome |
| FP-O\* | Output — required shape of logs / records |
| FP-D\* | Definition — measurable terms |
| FP-MS\* | Mechanism selection — whether the check may be a guard at all (narrow lint rule first) |
| FP-XB\* | Cross-binding — local minimum when other SSOT applies |
| GFP\* | Decision gate — binary routing |

Full tables: [`rules.md`](rules.md) and the part files in Topic map below.

---

## Enforcement (summary)

| Violation class | Consequence |
|-----------------|-------------|
| FP-M breach | Bug — must fix before ship; merge rejected if discovered in review |
| FP-N breach | Reject — change not acceptable until corrected |
| Fail-closed breach (**FP-M4**, **FP-N2**) | CI **MUST** fail (non-zero exit) |
| FP-F\* | As stated per row — STOP / CI fail where specified |

Detail: [`rules.md` § Enforcement](rules.md#enforcement-normative).

---

## Scope and authority set — derived, never listed (reading aid for **FP-M19** / **FP-M29**)

See [check-verification-rules.md](check-verification-rules.md).

## A suppression closes a finding — it does not replace one (reading aid for **FP-M18** (b) / **FP-M21**)

See [guard-runtime-rules.md](guard-runtime-rules.md).

## Derive a required set structurally, not by text scan (**FP-M19**)

See [check-design-rules.md](check-design-rules.md).

## Topic map

| File | Role |
|------|------|
| [rules.md](rules.md) | Definitions, output, failure paths and decision gates |
| [mechanism-selection.md](mechanism-selection.md) | Mechanism selection and declared capability |
| [guard-runtime-rules.md](guard-runtime-rules.md) | Runtime exits, suppression evidence, context windows and logging |
| [check-design-rules.md](check-design-rules.md) | Predicate, operand, declaration and location integrity |
| [check-verification-rules.md](check-verification-rules.md) | Proofs, anchors, scope, binding, diagnosis and aggregate coverage |

---

## Implementation review

- [ ] The check was proved by the three proofs over real files, with no test artefact and no stream-input channel ([**ENA-R6**](../enforcement-architecture/enforcement-authoring.md), **FP-N15**)
- [ ] New check opened against existing debt as a staged ratchet, never at warning severity (**FP-M18**)
- [ ] Every derived required set fails loud when it reads empty (**FP-M19**)
- [ ] Every location-valued field the check validates is resolved relative to the declaring file and existence-tested — never accepted on form alone — and the run reconciles resolved-count against declaration-count (**FP-M23**, **FP-N18**)
- [ ] The predicate expresses the invariant, not today's shape: no count/length equality where presence/superset serves, no literal content match standing in for a behavior check; the reviewer named the legitimate change that must not trip it (**FP-M22**, **FP-N17**)
- [ ] Every suppression kept or added in this change was verified, not read: the referent its reason names was opened and a rejection of the actor class was found there (**FP-M21**, **FP-N16**)
- [ ] Any finding exits non-zero, every excuse emits a complete ignore record (**FP-O1**), and no error is swallowed (**FP-M4**, **FP-F1**–**FP-F3**); **FP-O3** for GFP1 evidence
- [ ] Coverage that is still missing is recorded OPEN/deferred and never described as enforced or green

---
