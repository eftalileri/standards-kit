# Phone — normalization and E.164 SSOT (normative)

```kit-cover
type: normative
part-of: README.md
binds: the phone topic's agent execution contract plus the canonical-form obligation set -- PHONE-D definitions, PHONE-F failure paths, the GPHONE gates, PHONE-M / PHONE-N rows and the PHONE-V verification matrix
open-when: shape:backend-heavy, shape:frontend-heavy, signal:timezone-phone, signal:phone-number, signal:e164-normalization, signal:phone-persistence, signal:phone-validation
skip-when: signal:no-phone-field, signal:display-formatting-only
owns: PHONE-C1, PHONE-C2, PHONE-C3, PHONE-C4, PHONE-C5, PHONE-D1, PHONE-D2, PHONE-D3, PHONE-D4, PHONE-D5, PHONE-D6, PHONE-D8, PHONE-F1, PHONE-F2, PHONE-F3, PHONE-F4, GPHONE1, GPHONE2, GPHONE3, PHONE-M1, PHONE-M3, PHONE-M5, PHONE-M7, PHONE-M10, PHONE-M11, PHONE-M13, PHONE-M14, PHONE-N1, PHONE-N2, PHONE-N3, PHONE-N4, PHONE-N6, PHONE-N9, PHONE-N10, PHONE-V1, PHONE-V2, PHONE-V3, PHONE-V4, PHONE-V5, PHONE-V6
```

Scope: Same as [README.md](README.md) hub Scope, limited to canonical form, validation, normalization entrypoint, failure paths, and decision gates. UI-only rules are in [ui-formatting.md](ui-formatting.md) and [country-config.md](country-config.md).

Document type: Normative — canonical phone form, validation, normalization, and failure behavior.

References: [README.md](README.md); [error policy](../error-policy/error-policy.md); [error handling](../error-handling/error-handling.md); [forms](../forms/forms.md); [monorepo](../monorepo/README.md).

