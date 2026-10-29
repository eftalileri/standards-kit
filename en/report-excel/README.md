# Report Excel (server-side)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** Excel, workbook, ForExport, i18n headers, exceljs


Normative rules for Excel report workbooks: ForExport data chain, exporter map-only layer, shared formatters (currency, date, percent), i18n headers, column order, sheet layout, decision gates, and failure behavior.

- [Report Excel (SSOT)](report-excel.md) — scope, agent execution contract (**REXL-C\***), failure paths (**REXL-F\***), cross-topic minima (**REXL-X\***)
- [**MUST** and **MUST NOT**](excel-must-and-must-not.md) — **REXL-M10**–**REXL-M26**, **REXL-N1**–**REXL-N11**
- [Decision gates, gate validation and the verification checklist](excel-gates-and-verification.md) — GREXL1–GREXL5

Related: [Report PDF](../report-pdf/README.md) (shared money/date policy); [Name consistency](../name-consistency/README.md); [Error policy](../error-policy/error-policy.md); [Error handling](../error-handling/error-handling.md); [SSOT readiness](../ssot-readiness/README.md).

Shared data and formatting: [**RPDF-M1**–**RPDF-M9** and **REXL-M1**–**REXL-M9**](../report-pdf/report-export-core.md).
