# Markdown authoring — deliverable shape, size guard and MD–code traceability (normative)

```kit-cover
type: normative
part-of: README.md
binds: the required section order of a deliverable, the decision-facts format, the section size guard, the risk template and the MD-code traceability rows
open-when: signal:plan-deliverable, signal:md-code-verification
skip-when: signal:no-markdown-deliverable
owns: G1, G2, I1, I2, I3, KV0, KV1, KV2, KV3
```

Scope: The output-shape half of [markdown-authoring.md](markdown-authoring.md) — which sections a deliverable carries and in which order, how Decisions / facts is written, the per-section size cap, the verbatim risk template, the implementation-MD shape, the minimal workflow, and the MD–code traceability rows that **M17** invokes. The contract (**C1**–**C8**) and the M / N rows stay in [markdown-authoring.md](markdown-authoring.md); rule identities remain unchanged across the split.

Document type: Normative part — **KV0**–**KV3**, **G1**, **G2**, **I1**–**I3**. These are file-local bare identifiers; cite them across files in link form, e.g. `[G2](markdown-authoring-deliverable-shape.md)`.

References: [README.md](README.md); [markdown-authoring.md](markdown-authoring.md) (**C1**–**C8**, **M1**–**M19**, **N1**–**N11**); [implementation verification](../implementation-verification/README.md) (IV- rows); [cross-impact-analysis.md](cross-impact-analysis.md) (XIA-\*).

---

## Document shape codes

`§2a`–`§2o`, `§10` and `§15a` are kit vocabulary: shorthand for the shape a normative document, section or rule row must have. This table is their only definition; cite them freely, resolve them here. To find where a code is used, search the kit's Markdown (for example `grep -rlE '§(2[a-o]|10|15a)' en --include='*.md'` from the kit root) rather than trusting a written count, and inspect each match in context.

These codes are stable identifiers within this kit. If a legacy document refers to a section number, resolve it to a code here only when surrounding context confirms that meaning; do not assume that every matching section number is a shape-code reference.

| Code | What the section or rule row it labels must carry |
|------|---------------------------------------------------|
| `§2a` | Document type — the file declares its own role (normative rule engine, reference, routing, analysis-only) in its own header. |
| `§2b` | Legacy obligation map — a crosswalk from the superseded document to the rule IDs that replaced it, so no obligation is lost silently. |
| `§2d` | Strictest reading — where a rule admits two readings, the obligation binds under the stricter one. |
| `§2e` | Environment / runtime — the row states the runtime, platform or environment it applies to, and carries a Consequence. |
| `§2f` | STOP / merge blocked — the failure consequence is a hard stop, not a warning that can be shipped past. |
| `§2g` | Critical behaviour lives in rules — behaviour that decides pass/fail is a rule row, never only prose and never a duplicate of another file's row. |
| `§2h` | Testability / verification — every rule row carries a Verify naming a static, runtime or binary check. |
| `§2i` | Quality gate — the obligation is tied to a repeatable project enforcement mechanism (a gate that fails the build) rather than to reviewer judgement, where one is defined. |
| `§2j` | Decision gates — the topic exposes numbered `G…` gates the reader answers before implementing. |
| `§2k` | Enforcement — the section names which check enforces the rows and where that check runs. |
| `§2l` | Enforcement wiring — the project-provided command, script, workflow step or review procedure that carries out the enforcement `§2k` names. |
| `§2m` | Traceability — the section separates what the kit pins from what the consuming repository must fill in locally. |
| `§2n` | Gate validation scenarios — each decision gate has at least one observable `…-GV…` scenario. |
| `§2o` | Rule granularity — one primary obligation per rule row; a compound row is split. |
| `§10` | Topic split — a topic too large for one file is cut into a routing hub plus part files, with no identifier renumbered. |
| `§15a` | Full migration sweep — the check was run across the whole topic, not a sample. |

Deliberately absent: `§2c` and `§3a` have no live shape meaning.

When a new shape `§` code appears in a kit file, add its row here; distinguish it from a legacy document's own section number.

---

## MD–code verification — when **M17** applies

SSOT: [Implementation verification](../implementation-verification/README.md) (hub + [`validation-rules.md`](../implementation-verification/validation-rules.md) + [`verification-must-rules.md`](../implementation-verification/verification-must-rules.md) + [`execution-procedure.md`](../implementation-verification/execution-procedure.md) + [`anti-loop-rules.md`](../implementation-verification/anti-loop-rules.md)). Do not duplicate obligations here.