Non-normative samples: [`../_meta/examples/phone-verification-scenarios.md`](../_meta/examples/phone-verification-scenarios.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **PHONE-C*** | Agent execution contract (this file) |
| **PHONE-M*** | **MUST** |
| **PHONE-N*** | **MUST NOT** |
| **PHONE-F*** | Failure |
| **PHONE-D*** | Definition |
| **PHONE-O*** | Output / presentation ([ui-formatting.md](ui-formatting.md)) |
| **PHONE-V*** | Verification matrix (this file) |
| GPHONE* | Decision gate |

---

## Definitions (normative) — **PHONE-D**

| ID | Definition |
|----|------------|
| **PHONE-D1** | E.164 canonical string means a non-empty string that libphonenumber-js `parsePhoneNumber` accepts such that `isValid() === true` and `format('E.164')` yields a string matching `^\+[1-9]\d{0,14}$` (ITU E.164: at most 15 digits total after `+`; no trunk 0 in the library output). |
| **PHONE-D2** | Trunk prefix means the national 0 (or other documented national access prefix) shown in local UI; it **MUST NOT** appear in **PHONE-D1** output. |
| **PHONE-D3** | defaultCountry means ISO 3166-1 alpha-2 region code from the authoritative country selector for that field (UI or explicitly validated server context). |
| **PHONE-D4** | Supported region means a region code that the product explicitly allows for phone capture, as declared by its country-selection authority; each **MUST** be resolvable by the engine metadata (**PHONE-D7** in [country-config.md](country-config.md)). |
| **PHONE-D5** | Canonical phone normalization authority means the single production entry point that accepts raw input and an applicable default region, uses a maintained phone-number library without alternate parsing rules, and produces a valid **PHONE-D1** value or a typed rejection per **PHONE-F1**. Its location is defined by the adopting system's architecture; duplicate implementations are forbidden. |
| **PHONE-D6** | Valid phone candidate for a required field is a trimmed, non-empty string accepted by the canonical normalizer. Whitespace-only input is invalid (**PHONE-F1**). Optional fields use omission or `null` per [forms](../forms/README.md); an empty string is not a valid normalized value (**PHONE-N6**). |
| **PHONE-D8** | A UI mask is advisory only. The canonical normalizer **MUST** accept any trimmed input that the phone-number library validates, even if the input does not match an as-you-type mask at every step (for example, pasted input). A mask **MUST NOT** be the sole authority for validity. |

---

## Failure paths (normative) — **PHONE-F**

| ID | Condition | Outcome |
|----|-----------|---------|
| **PHONE-F1** | Parse fails, `isValid() === false`, or **PHONE-D1** shape not satisfied after successful parse. | ERROR — reject at validation boundary; must not persist or send in APIs. Client: user-visible error per [error handling](../error-handling/error-handling.md). Server: 4xx with semantic code per [error policy](../error-policy/error-policy.md). No default number. |
| **PHONE-F2** | defaultCountry missing, unknown, or not in **PHONE-D4** allowlist when national/international ambiguous input requires it. | ERROR — same as **PHONE-F1** class; message **MUST** indicate country context (root cause: unsupported or missing region). |
| **PHONE-F3** | E.164 string detected in database or outbound API payload audit as non-canonical (national format, trunk 0, or non-E.164) where **PHONE-M1** applies. | STOP — critical data defect; must not ship new features on that path until repaired; migration or fix required. |
| **PHONE-F4** | Display code applies the selected region's national format even though the stored E.164 number resolves to a different region. | Bug — remediate per **PHONE-O4** in [ui-formatting.md](ui-formatting.md); do not show a misleading national format. |

---

## Decision gates (normative) — GPHONE

Gates cite PHONE- rows; they do not add obligations alone.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GPHONE1 | Trimmed input is non-empty or the field is optional with absence (omit / null, not `""`) | **PHONE-D6**, [forms](../forms/forms.md) | Required field empty → **PHONE-F1** |
| GPHONE2 | Either (a) libphonenumber can derive a valid E.164 from input alone (international form), or (b) defaultCountry is **PHONE-D3** and in **PHONE-D4** | **PHONE-D3**, **PHONE-D4** | **PHONE-F2** |
| GPHONE3 | The canonical normalizer returns **PHONE-D1** for both international and region-dependent input. | **PHONE-M1**, **PHONE-D5**, **PHONE-N2** | **PHONE-F1** |

Routing summary: International `+…` input **MUST** pass through the same canonical normalizer as national input (**PHONE-N2**) so validation and canonical formatting run for every candidate.

---

## **MUST** (normative) — **PHONE-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-M1** | Every non-empty phone candidate **MUST** pass through the canonical phone normalizer before persistence, identity comparison, message dispatch, or outbound API assignment. | Bug — must not ship | Review that persisted and transmitted values come from the canonical normalizer, not raw UI input. |
| **PHONE-M3** | The product **MUST** expose exactly one normalization implementation for production (**PHONE-D5**); clients and servers call that authority or a documented shared equivalent, not independently maintained parsing copies. | Bug | Review that production paths share one implementation and approved library. |
| **PHONE-M5** | Decision/validation wrappers around phone **MUST** follow [decision function](../decision-function/decision-function.md): invalid phone → throw or structured error; **MUST NOT** return `null` / `undefined` to mean invalid. | Bug | Type and code review of normalize API |
| **PHONE-M10** | When the canonical normalizer is shared with client code and cannot raise a server-specific error carrier, server calls **MUST** pass through one boundary that maps known validation failures to the application's client-error response and rethrows unexpected faults unchanged. Direct server calls that bypass this boundary are forbidden. | Bug | Review that all server calls pass through the error-mapping boundary and unexpected failures remain visible. |
| **PHONE-M11** | Every paid OTP/SMS dispatch **MUST** first pass one server gate, before the provider call and before any durable provider-command window opens, that rejects the destination when (a) the region derived from the normalized number itself — never the request's country field — is outside the supported-country set, or (b) full library metadata positively identifies its line type as not SMS-capable (fixed line, toll-free, premium, shared-cost, VoIP, pager and similar). Mobile, fixed-line-or-mobile and an undeterminable type pass — stale metadata (a newly opened range) **MUST NOT** lock a real user out; the provider's rejection catches the remainder. Both are user-input rejections with registered 4xx codes; a provider's proven “not SMS-capable” reply maps to the same code as (b). Why: the engine ignores the request country for `+` input, so an unauthenticated send endpoint otherwise dispatches paid SMS to any country the provider allows (SMS pumping), and acceptance alone (**PHONE-M14**) admits landlines, which burn paid sends. | Bug — cost | Run the gate on crafted unsupported-region and landline numbers (rejected, no provider call) and on mobiles of several supported countries (accepted) |
| **PHONE-M7** | UI layers MAY use country-specific placeholders and masks per [placeholder-i18n.md](placeholder-i18n.md); such presentation **MUST NOT** substitute for **PHONE-M1** — stored and wire values remain **PHONE-D1** only. | Bug | Submit path audit: formatter output not assigned to canonical phone fields |
| **PHONE-M13** | The country of another person's number written without a country code (contact import, contact sync) **MUST** be decided by one shared decision function used by client and server, from only two sources: the engine metadata and the owning tenant's stored country. Contact numbers are mobile numbers: the decision function **MUST** produce only mobile candidates (full-metadata mobile or plan-level mobile-or-fixed) and **MUST NOT** produce, label or branch on fixed-line candidates anywhere. Order: (a) the number states its own country — `+CC`, or every country in which full metadata recognises it yields the SAME E.164 and the written digits carry that calling code (`00CC…`, `CC…`) → take it, do not ask; (b) a mobile number of the tenant's country → take it, do not ask, show the chosen country with a one-tap change; (b2) a number accepted in the tenant's country by the one acceptance predicate (**PHONE-M14**) that is NOT a mobile number there **MUST NOT** be taken as a foreign mobile number even when exactly one foreign mobile candidate exists → ask, listing only the mobile candidates (or the full list when none), still with no fixed-line row or label (a tenant landline would otherwise silently become another person's number abroad); (c) a mobile number in exactly one country → take it the same way, independent of whether the tenant's country is known (when the tenant's country is unknown, (b2) does not apply); (d) mobile numbers in several countries → ask, listing only those mobile candidates (the number as it would be saved there), the tenant's country first, nothing preselected; (e) no mobile candidate → ask with the full country list and number editing. The decision **MUST** run on a ready tenant country: “no tenant context” and “settings not yet loaded” are different states, and a cached settings answer missing the field is stale and re-read before deciding. **MUST NOT** use the UI locale, the device region, a contact's country tag (device region at save time, absent on some platforms) or the acting user's own country (**PHN-N1**, **PHONE-N10**). A device-local store **MUST NOT** persist a value derived from the tenant's country — it changes and the store may be shared across tenants; such a store keeps only rung (a) with a written calling code plus the tenant-independent match keys (the mobile-candidate E.164 forms, computed once per changed record), and every “is this contact already a stored member record” display de-duplication reads those keys through one reader — no per-keystroke decision run, no second matching path. Why: a stored national number otherwise either lands on a guessed country (wrong person on the messaging channel) or forces a question for an unambiguous number. | Bug | Run the decision function on `+CC`, `00CC…`, unique national, tenant-country mobile, tenant-country non-mobile, multi-country and no-match inputs; trace every contact write path to it |
| **PHONE-M14** | The engine (**PHONE-D5**) **MUST** bind exactly one metadata set — the full set, so line type and strict validity exist — in one module, and every parse, format, example and line-type question on client and server **MUST** go through that module; no other file imports the library, the client bundle resolves a single copy, and client and server pin the same library version. Acceptance **MUST** be one predicate used by normalization, the read path and the decision function: recognised by full metadata, or — outside a shared calling code — possible length plus the country's general national pattern (line type “unknown”). Why: two metadata sets or versions give two different “valid” answers for the same stored number, and stale metadata (a newly opened range) must not reject a number the general pattern accepts. | Bug | Search shows one library importer; the bundle source map lists one copy; the predicate accepts every stored production number. No import-restriction check is prescribed; the rule is held by the single engine module, single-copy bundle resolution and review |

---

## **MUST NOT** (normative) — **PHONE-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PHONE-N1** | **MUST NOT** persist, index, or send in API JSON any national display form (spaces, parentheses, trunk 0, or missing `+`) as the canonical phone value. | Reject / critical (**PHONE-F3**) | Schema / OpenAPI / DB audit: phone fields E.164 only |
| **PHONE-N2** | **MUST NOT** bypass the canonical normalizer for international `+` input or for callers considered trusted. | Bug | Review all paths, including malformed international input. |
| **PHONE-N3** | **MUST NOT** implement per-country `if/switch` parse branches in application code for normalization; libphonenumber-js (inside **PHONE-D5**) is the sole place for country rules. | Bug | `rg` for country-specific phone parse beyond config example/mask |
| **PHONE-N4** | **MUST NOT** coerce invalid input to a default E.164 or strip characters until it "looks valid". | Bug | Static inspection: garbage → **PHONE-F1** |
| **PHONE-N6** | **MUST NOT** store or transmit trimmed empty string `""` as a phone value; optional fields use absence (**PHONE-D6**). | Bug | API Static inspection: optional empty → no phone key or null |
| **PHONE-N9** | **MUST NOT** reject or block submit solely because as-you-type mask validation failed when the trimmed full input (e.g. after paste) normalizes to valid **PHONE-D1** per **PHONE-D8**. | Bug | Paste valid full national number that breaks intermediate mask steps → still **PHONE-M1** success |
| **PHONE-N10** | When a region is required to disambiguate national input, a missing or unsupported region **MUST** follow **PHONE-F2**; do not silently substitute an arbitrary country code. A product MAY define a default for a specific flow, but that default must be documented and used consistently by its selector, placeholder, and normalization call. A supplied international number still takes precedence according to the phone-number library. | Bug — normalization can bind a valid number to the wrong person or region | Review region selection, documented defaults, and consistency between placeholder and normalization flows. |

---

## Output / presentation (pointer) — **PHONE-O**

Binding **PHONE-O\*** / **PHONE-D9** / **PHONE-M8** / **PHONE-M9** / **PHONE-N8** rows live in [ui-formatting.md](ui-formatting.md) (display-only transforms from **PHONE-D1**). Placeholder sourcing and locale numeric ban: [placeholder-i18n.md](placeholder-i18n.md) (PH-\*).

---

## Verification (normative)

Purpose: Binary checks that can be adapted to the product's supported regions and input policies. Illustrative strings (non-normative) are in [`../_meta/examples/phone-verification-scenarios.md`](../_meta/examples/phone-verification-scenarios.md).

| ID | Check | Pass criterion |
|----|-------|----------------|
| **PHONE-V1** | A supported region's national input includes a trunk prefix | Output is valid E.164 without that national prefix in the canonical value. |
| **PHONE-V2** | Input is already valid international E.164 | Output remains valid E.164 and matches the library's canonical format. |
| **PHONE-V3** | National input omits a locally optional prefix | If the library resolves it under the supplied region, output matches the canonical value for that subscriber. |
| **PHONE-V4** | Input is not a phone number | Surface **PHONE-F1**; do not persist. |
| **PHONE-V5** | Default region is missing or unsupported when needed | Surface **PHONE-F2**. |
| **PHONE-V6** | Stored E.164 region differs from the current UI selector | Do not render the stored number with a misleading national mask; follow **PHONE-O4**. |

---

## Enforcement (normative)

- **PHONE-M** / **PHONE-M3** / **PHONE-M5** violation → bug (must fix).
- **PHONE-N** violation → per-row Consequence (reject or bug).
- Non-E.164 at rest or on wire where **PHONE-M1** applies → **PHONE-F3** (STOP).
- **PHONE-F1** / **PHONE-F2** → no silent fallback; no default phone.
- **PHONE-F4** → bug until **PHONE-O4** behavior is implemented.

---

## Agent execution contract

| ID | Rule |
|----|------|
| **PHONE-C1** | This topic is mandatory for any code path that stores, compares, or sends phone numbers over APIs. |
| **PHONE-C2** | [Shared agent contract C2](../_meta/agent-contract.md). |
| **PHONE-C3** | [Shared agent contract C2](../_meta/agent-contract.md); behavior comes only from PHONE- / GPHONE- rows in this folder; deviation → STOP. |
| **PHONE-C4** | Violations → consequences in Enforcement above and per-row Consequence columns in [normalization.md](normalization.md) and [ui-formatting.md](ui-formatting.md). |
| **PHONE-C5** | [Error policy](../error-policy/error-policy.md) wins on HTTP status and semantic codes for API failures; this folder adds phone-specific minimums only. |
