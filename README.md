# Standards kit (project-independent)

```kit-cover
type: routing
part-of: en/README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Portable scaffold for English standards, meta files, and agent routing. **Copy, symlink, or submodule** this folder into any repository. It is not tied to a single app.

**The index is [`en/README.md`](en/README.md).** It carries the generated topic list — one row per topic folder, derived from the tree — and the meta list. What each `en/_meta/` file is lives in [`en/_meta/README.md`](en/_meta/README.md) and in each file's own cover block.

## Using this kit in a new project

The step-by-step walkthrough, including the placeholder table for the agent-file template, is [`SETUP.md`](SETUP.md). The summary:

1. Place this directory at a stable repository path and set `KIT_ROOT` in the commands below to that location (for example, `KIT_ROOT=docs/standards-kit-independent`). Keep the copy's internal relative links intact.
2. Generate the lookup files once after copying, and again whenever the kit changes: run `node tools/kit-lookups.mjs` from the kit root (or `node "$KIT_ROOT/tools/kit-lookups.mjs"` from anywhere). The tool uses Node built-ins only and needs no install; `--check` reports whether the generated files are current without rewriting them. After adding or removing a topic folder, regenerate the topic index in [`en/README.md`](en/README.md) with `node tools/kit-index.mjs`.
3. Read [`en/README.md`](en/README.md) and the applicable topic hubs. Treat stack-specific material as conditional: open a platform or library topic only when the project uses that stack; do not infer that every topic applies.
4. Populate the project's own SSoT registry with its real authorities, ownership boundaries, and locations before relying on it for implementation decisions. The copied kit defines the registry process; project records must be derived from the new project's code and architecture, not copied from another repository.
5. Create the project's root agent-rule file from [`templates/CLAUDE.template.md`](templates/CLAUDE.template.md), or link the kit from the existing one. The root file establishes project-local precedence, language and workflow preferences, release authority, and deployment details, while pointing to this kit for reusable standards. Fill every placeholder from the new project's own facts; never copy another project's filled-in `CLAUDE.md`, `AGENTS.md`, or equivalent.
6. Use [`agent-notes/`](agent-notes/README.md) for empty deferred-observation and plan-divergence records. Start with its blank registry; do not carry over another project's notes or decisions.
7. Optionally copy [`templates/skills/task-orchestration/`](templates/skills/task-orchestration/SKILL.md) into `.claude/skills/` to run implementation work with several autonomous agents, and the [`templates/skills/security/`](templates/skills/security/README.md) skill folders to run a read-only security assessment whose checks point at this kit's rule ids instead of restating them; fill their placeholders as described in [SETUP.md](SETUP.md).

The kit is not a substitute for project-specific architecture, registries, configuration, or agent instructions. Resolve every example path and named tool against the consuming project before treating it as applicable.

**How to read the kit:**

0. `rule-id-index.tsv` (kit root) — **looked up, never read.** If you already hold a rule identity (`SSG-M8`, `COD-M3`), one anchored grep gives you the file that defines it and you open that file only. From the kit root: `grep "^SSG-M8<TAB>" rule-id-index.tsv` (or `grep "^SSG-M8<TAB>" "$KIT_ROOT/rule-id-index.tsv"` from elsewhere), the separator being a literal tab. It is generated from the tree, so it is never edited by hand — and it is not a document: opening it whole costs more than the hub scan it replaces. It and its two siblings below are derived on demand by `node tools/kit-lookups.mjs`; run it first when the files are absent or older than the kit, or check them with `--check` ([ENA-N11](en/enforcement-architecture/enforcement-anti-patterns.md)). An identity that is no longer defined anywhere is recorded in [`retired-rule-ids.tsv`](retired-rule-ids.tsv), which names its successor or the reason it was retired; a retired identity is never reused.

   Two sibling lookups work the same way and are generated the same way. `routing-vocabulary.tsv` answers *which files does this token open* (and its fan-out). `routing-synonyms.tsv` answers the question that comes **before** it — *what is this concept called here* — mapping a natural phrase to the canonical token. **Its own header prints the query to use, and that is the only place the query form is written** — it is word-start anchored, because an unanchored substring grep matches mid-word and hands back a plausible token belonging to another subject, which is worse than an empty result. Reach for the synonym table first when the token's name is not already known; guessing a token name fails silently, because a name that matches nothing looks exactly like a subject the kit does not cover.
1. [`en/README.md`](en/README.md) — the topic index and the meta list.
2. [`en/_meta/README.md`](en/_meta/README.md) — what each meta file is and whether it binds.
3. Each file's **cover block** (line 3) — its type, what it binds, when to open it, when to skip it, and the rule identifiers it defines.

The lookups are a navigation aid; the defining file remains the authority. Open the file the lookup names and verify the complete rule there.

`en/_meta/` is **mixed**, not uniformly non-normative: `agent-contract.md` and `precedence.md` bind; the rest route, track or illustrate. Normativity is declared **per file** — read the cover block's `type:` key rather than inferring it from the folder.

**Normative content** lives under `en/<topic>/`. Tool-specific agent configuration stays in the consuming project; this kit only holds reusable standards-shaped files.
