# Report PDF -- data sourcing and value formatting

```kit-cover
type: routing
part-of: README.md
binds: nothing
open-when: shape:backend-heavy, signal:pdf-report, signal:report-formatting, signal:currency-format, signal:date-format
skip-when: signal:excel-export-only, signal:no-pdf-data-or-format-change
owns: none
```

The PDF and Excel data/formatting obligations have one home: [report export core](report-export-core.md).

## **MUST**

[**RPDF-M1**–**RPDF-M9**](report-export-core.md) govern PDF data sourcing and formatting.

<a id="rpdf-m8--date-and-time-semantics"></a>

### Date and time semantics — [**RPDF-M8**](report-export-core.md#rpdf-m8--date-and-time-semantics)

[Calendar day, instant, language and consumer contracts](report-export-core.md#rpdf-m8--date-and-time-semantics).
