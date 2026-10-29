# Report export core — data sourcing and value formatting

```kit-cover
type: normative
part-of: README.md
binds: the PDF and Excel data ingress, map-only export, canonical display names and currency, date and percentage formatting obligations
open-when: shape:backend-heavy, signal:pdf-report, signal:excel-export, signal:report-generation, signal:report-formatting, signal:currency-format, signal:date-format
skip-when: none
owns: RPDF-M1, RPDF-M2, RPDF-M3, RPDF-M4, RPDF-M5, RPDF-M6, RPDF-M7, RPDF-M8, RPDF-M9, REXL-M1, REXL-M2, REXL-M3, REXL-M4, REXL-M5, REXL-M6, REXL-M7, REXL-M8, REXL-M9
```

**Keywords:** PDF, Excel, report data, ForExport, DTO, map-only export, display names, currency, date formatting, calendar day, percentages

Scope: Shared report data and formatting policy; PDF and Excel adapter-specific obligations retain their existing identities. Both outputs read the same service DTO authority. Currency policy has one definition, **RPDF-M6**; **REXL-M5** points to it. Adapter-specific helper contracts do not create a second policy authority.

References: [PDF scope and service whitelist](report-pdf.md); [Excel scope and ingress](../report-excel/report-excel.md); [PDF layout and resource limits](report-pdf-charts-layout-and-limits.md); [Excel workbook rules](../report-excel/excel-must-and-must-not.md).

