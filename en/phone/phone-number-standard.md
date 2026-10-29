# Phone number standard — E.164 core (normative)

```kit-cover
type: normative
part-of: README.md
binds: the PHN core obligation set -- agent execution contract, definitions, failure paths, the GPHN gates and their validation scenarios, and every PHN-M / PHN-N row that governs parsing, validating and normalising a telephone number to E.164
open-when: shape:backend-heavy, shape:full-stack, signal:phone-number, signal:e164-normalization, signal:calling-country-derivation
skip-when: signal:no-phone-field, signal:phone-ui-only
owns: PHN-C1, PHN-C2, PHN-C3, PHN-C4, PHN-D1, PHN-D2, PHN-D3, PHN-D4, PHN-D5, PHN-F1, PHN-F2, PHN-F3, GPHN1, GPHN2, GPHN3, PHN-M1, PHN-M2, PHN-M3, PHN-M4, PHN-M5, PHN-M6, PHN-N1, PHN-N2, PHN-N3, PHN-N4, PHN-N5
```

Normative part split out of this file: [gate validation, verification, enforcement and cross-standard binding](phone-number-verification-and-binding.md) (**PHN-GV1**–**PHN-GV3**, **PHN-V-E164**, **PHN-X1**).

Scope

- Included: Parsing user or API telephone input into E.164; validation that rejects invalid numbers; normalization to one canonical E.164 string per **PHN-D1**; derivation of calling-country ISO 3166-1 alpha-2 from E.164 prefix using one documented library or catalog; failure paths on invalid input; binary gates for whether normalization runs. Output is E.164 and structured metadata explicitly listed in **PHN-D3** only.
- Excluded: User-visible country or currency label strings — [locale names](../locale-names/README.md) (LCN-\*). IANA timezone resolution and UTC conversion — [timezone](../timezone/README.md) (TZ-\*); PHN-\* **MUST NOT** resolve timezone . UI mask rendering, placeholder tables, national format display — [phone](../phone/README.md) (PHONE-\*). SMS / messaging vendor APIs — N/A (one-line reason: transport contracts live in the adopting project's integration docs).

Document type: Normative — rule engine.


Environment: Applies to any client, server, or integration boundary that accepts phone-number strings; failures follow the application error and logging policies (structured logs per [logging policy](../logging-policy/logging-policy.md) where application logs emit).

Binding principle: Violations of **PHN-M** / **PHN-N** are bugs — must fix; must not ship silent accept of invalid numbers (**PHN-C3**).

References: [README.md](README.md); [error policy](../error-policy/error-policy.md); [error handling](../error-handling/error-handling.md); [decision function](../decision-function/decision-function.md); [timezone](../timezone/README.md); [locale names](../locale-names/README.md); [phone](../phone/README.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **PHN-C*** | Agent execution contract |
| **PHN-D*** | Definition |
| **PHN-M*** | **MUST** |
| **PHN-N*** | **MUST NOT** |
| **PHN-F*** | Failure path |
| GPHN* | Decision gate (normative index) |
| **PHN-V*** | Verification |
| **PHN-GV*** | Gate validation scenario |
| **PHN-X*** | Cross-standard binding (TZ consumes PHN output) |

---

## Agent execution contract — **PHN-C**

| ID | Rule |
|----|------|
| **PHN-C1** | This topic is mandatory for any code path that persists, compares, or transmits telephone numbers as domain values in Scope. |
| **PHN-C2** | [Shared agent contract C2](../_meta/agent-contract.md); compliance is only from PHN-\* / GPHN\* rows here; deviation → STOP. |
| **PHN-C3** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **PHN-C4** | [Error policy](../error-policy/error-policy.md) wins on HTTP status and semantic codes ; this file adds E.164 minimums only . |

Enforcement: STOP on **PHN-F1** at API boundary when invalid input must reject ; bug for **PHN-N1** / **PHN-N2**.


---

## Definitions (normative) — **PHN-D**

| ID | Definition |
|----|------------|
| **PHN-D1** | E.164 canonical string means `+` followed by digits only, total length within **ITU-T** E.164 maximum 15 digits after `+`, produced only by **PHN-M1** pipeline . |
| **PHN-D2** | Normalization engine means the single documented module (for example `libphonenumber-js` or successor named in architecture ) that implements parse, validate, and format to E.164 . |
| **PHN-D3** | PHN output record means exactly : (a ) **PHN-D1** string or absent when GPHN1 NO ; (b ) calling-country ISO 3166-1 alpha-2 when the engine resolves it — this is the only authorized value for [timezone](../timezone/README.md) **TZ-D4** when **TZ-M1** step (3) applies ; (c ) no extra user-facing formatted national string field unless PHONE-\* owns that surface . |
| **PHN-D5** | TZ handoff field means the one documented property name (OpenAPI field , TypeScript key ) on shared types that carries **PHN-D3** (b ) into [timezone](../timezone/timezone-resolution-standard.md) **TZ-D8** ; architecture **MUST** list that name next to **PHN-D2** / normalizer output type . |
| **PHN-D4** | Invalid input means any string for which **PHN-D2** reports not a possible number , too short, too long, or fails validation for the stated default region policy when national input is allowed . |

---

## Failure paths (normative) — **PHN-F**

| ID | Condition | Outcome |
|----|-----------|---------|
| **PHN-F1** | **PHN-D4** after parse attempt with documented default region policy when applicable . | throw or structured 4xx per [error policy](../error-policy/error-policy.md) ; **MUST NOT** persist or return success with best guess digits (**PHN-N2** ) . |
| **PHN-F2** | The normalization engine is unavailable, cannot be imported, or has no usable implementation. | STOP build or runtime preflight; **MUST NOT** fall back to a regex-only pipeline (**PHN-N5**) . |
| **PHN-F3** | National input allowed but default region not provided where engine requires it . | throw or typed error per [decision function](../decision-function/decision-function.md) ; **MUST NOT** assume UI locale region (**PHN-N1** ) . |

---

## Decision gates (normative index) — GPHN

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GPHN1 | Input string is non-empty after trim and matches documented pre-check (length / charset ) for attempting parse . | **PHN-M1** | Reject early with **PHN-F1** class or documented empty field path outside PHN (forms SSOT ) |
| GPHN2 | **PHN-D2** reports valid number for E.164 export . | **PHN-M2**, **PHN-M1** | **PHN-F1** |
| GPHN3 | Calling-country is required by downstream only when **PHN-D2** supplies it ; no synthetic country from language . | **PHN-M3**, **PHN-N1** | STOP or omit country field per API contract documented in architecture — **MUST NOT** invent alpha-2 |

Gate validation: Each gate has a validation scenario (**PHN-GV**) in [phone-number-verification-and-binding.md](phone-number-verification-and-binding.md).

---

## Gate validation scenarios — moved

The scenarios **PHN-GV1**–**PHN-GV3** are defined in [phone-number-verification-and-binding.md](phone-number-verification-and-binding.md).

---

## **MUST** (normative) — **PHN-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHN-M1** | All stored , compared , and API-emitted telephone values **MUST** be **PHN-D1** produced only through **PHN-D2** . | Bug / STOP | Static: DB / DTO audit for `+` prefix canonical E.164 only |
| **PHN-M2** | Invalid numbers **MUST** surface **PHN-F1** ; **MUST NOT** coerce to closest valid without user / system confirmation outside this standard . | Bug | Inspect the engine-invalid branch: it raises **PHN-F1** before any canonical value can be returned or persisted. |
| **PHN-M3** | When calling-country is emitted , it **MUST** be derived only from **PHN-D2** metadata for the normalized E.164 prefix , not from separate heuristics . | Bug | Trace from engine output to DTO |
| **PHN-M4** | National-format input **MUST** use exactly one documented default region source (explicit API field , stored user country , or explicit dial code selection ) ; that source **MUST** be named in architecture . For another person's number written without a country code the one source is the owning tenant's stored country inside the decision function of [normalization.md](normalization.md) **PHONE-M13** — never the acting user's own country . | Bug | Inspect the single documented region source and the missing-region **PHN-F3** rejection. |
| **PHN-M5** | Decision / validation entrypoints **MUST** follow [decision function](../decision-function/decision-function.md) : invalid phone **MUST NOT** return `null` / `false` alone without typed error . | Bug | Static / type review |
| **PHN-M6** | When **PHN-D3** (b ) is emitted to DTOs consumed by timezone resolution, it **MUST** be stored under **PHN-D5** on those types ; **MUST** match **PHN-D2** metadata byte-for-byte (normalized uppercase **A-Z** per type contract ) . | Bug / STOP | Schema diff : DTO field equals normalizer output ; no second derivation |

---

## **MUST NOT** (normative) — **PHN-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHN-N1** | **MUST NOT** derive calling-country from UI locale , application language , or display locale . | Bug | **PHN-GV3** , code review |
| **PHN-N2** | **MUST NOT** guess missing digits , pad with wildcards , or truncate to force validity . | Bug / STOP | Inspect parsing rejection: missing digits are neither guessed nor padded/truncated into a valid number. |
| **PHN-N3** | **MUST NOT** expose user-facing pretty print , mask characters , or national spacing as part of **PHN-D3** without routing through PHONE-\* . | Bug | Import boundary audit |
| **PHN-N4** | **MUST NOT** resolve IANA timezone inside **PHN-D2** call sites or this module family . | Bug | Static: the normalization engine and its call sites contain no `Intl` timezone or TZ resolver imports. |
| **PHN-N5** | **MUST NOT** replace **PHN-D2** with regex-only normalization for production paths . | Bug / STOP | CI : dependency on **PHN-D2** present |

---

## Verification, enforcement and cross-standard binding — moved

The verification matrix (**PHN-V**-\*), the enforcement and violation-handling layer, the traceability table, the cross-standard binding row **PHN-X1** and the skill boundary are defined in [phone-number-verification-and-binding.md](phone-number-verification-and-binding.md). That file cites **PHN-M1**, **PHN-N1**, **PHN-F1** and **PHN-D2** by link rather than restating them, so this file stays their single definition site.

---

*Normative name: phone-number-standard.*