| ID | Rule |
|----|------|
| **KV0** | **M17** **MUST** be satisfied by applying all applicable IV- rows in that folder. |
| **KV1** | When the user designates a target implementation or verification MD as authoritative, **IV-C8**, **IV-D5**, and [execution-procedure.md](../implementation-verification/execution-procedure.md) **A2b** **MUST** be applied: every checklist / evidence-table data row must be inventoried and evidenced per row — no sampling (**IV-N2**). |
| **KV2** | [M1](markdown-authoring.md) governs quote characters only; **MUST NOT** generalise it to letters or other normalization. (a) User-visible text preserves its language's native characters: UI, catalogues, errors, notifications and message bodies. Maintainer surfaces follow the consuming project's convention (KV3). (b) A transliteration repair takes each spelling or morpheme from attested forms in that language's catalogue corpus, never memory; unattested forms remain unchanged and are recorded. (c) A corpus-based check states its limits: homographs, rare correct forms, and damage invisible to diacritic folding (letter-count changes or morphological punctuation loss). Each different transfer function needs its own baseline; measure minimum word length against the real corpus. (d) Declare actual checked catalogue scope; one tree's green says nothing about another format/tier. An unadmitted scope is reviewed using its language's corpus evidence and direct reading; the scan narrows reading, it does not replace it. Letter correctness does not prove terminology correctness ([I18N-CAT-M9](../internationalization-rn/product-term-visible-surface.md)). |
| **KV3** | The consuming project's root agent-rule file owns which language each surface uses; the kit names that boundary ([KIT-LIM-7](kit-stated-limits.md)). KV2's native-letter obligation has no exception for user-visible text. Outside that class — agent docs, kit text, code comments, commit messages and the maintainer channel — the project's letter convention applies: it MAY explicitly permit transliteration there; silence inherits KV2(a). Such permission **MUST** be explicit in the root rules and **MUST NOT** extend to text users read. No obligation here requires converting native letters to ASCII. |

Failure consequence: Omitting IV-M / IV-O / IV-F requirements, skipping inventory items (including **IV-C8** rows), or fabricating Evidence → verification invalid — STOP; work is not complete (**IV-C5**, **IV-F3**).

---

## Required sections (when applicable) — order is strict

Include only sections that apply. Do not skip a section that applies. Do not reorder.

| Order | Section | When |
|-------|---------|------|
| 1 | Scope | Always — **M18** (included / excluded / implementation-bound vs analysis-only) |
| 2 | References | Always — **M4**, **M19** |
| 3 | Decisions / facts | Always when any user-approved or SSoT-derived fact exists; use format below |
| 4 | Technical plan | Always for **M6**; numbered items (**M5**) |
| 5 | Cross-impact analysis | Only when **M14** requires it; if not applicable, omit heading - you may use one short line under Technical plan per **M14** instead of a full section. Full section shape: [cross-impact-analysis.md](cross-impact-analysis.md). |
| 6 | Blueprint / actions | When you use a blueprint or action table (**I1**) |
| 7 | Risk documentation | When **M6** applies (**M7**) |
| 8 | Implementation checklist | When **M6** applies (**I2**, **N9**) |

Smaller deliverables (non-**M6** analysis): use sections 1–4 only; omit 5–8 unless needed.

---

## Decision / facts format

Aligned with [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (traceable, verifiable, no guessing):

| Rule | Requirement |
|------|-------------|
| Shape | Numbered list or table — not free-form paragraphs. |
| Content | Each row or item is one testable fact, decision, or user-approved answer (what we will implement or assume). |
| Narrative | No story-style explanation under this heading. At most one optional line: pointer to SSoT path if all facts are already in standards. |
| Verifiability | Each item must be checkable (e.g. "We use the project's selected server-state layer per decision-matrix row X + [`$KIT_ROOT/en/tanstack-query/README.md`](../tanstack-query/README.md)"). |
| Conflicts | If standards conflict, record which precedence rule applies ([**KIT-PRE-2**](../_meta/precedence.md) between kit rules; [decision matrix](../decision-matrix/decision-matrix.md) only for stack class) in a single row — do not invent a third option (**M10**). |

---

## Output size guard

| Rule | Requirement |
|------|-------------|
| **G1** | No major section (Scope, References, Decisions / facts, Technical plan, Blueprint, Risk documentation, Implementation checklist) may exceed 100 lines. |
| **G2** | If a section would exceed 100 lines, split the deliverable per **M13** (linked child MDs); the parent keeps Scope, References, and links to parts. |

---

## Risk documentation (strict) — template

Use this verbatim structure when **M6** applies:

```markdown
## Risk documentation

| Risk | Root cause | Fix | Standard ref |
|------|------------|-----|---------------|
| ... | ... | ... | ... |
```

Max 5 data rows. No extra paragraphs under this heading.

---

## Implementation MD shape (when **M6** applies)

| ID | Rule |
|----|------|
| **I1** | Blueprint / action tables: each action row **MUST** map 1:1 to a numbered technical item in Technical plan (or the row is forbidden). |
| **I2** | Implementation checklist = exact union of (a) all numbered technical obligations from Technical plan and (b) all Blueprint / actions rows, one checklist line each, no additions (**N9**). Same obligation **MUST NOT** appear twice with different wording. |
| **I3** | MD–code traceability: **M17** + **KV0** + IV- rows in [`implementation-verification/`](../implementation-verification/README.md) are the normative minimum. |

---

## Workflow (minimal)

| Step | Action |
|------|--------|
| 1 | Identify deliverable type; write Scope per **M18** (implementation-bound vs analysis-only drives **M6**). |
| 2 | Open the standards [M3](markdown-authoring.md) selects (no index or archived legacy standards); for a stack choice, consult [decision-matrix.md](../decision-matrix/decision-matrix.md) then the linked standard. |
| 3 | List unknowns; ask user; record answers in Decisions / facts (**M15**). |
| 4 | Draft using Required sections order and **MUST**/**MUST NOT** only. |
| 5 | User explicitly approves before treating as final (e.g. clear "approve / proceed"). |

---

## Related standards (non-exhaustive)

- [Cross-impact analysis](cross-impact-analysis.md) (XIA-\*; extends **M14**).
- [Backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (BHE-\*; server handler and cache plans).

Use the index for the full set: [`$KIT_ROOT/en/README.md`](../README.md).
