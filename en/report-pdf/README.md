# Report PDF (server-side)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** PDF, server-side, chart, formatter, data pipeline, output encoding, HTML escaping


Normative rules for PDF report generation: data whitelist, formatters, charts and fallback tables, layout, metadata gates, output encoding, and failure behavior.

- [Report PDF (SSOT)](report-pdf.md) — scope, agent execution contract (**RPDF-C\***), the report services whitelist, every **RPDF-N** prohibition and every GRPDF gate
- [Data sourcing and value formatting](report-export-core.md) — **RPDF-M1**–**RPDF-M9**
- [Charts, layout, preflight and resource limits](report-pdf-charts-layout-and-limits.md) — **RPDF-M10**–**RPDF-M27**, **RPDF-M30** and the normative failure-path table
- [Output encoding and the browser runtime tuple](report-pdf-output-encoding-and-runtime.md) — **RPDF-M28**, **RPDF-M29**
- [Appendix](report-pdf-appendix.md) — cross-topic reminders and the verification checklist (no rule of its own)

Read first when touching a template body: **RPDF-M28** / **RPDF-N11** / GRPDF9 — a template emits markup for a browser engine, so every dynamic value goes through one escaping authority (numbers included); input validation is not that layer.

Related: [Name consistency](../name-consistency/README.md) (display names); [Error policy](../error-policy/README.md); [Error handling](../error-handling/README.md); [SSOT readiness](../ssot-readiness/README.md); [Report Excel](../report-excel/README.md) (workbook exports); [Security](../security/README.md) (the renderer as a markup sink).
