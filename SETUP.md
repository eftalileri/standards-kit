# Setup guide — adopting the standards kit in your project

This kit is a set of English engineering standards written for AI coding agents (Claude Code, Codex and similar) and the people who review their work. It was extracted from a production React Native + Node.js monorepo and made project-independent. You add it to your repository, point your agent's root instruction file at it, and the agent follows the same rules on every task.

This guide takes you from an empty repository to a working setup in about 30 minutes.

## What you get

| Path | What it is |
|------|------------|
| `en/` | The standards: one folder per topic (SSoT, error policy, forms, pagination, i18n, security, …). `en/README.md` is the index. |
| `en/_meta/` | How to read the kit: precedence, the agent contract, the routing aid. Only `agent-contract.md` and `precedence.md` bind. |
| `agent-notes/` | An empty note registry for deferred observations and plan divergences. |
| `templates/CLAUDE.template.md` | A root agent file (`CLAUDE.md` / `AGENTS.md`) template, taken from a project where this setup works well, with all project facts replaced by placeholders. |
| `tools/` | Zero-dependency Node scripts that generate the lookup tables and the topic index. |
| `*.tsv` (root) | Generated lookups: rule id → file, routing tokens, synonyms; plus the retired-id ledger. Never edited by hand. |

## Requirements

- Node.js 18 or newer (only for the `tools/` scripts; no `npm install` needed).
- Git.
- An AI coding agent that reads a root instruction file (Claude Code reads `CLAUDE.md`; many others read `AGENTS.md`).

## Step 1 — Add the kit to your repository

Pick a stable path; the rest of this guide calls it `KIT_ROOT`. `docs/standards-kit` is a good default.

Copy (simplest; you own the copy and can edit it):

```bash
git clone --depth 1 https://github.com/eftalileri/standards-kit.git docs/standards-kit && rm -rf docs/standards-kit/.git
```

Or as a submodule (keeps you on upstream; edits go upstream first):

```bash
git submodule add https://github.com/eftalileri/standards-kit.git docs/standards-kit
```

Keep the internal relative links intact — do not move files around inside the kit.

## Step 2 — Generate the lookup files

From the kit root:

```bash
node tools/kit-lookups.mjs
```

Run it again whenever the kit changes. `node tools/kit-lookups.mjs --check` only reports whether the files are current. After adding or removing a topic folder, also run `node tools/kit-index.mjs` to regenerate the topic list in `en/README.md`.

## Step 3 — Decide which topics apply

Open `en/README.md`. Topics fall into three groups:

- **Universal** — apply to almost any codebase: `ssot`, `error-policy`, `error-handling`, `logging-policy`, `security`, `code-modularity`, `dead-code`, `implementation-verification`, `false-positive`, `enforcement-architecture`, `agent-planning`, `agent-gray-decisions`, `idempotency`, `transactions`, `api-list-pagination`, `timezone`, `name-consistency`, `authoring`.
- **Stack-specific** — apply only when you use that stack: everything ending in `-rn` (React Native), `zustand`, `tanstack-query`, `mmkv`, `expo-notifications`, `android-edge-to-edge`, `redis`, `nosql-query-safety`, `monorepo`, `styling`, `routing`.
- **Domain-specific** — apply only when you have that domain: `payment-ssot`, `appointment-lifecycle`, `phone`, `report-pdf`, `report-excel`, `email-provider`, `maps-location-rn`, `ai-visibility`.

You do not need to delete topics you do not use: every file has a cover block (line 3) with `open-when` / `skip-when`, so an agent skips it unless your project matches. Delete a folder only if you want a smaller copy; then run `node tools/kit-index.mjs` and `node tools/kit-lookups.mjs`.

## Step 4 — Start the project's own registries

The kit ships its registries **empty** on purpose. Fill them from your code, never from another project.

1. **SSoT registry** — `en/ssot/ssot-registry.md` explains the row format and the new-project registration procedure. Register each real authority (the one file/function that owns a piece of data, an operation or a derivation) as you meet it. You do not have to register everything on day one; the rules require registering an authority the first time a task touches it.
2. **Agent notes** — `agent-notes/note-registry.md` stays empty until there is something to record.

