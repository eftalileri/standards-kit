# Report PDF -- output encoding and the browser runtime tuple

```kit-cover
type: normative
part-of: README.md
binds: RPDF-M28 and RPDF-M29 -- the single escaping authority for every dynamic value a template emits, and the pinned renderer runtime contract
open-when: shape:backend-heavy, signal:pdf-report, signal:pdf-template-markup, signal:output-encoding, signal:browser-runtime
skip-when: signal:excel-export-only, signal:no-template-markup-or-runtime-change
owns: RPDF-M28, RPDF-M29
```

Scope: Output encoding at the interpolation point and the pinned compatibility contract for any external browser runtime used to render PDFs.

Document type: Normative part -- **RPDF-M28**, **RPDF-M29**.

References: [README.md](README.md); [report-pdf.md](report-pdf.md) (scope, agent execution contract **RPDF-C1-RPDF-C6**, **RPDF-N11**, **RPDF-N12**, GRPDF9, GRPDF10); [report-export-core.md](report-export-core.md) (**RPDF-M1-RPDF-M9**); [report-pdf-charts-layout-and-limits.md](report-pdf-charts-layout-and-limits.md) (**RPDF-M10-RPDF-M27**); [security](../security/README.md) (the renderer as a markup sink).

---

## **MUST**

| ID | Rule | Consequence if violated | Verify |
|----|------|-------------------------|--------|
| **RPDF-M28** | Output encoding — one escaping authority. When a PDF renderer consumes HTML, SVG, or other markup, every dynamic value MUST be encoded for its output context at the point it enters markup. Use one documented escaping authority and do not rely on input validation, a value’s apparent type, or renderer sandboxing as a substitute. Escape composed output as a whole. Only explicitly trusted, canonical markup producers may bypass escaping, and their contract must be documented. | Bug — must not ship | Review every dynamic interpolation and verify representative markup-significant input is harmless in the rendered document. Use static checks where the implementation can identify the actual sink and trusted producer. |
| **RPDF-M29** | Renderer runtime — one pinned compatibility authority. If PDF rendering depends on a browser or external executable, pin its version and platform-compatible runtime as one documented deployment unit. Build and production must use the same verified runtime artifact; executable discovery must not fall back to an unrelated host-installed binary or environment override. Validate a real launch in the final runtime context and use an appropriately restricted process identity. Runtime or version mismatch MUST fail the PDF job through the application’s error boundary; do not guess compatibility or silently substitute another binary. | STOP / supply-chain bug | Review the pinned runtime artifact, build/deployment parity, executable discovery, runtime launch, and failure behavior. |

---





## Runtime and encoding review limits

Static checks must follow the actual markup sink and the pinned runtime configuration. Names, function prefixes, or similarly shaped unrelated APIs are not proof of trusted output or executable provenance. Cross-file producers and deployment configuration require review when a local check cannot establish their contract.
