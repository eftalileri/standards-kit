# Phone verification scenarios (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — training and copy-paste fixtures only. Binding checks are **PHONE-V1**–**PHONE-V6** in [`../../phone/normalization.md`](../../phone/normalization.md).

Library: Implementations **MUST** still satisfy **PHONE-D5** (libphonenumber-js).

---

## Example fixtures (Turkey, conditional and illustrative)

These fixtures assume Turkey (`TR`) is a supported region and the selected parsing policy uses it as the default country. Replace them with examples for the target project’s supported regions; do not infer a global default from this sample.

| Raw input (illustrative) | defaultCountry | Expected canonical (illustrative) |
|--------------------------|----------------|-----------------------------------|
| `05551234567` | `TR` | `+905551234567` |
| `+905551234567` | `TR` (or ignored if intl parse) | `+905551234567` |
| `5551234567` | `TR` | `+905551234567` |

Do not treat this file as exhaustive; verify each supported **PHONE-D4** region by static inspection of the parser configuration or a real-run observation.

---

## Invalid examples (must fail)

| Input | Why |
|-------|-----|
| `""` (required field) | **PHONE-F1** |
| `abc` | **PHONE-F1** |
| Valid digits + unsupported `defaultCountry` | **PHONE-F2** |

---

## Display mismatch (illustrative, non-normative)

- Conditional example: stored `e164` `+491234567890` with a `TR` UI country selector must not be displayed as a Turkish national number; see **PHONE-O4** / **PHONE-V6**. Replace the countries with a pair supported by the adopting project.

---

## Paste (illustrative, non-normative)

- Pasting a full valid national string (with trunk `0` where applicable) must not drop trailing digits before normalizeToE164; see **PHONE-M9**, **PHONE-D8**, **PHONE-N9**.
