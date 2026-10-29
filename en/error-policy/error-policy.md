# Error policy (backend)

```kit-cover
type: normative
part-of: README.md
binds: the backend error-model core — the agent execution contract, the closed category set, the registry/carrier/boundary model, the required operator message shape, the semantic error-code rows, and where a newly registered code's user sentence may come from
open-when: shape:backend-heavy, signal:error-infrastructure, signal:error-raise, signal:error-boundary, signal:api-error-shape
skip-when: signal:client-only, signal:no-error-path-change
owns: C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, S1, S2, S3, S4
```

**MUST** / **MUST NOT** rows of this topic (the M family, banded): [error-model-registry-and-boundary.md](error-model-registry-and-boundary.md) (**M1**–**M12**, **M16**–**M18**); [error-carrier-and-severity-derivation.md](error-carrier-and-severity-derivation.md) (**M13**–**M15**, **M39**); [provider-contract-and-webhook-errors.md](provider-contract-and-webhook-errors.md) (**M19**–**M26**, **M45**, **M46**); [transport-i18n-and-classification-rules.md](transport-i18n-and-classification-rules.md) (**M27**–**M30**, **M35**); [error-category-provenance-and-client-text-set.md](error-category-provenance-and-client-text-set.md) (**M33**–**M34**, **M36**, **M40**–**M44**); [registry-cause-permanence-fact.md](registry-cause-permanence-fact.md) (**M37**); [error-policy-prohibitions.md](error-policy-prohibitions.md) (**N1**–**N24**). They are cited from here by ID, never restated. Non-binding tail: [error-policy-appendix.md](error-policy-appendix.md).

Bare-ID scope: an unlinked `C*` / `M*` / `N*` / `S*` id cited anywhere in this topic always means an error-policy row, never a same-named id from another topic; the band that defines each one is listed in [README.md](README.md). The single exception is stated in the numbering note at **M30**, where logging-policy **M31** / **M32** are cited by name.

Scope: Backend error handling: the single error registry (code → facts), the closed category model and derived severity, typed throw carriers and the single boundary handler, semantic codes, API error shape and envelope (traceId / category / retryable), root cause discipline, logging expectations at failure boundaries, null handling after retrieval. Not client UI or client-query behavior — see [error handling](../error-handling/error-handling.md).

Environment: Apply this policy at server error boundaries; logging follows [logging policy](../logging-policy/logging-policy.md). The API wire shape is independent of log transport.

Binding principle: This document is the single correct backend error model for the standards kit. Standard = one valid path. Any implementation that contradicts it is a bug. The only remedy is to fix the code or change the standards first — not to improvise behavior.

References:

- [Decision matrix](../decision-matrix/decision-matrix.md)
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [Editable persistent attributes](../editable-persistent-attributes/README.md) — cascade / no fallback, primary update not rolled back, idempotent jobs
- [SSoT governance](../ssot/README.md) — SSoT violations, guard coordination, null/fallback rules where applicable
- [Decision functions](../decision-function/decision-function.md) — decision vs retrieval, `validate*` contract, `decision()` wrapper
- [Logging policy](../logging-policy/logging-policy.md) — structured fields, severity and transport guidance
- Project runtime authority (conditional): A consuming project may declare an out-of-kit source for shipped runtime details. Apply that project’s precedence rules to resolve runtime-detail conflicts; this policy remains the reusable normative baseline.

Code samples: [`../_meta/examples/error-policy-code-samples.md`](../_meta/examples/error-policy-code-samples.md) (non-normative).

---

## Agent execution contract

**C1**: Apply [shared **C1**](../_meta/agent-contract.md).

**C2**: Apply [shared **C2**](../_meta/agent-contract.md).

**C3**: Precedence when standards conflict: REPOSITORY > TRANSACTION > ERROR > LOGGING.

**C4**: Apply [shared **C4**](../_meta/agent-contract.md).

**C5**: Apply [shared **C5**](../_meta/agent-contract.md).

**C6**: Apply [shared **C2**](../_meta/agent-contract.md).

**C7**: This policy defines the only valid backend error-handling model in this corpus. Alternative error patterns are forbidden.

**C8**: Apply [shared **C3**](../_meta/agent-contract.md).

**C9**: Refactor / feature / delete: never ship behavior that violates this policy because it was "faster" — **C5** applies before merge.

**C10**: If a required rootCause, semantic error, or contract field cannot be produced truthfully, STOP — no fabricated text or silent downgrade.

Enforcement: Violations are bugs and must be fixed; **C5** / **C10** require stopping until the standards or code are corrected.

