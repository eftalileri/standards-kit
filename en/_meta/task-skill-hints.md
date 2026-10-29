# Task to Skill hints

```kit-cover
type: routing
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

What this file is: a pointer only. It carries no task-shape table of its own, because routing is already owned by the authorities below and a hand-maintained third copy would drift.

What this file is not: not SSOT, not a rule source, not a mandatory mapping. If anything here disagreed with Standards or the consuming project's root agent-rule file, those win — see [precedence](precedence.md).

Where the routing lives — three authorities, no fourth list:

1. Problem class → system → standard file: [decision-matrix.md](../decision-matrix/decision-matrix.md) Matrix. This is the binding one; the planning procedure opens it at **P2** on a layer or technology choice.
2. Topic → hub path: the generated topic index in [`README.md`](../README.md), derived from the files themselves.
3. Task shape / signal → files: the generated lookup `routing-vocabulary.tsv` at the kit root, derived from each file's `open-when` and `skip-when`. Generate it with `node tools/kit-lookups.mjs` from the kit root when it is absent or older than the kit (`--check` reports whether it is current). It is grepped, never read: `grep "^signal:<name>	open	" routing-vocabulary.tsv` for the files a token opens, `cut -f1 routing-vocabulary.tsv | sort -u` for the whole vocabulary. The seven shape names are glossed in [agent-routing-aid.md](agent-routing-aid.md), which is that closed set's authority.

A task shape with no literal Matrix problem-class row (for example a phone number field, a PDF / Excel report, a monetary field, or an editable attribute cascade) resolves through authority 2: the topic index names the matching hub (`phone`, `report-pdf`, `report-excel`, `payment-ssot`, `editable-persistent-attributes`).

Use a tool-specific skill only when the consuming environment provides it and the task needs it. A skill supplements the standards; it does not replace the matrix, a topic standard, or project policy.
