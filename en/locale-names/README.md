# Locale names (country and currency UI labels)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** country name, currency, Intl.DisplayNames, i18n, locale


Purpose: Normative single source of truth for user-visible country and currency names derived from ISO 3166-1 alpha-2 and ISO 4217 codes in the active interface locale. This prevents selectors from depending on labels authored in one fixed language or maintaining a parallel display-name map.

Normative part files: [`country-currency-ui-display.md`](country-currency-ui-display.md), [`decision-gates.md`](decision-gates.md), [`contract-and-enforcement.md`](contract-and-enforcement.md).

---

## Scope (hub)

- Included: Register, onboarding, settings, and any UI that shows human-readable country or currency labels tied to ISO codes; hybrid Intl.DisplayNames + i18n override; **LCN-D6** / **LCN-M9** locale chains; optional **LCN-S1** memoization for lists; failure and logging minima when resolution fails.
- Excluded: E.164 normalization, dial codes, masks — [phone number](../phone/README.md) (PHN-\*); broader UI pipeline — [phone](../phone/README.md) (PHONE-\*). IANA timezone resolution and UTC conversion — [timezone](../timezone/README.md) (TZ-\*). Backend-only currency codes with no user-visible label in the product — N/A (one-line reason: no display obligation). Legal PDFs fixed to one jurisdiction locale — N/A unless the same component renders in-app selectors (then Included).


Environment: Applies — React Native / Expo / web JS engine Intl support varies; CI **MUST** document how **LCN-V-INTL** is satisfied.

---

## Reading order (normative)

1. [country-currency-ui-display.md](country-currency-ui-display.md) — Definitions (**LCN-D\***), **MUST** / **MUST NOT** (**LCN-M\*** / **LCN-N\***), SHOULD (**LCN-S\***), failure paths (**LCN-F\***).
1b. [decision-gates.md](decision-gates.md) — decision gates (GLOC\*) and gate validation scenarios (**LCN-GV\***).
1c. [contract-and-enforcement.md](contract-and-enforcement.md) — agent contract (**LCN-C\***), verification matrix (**LCN-V**-\*), enforcement / traceability / violation handling, skill boundary, false-completeness guard.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **LCN-C*** | Agent execution contract |
| **LCN-M*** | **MUST** |
| **LCN-N*** | **MUST NOT** |
| **LCN-F*** | Failure path |
| **LCN-D*** | Definition |
| GLOC* | Decision gate |
| **LCN-V*** | Verification / matrix |
| **LCN-GV*** | Gate validation scenario |
| **LCN-S*** | SHOULD (performance / hygiene; non-BLOCKER default) |

Full tables live in [country-currency-ui-display.md](country-currency-ui-display.md).

---

## Related standards

- [Phone number (E.164 core)](../phone/README.md) — PHN-\* parsing, validation, ISO 3166-1 alpha-2 from E.164; not display name labels.
- [Phone (UI hub)](../phone/README.md) — PHONE-\* masks, placeholders, national presentation; not LCN-\* Intl labels.
- [Timezone](../timezone/README.md) — TZ-\* IANA resolution and UTC conversion; not LCN-\* display names.

## Cross-links

- [Forms](../forms/forms.md) — selector accessibility and field wiring.
- [Error policy](../error-policy/error-policy.md) — semantic errors at API boundary where relevant.
- [Error handling](../error-handling/error-handling.md) — client-visible behavior.
- [Logging policy](../logging-policy/logging-policy.md) — structured logs for missing resolution, following the consuming project's logging contract.

---

## Enforcement (normative summary)

- **LCN-N1** / **LCN-N2** / **LCN-F1** / missing **LCN-M9** → BLOCKER (must not ship). Treat as reject in CI when the project defines a BLOCKER gate for this topic.
- **LCN-M11** violation on SSR surfaces → bug / reject until hydration or server locale contract is fixed.
- **LCN-S1** miss → WARNING (perf / list jank), not a default BLOCKER.
- **LCN-M** violations → bug (must fix); merge policy is reject until SSOT path is restored.
- Skill misuse (Skill states a label rule not present here) → invalid Skill — STOP and fix Skill or Standard.

Detail: [country-currency-ui-display.md](country-currency-ui-display.md) § Enforcement layer, § Violation handling, § Rule traceability.