Verification: Verify MUST / MUST NOT rows using code inspection, API responses, and logs in accordance with the consuming project’s verification policy.

---

## Technology

| Topic | Rule |
|-------|------|
| Pattern | Architectural discipline — no single library replaces this spec. |
| Logging | Use project logger per [logging policy](../logging-policy/logging-policy.md) — not `console.log` / `console.error` for operational paths. |
| Validation | The project-standard schema validator for input validation errors aligned with this policy. |

---

## Error categories (closed set — drives classification)

Every policy-covered error resolves to exactly one `ErrorCategory` from a closed set. The category — not an ad-hoc per-call-site decision — drives log level, crash-reporting routing, and the default `retryable` hint. Severity is derived from category, never stored (**M15**).

| Category | Meaning | Examples | Severity (derived) | Crash reporting |
|----------|---------|----------|--------------------|-----------------|
| `OPERATIONAL` | Expected resource-lifecycle outcome (the resource legitimately is not there / not in that state) | not-found after deletion, gone, no-longer-applicable | `WARN` | No → metric channel |
| `BUSINESS` | Expected rule / input / conflict outcome (the caller did something the domain rejects) | validation failure, forbidden, conflict / already-exists, quota | `WARN` | No → metric channel |
| `SYSTEM` | Unexpected failure, internal defect / invariant violation, or infrastructure failure | invariant violation, populate / transform / persist failed, DB / connection failure, unmapped code | `ERROR` | Yes (crash reporting) |

- `httpStatus` and `category` are independent. A `4xx` may still be `SYSTEM` when the cause is a defect (e.g. an invariant violation that returns `400` to the client but must still be visible to crash reporting). Do not infer category from status, or status from category.
- Legacy free-form buckets (Validation / Database / Business logic / System) map into this closed set: Validation + rule/conflict → `BUSINESS`; not-found / lifecycle → `OPERATIONAL`; Database / infra / defect / invariant → `SYSTEM`.
- Doubt → `SYSTEM` (fail-loud): if a code's category is genuinely unclear, classify `SYSTEM` so the failure stays visible, never the reverse.
- Upstream / third-party transient failures are the one carve-out from "infrastructure failure → `SYSTEM`": a provider's own *retryable* responses (connection / timeout, HTTP 408 / 409 / 429 / 5xx, including provider-specific overload like 529) that still fail *after* the client SDK's own retries are an expected condition of depending on that service — classify `OPERATIONAL` / `BUSINESS` (→ `WARN`, metric), `retryable: true` (**M19**). Non-retryable 4xx and malformed responses are ordinarily `SYSTEM`; however, a not-found response that the provider also uses during documented or proven post-write propagation is transient until the provider supplies the successful structural ownership evidence. The status alone never proves ownership mismatch.

---

## Error registry, carrier, and boundary (model)

This is the backbone the rest of the policy enforces (**M12**–**M18**, **N9**–**N12**):

- One registry is the authority. A single error registry maps each code to its `{ httpStatus, category, messageKey, retryable }` facts. It is the one answer to "what does this error mean / return / log as." Per-domain or per-handler status maps and parallel code-group tables are second writers of the same datum — forbidden (SSoT — one authority).
- The code is the carrier. Errors travel as a typed carrier or project-standard throw factory carrying the code and structured context, where `code` is the registry key and `context` holds operator detail (root cause, ids). The message is not a string to be parsed back into a code.
- Severity is derived, not stored. One total severity derivation maps category to `WARN` or `ERROR`; no `severity` field exists on the error or the registry row. Drift is impossible because severity is recomputed from the authority every time.
- One boundary resolves the response. Exactly one boundary handler turns a thrown error into the API response, deriving status / category / severity / retryable from the registry, attaching a trace id, and logging once. An unknown / unmapped code → `SYSTEM` → 500 → error log → crash reporting (fail-loud).
- Type system is the first guard. Where the type system permits it, derive the error-code type from the registry keys so an off-registry code fails at compile time; no regex guard is needed to enforce registry membership (enforcement is type + AST lint, not string scanning).
- The catalog is a cross-boundary contract. Where backend and client types are shared, the code catalog and envelope type live in that single cross-boundary contract (for example, a shared package in a monorepo); otherwise use the consuming project’s canonical API contract. See [error handling](../error-handling/error-handling.md).

---

## Required message shape (operator-facing text and non-coded throws)

Registry-coded throws carry the code (**M13**); the user-facing text comes from `messageKey` → i18n (**M4**). This shape governs operator-facing text only — the `rootCause` / context fields, and any non-coded free-text `SYSTEM` throw (e.g. startup / invariant assertions):

