# Country and currency display names — decision gates (GLOC) and gate validation (**LCN-GV**)

```kit-cover
type: normative
part-of: README.md
binds: GLOC1 to GLOC3 and LCN-GV1 to LCN-GV4 -- the binary routing between Intl-primary, i18n-primary and hybrid label resolution, and the observable scenarios that prove each gate
open-when: shape:frontend-heavy, signal:display-names, signal:country-label, signal:currency-label, signal:intl-displaynames
skip-when: signal:single-locale-documented, signal:no-label-surface
owns: GLOC1, GLOC2, GLOC3, LCN-GV1, LCN-GV2, LCN-GV3, LCN-GV4
```

Scope: The gate index of the locale-names topic and the scenarios that validate it. Every gate routes to rows defined in [country-currency-ui-display.md](country-currency-ui-display.md); no gate adds an obligation of its own.

Document type: Normative part — GLOC1–GLOC3, **LCN-GV1**–**LCN-GV4**.

References: [README.md](README.md); [country-currency-ui-display.md](country-currency-ui-display.md) (**LCN-D\***, **LCN-F\***, **LCN-M\***, **LCN-N\***, **LCN-S1**); [contract-and-enforcement.md](contract-and-enforcement.md) (**LCN-C\***, **LCN-V**-\*).

---

## Decision gates (normative) — GLOC

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GLOC1 | The screen shows a human-readable country or currency name (not only the raw ISO code) for an allowlisted code and the ISO code on that surface satisfies **LCN-M12** (**LCN-D7** provenance only ) . | **LCN-M1**, **LCN-D2**, **LCN-M12**, **LCN-D7** | STOP — if the product is single-locale only, document Scope carve-out in repo SSOT; else implement **LCN-D2**. |
| GLOC2 | **LCN-V-INTL** evidence exists for the supported runtime and platform set (documented capability evidence or a runtime probe). | **LCN-M6**, **LCN-N3** | Use i18n-primary path (**LCN-M7**) for labels; do not claim Intl-primary without evidence. |
| GLOC3 | Every allowlisted code has either Intl resolution on **LCN-V-INTL** targets or a populated i18n key reachable via **LCN-M9** from every shipped **LCN-D1** value (parent bundle counts). | **LCN-M4**, **LCN-M5**, **LCN-M8**, **LCN-M9** | **LCN-F1** — BLOCKER. |

Gate validation: Each gate **MUST** have at least one observable check in **LCN-GV** (below).

---

## Gate validation scenarios (normative) — **LCN-GV**

| ID | Gate | Scenario | Pass criteria |
|----|------|----------|----------------|
| **LCN-GV1** | GLOC1 | Open country selector in two distinct **LCN-D1** values (for example `en`, `tr`). | Labels differ where **LCN-V-INTL** or i18n provides distinct strings; raw ISO code only if **LCN-F1** path is explicitly allowed by product (documented), otherwise fail. |
| **LCN-GV2** | GLOC2 | Check documented **LCN-V-INTL** evidence against the project's minimum supported runtime and platform set. | Record supported or unsupported; unsupported evidence forces the GLOC2 NO branch (**LCN-M7**). |
| **LCN-GV3** | GLOC3 | Add a fake allowlist code in a branch build only — resolver returns empty for both Intl and i18n. | Build fails CI BLOCKER step or issue is impossible because allowlist is generated from keys (**LCN-M5**). |
| **LCN-GV4** | GLOC3 | Set **LCN-D1** to a regional tag whose leaf i18n file is absent but parent exists (for example `en-AU` keys missing, `en` present). | Label resolves via **LCN-M9**; **LCN-F1** not raised for supported codes. |