## PDF data and formatting

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **RPDF-M1** | PDF body data must be filled only from the [whitelist report services](report-pdf.md#report-services-whitelist-normative-binding) (or architecturally renamed equivalents in the same service family). | Bug — must not ship | Static: inspect the template/renderer for database or API imports; only service outputs cross into template props. |
| **RPDF-M2** | The PDF buffer generator (or equivalent) must map only the returned DTO from the chosen report service into the template; no second aggregation layer that recomputes the same metrics from raw inputs. | Bug | Static: diff template inputs vs service return type usage; no parallel math from alternate inputs. |
| **RPDF-M3** | Person or organization display names must use the same canonical name-resolution path as the client UI, or a documented batch equivalent ([name-consistency](../name-consistency/name-consistency.md)). | Bug | Static: all name fields in the PDF pass through that resolver or the documented batch equivalent. |
| **RPDF-M4** | Filter chips, table cells and meta lines of a report export (PDF, CSV) must show human-readable labels, not raw identifiers: the service puts the resolved display name next to each identifier and the exporter renders the name (an unresolved person renders the localized marker, **NCM-M13**). A tabular export takes its column set and order from one per-report declaration that every format reads, never from the keys of the payload rows — key iteration prints whatever identifier the payload carries and lets the columns drift between formats. A CSV cell whose text starts with `=`, `+`, `-`, `@`, tab or carriage return and is not a plain number is written with a leading `'`: names are tenant-written free text, and a spreadsheet must not evaluate them as formulas when the exporting user opens the file. | Bug | Static: chip/table/meta render uses label strings from the declaration; no raw identifier (database id, UUID, phone id) rendering for user-visible output. |
| **RPDF-M5** | Every currency amount field in the PDF must be formatted through one documented currency formatter that receives the value, currency and display language (a documented moved location is allowed if the contract is the same). | Bug | Static: search the template/formatters for ad hoc number-to-fixed or manual currency concatenation — must be absent for money fields. |
| **RPDF-M6** | The currency formatter must apply the adopting project's documented fraction-digit and rounding policy consistently, including whether whole units omit a forced fractional tail (for example `,00` / `.00`). | Bug | Inspect the formatter's fraction-digit options against the documented policy; a real report shows whole and fractional amounts with the required trimming. |
| **RPDF-M7** | Within one PDF, all currency fields must follow the same grouping/decimal rules (no mix such as `1.000` vs `1.000,00` for the same semantic type). | Bug | Inspect all money fields in one real report for consistent grouping and decimals. |
| **RPDF-M8** | Date/time formatting **MUST** follow clauses (a)–(d) below, preserving the distinction between instants, calendar days, display text and machine keys. | Bug | Static: inspect formatter inputs and each field's render sites; use the adopting project's enforcement mechanism for displayed date-call language arguments (excluding key/comparison assignments) and record its actual scope and limits. |
| **RPDF-M9** | Percentage fields must use a fixed decimal count per report type (documented in code or report spec); trailing fractional zeros must follow the same trim discipline as **RPDF-M6** (e.g. integer percent shows without spurious decimals). | Bug | Inspect each report-type decimal policy and the real formatted integer/fractional percentage output. |

<a id="rpdf-m8--date-and-time-semantics"></a>

### Date and time semantics — [**RPDF-M8**](#pdf-data-and-formatting) clauses

(a) Use one date-time formatter and one date-range formatter from the same formatter authority. Instants include time, PDF language and business timezone. User-selected report bounds are calendar days: the range formatter accepts no timezone and displays the same day derivation used by the query window. **MUST NOT** shift `new Date(dayText)` through a business zone ([**TZ-M19**](../timezone/timezone-must.md)); do not provide an instant-to-date-only formatter.

(b) A service-produced date field displayed verbatim **MUST** receive the resolved PDF-meta language. **MUST NOT** use a literal language or another resolver ([**I18N-RN-N3**/N7](../internationalization-rn/internationalization-prohibitions.md)). An optional formatter language is deliberately omitted only for grouping keys and comparisons, which require one deterministic locale independent of display numbering system or calendar.

(c) When a field has readers with different language authorities, its producer **MUST NOT** pre-format it. Emit a language-neutral calendar day (`YYYY-MM-DD`, Latin digits), derived once in the business timezone, and format at each display edge. That display formatting pins to UTC and **MUST NOT** re-apply a timezone. Remove the producer's now-unused language parameter throughout its call chain. The machine day is also the sort/comparison key; localized day-first strings are not.

(d) For every pre-formatted row date, enumerate render sites and their language authorities. Multiple authorities require a documented machine-value DTO contract and no producer formatting. A single-file language check cannot decide this cross-file consumer fact.

## Excel data and formatting

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **REXL-M1** | Excel row data must enter only through one documented export-data boundary that calls the report's export-oriented data service for that report type. | Bug — must not ship | Static: single data ingress in the exporter call tree; no parallel loaders. |
| **REXL-M2** | The exporter **MUST** satisfy [**RPDF-M2**](report-export-core.md): map the shared API/PDF build-function output only, without another aggregation or data source. | STOP export | Static + types: map-only layer; no service/database imports in the exporter. |
| **REXL-M3** | Display-name fields populated by the report service must be written as returned — no re-resolution in the exporter. | Bug | Code review: no name resolver calls in the exporter. |
| **REXL-M4** | Every currency cell must use the shared currency formatter; currency and language remain mandatory inputs through the public entrypoint. | STOP export | Static: all money cells use the helper; inspect the missing-parameter rejection branch. |
| **REXL-M5** | Currency display **MUST** follow the single [**RPDF-M6**](report-export-core.md) whole/fractional policy. | Bug | Compare to [report-pdf](report-export-core.md) **RPDF-M6** or the shared formatter source. |
| **REXL-M6** | Workbook creation must receive currency and language from callers — no hardcoded currency, locale, or silent defaults. | STOP export | Search the exporter for hardcoded locale/currency strings. |
| **REXL-M7** | Date cells must use the shared timezone-aware date formatter (or a same-contract helper) with the timezone argument supplied by orchestration (**REXL-M21**), not computed inside the cell mapper alone. | Bug | Static: one date path; no ad hoc locale formatting in exporters. |
| **REXL-M8** | File names must be produced by one shared filename authority taking the report type, filters and timezone; the timezone must be required (throw if absent). | STOP export | Inspect the required timezone parameter and missing-timezone rejection before filename creation. |
| **REXL-M9** | Percentage and consistent numeric fields **MUST** use a shared formatter; decimal places **MUST** be fixed per report type (for example, two for percent). | Bug | Static: no scattered fixed-decimal + `%` formatting outside the shared helper. |