```
[What failed]. Root cause: [Root cause]. Solution: [One-sentence action]. [Optional: id/source]
```

It is operator text, never a string that downstream code parses to recover a code (**N10**).

validate* pattern: validation helpers may return `string | null` (`null` = valid). The caller **MUST** comply with **M10** — see [decision functions](../decision-function/decision-function.md) (V1, V2, **M7**).

---

## Semantic error codes (API)

S1: Every API error response includes success: false (or project equivalent), error, message (and, per **M4**, rootCause only on non-prod 500); names may match the shared schema.

S2: error is a unique uppercase snake or project convention identifier (e.g. VALIDATION_ERROR, NOT_FOUND, INSUFFICIENT_BALANCE), and is a key of the single error registry (**M12**), with membership encoded in the type system where supported (**M14**).

S3: Register new codes in the one registry; do not duplicate meaning under different strings, and do not map the same code to different statuses / messages in different places (one code → one `{ httpStatus, category, messageKey }`). One meaning that arises on several record types keeps ONE code and an object-neutral user sentence — the sentence names no record type (say "this item", not "this <record-type>'s item") — because the sentence is shown wherever the code is raised. A per-object code is opened only when the client's response to the two objects genuinely differs, never to fix a noun: released clients do not know the new code and fall to the generic sentence ([**DCD-M8**](../dead-code/dead-code-rules.md)), which is worse than a neutral one; a wording fix follows the report through **I18N-CAT-M5** (one change set, every language, keys unchanged).

S4: A code is not registered until the user sentence its `messageKey` promises can be SOURCED from the product's own words — and where it cannot be, what stops is the REGISTRATION, never the sentence's quality. **M29** makes a registered key a promise in every declared language and **M34** decides which codes additionally owe a client-side sentence; both leave one question open, and it is the question every new code asks on the day it is written: *where does that sentence come from?* Three obligations bind.

- (a) Three ranked sources, and nothing else counts as one. (1) The product already carries a sentence for the same predicate — copy it verbatim per language, including from a sibling catalog of the same product; the identifier being registered frequently already has one there. (2) It does not, but that language's own catalog already carries the sentence's frame for two or more different subjects, and the subject noun the new sentence needs is itself a string the product owns in that language — then the frame may be filled, and only where every inflection the fill requires is already attested in that same catalog. Gender, case and particle agreement are the test: an inflection the catalog does not attest is a guess, and the source is unavailable. (3) Neither — the generic text stands and the sentence is recorded as an owner decision. Writing a plausible sentence in a language nobody on the team reads is not source (3) done well; it is an invention that reads as reviewed, is reported by nobody, and is worse than the generic it displaced — the same trade [**I18N-CAT-M7**](../internationalization-rn/orthographic-corruption-shapes.md)(c) refuses one layer down, for a word instead of a sentence. Once the owner HAS decided, the decision fixes the MEANING and each language's rendering is still SOURCED, not invented: carry over the subject nouns that language already attests for the same objects — most often from the new code's inverse-predicate sibling, whose whole sentence cannot be borrowed precisely because it asserts the opposite. REACHABILITY is not an input to any of this. A code no caller surface can currently produce still owes every declared language, because the registration is what makes the promise; measure the producing surface anyway and record the finding beside the row, so a defence layer is never later read as a live user surface — and never spend an unreachability finding to skip a language or to raise a gate ceiling.
- (b) Falling to source (3) can BLOCK the registration, and that is the correct outcome. Where the completeness gate requires the entry and its staged exemption list ([**FP-M18**](../false-positive/check-design-rules.md)) stands at its ceiling, the code cannot be registered until the sentence is decided. Two escapes look cheaper and are both regressions: raising the ceiling is precisely the ratchet failure that list exists to prevent, and re-classifying the code into the band that owes no sentence moves an expected caller outcome into the defect channel (**M33**). The work stops at a named product decision, and the decision is the deliverable.
- (c) Look for the sentence under the identifier the wire ALREADY carries, before minting a better name. A hand-written envelope being converted emits some literal today. That literal is often already answered by the client dictionary in every language, so registering that identifier costs no translation and preserves the published contract ([**DCD-M8**](../dead-code/dead-code-rules.md)); a more descriptive name in the same position buys nothing, splits one meaning across two strings (S3), and changes what released clients branch on.

[Consequence: either a code ships with an invented sentence no reader can report, or a gate ceiling is raised to admit it — in both cases the completeness promise becomes decorative; must not ship.]

