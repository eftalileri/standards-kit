# Report Excel generation (server-side SSOT)

```kit-cover
type: normative
part-of: README.md
binds: REXL-C1 to REXL-C6, the REXL-F failure paths and the REXL-X cross-topic minima -- the agent execution contract, the closed set of export failure outcomes, and the alignment obligations toward the PDF and name-consistency standards
open-when: shape:backend-heavy, signal:excel-export, signal:report-generation
skip-when: signal:pdf-export-only, signal:no-excel-change
owns: REXL-C1, REXL-C2, REXL-C3, REXL-C4, REXL-C5, REXL-C6, REXL-F1, REXL-F2, REXL-F3, REXL-F4, REXL-F5, REXL-X1, REXL-X2, REXL-X3
```

Normative parts split out of this file: [**MUST** and **MUST NOT**](excel-must-and-must-not.md) (**REXL-M10**–**REXL-M26**, **REXL-N1**–**REXL-N11**); [decision gates, gate validation and the verification checklist](excel-gates-and-verification.md) (GREXL1–GREXL5).

Scope

- Included: Server-side Excel export pipelines: one authorized report-data boundary, an exporter that maps a validated DTO to worksheets, shared currency/date/percentage formatters, localized headers, declared column/sheet order and types, an orchestration-supplied timezone and single deterministic export clock for filenames and generated-at metadata, required-field validation before row writes, documented size/streaming bounds, formula alignment with service data, an explicit zero-row policy, and failure handling.
- Excluded: PDF generation ([report-pdf](../report-pdf/report-pdf.md)); in-app grids; product-specific visual and feature design beyond the binding minima, which belong in the adopting product's own design specification.
- Decision gates: Required — wrong layer (database/API inside the exporter, missing params, invalid contract) is high-bug.

Document type: Normative — behavior for Excel outputs.

Environment: N/A for host-specific logging fields in this file — **REXL-F1**–**REXL-F3**, **REXL-F5** defer error / log shape to [error policy](../error-policy/error-policy.md) and [error handling](../error-handling/error-handling.md) (local minimum retained in Failure paths).

Binding principle: Violations of **REXL-M** / **REXL-N** are bugs — must fix; must not ship noncompliant export paths. STOP export generation on GREXL NO branches that map to **REXL-F1**–**REXL-F3** or **REXL-F5** (**REXL-C3**, **REXL-C4**).

References: [Markdown authoring](../authoring/markdown-authoring.md); [agent gray decisions](../agent-gray-decisions/gray-situation-decisions.md); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md); [error handling](../error-handling/README.md); [error policy](../error-policy/README.md); [name consistency](../name-consistency/README.md); [report PDF](../report-pdf/README.md); [timezone resolution](../timezone/timezone-resolution-standard.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **REXL-C\*** | Agent execution contract. |
| **REXL-M\*** | **MUST**. |
| **REXL-N\*** | **MUST NOT**. |
| **REXL-F\*** | Failure path (F table + failure routing). |
| **REXL-X\*** | Cross-topic local minimum (PDF / names). |
| GREXL\* | Decision gates — cite **REXL-M** / **REXL-N** only. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **REXL-C1** | Normative text is only REXL- / GREXL rows; narrative paragraphs do not add obligations. |
| **REXL-C2** | [Shared agent contract C2](../_meta/agent-contract.md). |
| **REXL-C3** | [Shared agent contract C2](../_meta/agent-contract.md); no alternate data sources, currencies, or header languages without a standard amendment. |
| **REXL-C4** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **REXL-C5** | Apply [shared **C3**](../_meta/agent-contract.md). |
| **REXL-C6** | If a GREXL answer cannot be determined from code or the report data contract, STOP — record per [gray-situation](../agent-gray-decisions/gray-situation-decisions.md). |

Enforcement summary: STOP export (no workbook stream) for GREXL1 NO → **REXL-F1**; **REXL-M23** / import failure → **REXL-F5**; ERROR API path for GREXL2 / GREXL4 NO when contract forbids empty rows or data invalid → **REXL-F2**; LOG + FAIL for GREXL3 NO → **REXL-F3**.



---

## **MUST**, **MUST NOT** and the decision gates — moved

The data/formatting rows **REXL-M1**–**REXL-M9** are defined in [report export core](../report-pdf/report-export-core.md); **REXL-M10**–**REXL-M26** and **REXL-N1**–**REXL-N11** are defined in [excel-must-and-must-not.md](excel-must-and-must-not.md); the gate index GREXL1–GREXL5, its validation scenarios, the verification checklist and the enforcement/traceability note in [excel-gates-and-verification.md](excel-gates-and-verification.md).

---

## Failure paths (normative)

| ID | Situation | Required behavior | Rule anchor |
|----|-----------|-------------------|-------------|
| **REXL-F1** | Missing `data`, `currency`, `language`, `timezone`, or contract-required inputs | STOP — no workbook; actionable error (root cause + fix) per [error handling](../error-handling/error-handling.md) / [error policy](../error-policy/error-policy.md). | GREXL1, **REXL-M4**, **REXL-M6**, **REXL-M8**, **REXL-M21** |
| **REXL-F2** | **REXL-M25** failure, invalid DTO, contract violation, service error, **REXL-M20** missing, or zero rows when contract forbids | ERROR; log; API/client sees explanation — no silent defaults (**REXL-N1** spirit). | GREXL2, GREXL4, **REXL-M20**, **REXL-M25** |
| **REXL-F5** | **REXL-M23**: required Excel helper missing, undefined at runtime, or import resolution fails | STOP — no workbook; fail fast with logged root cause | **REXL-M23** |
| **REXL-F3** | Missing translation key for selected language | LOG + FAIL; export aborts; no fallback raw string. | GREXL3, **REXL-M10**, **REXL-M11** |
| **REXL-F4** | Contract allows zero rows; no data rows | Headers per **REXL-M10**; empty data region; no fake rows; **REXL-N1**, **REXL-N3** still apply to any formatted cells. | GREXL4, **REXL-M10** |

---

## Cross-topic local minimum

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **REXL-X1** | Excel must use the same SSoT service family as PDF for the same report type (ForExport chain vs PDF whitelist services). | Bug | Architecture map: one DTO family. |
| **REXL-X2** | Display names must rely on service output consistent with [name consistency](../name-consistency/name-consistency.md); Excel must not add a second resolver. | Bug | **REXL-M3**, **REXL-N2** |
| **REXL-X3** | Money formatting policy must match [report-pdf](../report-pdf/report-export-core.md) (**RPDF-M5**–**RPDF-M7** discipline). | Bug | Paired review or shared formatter reference. |

---

## Related standards

| Standard | Relationship |
|----------|--------------|
| [Report PDF](../report-pdf/report-pdf.md) | Shared numeric/currency policy (**REXL-X3**). |
| [Name consistency](../name-consistency/name-consistency.md) | **REXL-X2** |
| [Error handling](../error-handling/error-handling.md) / [Error policy](../error-policy/error-policy.md) | **REXL-F1**–**REXL-F3** |
| [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) | Single pipeline for report data (**REXL-M1**, **REXL-N1**) |
| [Timezone resolution](../timezone/timezone-resolution-standard.md) | **REXL-M21**, **REXL-N8** — IANA must not be inferred in exporter |

---

*Normative body complete without examples.*

Shared data and formatting: [**RPDF-M1**–**RPDF-M9** and **REXL-M1**–**REXL-M9**](../report-pdf/report-export-core.md).
