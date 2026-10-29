# Kit tools

Generators for the kit's derived files. Node.js 18 or newer, Node built-ins only — no `npm install`, no awk, no Python. Run them from any directory.

| Command | What it does |
|---|---|
| `node <kit>/tools/kit-lookups.mjs` | Writes the three lookup tables at the kit root: `rule-id-index.tsv`, `routing-vocabulary.tsv`, `routing-synonyms.tsv`. |
| `node <kit>/tools/kit-lookups.mjs --check` | Writes nothing; exits 1 if any table is stale, missing or cannot be generated. |
| `node <kit>/tools/kit-index.mjs` | Regenerates the topic table between `<!-- kit-index:topics -->` and `<!-- /kit-index:topics -->` in `en/README.md`. |
| `node <kit>/tools/kit-index.mjs --check` | Writes nothing; exits 1 and lists the lines when the table has drifted. |

## Options

- `--root <dir>` — the kit root. Without it, the tools use the `KIT_ROOT` environment variable, and otherwise the parent of this `tools/` folder.
- `--only <list>` (`kit-lookups.mjs` only) — a comma-separated subset of `rule-index`, `routing-vocabulary`, `routing-synonyms`.
- `--lenient` (`kit-lookups.mjs` only) — write `rule-id-index.tsv` even when a cover block's `owns` line and the file's real definitions disagree. The disagreements are still printed as warnings.

Exit codes: `0` for success, `1` when a check fails or a table cannot be generated, `2` for bad arguments or a missing kit root.

## The lookup tables

The tables are derived from the tree. Do not commit them, and do not edit them by hand. Regenerate them before any lookup that matters. Nobody reads them whole: each table's header prints the anchored `grep` that queries it, and every path in them is relative to the kit root (for example, `en/ssot/README.md`). To run a query from the kit root:

```sh
grep "^SSG-M8	" rule-id-index.tsv                        # the separator is a literal TAB
grep "^signal:form-input	open	" routing-vocabulary.tsv
grep -iE '(^|[ -])scheduler' routing-synonyms.tsv
```

## When generation fails

Each error message names a code, the file involved, its root cause and the fix. The most common ones:

- `RULE_INDEX_OWNS_DISAGREEMENT` — a file's cover-block `owns` line does not match the identities the census finds defined in it. Fix the `owns` line, or write the definition in a form the census recognises: a line that starts with the identity and a colon (`ID: …`, `**ID:** …`), a list item (`- ID: …`), a heading (`## ID — …`), a table row whose first cell is the identity, or a bold label (`**ID** — …`). Topic folders listed in `lib/census-groups.mjs` use the broader grammar: it also recognises named identities such as `PERF-T-FPS` in `ID:` lines, headings and table cells, but it does not skip fenced code. Files in any other folder are counted fence-aware.
- `ROUTING_SHAPE_UNKNOWN` / `ROUTING_SIGNAL_SHADOWS_SHAPE` — a cover block uses a `shape:` name that `en/_meta/agent-routing-aid.md` does not publish, or a signal reuses a shape's name.
- `SYNONYM_TOKEN_UNCOVERED` / `SYNONYM_ALIAS_TARGET_UNKNOWN` — no phrase could be produced for an `open` token, or a local alias points at a token that does not exist.
- `KIT_INDEX_HUB_MISSING` / `KIT_INDEX_HUB_AMBIGUOUS` — a topic folder has no `part-of: self` hub, or has more than one.

## Adapting to a project

- Add your own phrases (in your working language, your product's terms or vendor names) to `lib/routing-synonyms-local-aliases.mjs`. They appear in the table as `local-alias` rows. The kit's generic English aliases are in `lib/routing-synonyms-aliases.mjs`. If one of those points at a topic you deleted, it is skipped with a warning.
- If you add a topic that follows the broad identity grammar, list its folder in `lib/census-groups.mjs`.
