# Country and currency display names — contract, verification and enforcement

```kit-cover
type: normative
part-of: README.md
binds: LCN-C1 to LCN-C3 plus the LCN-V verification matrix, the enforcement layer, violation classification, the traceability table, the skill boundary and the false-completeness guard
open-when: shape:frontend-heavy, signal:display-names, signal:label-enforcement, signal:intl-support-evidence
skip-when: signal:single-locale-documented, signal:no-label-surface
owns: LCN-C1, LCN-C2, LCN-C3
```

Scope: How the locale-names topic binds an agent, how each rule is proven, how a violation is classified, where each rule is traced in a consuming repository, and what "100% complete" requires.

Document type: Normative part — **LCN-C1**–**LCN-C3**, **LCN-V**-\*.

References: [README.md](README.md); [country-currency-ui-display.md](country-currency-ui-display.md) (**LCN-D\***, **LCN-F\***, **LCN-M\***, **LCN-N\***, **LCN-S1**); [decision-gates.md](decision-gates.md) (GLOC\*, **LCN-GV\***).

Citation form: the first column of the enforcement and traceability tables below cites rules defined in [country-currency-ui-display.md](country-currency-ui-display.md) and [decision-gates.md](decision-gates.md); per copy policy P1 those citations are links, not restatements.

---

## Verification matrix (normative) — **LCN-V**

| ID | Check | Mode |
|----|-------|------|
| **LCN-V-INTL** | Documented proof that `Intl.DisplayNames` supports `region` and `currency` for minimum engine and OS versions or explicit NO with **LCN-M7** | Static doc + CI optional probe |
| **LCN-V-SSOT** | Every selector references **LCN-D2** only | Static |
| **LCN-V-KEYS** | All allowlisted codes have i18n leaves or documented Intl-only exemption | CI script or manual release gate |
| **LCN-V-LOCALE-CHAIN** | Documented **LCN-D6** covers every shipped **LCN-D1** prefix strategy (regional → parent) | Static doc + real-run observation |
| **LCN-V-DOMAIN-CODE** | **LCN-M12** : selectors receive codes from documented **LCN-D7** sources only | Static import / props audit |

---

## Enforcement layer (normative)

Each **LCN-M** / **LCN-N** row **MUST** be at least one of: statically checkable, runtime observable, or CI-validated. Each **LCN-S** row SHOULD map to Verify (recommended, not required for SHOULD).

| Rule ID | Static inspection | Runtime observation | CI validation (example) |
|---------|-------------------|---------------------|-------------------------|
| [**LCN-M1**](country-currency-ui-display.md) | Import graph from selectors to **LCN-D2** | Switch language; labels update | Optional: forbidden import paths |
| **LCN-N1**, **LCN-N2**, **LCN-N5**, **LCN-N6**, **LCN-N7**, **LCN-M12** | `rg` / ESLint no-restricted-syntax for known map names ; import denylist for TZ / phone engines in **LCN-D2** ; props must trace to **LCN-D7** | — | BLOCKER job on match |
| [**LCN-M6**](country-currency-ui-display.md) | Doc file exists | — | Warning or fail if missing at tag |
| [**LCN-M9**](country-currency-ui-display.md) | **LCN-D6** declaration and Intl/i18n locale-array inspection | Regional tag resolves through its documented parent chain | Static chain inspection |
| [**LCN-M11**](country-currency-ui-display.md) | Server-render locale propagation audit | Hydrated labels match stabilized **LCN-D1**, or the server already used that locale | Static inspection + real rendered output |
| [**LCN-S1**](country-currency-ui-display.md) | **LCN-D2** uses memo/cache pattern | List scroll CPU | Perf budget or WARNING |
| **LCN-GV*** | — | Manual real-run observation | Required for release candidate per project policy |

---

## Violation handling (normative)

| Class | Meaning | Required action |
|-------|---------|-----------------|
| BLOCKER | Violates **LCN-F1**, **LCN-N1**, **LCN-N2**, **LCN-N3**, **LCN-N4**, **LCN-N5**, **LCN-N6**, **LCN-N7**, **LCN-M9**, **LCN-M12**, or ships without **LCN-M1** | Must not ship; CI **MUST** fail when the project wires this topic to CI. |
| WARNING | **LCN-M6** doc stale, **LCN-S1** perf hygiene missed, or log shape drift from [logging policy](../logging-policy/logging-policy.md) | Fix before next release; does not override BLOCKER |
| Bug | **LCN-M11** SSR / hydration mismatch (wrong language persists) | Reject merge for SSR surfaces until fixed |

Detection flow: Owner **MUST** define who runs **LCN-V**-\* checks (role or bot) and where results are posted (PR comment, dashboard). Unassigned detection → migration incomplete for operational SSOT.

---

## Rule traceability (normative)

Each SHOULD (and BLOCKER rows) SHOULD map at least one of: code location, lint rule.

| Rule ID | Trace (fill in consuming repo) |
|---------|----------------------------------|
| [**LCN-M1**](country-currency-ui-display.md) | Path to the single display-name module or hook: `________`. Enforcement mechanism, if any, and its scope: `________`. |
| **LCN-M12**, **LCN-D7** | Selector props / store fields: `________` |
| [**LCN-M9**](country-currency-ui-display.md) | Doc + module: `________` |
| [**LCN-M11**](country-currency-ui-display.md) | SSR entry + client root: `________` |
| [**LCN-S1**](country-currency-ui-display.md) | Memo/cache site: `________` |
| [**LCN-N2**](country-currency-ui-display.md) | Lint rule id: `________` or script: `________` |
| **LCN-N5**, **LCN-N6**, **LCN-N7** | **LCN-D2** module path + import audit script: `________` |
| [GLOC2](decision-gates.md) | Verification artifact: `________` or doc: `________` |

---

## Skill boundary (normative)

Skills **MUST NOT** restate LCN-\* obligations. Skills MAY sequence steps that cite GLOC\* and **LCN-D2** paths only. Skill misuse (new requirements in a Skill) → invalid until Standard updated or Skill trimmed.

---

## False completeness guard (normative)

Marking this topic 100% in [`standards-completion-status.md`](../_meta/standards-completion-status.md) requires a filled Rule traceability table for **LCN-M1**, **LCN-M9**, **LCN-N2**, GLOC2 (and **LCN-M11** when SSR applies) in the consuming repository (not in this kit alone).

---

## Agent execution contract — **LCN-C**

| ID | Rule |
|----|------|
| **LCN-C1** | Any UI that maps ISO country or currency codes to end-user strings **MUST** comply with **LCN-M1** or a documented Scope exclusion approved in the product SSOT index. |
| **LCN-C2** | [Shared agent contract C2](../_meta/agent-contract.md); compliance is only from LCN-\* / GLOC\* rows here; deviation → STOP. |
| **LCN-C3** | Technical fallback means **LCN-D5** only; never contradicts [error policy](../error-policy/error-model-registry-and-boundary.md) M6-class minima (no defaulting to fake data) for money or identity fields. |