## Step 5 — Create your root agent file from the template

```bash
cp docs/standards-kit/templates/CLAUDE.template.md CLAUDE.md
```

(Use `AGENTS.md` instead, or as well, if your agent reads that name.) Then edit `CLAUDE.md`:

1. **Replace every `<PLACEHOLDER>`.** Find them with `grep -n '<[A-Z_]*>' CLAUDE.md`. The important ones:

   | Placeholder | Fill with |
   |-------------|-----------|
   | `<PROJECT_NAME>` | Your project name. |
   | `<KIT_ROOT>` | The path from Step 1, e.g. `docs/standards-kit`. |
   | `<OWNER_LANGUAGE>` | The language the agent should use with you in chat. |
   | `<AGENT_NOTES_PATH>` | `docs/standards-kit/agent-notes` (or wherever you keep them). |
   | `<ARCHITECTURE_DOCS_PATH>`, `<DECISION_RECORDS_PATH>` | Your architecture and ADR folders; delete the precedence line if you have none. |
   | `<SSOT_FIND_COMMAND>` | A command that searches the registry, or delete it and keep the file path. |
   | `<SOURCE_DIRS>` | Your source folders, e.g. `src/`, `server/`, `packages/`. |
   | `<COMMIT_GATE_COMMAND>` | The fast checks before every commit, e.g. `npm run lint && npm run typecheck && npm run format:check`. |
   | `<FULL_CI_COMMAND>` | The full gate before push. |
   | `<SAFE_LINT_FIX_COMMAND>` | An autofix you trust to touch source, or delete the exception. |
   | `PROJECT FACTS` placeholders | Deploy host and commands, the logging helper, the error registry and central error handler. |

2. **Decide the optional sections.** `TEST ARTIFACT POLICY` reflects one owner's choice (verify against the real tree instead of agent-written tests). If your project relies on tests, delete that section and the `0.` line under `PRECEDENCE`.
3. **Trim `CODE STANDARDS`** to your stack. The defaults assume TypeScript, a React/React Native client and a Node.js backend.
4. **Keep the rule ids.** Lines such as `ENA-A1`, `SSG-M8`, `M18` are pointers into the kit; the agent resolves them with `grep "^SSG-M8<TAB>" rule-id-index.tsv`.
5. **Delete the HTML comment** at the top and any inline `<!-- … -->` hints once filled.

Do **not** leave the template inside the kit named `CLAUDE.md`: Claude Code loads `CLAUDE.md` files from subfolders it reads, so a placeholder file would be loaded as real instructions.

## Step 6 — First run

Ask your agent for a small, real task (for example "add input validation to the signup endpoint"). A correct setup shows up as the agent:

- reading `agent-planning/agent-planning-procedure.md` and `_meta/agent-routing-aid.md` first,
- looking up rule ids in `rule-id-index.tsv` instead of opening whole files,
- searching the SSoT registry before writing code and registering the authority it used,
- running your commit gate before committing.

If it does not, check that `<KIT_ROOT>` in `CLAUDE.md` points to the right folder and that Step 2 produced the `.tsv` files.

## Keeping the kit healthy

- **Extend before you add.** New rules go into an existing topic file; a new topic folder is the last resort. The procedure is in `en/authoring/kit-rule-addition.md`.
- **Write rules, not stories.** A rule is MUST / MUST NOT + a one-line reason, project-independent. No dates, measurements or incident narratives.
- **Never reuse a rule id.** Retire it in `retired-rule-ids.tsv` with its successor.
- **Regenerate** with `node tools/kit-lookups.mjs` after every kit edit; `--check` fits in a pre-commit hook or CI step.
- **Pulling upstream updates** (copy install): diff the new release against your copy, keep your local additions, regenerate the lookups.

## FAQ

**Is the kit only for React Native?** No. The universal topics are stack-neutral. The `-rn` topics simply stay closed when your project is not React Native.

**Do I have to use Claude Code?** No. Any agent that reads a root instruction file works; rename the template to what your agent reads.

**Can I translate the kit?** The kit lives under `en/` so a translation can sit beside it (e.g. `tr/`). Keep rule ids identical across languages.
