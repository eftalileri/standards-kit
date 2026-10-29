# Report Excel — decision gates (GREXL), gate validation and the verification checklist

```kit-cover
type: normative
part-of: README.md
binds: GREXL1 to GREXL5 -- the binary routing over required export inputs, schema validation, translation coverage, the zero-row contract and currency alignment with PDF, plus the scenarios and pre-merge checklist that prove them
open-when: shape:backend-heavy, signal:excel-export, signal:report-generation, signal:excel-gate-routing
skip-when: signal:pdf-export-only, signal:no-excel-change
owns: GREXL1, GREXL2, GREXL3, GREXL4, GREXL5
```

Scope: The gate index of the report-Excel topic, the observable scenario per gate, the per-change verification checklist, and the enforcement/traceability note. Every gate routes to rows defined in the other part files; no gate adds an obligation of its own.

Document type: Normative part — GREXL1–GREXL5.

References: [README.md](README.md); [report-excel.md](report-excel.md) (**REXL-C\***, **REXL-F\***, **REXL-X\***); [excel-must-and-must-not.md](excel-must-and-must-not.md) (**REXL-M\***, **REXL-N\***); [report-pdf](../report-pdf/report-pdf.md); [timezone resolution](../timezone/timezone-resolution-standard.md).

---

## Decision gates (normative index)

| Gate | Proceed only if YES | Binding rule IDs (M/N) | If NO |
|------|---------------------|-------------------------|-------|
| GREXL1 | Required export inputs present: data, currency, language, timezone (**REXL-M21** — IANA from orchestration resolver), and any other contract-required inputs for this report type. | **REXL-M4**, **REXL-M6**, **REXL-M8**, **REXL-M21** | STOP export → **REXL-F1** |
| GREXL2 | **REXL-M25** passed: schema validation (or an equivalent explicit check) succeeds and every required field named in the report-type contract is present and non-null where the contract requires non-null before row write. | **REXL-M1**, **REXL-M2**, **REXL-M25** | ERROR → **REXL-F2** |
| GREXL3 | For the selected `language`, every header key used by this exporter exists in the translation table. | **REXL-M10**, **REXL-M11** | LOG + FAIL → **REXL-F3** |
| GREXL4 | Per **REXL-M20**: if contract says NO to zero rows, row count > 0; if YES, only header + empty data region is allowed (**REXL-F4** path). | **REXL-M20**, **REXL-M1**, **REXL-M2** | **REXL-M20** missing → ERROR **REXL-F2**; contract NO with zero rows → **REXL-F2**; contract YES with zero rows → proceed under **REXL-F4** |
| GREXL5 | Currency display policy aligned with PDF (**REXL-M5** / **REXL-X3**) for this change. | **REXL-M5**; detail: [report-pdf](../report-pdf/report-pdf.md) | Must not ship until aligned |

---



## Gate validation scenarios

Each row must be checkable by static review or documented manual RC before claiming operational compliance in a consuming repo.

| Gate | Scenario (pass criteria) |
|------|---------------------------|
| GREXL1 | Omit a required currency, timezone, or language at workbook creation → **REXL-F1**; with valid inputs, the timezone matches the owning context resolved by [timezone resolution](../timezone/timezone-decision-gates.md) GTZ1. |
| GREXL2 | Omit a contract-required field or break the schema validation → **REXL-F2**; no workbook bytes; no silent empty file. |
| GREXL3 | Remove or rename one active header key in translations → export fails after log; no English fallback string invented in exporter. |
| GREXL4 | For a type with contract NO to zero rows, run with 0 data rows → **REXL-F2**; for a type with YES, assert headers present and no fabricated data rows. |
| GREXL5 | Golden compare: whole-unit amount has no forced fractional tail, matching **RPDF-M6** / **REXL-M5**. |

---

## Verification checklist (Excel change / new exporter)

| Check | Rule IDs |
|-------|----------|
| Data only via the documented export-data boundary | **REXL-M1**, **REXL-N1** |
| Map-only exporter | **REXL-M2** |
| Names as returned | **REXL-M3**, **REXL-N2** |
| Money via the shared currency formatter | **REXL-M4**, **REXL-M5**, **REXL-N3**, GREXL5 |
| No hardcoded locale/currency | **REXL-M6** |
| Dates via timezone helper | **REXL-M7** |
| Timezone from orchestration / TZ SSOT | **REXL-M21**, **REXL-N8** |
| Single clock for generatedAt / filename time | **REXL-M22**, **REXL-N11** |
| Helpers resolvable (**REXL-M23**) | **REXL-M23**, **REXL-F5** |
| Row/size/streaming documented | **REXL-M24**, **REXL-N9** |
| Schema validation (or equivalent) + required fields before rows | **REXL-M25**, GREXL2 |
| Filename generation requires timezone | **REXL-M8** |
| Percent via shared formatter | **REXL-M9**, **REXL-N7** |
| Headers from translations | **REXL-M10**, **REXL-M11**, **REXL-N4** |
| Column order categories | **REXL-M12** |
| No duplicate / redundant columns | **REXL-N5**, **REXL-N6** |
| Column type consistency + shared autofit helper | **REXL-M13**, **REXL-M14** |
| Sheet count, index order, tab names | **REXL-M15**, **REXL-M16**, **REXL-M26**, **REXL-N10** |
| Shared header-row styling | **REXL-M17** |
| Single source for same metric; formulas OK | **REXL-M18**, **REXL-M19** |
| Zero-row policy documented | **REXL-M20**, GREXL4 |
| Gates + failure paths | GREXL1–GREXL5, **REXL-F1**–**REXL-F5** |

---

## Enforcement and traceability

| Topic | Requirement |
|-------|-------------|
| Verification | Each Verify column names an observable inspection, runtime check, or binary outcome appropriate to the rule. |
| Local mapping | This standard does not prescribe module paths; the adopting repository should map each applicable rule to its implementation and enforcement mechanism and record that mechanism's actual scope and limits. |
