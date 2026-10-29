# Whole-graph dead-code analysis (operational guidance)

```kit-cover
type: normative
part-of: README.md
binds: safe configuration and interpretation of a whole-graph dead-code analyzer when the consuming project uses one
open-when: signal:unused-report, signal:knip-tuning
skip-when: signal:no-deletion
owns: none
```

**Scope:** Apply this guidance when the consuming project uses [knip](https://knip.dev) or a similar whole-graph analyzer. Tool setup and configuration are project-specific; this file explains the safety properties they must preserve. It extends [dead-code.md](dead-code.md) (**DCD-**\*) without redefining the deletion policy. The per-category resolution playbook is in [knip-optimization-playbook.md](knip-optimization-playbook.md).

**Document type:** Normative operational guidance within the [dead-code hub](README.md), conditional on adopting a whole-graph analyzer.

**References:** [dead-code.md](dead-code.md); [dead-code-rules.md](dead-code-rules.md); [knip-optimization-playbook.md](knip-optimization-playbook.md); [monorepo](../monorepo/README.md) (when workspaces apply).

## 1. What a whole-graph analyzer can report

A configured analyzer walks an import graph from declared entry points and reports candidates it cannot reach:

| Report | Typical meaning | Review need |
|--------|-----------------|-------------|
| Unused files | File is not reachable from declared entries | Verify entries, dynamic loading, and external consumers |
| Unused exports or types | Export is not imported in the analyzed graph | Check barrels, public APIs, generated use, and package consumers |
| Unused dependencies | Declared dependency is not found in analyzed source | Check build configuration, plugins, dynamic loading, and workspace placement |
| Unlisted dependencies | Source imports a package absent from the relevant manifest | Confirm the import and dependency ownership |
| Unresolved imports | An import target cannot be resolved | Check aliases, generated files, and configuration |
| Duplicate exports | A binding is exposed by multiple paths | Verify whether the duplication is intentional |

Every result describes only the graph the tool analyzed. It does not include released clients with frozen bundles or third-party consumers. A flagged wire surface is therefore not evidence of deadness; apply [DCD-M8](dead-code-rules.md), [DCD-N5](dead-code-rules.md), and [GDCD4](dead-code.md) before removing it.

Every result is a **candidate**, never an auto-delete. Review it under [DCD-M3](dead-code-rules.md); keep the analyzer advisory while its relevant categories have known false positives ([DCD-N3](dead-code-rules.md)).

## 2. Project setup

Install and configure the analyzer using the consuming project's package manager, supported version policy, and workspace layout. Do not copy a version number, package manifest, or command from another project.

Expose a clear command through the project's existing task runner or package scripts. Use the configured command for scans; an unconfigured run can report most of the project as unused and is not actionable. Keep findings advisory until their precision supports a stronger role.

## 3. Configuration and coverage

The configuration must represent the real runtime entry points, workspaces, source directories, and extensions. Derive these from the project's authorities instead of maintaining a divergent file list. When the tool cannot consume an authority directly, document how consistency is maintained or state the coverage limit.

A configured run is mandatory before acting on output (**DCD-M4**): unconfigured, the analyzer cannot find the application entry and reports nearly everything as unused (noise).

Use the tool’s executable configuration form, not its JSON form, when it offers both. A JSON configuration cannot import anything, so every extension set in it is a hand-written copy of the project’s source-extension authority, and copies drift silently (a glob matching nothing is not an error). The executable form derives those sets, which is what **DCD-M4** (a) requires. Two filename traps: the declarative name is usually resolved first, so the old file must be deleted in the same change or the new one is dead; and a `*.config.*` shaped name is excluded by many projects’ own lint scope, which would drop the very file that closes this blind spot.

The following is a **shape sketch**, not a ready-to-run configuration:

```js
export default {
  workspaces: {
    '<workspace>': {
      entry: ['<runtime-entry>'],
      project: ['<source-pattern>'],
      // One recorded reason per entry (DCD-M5); a misplaced dependency is moved, not ignored.
      ignoreDependencies: ['<tool-plugin-loaded-from-an-unparsed-config>'],
    },
  },
};
```

Configuration text does not prove coverage. For at least one real file in every relevant source class and workspace, ask the analyzer whether it includes that path (for knip, use its `--trace-file` option). A file absent from the graph was not measured, regardless of what a glob appears to say. State classes that remain outside the graph — a package that is not a declared workspace, a documentation tree, or a package whose consumers include a separately maintained mirror that no in-repo graph sees: a “no findings” for any of them is unscanned, not clean.

Tooling-config helper directories are entries. A lint/build configuration that composes local modules (for example a flat lint config spreading `./<dir>/*.js`) is parsed by the analyzer’s plugin for its own imports only; the local modules it pulls in are not followed, so every package imported from them is reported as an unused devDependency. The fix is to add the helper directory to `entry`, never `ignoreDependencies` — a suppression would also hide a genuinely unused plugin (**DCD-M5**).

Suppress only proven false positives, using the tool's appropriate configuration mechanism and a reason that can be checked. Do not hide genuine findings to make a report clean.

## 4. Common false-positive sources

| Cause | What to verify |
|-------|----------------|
| Dynamic imports or runtime registration | Confirm the entry and loading path are represented in the graph |
| Build or bundler configuration | Check whether the tool understands that configuration language |
| Generated code or files | Confirm whether generated outputs or their sources are the intended analysis targets |
| Workspace dependency placement | Check which manifest owns the dependency and where its consumer is analyzed |
| Public package surface | Check external consumers and compatibility obligations, not only local imports |
| Type declarations or ambient modules | Confirm the analyzer's treatment before treating a missing import as dead |
| Cross-workspace dependency | Used in one workspace, listed in another’s manifest: move the dependency; use `ignoreDependencies` only for an intentional placement |
| Dynamic `import()` in a package script; sibling source package resolving from the deployer | Outside the static graph or attributed to the sibling manifest: `ignoreDependencies` with a recorded reason |

Typical proven false-positive sources that justify a recorded `ignoreDependencies` reason:

- A hand-run CLI tool that no source imports and no package script invokes, driven by its own root config file — the static graph has no usage to see.
- A dependency loaded only by a dynamic `import()` inside a package script (`node -e "await import('<pkg>')"`) — the shell string is outside the static graph.
- A dependency whose only importer is a sibling package root that ships as source inside the deploying package and resolves the package from the deployer’s `node_modules` — the analyzer attributes the import to the sibling’s own manifest.
- An `ignoreDependencies` entry for a package that is no longer declared anywhere is stale — the analyzer’s hint names it; drop it.

Correct the configuration when a tool blind spot is established. Keep a finding when the code is genuinely unused. Do not add a suppression without evidence.

## 5. Verify-before-delete workflow

For each candidate:

0. **Check published surfaces first.** If it is a route, endpoint, response field, request parameter, event name, or other public contract, establish the released-consumer horizon before considering deletion (**DCD-M8**, **DCD-N5**, **GDCD4**).
1. **Prove it is unused.** Review source references, dynamic or string-keyed use, barrels, workspace consumers, and every executable tree that can consume the contract. The directory set you walked is a premise of the result, so state it before trusting the zero: “0 references” means only “absent from the trees I opened”. Migration and operational script trees are the measured trap — they import the same authorities, run against production data, and are routinely excluded from a source scan that names only the application directories. Enumerate every tree that can execute against production — application, shared, scripts/migrations, jobs/workers, and any sibling repository that consumes the same contract — and if one of them cannot be scanned from here, say so rather than letting its silence read as absence.
2. **Remove in small related batches** under the source-editing policy that applies to the project.
3. **Run the verification required by the project.** A clean result from the same incomplete source graph does not prove an external consumer is absent.
4. **Keep uncertain candidates** ([DCD-M6](dead-code-rules.md)).

High-confidence starting points are obvious orphan patterns, such as backup files or an index module with no importers. These are still candidates and use the same review steps.

## 6. Do / don't checklist

**Do**

- Run the configured analyzer, never an unconfigured one (**DCD-M4**).
- Review its configuration hints before its findings.
- Treat every row as a candidate and verify it in the project's source and consumer scope.
- Fix a tool blind spot in configuration, with evidence (**DCD-M5**).
- Resolve a real structural finding at the source of the structure.
- Re-run the analyzer after configuration changes to confirm the correction.
- Keep anything uncertain (**DCD-M6**).

**Don't**

- Add a noisy whole-graph report to a blocking gate (**DCD-N3**).
- Delete from a report alone (**DCD-N1**).
- Delete a public surface based only on the current source tree (**DCD-M8**, **DCD-N5**).
- Treat a text search that includes dependencies, generated files, or type stubs as proof of usage (**DCD-N4**).
- Suppress a genuine finding (**DCD-M5**).
- Use an analyzer's automatic fixer as the deletion path; follow the consuming project's source-editing policy (**DCD-N2**).

## 7. Finding categories

See [knip-optimization-playbook.md](knip-optimization-playbook.md) for category-based configuration and structural remedies. Apply only the entries relevant to the analyzer and stack used by the consuming project.

**Part of:** [Dead code README](README.md).
