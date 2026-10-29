# Implementation verification (MD–code 1:1)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** MD-code 1:1, implementation verification, verification table, evidence

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1**–**P8** when this topic is in scope (**P8** verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: audit entry point index).

Short name: MD–code verification

Scope

- Project independence: This hub applies to any workspace that adopts the standards kit. Any paths shown in an implementation-bound target are treated as obligations only when that target explicitly pins them.
- Included: Agent execution protocol for comparing an implementation-bound Markdown plan, analysis, blueprint, or technical note against the repository codebase item-by-item; producing a verification table with Evidence; recursively following reference chains inside the MD; remediating Missing items with full implementation subject to domain standards. Implementation-bound is defined only as in [execution-procedure.md](execution-procedure.md) **A2** definition (no agent-invented reading). When the user designates a target MD as authoritative for the pass, **IV-C8** applies (exhaustive checklist and evidence-table rows).
- Excluded: Markdown that contains no verifiable technical obligations (pure narrative docs). Domain-only business-rule correctness (whether a product rule is _right for the business_) remains under topic SSOT files — this topic governs traceability, procedure, and evidence for obligations written in the target MD. However: rows in the target MD that name UI copy, i18n keys, locale files, or a11y labels are verifiable when they appear as checklist / verification / evidence table rows or equivalent atomic items (**IV-D5**); do not treat them as non-technical Excluded "domain QA" if the MD lists them.
- Trigger: This standard is mandatory when [`markdown-authoring.md`](../authoring/markdown-authoring.md) **M17** applies or the user explicitly requests 1:1 MD vs code, item-by-item verification, function-by-function checks, or equivalent wording and the target MD contains at least one concrete technical obligation (paths, functions, fields, behaviors).

Decision gates: N/A — this topic is procedure and traceability; it does not choose application stack layers.

Environment: Governs verification procedure and repository inspection. When a pass inspects logging or transport behavior, the applicable logging and transport standards remain authoritative for those domain rules.

Binding principle: Violation of IV-M / IV-N / IV-F / IV-O / IV-AM / IV-AN rows — including **IV-C8** when a target MD is authoritative — yields invalid verification output, rejected agent deliverables, and STOP on critical paths (**IV-C3**, **IV-F2**, **IV-F3**). This README routes; it defines no rule row.

Normative parts (read all that apply to the task):

| Part                                                     | Role                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [validation-rules.md](validation-rules.md)               | Rule engine: IV-C, IV-D, IV-O, IV-F, IV-XB, enforcement summary                                                                                                                                                                                                                     |
| [verification-must-rules.md](verification-must-rules.md) | **IV-M1**–**IV-M9** / IV-N rows — how a verification run is conducted and evidenced — and the markdown-authoring mapping note                                                                                                                                                       |
| [change-acceptance-bar.md](change-acceptance-bar.md)     | **IV-M10**–**IV-M14** — the enterprise/best-practice bar, the only-better ratchet, the before/trigger/preservation/after proof a defect fix or authority consolidation must carry, the required shape and placement of the limit an unfenceable decision owes, and only-needed code |
| [execution-procedure.md](execution-procedure.md)         | Ordered checklist, inventory shape, completion definition, acceptance checks **V1**–**V8**                                                                                                                                                                                          |
| [anti-loop-rules.md](anti-loop-rules.md)                 | IV-AM / IV-AN anti-loophole rules                                                                                                                                                                                                                                                   |

References: [`markdown-authoring.md`](../authoring/markdown-authoring.md) (**M17**); [`cross-impact-analysis.md`](../authoring/cross-impact-analysis.md) (XIA-\* — when target MD includes a Cross-impact analysis table, treat rows as verifiable obligations per **IV-D5**); [`backend-http-efficiency.md`](../backend-http-efficiency/backend-http-efficiency.md) (BHE-\* — when target MD cites BHE- obligations); [`gray-situation-decisions.md`](../agent-gray-decisions/gray-situation-decisions.md). Discovery (non-normative): the generated kit-root lookup `routing-vocabulary.tsv` (shape / signal → files, grepped never read; built and freshness-checked with `node tools/kit-lookups.mjs`, `--check`) and [`agent-routing-aid.md`](../_meta/agent-routing-aid.md) (the seven shape names, glossed); use to locate which standard file to open before **IV-M6** reference-chain expansion (does not replace normative topic files or Evidence rows).

---

## Rule identifiers (normative)

| Prefix  | Meaning                                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IV-C\*  | Agent execution contract (validation-rules.md).                                                                                                                                         |
| IV-M\*  | **MUST** — core verification and remediation (verification-must-rules.md), plus the change-acceptance bar **IV-M10**–**IV-M14** ([change-acceptance-bar.md](change-acceptance-bar.md)). |
| IV-N\*  | **MUST NOT** — forbidden shortcuts (**IV-N8** — inventory id append-only).                                                                                                              |
| IV-F\*  | Failure path — STOP / invalid outcomes.                                                                                                                                                 |
| IV-D\*  | Decision definitions — removes ambiguity; includes **IV-D4** (Missing vs Invalid) and **IV-D5** (checklist / matrix rows, including localization when listed).                          |
| IV-O\*  | Output shape — verification table (deliverable caps).                                                                                                                                   |
| IV-AM\* | **MUST** — anti-loophole (anti-loop-rules.md).                                                                                                                                          |
| IV-AN\* | **MUST NOT** — anti-loophole (anti-loop-rules.md).                                                                                                                                      |
