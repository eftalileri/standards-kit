# Agent routing aid (non-normative)

```kit-cover
type: routing
part-of: README.md
binds: nothing
open-when: shape:floor
skip-when: none
owns: none
```

Purpose: The closed shape table and the lookup commands that [`agent-planning-procedure.md`](../agent-planning/agent-planning-procedure.md) **P3** and **P4** use. Which files a task opens is decided by **P5** from each file's own cover block; this file keeps no hub list and states no condition of its own.

Lookups — query, never read whole. Every `open-when` / `skip-when` token, the files that declare it and its fan-out are generated into `routing-vocabulary.tsv` at the kit root; the natural phrases that name those tokens are generated into `routing-synonyms.tsv` beside it. Both are generated on demand by the kit's own lookup tool — run `node tools/kit-lookups.mjs` from the kit root (or `node <kit>/tools/kit-lookups.mjs`) first when they are absent or older than the kit; `--check` reports whether they are current.

```bash
# run from the kit root (or prefix each file with "$KIT_ROOT/")
grep -iE '(^|[ -])scheduler' routing-synonyms.tsv           # 1. word -> token
grep "^signal:form-input	open	" routing-vocabulary.tsv   # 2. token -> files
cut -f1 routing-vocabulary.tsv | grep -v "^#" | sort -u     # last resort only
```

Hop 1 finds a token whose name you do not know; keep its word-start anchor `(^|[ -])`, because an unanchored `grep -i` matches mid-word and returns a plausible token from another subject. Hop 3 is a fallback, never an entry point.

Shapes are a closed set of seven, and this table is their authority — the generator fails with `ROUTING_SHAPE_UNKNOWN` on any cover block naming a shape absent from it.

| Shape | The task is |
|---|---|
| `shape:floor` | any task at all — this is what no task can route away |
| `shape:backend-heavy` | mostly server work: handlers, domain services, data access, jobs |
| `shape:frontend-heavy` | mostly client work: screens, client state, navigation, forms |
| `shape:full-stack` | one feature slice crossing the FE↔BE contract in the same change |
| `shape:refactoring` | moving or consolidating existing code without changing behaviour |
| `shape:bug-fix` | repairing a defect against evidence, in whichever tier holds the cause |
| `shape:mechanical-enforcement` | adding, changing or removing a lint rule, guard, CI step or gate |
