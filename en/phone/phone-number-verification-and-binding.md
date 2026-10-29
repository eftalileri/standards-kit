# Phone number standard — gate validation, verification, enforcement and cross-standard binding

```kit-cover
type: normative
part-of: README.md
binds: PHN-GV1 to PHN-GV3, the PHN-V verification matrix, the enforcement and violation-handling layer, the traceability table, PHN-X1 (the alpha-2 handed to the timezone standard) and the skill boundary
open-when: shape:backend-heavy, signal:timezone-phone, signal:phone-number, signal:e164-normalization, signal:phone-timezone-handoff, signal:phone-enforcement
skip-when: signal:no-phone-field, signal:phone-ui-only
owns: PHN-GV1, PHN-GV2, PHN-GV3, PHN-V-E164, PHN-X1
```

Scope: The verification and enforcement tail of the phone-number standard: the observable scenario per gate, which checks prove the rules hold, how a violation is classified, where each rule is traced in a consuming repository, the one cross-standard row that binds PHN output to the timezone standard, and the skill boundary.

Document type: Normative part — **PHN-GV1**–**PHN-GV3**, **PHN-V-E164**, **PHN-X1**.

References: [README.md](README.md); [phone-number-standard.md](phone-number-standard.md) (**PHN-C\***, **PHN-D\***, **PHN-F\***, **PHN-M\***, **PHN-N\***, GPHN\*); [timezone](../timezone/README.md) (**TZ-D4** — the consumer of **PHN-X1**).

Citation form: the first column of the enforcement and traceability tables below cites rules defined in [phone-number-standard.md](phone-number-standard.md); per copy policy P1 those citations are links, not restatements.

---

## Gate validation scenarios (normative) — **PHN-GV**

| ID | Gate | Scenario | Pass criteria |
|----|------|----------|---------------|
| **PHN-GV1** | GPHN1 | Empty string , whitespace only . | No call to E.164 formatter ; documented forms path or **PHN-F1** . |
| **PHN-GV2** | GPHN2 | Known invalid : too few digits , invalid CC . | **PHN-F1** ; no DB write . |
| **PHN-GV3** | GPHN3 | Application display language differs from the calling-country implied by a valid E.164 input. | Calling-country is derived from the number's international prefix, never from UI language (**PHN-N1**) . |

---

## Verification matrix (normative) — **PHN-V**

| ID | Check | Mode |
|----|-------|------|
| **PHN-V-E164** | Persisted values match E.164 regex / schema | Static schema + migration lint |
| **PHN-V-ENGINE** | Single **PHN-D2** import site per bounded context | Static |
| **PHN-V-INVALID** | Invalid-input branch throws | Static inspection |
| **PHN-V-LOCALE** | Locale or display-language changes do not change normalization or calling-country output. | Static inspection or runtime observation |
| **PHN-V-TZ** | **PHN-M6** , **PHN-D5** documented ; DTO has handoff field | Static doc + types |

---

## Enforcement layer (normative)

| Rule ID | Static inspection | Runtime observation | CI validation |
|---------|-------------------|---------------------|---------------|
| [**PHN-M1**](phone-number-standard.md) | DTO/schema and normalizer-entry inspection | Bad input returns API 400 | Static contract inspection and real response observation |
| [**PHN-N1**](phone-number-standard.md) | rg banlist | — | **PHN-GV3** |
| [**PHN-F1**](phone-number-standard.md) | — | Logs with root cause | Observe the real failure boundary |
| [PHN-M6](phone-number-standard.md), [PHN-X1](#cross-standard-binding-normative--phn-x) | OpenAPI / types | — | Schema and DTO inspection |

Violation handling

| Class | Meaning | Required action |
|-------|---------|-----------------|
| STOP | **PHN-F2** , persist invalid E.164 | Block release until remediated |
| Bug | **PHN-N** / **PHN-M** miss | Must fix ; must not ship |

---

## Rule traceability (normative)

| Rule ID | Trace (fill in consuming repo) |
|---------|--------------------------------|
| [**PHN-D2**](phone-number-standard.md) | Engine module: `________` |
| [**PHN-M1**](phone-number-standard.md) | Normalizer entry: `________` |
| [**PHN-N1**](phone-number-standard.md) | Lint rule or static inspection: `________` |
| **PHN-D5**, **PHN-M6**, **PHN-X1** | Shared types / pipeline inspection: `________` |

---

## Cross-standard binding (normative) — **PHN-X**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHN-X1** | Any ISO 3166-1 alpha-2 passed to [timezone](../timezone/README.md) as **TZ-D4** **MUST** equal **PHN-D3** (b ) from the same PHN normalization that produced **PHN-D1** ; **MUST** be valid two-letter alpha-2 per project validator ; **MUST NOT** send placeholders, numeric calling codes alone, or strings not returned by **PHN-D2** . | Bug / STOP | Integration : normalize → DTO → TZ resolver ; assert equality ; **PHN-V-TZ** |

---

## Skill boundary (normative)

Skills **MUST NOT** restate PHN-\* obligations. Skills MAY cite GPHN\* and **PHN-D2** paths only.
