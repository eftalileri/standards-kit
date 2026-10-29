# Phone — per-country input format, example and length (normative)

```kit-cover
type: normative
part-of: README.md
binds: PHONE-D7, PHONE-M2, PHONE-M4, PHONE-M6, PHONE-M12 and PHONE-N5 -- per-country input format, example number and permissible length come only from the phone engine's metadata, input is never truncated by a per-country length, and the own-number entry starts on the device region
open-when: shape:frontend-heavy, signal:phone-number, signal:phone-placeholder, signal:phone-mask, signal:country-config
skip-when: signal:no-phone-field, signal:server-side-only
owns: PHONE-D7, PHONE-M2, PHONE-M4, PHONE-M6, PHONE-M12, PHONE-N5
```

Scope: Where per-country UI facts for phone entry (as-you-type grouping, example number, permissible length, initial country of an own-number field) come from. Excluded: Normalization logic — normalization.md; full i18n string tables — N/A.

References: [README.md](README.md); [normalization.md](normalization.md); [placeholder-i18n.md](placeholder-i18n.md); [ui-formatting.md](ui-formatting.md).

---

## Definitions (normative) — **PHONE-D**

Citation of **PHONE-D4**, whose single definition site is [normalization.md](normalization.md) — Supported country: the adopting product's allowlist; every supported country **MUST** be resolvable by the phone engine.

| ID | Definition |
|----|------------|
| **PHONE-D7** | Engine country metadata means the per-country data shipped with the project's documented phone engine that already validates the number: as-you-type formats, national (trunk) prefix, possible lengths and example numbers. It is the only source of per-country phone input facts; the application keeps no per-country format, length, pattern or example table of its own. |

---

## **MUST** (normative) — **PHONE-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-M2** | Every numeric phone placeholder **MUST** be the engine's mobile example number for the selected country, formatted with the engine's national format, returned by the single placeholder accessor (**PH-D3**). **MUST NOT** write example literals in config tables or feature components. Reason: a hand-written example drifts from the engine and users who type it exactly as shown are rejected. | Reject | Review: placeholder props resolve only through the accessor; the accessor reads only engine examples |
| **PHONE-M4** | Phone input **MUST NOT** drop or truncate digits by a per-country maximum (input slice or `maxLength`). A too-long or too-short number stays as typed and is rejected by engine validation as a field error. Reason: cutting a too-long number can produce a *different valid number* — the OTP then goes to a stranger with no error. | Bug | Review: the input formatter returns every typed digit; validity comes only from the engine |
| **PHONE-M6** | As-you-type grouping **MUST** come from the engine's incomplete-number formatter for the selected country (single formatter module), never from hand-written per-country formatters or masks. Reason: the visible grouping, the example and the accepted number then share one source. | Bug | Review: one formatter module, no per-country switch |
| **PHONE-M12** | An own-number entry field (login, registration, own SMS verification) **MUST** start on the device region when it is a supported country (**PHONE-D4**), else the product default; this is initial state only, read once, and **MUST NOT** overwrite a country the user selected or a restored draft value. Reason: most users are in their device region, and a silently wrong initial country makes their correctly typed number invalid. | Bug | Review: the initial value comes from the single default-country function; no effect writes the selection |

---

## **MUST NOT** (normative) — **PHONE-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-N5** | **MUST NOT** inject trunk 0 or national prefix via ad-hoc per-country regex in feature code. Only the engine (formatter, example, normalization to E.164) **MUST** influence 0 display vs E.164. | Reject | No automated check is prescribed for this row; the class is held by the engine authority and review. Stated limits for any check: phone context would have to be resolved from the BINDING NAME, because zero-padding a minute or an invoice counter is the same syntax and an unanchored predicate is born red on legitimate code; prefix STRIPPING is a different verb and a separate class; and a prefix computed at runtime cannot be read from one file's syntax tree. |

---

## Enforcement (normative)

- **PHONE-M2** / **PHONE-M4** / **PHONE-M6** / **PHONE-M12** violation → bug or reject; held by review (**ENA-GV3**).
- **PHONE-N5** violation → reject.
