# Report PDF -- cross-topic reminders and the verification checklist

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: The two non-binding tails of the report-PDF topic: the cross-topic reminder table (each row cites another topic's own rules, and adds none) and the pre-merge verification checklist (each row maps to a rule ID already defined in the normative parts).

Document type: Reference -- carries no rule of its own. Every obligation named here is defined in [report-pdf.md](report-pdf.md), [report-export-core.md](report-export-core.md), [report-pdf-charts-layout-and-limits.md](report-pdf-charts-layout-and-limits.md) or [report-pdf-output-encoding-and-runtime.md](report-pdf-output-encoding-and-runtime.md).

---

## Cross-topic standards (binding reminders)

| Standard | Relationship |
|----------|----------------|
| [Markdown authoring](../authoring/markdown-authoring.md) | Plans referencing PDF work use **MUST** tables and Scope; cite RPDF- IDs when specifying PDF tasks. |
| [Agent gray decisions](../agent-gray-decisions/gray-situation-decisions.md) | No ambiguous multi-branch fixes; **RPDF-C6** STOP when uncertain. |
| [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) | Report data single source; no bypass of service layer for PDF. |
| [Error handling](../error-handling/error-handling.md) / [Error policy](../error-policy/error-policy.md) | **RPDF-M22**, **RPDF-N8** — structured errors; no silent normalization of invalid business data. |
| [Name consistency](../name-consistency/name-consistency.md) | **RPDF-M3** — canonical display names. |
| [Security](../security/README.md) | **RPDF-M28**, **RPDF-N11** — output encoding for the rendered document. The report renderer is a markup sink: free-text domain schemas do not filter markup, so the template escape is the sink's own control and is not substituted by input validation or by renderer process hardening. |

---

## Verification checklist (PDF change / new template)

Map every item to a rule ID; all must pass before merge.

| Check | Rule IDs |
|-------|----------|
| Data only from whitelist report services | **RPDF-M1**, **RPDF-M2**, **RPDF-N1** |
| Names via the canonical display-name authority | **RPDF-M3**, **RPDF-N2** |
| Money via the documented currency formatter; consistent grouping | **RPDF-M5**–**RPDF-M7**, **RPDF-N4** |
| Dates via the shared date-time and date-range formatters | **RPDF-M8**, **RPDF-N5** |
| Percent rules per report type | **RPDF-M9** |
| Charts match the product's chart contracts; fallback tables | **RPDF-M10**, **RPDF-M11**, **RPDF-N6** |
| No overlap; `page-break-inside`; bounded chart wrap | **RPDF-M12**–**RPDF-M14** |
| Title/legend/labels; i18n + data key alignment | **RPDF-M15**–**RPDF-M17**, GRPDF8 |
| Filter chips show labels | **RPDF-M4**, **RPDF-N3** |
| KPI/table same metric — single binding | **RPDF-M21**, **RPDF-N7** |
| Metadata preflight | **RPDF-M23**, **RPDF-N9**, GRPDF2 |
| Layout order and footer | **RPDF-M18**–**RPDF-M20** |
| Formatter module resolvable; import smoke check in the adopting project's pipeline | **RPDF-M24** |
| Single time source for `generatedAt` / ranges | **RPDF-M25**, **RPDF-N10** |
| Payload validation path (schema or explicit key list) | GRPDF1 |
| Double-failure on critical insight slots | **RPDF-M26**, GRPDF4 |
| Size / timeout limits documented and enforced | **RPDF-M27** |
| Every dynamic value in template markup escaped by the single authority (numbers included); the adopting project's provenance check passes (record its scope) | **RPDF-M28**, **RPDF-N11**, GRPDF9 |
| Browser renderer version is pinned to its runtime image and real-launch behavior is verified in the deployed runtime context | **RPDF-M29**, **RPDF-N12**, GRPDF10 |

Code layout: Keep shared styles and HTML building blocks in the locations defined by the adopting system; they must follow **RPDF-M12**–**RPDF-M14**.
