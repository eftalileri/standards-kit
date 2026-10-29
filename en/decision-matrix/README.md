# Decision matrix

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: signal:stack-choice
skip-when: none
owns: none
```

**Keywords:** stack choice, problem class, routing, system, standard file

SSOT: [decision-matrix.md](decision-matrix.md) — problem class to stack/system and standard file (the Matrix). Part file [decision-matrix-governance.md](decision-matrix-governance.md) — the contract **C1**–**C7**, the agent role, **M1**–**M8**, **N1**–**N5**, the layer precedence, change impact and ordered usage.

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: stack precedence pointers and boundary ID index). [Agent planning procedure](../agent-planning/agent-planning-procedure.md) (**P2** + **P5** use this matrix and linked hubs). [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) when the problem is not in the matrix or docs conflict at the document level. Backend HTTP handler efficiency and cache plans do not replace matrix rows for client server state; use [Backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (BHE-\*) when changing server deduplication or outbound cache. Markdown cross-impact table shape: [Cross-impact analysis](../authoring/cross-impact-analysis.md) (XIA-\*) extends [Markdown authoring](../authoring/markdown-authoring.md) **M14**.
