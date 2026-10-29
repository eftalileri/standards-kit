# Phone — UI formatting and display (normative)

```kit-cover
type: normative
part-of: README.md
binds: PHONE-D9, PHONE-O1 to PHONE-O5, PHONE-M8, PHONE-M9, PHONE-N7 and PHONE-N8 -- display-only transforms derived from the stored E.164 value, and the ban on persisting any presentation form
open-when: shape:frontend-heavy, signal:phone-number, signal:phone-display, signal:phone-mask
skip-when: signal:no-phone-field, signal:server-side-only
owns: PHONE-D9, PHONE-O1, PHONE-O2, PHONE-O3, PHONE-O4, PHONE-O5, PHONE-M8, PHONE-M9, PHONE-N7, PHONE-N8
```

Scope: Presentation only: placeholders, masks, as-you-type formatters, and read-only display derived from **PHONE-D1** in [normalization.md](normalization.md). Excluded: Persistence and API wire format — normalization.md only.

References: [README.md](README.md); [normalization.md](normalization.md); [country-config.md](country-config.md); [placeholder-i18n.md](placeholder-i18n.md); [forms](../forms/forms.md).

---

## Definitions (normative) — **PHONE-D**

| ID | Definition |
|----|------------|
| **PHONE-D9** | Authorized display formatter means a pure function (or documented stateless pipeline) mapping `(e164: PHONE-D1, effectiveDisplayCountry: ISO 3166-1 alpha-2)` to a UI-only string. It **MUST** use the phone-number library's parse of `e164` as the source of national / international digit layout, except when **PHONE-O4** branch (b) (show canonical `E.164`) applies. |

---

## Output / presentation (normative) — **PHONE-O**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-O1** | Display of a stored phone **MUST** derive from **PHONE-D1** via an authorized display formatter (**PHONE-D9**) that may insert trunk / spacing consistent with the engine metadata (**PHONE-D7**) — read-only view; **MUST NOT** write that string back as canonical storage. | Bug | Review that edit and submit flows re-normalize from raw input rather than from the display string. |
| **PHONE-O2** | Placeholder and mask example strings **MUST** come only from the engine example via the single placeholder accessor per **PHONE-M2** in [country-config.md](country-config.md) and **PH-M1** in [placeholder-i18n.md](placeholder-i18n.md). Locale files **MUST NOT** carry numeric phone samples per **PH-N2** there. | Reject | Static: no string literal placeholders for national digits in feature screens; the **PH-V1** scan matches |
| **PHONE-O3** | The national input **MUST NOT** carry a per-country length cap (see **PHONE-M4** in [country-config.md](country-config.md)); every digit including the trunk prefix reaches validation. | Bug | Review: no `maxLength`/slice on the phone input; the engine example typed as shown is accepted |
| **PHONE-O5** | Every country list (the full country picker of every phone field and the list of countries a number matches) **MUST** use one ordering rule implemented once: the owning tenant's stored country first (in the full picker as its own group for that country, absent where no tenant context exists), then the remaining countries alphabetical by their localized name; rows of the same meaning look the same in both lists (flag, localized name, and in the match list the number as it would be saved there; candidate rows are mobile-only and carry no line-type label). **MUST NOT** sort by code, by a hand-written list or by the device region. | Bug | Review: both lists call the one ordering function; picker shows the tenant-country group only with a tenant context |
| **PHONE-O4** | When stored **PHONE-D1** implies region A (from libphonenumber parse) and the UI country selector for that field shows region B ≠ A, the visible string **MUST** either (a) format using the region derived from `e164` only (ignore B for national layout), or (b) show international canonical `format('E.164')` (same digits as stored). **MUST NOT** apply B's national mask to A's number — **PHONE-F4**. | Bug | **PHONE-V6** in [normalization.md](normalization.md) |

---

## **MUST** (normative) — UI layer

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-M8** | For fixed `e164` (**PHONE-D1**) and fixed `effectiveDisplayCountry` (after **PHONE-O4** resolution — the region actually used for layout), the authorized display formatter **MUST** return identical output (no randomness; no time / locale dependence for digit layout). | Bug | Static: formatter depends only on fixed E.164 and resolved display country, with no clock/random/locale dependency; inspect its real output. |
| **PHONE-M9** | Paste and autofill paths **MUST** preserve all national significant digits that libphonenumber would accept (including trunk 0); **MUST NOT** truncate on paste because of `maxLength` or mask slot count (**PHONE-M4**, **PHONE-O3**). The normalize step **MUST** receive the full pasted string after trim (**PHONE-D8**). | Bug | Trace paste/autofill to normalization: the complete trimmed string reaches the engine and no mask/length branch truncates significant digits. |

---

## **MUST NOT** (normative) — UI layer

**PHONE-N1** (persist/API E.164 only) is defined once in [normalization.md](normalization.md); UI submit paths **MUST** satisfy it.

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-N7** | **MUST NOT** use display formatter output as the source for OTP or SMS dispatch — dispatcher input **MUST** be **PHONE-D1** after **PHONE-M1**. | Bug | Trace from submit handler to SMS: variable is E.164 |
| **PHONE-N8** | **MUST NOT** ship a custom national display that changes digit order, drops or adds significant digits, or contradicts libphonenumber-js `formatNational` (or `formatInternational` when that is the chosen **PHONE-O4** branch) for the same parsed `e164` and the same `effectiveDisplayCountry`. Allowed: whitespace / separator decorators only (same digit sequence as the library output for that mode). | Reject | Inspect the formatter and compare real custom output with the library for the same parsed number, region and selected mode. |

---

## Technology note

- **PHONE-D9** **MUST** call libphonenumber-js for national / international layout (`formatNational`, `formatInternational`, `format('E.164')`); custom code is limited to the **PHONE-N8** allowlist (decorators only). Storage never uses these APIs ([normalization.md](normalization.md) **PHONE-M1**).

---

## Enforcement (normative)

- **PHONE-O** / **PHONE-M8** / **PHONE-M9** / **PHONE-N1** / **PHONE-N7** / **PHONE-N8** violation → bug or reject per row Consequence.
- **PHONE-F4** (wrong-country display) → bug; fix via **PHONE-O4**.
