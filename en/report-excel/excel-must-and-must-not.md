# Report Excel — **MUST** (**REXL-M**) and **MUST NOT** (**REXL-N**)

```kit-cover
type: normative
part-of: README.md
binds: REXL-M10 to REXL-M26 and REXL-N1 to REXL-N11 -- the single data ingress, the map-only exporter, the shared currency / date / percent formatters, translation-backed headers, column and sheet ordering, the orchestration-supplied IANA timezone, the single export clock, schema validation before row write, and every prohibition that keeps a second data source or formatter out of the exporter
open-when: shape:backend-heavy, signal:excel-export, signal:report-generation, signal:report-formatting
skip-when: signal:pdf-export-only, signal:no-excel-change
owns: REXL-M10, REXL-M11, REXL-M12, REXL-M13, REXL-M14, REXL-M15, REXL-M16, REXL-M17, REXL-M18, REXL-M19, REXL-M20, REXL-M21, REXL-M22, REXL-M23, REXL-M24, REXL-M25, REXL-M26, REXL-N1, REXL-N2, REXL-N3, REXL-N4, REXL-N5, REXL-N6, REXL-N7, REXL-N8, REXL-N9, REXL-N10, REXL-N11
```

Scope: Excel workbook obligations **REXL-M10**–**REXL-M26** and **REXL-N1**–**REXL-N11**. [Data and formatting **REXL-M1**–**REXL-M9**](../report-pdf/report-export-core.md) are defined in the shared export core.

Document type: Normative part — **REXL-M10**–**REXL-M26**, **REXL-N1**–**REXL-N11**.

References: [README.md](README.md); [report-excel.md](report-excel.md) (scope, agent execution contract **REXL-C1**–**REXL-C6**, failure paths **REXL-F1**–**REXL-F5**, cross-topic minima **REXL-X1**–**REXL-X3**); [excel-gates-and-verification.md](excel-gates-and-verification.md) (GREXL1–GREXL5, checklist); [report-pdf](../report-pdf/report-pdf.md); [timezone resolution](../timezone/timezone-resolution-standard.md).

---

