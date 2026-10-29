# Phone — placeholder and i18n hygiene (normative)

```kit-cover
type: normative
part-of: README.md
binds: the PH-* obligation set -- the single placeholder accessor, the ban on national numeric examples inside locale message files, and the GPH1 routing gate
open-when: shape:frontend-heavy, signal:phone-number, signal:phone-placeholder, signal:locale-sourced-label
skip-when: signal:no-phone-field, signal:server-side-only
owns: PH-D1, PH-D2, PH-D3, PH-F1, PH-F2, GPH1, PH-M1, PH-M2, PH-M3, PH-N1, PH-N2, PH-V1, PH-V2, PH-V3, PH-V4, PH-V5, PH-C1, PH-C2, PH-C3
```

Scope: Where national numeric phone examples may live; how input placeholders are resolved; what locale message files must not contain. Canonical E.164 and persistence rules are in [normalization.md](normalization.md). Per-country input facts are in [country-config.md](country-config.md).

Document role: Normative rule engine for presentation routing and i18n constraints. Together with [normalization.md](normalization.md) (data SSOT) and [country-config.md](country-config.md) (engine metadata as the per-country source), this file closes agent escape paths for hardcoded placeholders and polluted locales.

References: [README.md](README.md); [normalization.md](normalization.md); [country-config.md](country-config.md); [ui-formatting.md](ui-formatting.md); [forms](../forms/forms.md).

Environment: Applies to locale bundles and phone-entry UIs in every shipped runtime. Enforce **PH-N2** wherever the build system supports locale validation.


---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **PH-C*** | Agent execution contract (this file) |
| **PH-M*** | **MUST** |
| **PH-N*** | **MUST NOT** |
| **PH-F*** | Failure |
| **PH-D*** | Definition |
| GPH* | Decision gate |

Coexistence with PHONE-\*: PHONE-\* rows in this folder remain binding. PH-\* rows specialize placeholder and i18n; on conflict STOP and fix one standard — no weaker reading ([README.md](README.md) **PHONE-C3**).

---

## Definitions (normative) — **PH-D**

| ID | Definition |
|----|------------|
| **PH-D1** | A numeric phone example in locale content is a national phone-number sample embedded in a translation value for a phone placeholder, example, mask hint, or format instruction. Keep such digits in product-owned country configuration rather than locale copy. The adopting product documents how its localization catalog identifies these keys; this restriction applies to every shipped locale. |
| **PH-D2** | A locale message file is any checked-in translation bundle consumed by the runtime localization system. The adopting product documents which files are scanned. |
| **PH-D3** | The phone-placeholder accessor is the single exported function (or documented alias) that returns the engine's mobile example number for a selected country in national format (**PHONE-M2**; no other source). Its module location is defined by the adopting system's architecture. |

---

## Failure paths (normative) — **PH-F**

| ID | Condition | Outcome |
|----|-----------|---------|
| **PH-F1** | A supported region (**PHONE-D4** in [normalization.md](normalization.md)) has no engine example number when the UI shows a phone placeholder. | STOP — configuration defect; must not ship until the engine resolves the region or the region is removed from the allowlist (same class as data SSOT gap). |
| **PH-F2** | The region passed to the phone-placeholder accessor is invalid or unsupported. | ERROR — same input class as **PHONE-F2** in [normalization.md](normalization.md); no silent fallback digits. |

---

## Decision gates (normative) — GPH

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GPH1 | Either a user-selected supported region is available, or the product defines one documented default region for that field and uses it for both the placeholder and canonical normalizer. | **PH-M3**, **PHONE-D3**, **PHONE-D4** ([normalization.md](normalization.md)) | **PH-F2**, or apply the documented default per **PH-M3** only |

---

## **MUST** (normative) — **PH-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PH-M1** | All phone input placeholder strings shown in UI **MUST** be sourced via the single placeholder accessor (**PH-D3**) or the single documented re-export of it. | Reject | Static: feature screens contain no string literal national phone examples for placeholder props |
| **PH-M2** | Every non-empty submission from a field that uses **PH-M1** **MUST** pass through the canonical phone normalizer (**PHONE-M1**, **PHONE-D5**) before persistence, API transmission, or message dispatch. | Bug — must not ship | Trace submission to the shared normalization authority. |
| **PH-M3** | When no country is selected, placeholder and parse `defaultCountry` **MUST** use the same documented default region for that screen or tenant policy (must be in allowlist). | Bug | Code review: default ISO matches GPHONE2 path |

