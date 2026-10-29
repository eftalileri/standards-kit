# Report PDF generation (server-side SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the RPDF obligation set as a whole -- agent execution contract, the report services whitelist, every RPDF-N prohibition and every GRPDF decision gate
open-when: shape:backend-heavy, signal:pdf-report, signal:report-generation
skip-when: signal:excel-export-only, signal:no-pdf-change
owns: RPDF-C1, RPDF-C2, RPDF-C3, RPDF-C4, RPDF-C5, RPDF-C6, RPDF-N1, RPDF-N2, RPDF-N3, RPDF-N4, RPDF-N5, RPDF-N6, RPDF-N7, RPDF-N8, RPDF-N9, RPDF-N10, RPDF-N11, RPDF-N12, GRPDF1, GRPDF2, GRPDF3, GRPDF4, GRPDF5, GRPDF6, GRPDF7, GRPDF8, GRPDF9, GRPDF10
```

Normative parts (the **RPDF-M** family, banded): [data sourcing and value formatting](report-export-core.md) (**RPDF-M1-RPDF-M9**); [charts, layout, preflight and resource limits](report-pdf-charts-layout-and-limits.md) (**RPDF-M10-RPDF-M27**, **RPDF-M30** and the failure-path table); [output encoding and the browser runtime tuple](report-pdf-output-encoding-and-runtime.md) (**RPDF-M28**, **RPDF-M29**). Non-binding tails: [appendix](report-pdf-appendix.md).

Scope

- Included: Server-side PDF report pipelines: data binding to templates, formatting (money, date, percent), charts and fallback tables, page layout, metadata preflight, and failure behavior. Applies wherever the PDF buffer generator (or a renamed successor) renders report PDFs.
- Excluded: Excel and other non-PDF exports ([report Excel SSOT](../report-excel/report-excel.md)); in-app reporting UI (charts outside PDF); product narrative and visual design beyond binding minima, which remain in the adopting product's design specification.
- Decision gates: Required — PDF generation is branch-heavy (data completeness, chart vs table, metadata, formatting).

Document type: Normative — behavior for PDF outputs.

Environment: Applies to the server runtime that renders PDFs, with logging and error handling per the linked application policies.

Binding principle: Violations of **RPDF-M** / **RPDF-N** are bugs — must fix; must not ship noncompliant PDF paths. STOP dependent release work until remedied or this standard is amended (**RPDF-C3**, **RPDF-C4**).

References: [Markdown authoring](../authoring/markdown-authoring.md); [agent gray decisions](../agent-gray-decisions/gray-situation-decisions.md); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md); [error handling](../error-handling/README.md); [error policy](../error-policy/README.md); [name consistency](../name-consistency/README.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **RPDF-C\*** | Agent execution contract. |
| **RPDF-M\*** | **MUST**. |
| **RPDF-N\*** | **MUST NOT**. |
| GRPDF\* | Decision gates — binary routing; cite RPDF- rows only. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **RPDF-C1** | This topic is mandatory for new or changed PDF report templates, bindings, or PDF buffer-generation (or equivalent) call paths. |
| **RPDF-C2** | [Shared agent contract C2](../_meta/agent-contract.md). |
| **RPDF-C3** | [Shared agent contract C2](../_meta/agent-contract.md); apply **RPDF-M** / **RPDF-N** / GRPDF exactly; no alternate data sources or formatting without a standard amendment. |
| **RPDF-C4** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **RPDF-C5** | Apply [shared **C3**](../_meta/agent-contract.md); feature docs extend layout and visuals where this file does not contradict them. |
| **RPDF-C6** | If a required GRPDF answer cannot be determined from code or contracts, STOP — record uncertainty per [gray-situation](../agent-gray-decisions/gray-situation-decisions.md). |

Enforcement summary: STOP PDF generation (no buffer returned) for GRPDF1 / GRPDF2 / GRPDF10 NO branches, **RPDF-M24**/RPDF-M26/RPDF-M27/RPDF-M29 hard failures, and formatter/time preflight failures; bug / must not ship for **RPDF-N\*** and structural **RPDF-M\*** breaks; reject PRs that add forbidden DB/API/formatting in templates until compliant.



---

## Report services whitelist (normative binding)

PDF-bound report payloads MUST come from documented, authorized report data services. Each adopting system maintains an explicit allowlist or router mapping report types to their data producers.

The allowlist is product-specific; this standard does not prescribe service names or report categories. **RPDF-M1** requires every PDF type to map to one documented data producer, verifiable at the orchestration boundary.

---

## **MUST NOT**

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **RPDF-N1** | Must not run raw DB queries, extra HTTP/API calls, or PDF-only recomputation inside the PDF template or renderer to replace or duplicate whitelist service data. | Bug — merge blocked | Static: template folder imports — no DB drivers / fetch to non-report endpoints. |
| **RPDF-N2** | Must not render raw stored name fields (for example separate first-name and last-name columns) for user-visible person names when **RPDF-M3** applies. | Bug | Static: name fields only via NCM resolver path. |
| **RPDF-N3** | Must not show raw IDs on filter chips for end users. | Bug | Inspect filter-chip render bindings: they use display labels rather than raw identifiers. |
| **RPDF-N4** | Must not format money fields with fixed-decimal conversion, string concatenation, or any helper other than the documented currency formatter. | Bug | **RPDF-M5** grep audit. |
| **RPDF-N5** | Must not format dates with `new Date().toLocaleString()`, `Intl` ad hoc in templates, or non-whitelisted formatters. | Bug | **RPDF-M8** grep audit. |
| **RPDF-N6** | Must not leave a chart-sized empty region when the spec requires a chart or table for that insight. | Bug | Inspect both chart and fallback branches required by **RPDF-M11**; a real rendered report has no empty required slot. |
| **RPDF-N7** | Must not show two different numeric values for the same metric in the same PDF. | Bug | Trace KPI and detail fields to the same **RPDF-M21** DTO property; inspect matching values in a real report. |
| **RPDF-N8** | Must not silently continue, substitute arbitrary defaults, or fabricate business data when required report data is missing (error policy — no silent fallback for invalid domain state). | STOP / bug | Inspect missing-field rejection before rendering: it throws or returns a registered error and cannot emit a buffer. |
| **RPDF-N9** | Must not start PDF byte generation when **RPDF-M23** preflight fails. | STOP | Static: metadata validation failure prevents the renderer call required by **RPDF-M23**. |
| **RPDF-N10** | Must not sample wall time for `generatedAt`, report range bounds, or footer/header generation timestamps using ad hoc `Date.now()` / `new Date()` in template or non-orchestrator PDF code — must use the PDF time context from **RPDF-M25**. | Bug | **RPDF-M25** Verify (template/layout grep). |
| **RPDF-N11** | Must not treat input validation as the encoding layer. A write-path schema that accepts free text (person / service / package names, and time or date fields whose schema is only "a non-empty string") leaves the template escape as the only layer between tenant-controlled text and the renderer, so must not embed a data-derived value unescaped on the grounds that "the write path constrains it" or "this field is generated server-side". Must not re-introduce a character allowlist on those write paths as an encoding substitute — an alphabet restriction is not an output-encoding control, and removing one is not what opens this surface. Inconsistent escaping within one template (some fields escaped, their immediate neighbours not) is the observed failure signature: it proves the protection was known and forgotten, so it is a defect, never a deliberate design. | Bug | **RPDF-M28** Verify (the adopting project's producer-provenance check over its canonical backend source must report zero; record that check's actual scope and limits). |
| **RPDF-N12** | When a browser runtime is used, do not silently substitute a system-installed executable, an independent path override, or an unverified version. Do not infer compatibility from a major version alone. | STOP / supply-chain bug | **RPDF-M29** runtime artifact and launch inspection. |

---

## Decision gates (normative index)

Purpose: Binary routing for PDF work — no new obligations beyond cited RPDF- rows.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|---------------------|------------------|-------|
| GRPDF1 | The report service succeeds and one documented schema or explicit required-field check validates its payload before rendering. | **RPDF-M1**, **RPDF-M2**, **RPDF-M22**, **RPDF-N8** | STOP — no buffer; return an error per **RPDF-M22**; do not invent defaults. |
| GRPDF2 | Required metadata preflight passes (owning entity label, timezone when required, currency, language, and labels for active filters). | **RPDF-M23**, **RPDF-N9** | STOP PDF generation — return a documented error. |
| GRPDF3 | Template data comes only from whitelist services (no parallel source). | **RPDF-M1**, **RPDF-N1** | Bug — must not ship until removed. |
| GRPDF4 | For each chart slot: either chart renders or fallback table is present; and **RPDF-M26** holds (no slot with both failed). | **RPDF-M11**, **RPDF-N6**, **RPDF-M26** | Bug / STOP — incomplete PDF or **RPDF-M26** STOP. |
| GRPDF5 | Display names use **RPDF-M3** path. | **RPDF-M3**, **RPDF-N2** | Bug. |
| GRPDF6 | All money fields use the documented currency formatter. | **RPDF-M5**–**RPDF-M7**, **RPDF-N4** | Bug. |
| GRPDF7 | All dates use approved formatters and timezone. | **RPDF-M8**, **RPDF-N5** | Bug. |
| GRPDF8 | Chart–text alignment: **RPDF-M15**–**RPDF-M17** satisfied for every chart in this PDF. | **RPDF-M15**, **RPDF-M16**, **RPDF-M17** | Bug. |
| GRPDF9 | Every dynamic value entering template markup is escaped at the output boundary by the canonical encoder, or comes from an explicitly trusted, documented markup producer. Names and types alone do not prove safety. | **RPDF-M28**, **RPDF-N11** | Bug — do not ship; encode at interpolation and review cross-file producers. |
| GRPDF10 | If rendering uses an external browser runtime, its version and platform are pinned to the deployed runtime and a real launch is verified in that environment. | **RPDF-M29**, **RPDF-N12** | STOP — do not generate PDFs through an unverified or silently substituted runtime. |

---

---

*Normative requirements for server-side PDF report generation.*
