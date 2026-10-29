# Timezone resolution — verification, enforcement and cross-standard binding

```kit-cover
type: normative
part-of: README.md
binds: the TZ-V verification matrix, the enforcement and violation-handling layer, the traceability table, TZ-X1 (the provenance contract with the phone-number standard) and the skill boundary
open-when: shape:backend-heavy, signal:timezone-phone, signal:timezone-resolution, signal:timezone-enforcement, signal:phone-timezone-handoff
skip-when: signal:no-timezone-surface, signal:instant-only
owns: TZ-X1
```

Scope: How each timezone rule is proven, how a violation is classified, where each rule is traced in a consuming repository, the single cross-standard row that binds the phone-number handoff, and the skill boundary.

Document type: Normative part — **TZ-X1**.

References: [README.md](README.md); [timezone-resolution-standard.md](timezone-resolution-standard.md) (**TZ-C\***, **TZ-D\***, **TZ-F\***); [timezone-decision-gates.md](timezone-decision-gates.md) (GTZ\*, **TZ-GV\***); [timezone-must.md](timezone-must.md) (**TZ-M\***); [timezone-must-not.md](timezone-must-not.md) (**TZ-N\***); [phone number](../phone/README.md) (**PHN-M3**).

Citation form: the first column of the enforcement and traceability tables below cites rules defined in the other part files; per copy policy P1 those citations are links, not restatements.

---

## Verification matrix (normative) — **TZ-V**

| ID | Check | Mode |
|----|-------|------|
| **TZ-V-ORDER** | **TZ-M1** order enforced in resolver branch inspection | Static inspection |
| **TZ-V-SSOT** | Single **TZ-D6** import graph | Static |
| **TZ-V-DST** | DST boundary conversion/rejection branches | Static inspection |
| **TZ-V-NO-NAIVE** | No unapproved `setUTC*` | Static rg |
| **TZ-V-PHN-HANDOFF** | **TZ-M7** : no **PHN-D2** in timezone package ; DTO carries documented `callingCountry` (or alias ) | Static import graph + types |
| **TZ-V-CLOCK** | **TZ-M8** : single time module on resolver tree | Static `rg` |
| **TZ-V-MAP-OWNER** | **TZ-M9** / **TZ-N7** : architecture doc + single map SSOT | Static |
| **TZ-V-OVERRIDE-LOG** | **TZ-M10** : divergent D2 / D3 log branches | Static inspection |
| **TZ-V-CALENDAR-DAY-DISPLAY** | **TZ-M11**/TZ-N8: one registered formatter preserves date-only components independently of device timezone | Static import graph + runtime verification |
| **TZ-V-MULTI-ZONE-INSTANT** | **TZ-M12**: one captured current instant fans out through **TZ-D11** with each fact owner's timezone | Static call-graph review + boundary-minute runtime verification |

---

## Enforcement layer (normative)

| Rule ID | Static inspection | Runtime observation | CI validation |
|---------|-------------------|---------------------|---------------|
| [**TZ-M1**](timezone-must.md) | Read resolver order | — | Static: verify order in resolver module |
| [**TZ-M2**](timezone-must.md) | Import graph to **TZ-D6** | Wrong instant in UI | Build check |
| [**TZ-N1**](timezone-must-not.md) | rg audit | — | Required on phone / scheduling packages when wired |
| [**TZ-F1**](timezone-resolution-standard.md) | — | Error response shape | Static: response shape review |
| **TZ-M7**, **TZ-N6** | DTO / OpenAPI | — | Static: DTO field audit |
| [**TZ-M8**](timezone-must.md) | rg on topic tree | Deterministic clock source | Static: single time module |
| **TZ-M9**, **TZ-N7** | Architecture + import graph | — | Static duplicate map check |
| [**TZ-M10**](timezone-must.md) | — | Log sink assert | **TZ-GV5** |
| **TZ-M11**, **TZ-N8** | Calendar-day authority/import graph; no implicit-zone formatter on its consumer path | Same calendar day under opposite device timezones | **TZ-GV6** |
| [**TZ-M12**](timezone-must.md) | One **TZ-D9** read before multi-zone iteration; all branches consume that exact instant through **TZ-D11** | Boundary-minute evaluation remains coherent across person and tenant zones | Static call-graph review |

Violation handling

| Class | Meaning | Required action |
|-------|---------|-----------------|
| STOP | **TZ-F1**, **TZ-F2**, **TZ-F3** at contract boundary | Halt deploy for affected surface until fixed or Scope amended |
| Bug | **TZ-N1**–**TZ-N8**, **TZ-M1**–**TZ-M9** or **TZ-M11**–**TZ-M12** miss (wrong IANA / instant / calendar day or SSOT break) | Must fix; must not ship silent wrong instant or shifted calendar day |
| WARNING | **TZ-M10** miss when **TZ-D2** / **TZ-D3** diverge (no override log ) | Ops visibility gap ; fix before next release or per project RC policy |

---

## Cross-standard binding (normative) — **TZ-X**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **TZ-X1** | When **TZ-M1** (3) uses calling-country, that value **MUST** satisfy [phone number](../phone/README.md) **PHN-M3** at the PHN produce site (same normalization event ) ; TZ **MUST** consume only **TZ-D8** channels . Violations of **PHN-M3** upstream → TZ **MUST** STOP or reject the handoff per **TZ-F1** class (invalid provenance ) . | Bug / STOP | Trace : shared type links PHN normalizer output → TZ resolver input ; inspect the PHN-produced shared DTO field flowing unchanged into TZ input |

---

## Rule traceability (normative)

| Rule ID | Trace (fill in consuming repo) |
|---------|--------------------------------|
| [**TZ-M1**](timezone-must.md) | Resolver module: `________` |
| [**TZ-D6**](timezone-resolution-standard.md) | SSOT path: `________` |
| **TZ-D5**, **TZ-M9** | Map owner module: `________` |
| [**TZ-M10**](timezone-must.md) | Override log: `________` |
| [**TZ-M11**](timezone-must.md) | Calendar-day display authority: `________` |
| **TZ-D11**, **TZ-M12** | Zoned-parts authority: `________` |

---

## Skill boundary (normative)

Skills **MUST NOT** restate TZ-\* obligations. Skills MAY sequence steps that cite GTZ\*, **TZ-D6**, and **TZ-D10** only.