**PH-F1**/**PH-F2** default-selection clarification: A documented default for an omitted country argument does not authorize replacing a provided invalid or unsupported country, nor replacing a missing or empty supported-country example. Reject non-string runtime input before property-key coercion, then resolve membership against the product allowlist before reading the example; return only that country's configuration value. Missing configuration and unusable examples stop through the configuration-defect path; unsupported provided input takes the existing unsupported-country error class. Enforcement limit: this semantic remains review-owned; a type alone cannot reject malformed runtime input, and the single accessor is the only example-producing surface.

**PH-M3** shared-default clarification: Where several consumers use the same documented product-wide default region, its value has one shared authority; UI compatibility names re-export that value rather than redefine it. This does not replace a screen's genuine selected-country authority or authorize a default on a write path that forbids one. The direct shared alias is the structural prevention of duplicated defaults.

---

## **MUST NOT** (normative) — **PH-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PH-N1** | **MUST NOT** hardcode national digit placeholder values anywhere (including config tables, components, Storybook, or bundled UI); the engine example via **PH-D3** is the only source. Test fixtures that mount production inputs with literal national placeholders violate **PH-M1**. | Reject | Search: national digit placeholders appear only through the accessor |
| **PH-N2** | **MUST NOT** ship **PH-D1** violations in **PH-D2** files. | Invalid build / reject | Review or automate a scan of the product's documented locale-message files and phone-related keys. |

---

## Relationship to **PHONE-M2** / **PHONE-O2**

**PHONE-M2** and **PHONE-O2** in [country-config.md](country-config.md) and [ui-formatting.md](ui-formatting.md) rest on the same SSOT as **PH-M1** / **PH-N1**. Implementations satisfy all three or none — partial compliance is invalid.

---

## Verification (normative)

| ID | Check | Pass criterion |
|----|-------|----------------|
| **PH-V1** | Locale review or scan (**PH-D2**) | No locale message contains a phone-number example under a phone-related key. |
| **PH-V2** | UI audit | Placeholders resolve only through the product's phone-placeholder accessor (**PH-M1**) |
| **PH-V3** | Any supported region selected | Placeholder equals the engine's mobile example in national format, and typing it exactly as shown is accepted and normalizes to that example's E.164 ([country-config.md](country-config.md) **PHONE-M2**) |
| **PH-V4** | Trunk-prefix regions (e.g. TR `0`, RU `8`, US `1`) | The example and the same number without the trunk prefix both normalize to the same E.164 |
| **PH-V5** | Submit path with non-empty input | Canonical normalizer invoked (**PH-M2**) before transmission or persistence |

---

## Enforcement (normative)

| Violation | Consequence |
|-----------|-------------|
| **PH-M** | Bug — must fix; must not ship if **PH-M2** is bypassed |
| **PH-N** | Reject — merge blocked until fixed |
| **PH-N2** (**PH-D1** in i18n) | Invalid build when CI enforces; otherwise same as **PH-N** |
| **PH-F1** | STOP — do not release with missing config for allowlisted region |
| **PH-F2** | ERROR path — no fabricated placeholder digits |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **PH-C1** | Placeholder and i18n obligations for phone fields are fully expressed in PH-\* and PHONE-\* rows cited here; examples under `_meta/examples/` are non-normative. |
| **PH-C2** | Determine **PH-D1** compliance from the product's documented phone-related localization keys and its chosen validation/review method. Avoid silently exempting a phone-number example. |
| **PH-C3** | Deviation from **PH-M** / **PH-N** / **PH-F** uses consequences in Enforcement above; no silent fallback placeholder. |

---

## Non-normative summary (truth vs display)

| Layer | Question answered |
|-------|-------------------|
| [normalization.md](normalization.md) | What is the phone for storage and APIs? (E.164 only) |
| This file | What may the user see as hint/placeholder digits, and where may they not live? (engine example via the accessor; not i18n digits) |

Flow: Raw UI input (may include trunk 0) → placeholder from the engine example (**PH-M1**) → the canonical normalizer (**PH-M2** / **PHONE-M1**) → storage E.164 → read-only display per [ui-formatting.md](ui-formatting.md).
