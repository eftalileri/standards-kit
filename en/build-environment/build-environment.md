# Build and environment (SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract for the build-environment topic and the enforcement notes that name which mechanism enforces BE-M16 to BE-M18
open-when: shape:backend-heavy, shape:full-stack, signal:env-variable, signal:build-script, signal:ci-workflow, signal:build-config, signal:dependency-upgrade
skip-when: signal:no-build-or-environment-change
owns: BE-C1, BE-C3, BE-C6, BE-C7
```

## Scope

- **Included:** Binding rules for Node.js / TypeScript (or JavaScript) repositories that use `package.json` for scripts, environment variables for configuration, build output, test runner configuration, and documented deployment surfaces. Rules apply at the owning package boundary unless a monorepo layout is documented (see **BE-M11** and [monorepo](../monorepo/README.md)).
- **Excluded:** Build systems without `package.json`; adapt these principles to the stack’s own manifest and execution model. Production secret rotation, vault products, and token lifecycle are governed by [security](../security/README.md) (SEC- rows); this file states local minimums only (**BE-N3**, GBE2). This topic does not select an environment-validation library.

**Document type:** Normative — contract and enforcement notes for the build-environment topic; the rule rows live in the part files listed below. **BE-C2**, **BE-C4** and **BE-C5** are not defined; the gaps are never back-filled.

**Environment:** Applies — local vs CI vs production hosts, committed vs injected variables, `NODE_ENV`, and build-time configuration files.

**References:** [README.md](README.md); [decision matrix](../decision-matrix/decision-matrix.md); [security — secrets and logging](../security/security-secrets-and-logging.md).

**Code samples (non-normative):** [`../_meta/examples/build-environment-code-samples.md`](../_meta/examples/build-environment-code-samples.md).

## Parts of this topic

The rule rows live in part files; the identifiers are unchanged.

| Part | Identifiers defined there |
|------|---------------------------|
| [build-environment-decision-gates.md](build-environment-decision-gates.md) | GBE1–GBE10 |
| [build-environment-repository-and-scripts.md](build-environment-repository-and-scripts.md) | **BE-M1**–**BE-M4**, **BE-M6**–**BE-M9**, **BE-M11**–**BE-M14**, **BE-M20**–**BE-M21**, **BE-M26**, **BE-M31**, **BE-M33**–**BE-M36** |
| [build-environment-deployment-config-source.md](build-environment-deployment-config-source.md) | **BE-M28**–**BE-M30** |
| [build-environment-config-and-runtime-floor.md](build-environment-config-and-runtime-floor.md) | **BE-M15**–**BE-M17** |
| [build-environment-runtime-floor.md](build-environment-runtime-floor.md) | **BE-M18** |
| [build-environment-release-and-cutover.md](build-environment-release-and-cutover.md) | **BE-M19**, **BE-M22** |
| [build-environment-env-key-declaration.md](build-environment-env-key-declaration.md) | **BE-M23**, **BE-M24**, **BE-M27**, **BE-M32** |
| [build-environment-gate-coverage-proof.md](build-environment-gate-coverage-proof.md) | **BE-M25** |
| [build-environment-prohibitions.md](build-environment-prohibitions.md) | **BE-N1**–**BE-N12**, **BE-F1** |

## Enforcement notes

**BE-M16** enforcement note: Configuration composition order and same-file import/spread parity **MUST** be enforced by a narrow syntax-tree rule; directory-to-composition omission remains a disjoint cross-file inventory check. Executable configuration, configuration modules, and rule sources **MUST** be included in the ordinary pre-commit lint command; an auxiliary alias may exist but **MUST NOT** create a second CI execution path.

**BE-M17** enforcement note: A hand-written extension set inside a scope declaration is decidable from a single file’s syntax tree and **MUST** be locked by a narrow rule; the *inventory* comparison (tool-reported files vs. directory authority) is inherently cross-file and belongs to a separate aggregate check. Keep the two disjoint — one condition, one mechanism.

**BE-M17** enforcement note — the third direction (scope address resolution). Where a scope declaration still names individual files, each name is a location-valued reference and is therefore subject to [**FP-M23**](../false-positive/check-design-rules.md): the aggregate check **MUST** resolve every glob-free entry and existence-test it, because a glob matching nothing is not an error in any mainstream matcher. Two forward directions (“file no configuration matches”, “file no gate command reaches”) do not cover this reverse one: the entry outlives its file’s deletion or rename, the block it scopes silently empties, the gate stays green, and every inventory derived from the configuration *text* keeps reporting that rule as enforced — a false coverage signal, not merely a missing one. This is the deletion half of [**SSG-M8**](../ssot/ssot-principles-and-precedence.md): a migration that removes a file removes its enforcement address in the same change. Resolution reads the tool’s own resolved configuration, never a second glob or text parser, and the run reconciles resolved-count against declared-count so “resolved nothing” cannot read as “all resolved” (**FP-M19**). When the emptied entry was a rule’s only scope, that rule’s coverage is already zero and the exit belongs to [**FP-M25**](../false-positive/check-verification-rules.md) — with one measurable discriminator: a body whose *own* predicate is pinned to the same dead path (an early return keyed to the removed filename) can produce no finding on any tree, so it is inert residue and is retired together with the address, while the successor invariant is recorded as new work rather than repointed onto a predicate written against the old tree.

**BE-M18** enforcement note: A dependency runtime-floor change is a cross-file deployment invariant. The manifest engine field is the single minimum-runtime authority; CI images, container bases, platform configuration, and operational documentation are consumers that **MUST** satisfy it, not competing minimum stores. A stable minimum is a SemVer precedence boundary: a prerelease carrying the same major/minor/patch tuple is lower and **MUST NOT** be accepted by a checker that merely truncates the prerelease suffix. Enforce the runtime checker’s single-file structure with a syntax-tree lint rule and reserve a build/deployment check for manifest/lock/script/entry/CI parity that one source tree cannot see. Top-level fail-loud evidence **MUST** exclude calls hidden in uninvoked nested function or class bodies, and comparator evidence **MUST** bind the same tuple-component decision and stable-equality prerelease rejection to the canonical comparator return consumed by the support branch; disconnected expressions are not proof. In the canonical tuple-mismatch branch, the comparison-result assignment **MUST** be the first executable statement and `break` **MUST** be exactly the second statement; a reversed or additional statement does not prove an executable decision. The syntax-tree rule proves this canonical structural data flow and fail-loud branch shape; it does not provide full control-flow or symbolic equivalence analysis and does not execute the checker under alternate runtimes.

**BE-M18** single-architecture image note: For the narrow vendor-artifact exception, declare one canonical target-platform build argument (for example `linux/amd64`) and consume that argument in every `FROM --platform=...` stage; do not repeat a literal platform flag that produces a builder constant-platform warning. Retain a runtime architecture assertion in every stage. Package lifecycle policy belongs to the executable install/prune commands, not to a package-manager-foreign or inert manifest field: when install scripts are not required, both cold install and production prune **MUST** run with scripts disabled, and the real compiler/build/runtime launch artifacts **MUST** then be exercised explicitly.

**BE-M18** major external SDK review note: A green typecheck establishes that used signatures still compile, not that a provider-backed data flow still has the same result representation or failure semantics. For a major SDK upgrade, read the vendor’s versioned breaking-change notes, trace every used constructor, query parameter, load/write operation, result adapter and error boundary to its domain consumer, then compare the new published declarations and resolved runtime floor with those uses. Keep one representation adapter where multiple consumers interpret the same SDK cell shape; required-field validation remains a separate authority. A live provider operation cannot be inferred from source-only verification when credentials or access are unavailable; state that limit in the delivery record. Stated enforcement limit: provider release semantics and live responses are external facts with no machine-readable contract in the repository; a single-file syntax-tree rule cannot prove this review or a real provider result. Existing typecheck/build checks cover only their named static surfaces.

For decimal query results, inspect the SDK’s actual row conversion: an arbitrary-precision object is neither a JSON number nor a `{value}` string wrapper. If the API contract requires a number, project an exact decimal string and validate its finite/safe range at the owning read boundary; keep sorting and filters on the numeric expression in the query language. Do not silently coerce an unrecognized result to zero. This relation spans provider schema, query, SDK internals and the API contract, so no single-file syntax-tree check can prove it.

Compiler-major adoption under **BE-N7**: Aligning the declared version is only the first step. For every deployable package, inspect the new compiler’s official defaults, deprecated options and supported API; check every local `tsconfig` and every tool that imports the compiler API. Preserve the established output layout with an explicit source root when a default changes, and verify the emitted entry point and native module specifiers against the actual runtime. Run each package’s own compiler over every governed project and perform a real build. Type checking cannot prove a runtime import will resolve, and an older pull request’s green check cannot prove the current tree. The compiler invocation and build enforce the static and emitted-output portions; published-runtime behavior and third-party compiler API compatibility require source inspection and a focused runtime import because no single-file lint predicate can establish them.

---

## Rule identifiers (normative)

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| **BE-C\*** | This file only | Agent execution contract. |
| **BE-M\*** | Repository/scripts and config/runtime part files | **MUST** (numbered). |
| **BE-N\*** | Prohibitions part file | **MUST NOT** (numbered). |
| GBE\* | Decision-gates part file | Decision gates (normative index). |

Citations must use full IDs (e.g. **BE-M2**, GBE3).

---

## Agent execution contract

| ID | Rule |
|----|------|
| **BE-C1** | This topic is mandatory for in-scope repositories (see Scope). |
| **BE-C3** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **BE-C6** | Apply [shared **C5**](../_meta/agent-contract.md) to build, env and deployment surfaces. |
| **BE-C7** | Security wins on secrets, tokens, and crypto — this file does not weaken SEC- rows (local minimum only). |

Enforcement consequence: merge blocked / must not ship — see **BE-C3** and each row Consequence. Use the enforcement mechanism the adopting project documents; a reference to a check is not evidence that it exists or covers the full rule — record its actual scope and limits.

---

## Technology

| Topic | Rule |
|-------|------|
| TypeScript | `typescript` compiler; strict mode required (**BE-M1**). |
| Env loading | `dotenv` or framework built-in (Next, Vite, Metro) — no hardcoded deployment values (**BE-N2**). |
| Build tools | Vite / Webpack / Metro / tsc — the project documents which in its README (**BE-M7**). |

---

*Version 1.0.0.*
