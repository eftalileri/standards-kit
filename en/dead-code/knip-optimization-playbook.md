# Knip optimization playbook — by finding category (normative part)

```kit-cover
type: normative
part-of: README.md
binds: the category-based resolution for each knip finding class, applied at the config or structural layer
open-when: signal:unused-report, signal:knip-tuning
skip-when: signal:no-deletion
owns: none
```

**Scope:** The finding-category playbook for [knip-usage.md](knip-usage.md) — how each class of whole-graph analyzer finding is resolved at the configuration or structural layer, and the convergence check that tells you the configuration is done. Defines no rule row; every obligation it cites lives in [dead-code-rules.md](dead-code-rules.md).

Document type: Normative part file under [README](README.md).

References: [README.md](README.md); [knip-usage.md](knip-usage.md); [dead-code.md](dead-code.md); [dead-code-rules.md](dead-code-rules.md) (**DCD-M3**, **DCD-M6**, **DCD-M8**).

---

## 8. Optimization playbook — by finding category

**Framing (read first):** Optimization is **category-based and applied at the configuration or structural layer** — generic and repeatable, **not** bespoke per-function edits. Classify each finding and apply the category's standard resolution. Adapt examples to the adopting project's language, tool, package layout, and entry points.

| # | Finding pattern | Tool blind-spot or real issue? | Standard resolution (config / structural — generic) |
|---|-----------------|--------------------------------|------------------------------------------------------|
| 1 | "N unused files" where N ≈ whole repo | Blind-spot (no entry graph) | Config: define `workspaces` + `entry` (app root, configs, scripts) in the knip config. |
| 1b | "0 unused files" that looks too clean | Blind-spot (class outside the declared set) | Measure, don't read: `knip --trace-file <path>` for one file of each extension/directory/package class; "not found in module graph" means unscanned, not clean ([**DCD-M4**](dead-code-rules.md)). |
| 2 | "Remove redundant entry pattern" hint | Blind-spot (plugin already covers it) | Config: delete that `entry` line — a knip plugin (package `main`, Expo, ESLint, Metro) auto-detects it. |
| 3 | Build-config plugin flagged unused (`babel-*` in `.cjs`) | Blind-spot (`.cjs` plugin names not parsed) | Config: `ignoreDependencies` with reason. |
| 4 | Dep used in one workspace but declared in another's `package.json` | Real (misplaced dependency) | Structural: move the dep to the consuming workspace's `package.json` (or `ignoreDependencies` if intentional). |
| 5 | Unlisted / phantom dep (imported in source, not in `package.json`) | Real (relying on transitive) | Structural: add it to `dependencies` in the right `package.json`. |
| 6 | File reached only by dynamic/string registration (navigator names, DI, reflection) flagged unused | Blind-spot (static graph can't follow) | Config: add the file/pattern to `entry` (or the registry file as entry). Never delete. |
| 7 | Dead barrel `index.ts` (0 importers) + files reachable only through it | Real (orphan re-export chain) | Structural: delete the barrel after confirming 0 importers; verify the leaf files independently. |
| 8 | Orphan leaf file with no source references | Real (dead code) | **Delete** only after [DCD-M3](dead-code-rules.md) verification and the project's required checks. |
| 9 | "Live-looking" dep imported only by dead files (cascade) | Real (ordering) | Resolves automatically once the dead files are deleted — do not `ignore` it. |
| 10 | Dependency used only by artifacts intentionally removed under an applicable project policy | Real (conditional) | **Remove** after verifying no remaining test, build, lint, configuration, or runtime consumer needs it; follow the project's dependency and artifact policies. |
| 11 | High `unused exports` / `exported types` | Low signal (barrels + dead-file exports) | Don't chase per-export; the count drops after dead files are removed. Re-measure then. |
| 12 | `Configuration hints` keep appearing after tuning | Mixed | Redundant-entry/ignore hints → remove them (rows 2). "N unused files" hint when N is genuinely dead → leave it; it is the finding, not a config error. |
| 13 | **Wire surface** (route handler, response-field projection, contract type) with no source callers | **Undecidable from the graph** — the analyzer sees this checkout, not every released client | **Out-of-band:** run [DCD-M8](dead-code-rules.md) — identify the oldest supported consumer release and scan **its** source. Still calling → keep as a thin **delegating alias** (canonical authority + wire translation only). Not calling / unknown → keep as uncertain ([DCD-M6](dead-code-rules.md)). |

Convergence check (when a separately scoped knip run is performed): a re-run should show (a) zero "redundant entry/ignore" hints, (b) the dependency list reduced to genuine dead/real findings, and (c) stable file/export counts across runs. At that point the config is optimal; remaining numbers are real candidates for the verify-before-delete workflow ([knip-usage.md](knip-usage.md) §5).

Part of: [Dead code README](README.md).
