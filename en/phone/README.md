# Phone (E.164 SSOT, UI vs storage)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** E.164, normalization, phone mask, placeholder, country config


Purpose: Reusable guidance for telephone-number boundaries: use canonical international form (E.164) for persistence, comparison, and APIs; keep local / national presentation in the UI; and delegate parsing and validation to one maintained phone-number library or documented equivalent.


Non-normative illustrations: [`../_meta/examples/phone-verification-scenarios.md`](../_meta/examples/phone-verification-scenarios.md).

---

## Scope (hub)

- Included: Client and server phone capture, normalization, persistence, API payloads, display formatting, and per-country input facts (format, example, length) taken from the engine metadata.
- Excluded: User-visible country name labels for selectors are not defined in this folder — SSOT is [locale names](../locale-names/README.md) (LCN-\*). SMS / messaging provider APIs beyond requiring E.164 at the boundary — N/A here (one-line reason: transport and vendor contracts live in the adopting project's integration docs). Optional vs required phone fields follow [forms](../forms/forms.md) and [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md); this topic defines what happens when a value is present.


Environment: Applies in every runtime that accepts, stores, compares, or transmits phone numbers; logging of failures **MUST** follow [logging policy](../logging-policy/logging-policy.md) where application logs are emitted.

---

## Reading order (normative)

- [E.164 core](phone-number-standard.md) — PHN definitions, gates and normalization obligations.
- [Core verification and timezone handoff](phone-number-verification-and-binding.md) — **PHN-GV**, **PHN-V** and **PHN-X1**.

1. [normalization.md](normalization.md) — Definitions (**PHONE-D\***), failure paths (**PHONE-F\***), **MUST** / **MUST NOT**, decision gates (GPHONE\*), verification matrix, enforcement summary.
2. [country-config.md](country-config.md) — engine metadata as the only per-country source (**PHONE-D7**), placeholders (**PHONE-M2**), no length truncation (**PHONE-M4**), own-number initial country (**PHONE-M12**), forbidden ad-hoc national zero injection.
3. [placeholder-i18n.md](placeholder-i18n.md) — Placeholder accessor (**PH-M1**), i18n numeric ban (**PH-N2**), GPH1, link to normalizeToE164 (**PH-M2** / **PHONE-M1**).
4. [ui-formatting.md](ui-formatting.md) — Presentation layer (**PHONE-O\***), masks, display-from-E.164, **PHONE-N1** persistence ban.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **PHONE-C*** | Agent execution contract |
| **PHONE-M*** | **MUST** |
| **PHONE-N*** | **MUST NOT** |
| **PHONE-F*** | Failure path |
| **PHONE-D*** | Definition |
| **PHONE-O*** | Output / presentation |
| GPHONE* | Decision gate |
| PH-* | Placeholder and i18n hygiene ([placeholder-i18n.md](placeholder-i18n.md)) |
| GPH* | Placeholder routing (GPH1 in [placeholder-i18n.md](placeholder-i18n.md)) |
| **PHONE-V*** | Verification matrix ([normalization.md](normalization.md)) |

Full M / N / F / D / O / GPHONE / **PHONE-V** / PH- tables live in [normalization.md](normalization.md), [placeholder-i18n.md](placeholder-i18n.md), and the other part files above.

---

## Cross-links

- [Phone number (E.164 core)](phone-number-standard.md) — PHN-\* strict boundary : parse, validate, E.164 canonical, calling-country from prefix ; no UI masks here.
- [Timezone](../timezone/README.md) — TZ-\* uses calling-country from PHN-\* only where **TZ-D4** and **TZ-D5** in that standard apply .
- [Locale names](../locale-names/README.md) — LCN-\* display names ; not E.164 or timezone in that resolver .
- [Forms](../forms/forms.md) — field optional/required, Zod, submission.
- [SSOT readiness](../ssot-readiness/ssot-readiness-rules.md) — M6 phone minimum; detail here.
- [Error policy](../error-policy/error-policy.md) — semantic errors for invalid input at API boundary.
- [Error handling](../error-handling/error-handling.md) — client-visible failure behavior.
- [Monorepo](../monorepo/README.md) — placement of the shared phone-normalization authority across packages.
- Placeholder and i18n SSOT: [placeholder-i18n.md](placeholder-i18n.md).

---

## Enforcement (normative summary)

- **PHONE-M** violation → bug (must fix); must not ship persistence or APIs that skip **PHONE-M1** / **PHONE-M2** / **PHONE-M3** / **PHONE-M7** / **PHONE-M8** / **PHONE-M9**.
- **PHONE-N** violation → per-row Consequence in [normalization.md](normalization.md) and [ui-formatting.md](ui-formatting.md) (reject or bug).
- E.164 violation at rest or on the wire (national format persisted or sent) → critical defect — STOP release; remediate data or gate (**PHONE-F3**).
- **PHONE-F\*** outcomes are closed — no silent fallback to a guessed number.

---

## Agent execution contract

The contract rows **PHONE-C1**–**PHONE-C5** are defined in [normalization.md](normalization.md).