## **MUST**

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **REXL-M10** | Header strings must come from the product's translation catalog, with one authoritative set per report type and language. | Bug | Static: header keys resolve via the i18n module. |
| **REXL-M11** | All headers in one workbook must use the same language as the workbook entrypoint's `language` argument. | Bug | Inspect header bindings and a real workbook: every header uses the entrypoint language. |
| **REXL-M12** | Column order must follow: identity / label → date-time → amount → status → remaining fields (remaining order must match that report's data contract without breaking the category sequence). | Bug | Static: ordered column builder or contract-driven function. |
| **REXL-M13** | Within one column, must not mix raw number and formatted string money types inconsistently — one consistent representation per column. | Bug | Column-type audit in exporter. |
| **REXL-M14** | Apply one shared column-width calculation or autofit helper consistently. | Bug | Static: a single width helper is used. |
| **REXL-M15** | If the report fits one logical page, must use one worksheet. | Bug (must fix) | Structure review. |
| **REXL-M16** | Multi-sheet workbooks must use ascending tab index order 0..n-1: index 0 = summary or coarsest aggregate when such a sheet exists; highest index = finest detail unless the report data contract documents a different fixed order — then must follow that documented table exactly. | Bug (must fix) | Sheet creation order matches contract table; 0 = first row in table. |
| **REXL-M17** | Header row styling must use one shared header-row helper; colors/fonts/alignment must stay consistent across reports. | Bug | Static: shared helper call. |
| **REXL-M18** | If the same metric appears in summary and detail, must bind one service field — the exporter must not compute a second total. | Bug | Static: same property referenced. |
| **REXL-M19** | If formulas are used, they must be consistent with service-supplied values — forbidden manual formulas that contradict SSoT. | Bug | Review formula ranges vs DTO fields. |
| **REXL-M20** | For every report type, document whether zero data rows are allowed as an explicit YES or NO in its data contract. If the answer is missing, treat the export as noncompliant until documented (GREXL4). | Must not ship until contract row exists | Review that every report contract states an explicit zero-row policy. |
| **REXL-M21** | The IANA timezone passed to date formatters, filename generation, and workbook creation must be the same value resolved once by orchestration for the report's owning context. Exporter-only modules must not resolve it themselves ([GTZ1](../timezone/timezone-decision-gates.md), [**TZ-M1**](../timezone/timezone-must.md)); resolution occurs outside exporter-only modules (settings, report orchestration, or a documented resolver). | Bug / STOP | Static: exporter files do not import database/settings code to derive the timezone; trace every formatter/filename/workbook argument to the same resolver output. |
| **REXL-M22** | Exported-at metadata, the filename time segment, and any other export-scoped "current time" must use one deterministic source per request: an injectable clock, or exactly one documented read of system time at export entry, threaded to all call sites that need the same semantic instant. | Bug | Static audit: the filename timestamp matches embedded metadata when both exist; a single clock injection site. |
| **REXL-M23** | Every shared formatter and workbook helper used by an export (currency and date formatters, header-row styling, column autofit, filename generation) must be defined and resolvable through the documented export module at build time; a runtime undefined helper, failed import, or missing export must STOP the job (**REXL-F5**). | STOP export | Build + smoke: the export module loads. |
| **REXL-M24** | Per report type, the data contract or architecture must document at least one of: (1) maximum row count (reject or **REXL-F2** over cap), (2) maximum cell / approximate size budget, (3) streaming or chunked write. New list exports without such documentation must not ship. | Bug / must not ship | Review the documentation and code: a cap constant or streaming API is referenced for high-volume types. |
| **REXL-M25** | Before writing data rows, the orchestration boundary (the caller of workbook creation or a documented wrapper) must validate the export DTO against the documented schema (or an equivalent explicit check) and the report-type required-field list from the data contract; on failure, must route to **REXL-F2** without emitting a partial workbook. | ERROR → **REXL-F2** | Static inspection: dropping a required field yields an error and no file; parse/validation at the boundary before the row loop. |
| **REXL-M26** | Each worksheet tab name must be non-empty and come from a translation key or documented constant, not raw user input. It must comply with spreadsheet-format constraints, including maximum length (31 characters) and disallowed characters (`[]*?:/\`). | Bug (must fix) | Static: the name builder uses i18n/constants; apply the workbook format's sheet-name validation. |

---

## **MUST NOT**

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **REXL-N1** | Must not perform DB or HTTP/API calls inside the exporter; must not add "Excel-only" field math or a different formula/data source than PDF/API share. | STOP export | Static: no db/fetch imports in exporter modules. |
| **REXL-N2** | Must not re-resolve person display names in the exporter; must not show raw ID columns to end users when the service already supplies a display name. | Bug | Column list + code paths. |
| **REXL-N3** | Must not format money with fixed-decimal conversion plus symbol concatenation or any path outside the shared currency formatter. | Bug | Search the Excel export paths for ad hoc fixed-decimal conversion. |
| **REXL-N4** | Must not use hardcoded header user-visible strings in exporter code. | Bug | String literal audit vs translation keys. |
| **REXL-N5** | Must not add two columns for the same semantic fact when the contract does not require both (e.g. redundant ID + name). | Bug (must fix) | Semantic column review. |
| **REXL-N6** | Must not use two "different" metric columns that show the same value from the same source (e.g. Total vs Grand Total). | Bug (must fix) | Data source comparison. |
| **REXL-N7** | Must not format percentages with ad hoc fixed-decimal conversion plus a percent sign outside the shared formatter. | Bug | Same audit as **REXL-M9**. |
| **REXL-N8** | Do not derive the owning context's IANA timezone inside exporter-only code from the host default, local offset, locale, or a database read that bypasses orchestration (**REXL-M21**). | Bug / STOP | Review that exporter-only modules receive the resolved timezone and do not resolve it independently. |
| **REXL-N9** | Must not ship a new high-volume list export without **REXL-M24** documentation (cap or streaming ) for that type. | Must not ship | PR checklist + contract diff. |
| **REXL-N10** | Must not leave workbook tabs at Excel defaults `Sheet1`, `Sheet2`, … when **REXL-M26** applies (multi-sheet workbook or contract mandates named sheets ). | Bug | UI or file parse: tab names match i18n/constant table. |
| **REXL-N11** | Must not read time via independent `new Date()` (or equivalent ) calls in multiple modules for the same export job's single exported-at semantic (use **REXL-M22** clock ). | Bug | Static: one assignment from clock at entry; grep for stray `new Date()` in filename/metadata paths. |
