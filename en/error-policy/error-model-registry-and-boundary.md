# Error policy — registry, boundary and failure classification (**M1**–**M12**, **M16**–**M18**)

```kit-cover
type: normative
part-of: README.md
binds: the first band of error-policy MUST rows — root cause discipline, machine-readable codes, wrapping and null-return discipline, the single error-registry authority, and the one boundary handler with its trace id
open-when: shape:backend-heavy, signal:error-infrastructure, signal:error-raise, signal:error-boundary
skip-when: signal:client-only, signal:no-error-path-change
owns: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M16, M17, M18
```

Part of [Error policy](error-policy.md) — the agent execution contract (**C1**–**C10**), the closed category set, the registry/carrier/boundary model, the required message shape and the semantic-code rows (S1–S3) are defined there and bind every row below.

Bare-ID scope: an unlinked `C*` / `M*` / `N*` / `S*` id cited in this topic always means an error-policy row; the band that defines each one is listed once in [README.md](README.md). That list is deliberately not mirrored here — a second copy of the band map goes stale the first time a band is split or renamed, and the reader cannot tell which copy binds ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

---

## **MUST** — **M1** to **M12**, **M16** to **M18**

**M1**: For critical (`SYSTEM`) failures, capture root cause as structured context on the carrier and in logs (**M9**). Root cause is operator-facing — it reaches the API payload only per **M4**, never a `4xx` user message. A throw of a `SYSTEM` code **MUST** write its own `rootCause` sentence naming what failed, in which operation and why; the code alone is not a root cause, because the boundary then logs only the code and the operator cannot tell two throw sites apart. The sentence names the record or input involved and carries the Solution part of the Required message shape — what restores correct behaviour; an empty value, the code restated or a generic phrase is a defect. A `catch` that throws a registered code carries the caught failure's operation, key and underlying code or message in that sentence, so the crash report points at the cause without a second investigation. Review-held: whether a code is `SYSTEM` and whether a spread context already carries the sentence is decided in another file.

**M2**: Registry-coded throws set the code as the error identity (**M13**); the Required message shape (below) governs operator-facing text (rootCause / context fields and any non-coded free-text `SYSTEM` throw) — it is not a string to be parsed back into a code (**N10**).

**M3**: API error responses **MUST** include a stable machine-readable error code (string), not only a human message. The code is the registry key (**M12**), server-authoritative.

**M4**: Operator diagnostics are present in failure logs (**M9**) and MUST NOT be included in user-facing `4xx` messages. The default is to keep them off the API body. If the project contract exposes such a field for debugging, it is allowed only for an unmapped server failure behind an explicit non-production runtime condition. All user-facing messages come from the registry message key and localization layer (**M18**).

**M5**: Wrap async operations that can fail in try/catch (or language equivalent); on catch, re-raise a typed carrier (or map to API error) and let the single boundary log once (logging **M15**) — no silent swallow on critical paths.

For an external read, keep the provider call inside its retryable/unavailable catch, then validate and map returned rows outside that catch. A malformed row is a server contract failure, not evidence that the provider was unavailable; returning an empty result for it hides a `SYSTEM` error. This is review-enforced: syntax cannot identify which mapper checks the row contract or which catch denotes provider availability.

**M6**: After data retrieval (find*, get* that may return null), the caller **MUST** check null/undefined and throw with Required message shape if missing data is invalid for the operation — no defaulting with ?? / || to fake data.

**M7**: Decision / validation functions **MUST NOT** return null/undefined to mean failure — they **MUST** return an error string or throw per decision functions (validate* null = valid per V1 there).

**M8**: Retrieval functions MAY return null when no row exists; callers **MUST** handle per **M6**.

**M9**: At the single boundary, log failure paths with logger including rootCause and, where your logging schema defines it, solution (or equivalent keys) per logging policy (**M7**, logger.error minimums **M12**). Log payload is not required to mirror every API response field.

**M10**: Callers of validate* that receive a non-null error string **MUST** either throw with Required message shape or map into the documented API validation response — silent success after a validation error is forbidden.

**M11**: API error JSON **MUST** use only property names and required/optional flags defined in the shared contract (OpenAPI / shared types). Do not add wire fields that the contract does not define.

**M12**: One error registry MUST be the sole authority for each code’s facts: HTTP status, category, message key, and retryability. There is exactly one such registry for each backend error contract; parallel per-domain status maps or code-group tables are forbidden (SSoT — one authority per datum).

An unregistered code family does not merely go unenforced — it manufactures its own bypass, and it blinds the check that would catch it. Because the typed carrier accepts only registry keys (**M14**), a code that is absent from the registry *cannot* be raised into the boundary at all; every caller needing it is forced to hand-write a status and envelope, which is precisely what **M16** forbids. The omission therefore *produces* the violation instead of merely tolerating it, and the parallel constant holding those codes reads as documentation while functioning as the second authority this row bans. The same membership is the input of any mechanical check on this class: a rule asking "is a registered code being returned by hand?" is silent on an unregistered family, so a zero finding there measures the registry's emptiness, not the call site's cleanliness — treating that zero as coverage is the circular measurement [**FP-MS9**](../false-positive/mechanism-selection.md) warns about. Registering the family is what arms the check, so the order is fixed: register first, then convert the call sites, then delete the constant in the same change ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

Registration is per-member and evidence-bound, in both directions. A member that is raised today is registered with the status it is measured to return now; changing that status is a separate, separately-justified decision, because published clients may branch on the status rather than on the code. A member with no producer at all is not registered on the way out: a code the server cannot emit has no facts to record, and inventing a status for it would fabricate the very authority this row protects — it is removed instead, with its deadness proven by the absence of an emitting path rather than by a source-tree search ([**DCD-M8**](../dead-code/dead-code-rules.md) governs the wire question; a value no server path can produce never reached a client). Classify the members one at a time: a family that looks uniformly caller-caused usually is not (**M33**).

A typed carrier **MUST NOT** accept the HTTP status as a constructor argument. A carrier that stores a semantic code and accepts its status from the call site creates two authorities for one fact. The same code could then produce different statuses at different raise sites, splitting the wire contract and making the code impossible to represent accurately in one registry row. The carrier takes the code and reads its status from the registry. An optional status parameter with a registry fallback is the same second writer and is forbidden. A carrier holding an externally observed status is different: it carries no semantic code, so the status is a measured fact rather than a decision. This distinction is decidable from the carrier’s syntax and may be enforced by a focused static check that covers constructor properties, object parameters, and destructuring forms.

The lock **MUST** cover every spelling of the same second writer. A predicate limited to a constructor-body assignment misses parameter properties, object-parameter member reads, and destructured constructor arguments. Check each syntax form independently. A zero baseline proves only that the measured forms are absent, not that the carrier is fully protected; document any syntax the check cannot follow.

A consumer that branches on error codes **MUST** type its code set from the registry’s code type, not as a bare string set. Otherwise an unregistered literal can never match an envelope yet remains as a silent parallel classification authority. In TypeScript, for example, expose the set as `ReadonlySet<string>` while constructing it from `new Set<RegistryCode>([...])`; use the equivalent registry-derived type in other languages. Prefer type checking over a separate lint or cross-file guard when the compiler can enforce membership.

**M16**: Exactly one boundary handler **MUST** convert a thrown error into the API response, deriving `httpStatus`, `category`, `severity`, and `retryable` from the registry. Controller validation/authentication/not-found branches — including defensive branches believed unreachable after middleware — **MUST** raise a registered typed error into that boundary; they may not write a local error status/envelope that bypasses trace id, i18n, category, and the single log. An unknown / unmapped code **MUST** resolve to `SYSTEM` → `500` → error log → crash reporting (fail-loud default; **N1** / **N2** aligned).

**M16** framework error-handoff clarification: A framework's error handoff may also carry continuation/routing control signals. An unknown thrown value must never be forwarded into that protocol unchanged when it is not an Error carrier: falsey values or reserved route-control strings can turn a failed authentication boundary into normal continuation, so the global SYSTEM classifier never sees the failure. Preserve genuine typed/SDK Error carriers and registered domain codes; normalize an unclassified non-Error throwable to the existing registered internal/SYSTEM carrier with only code-owned context and safe structural identity, never its raw value or a copied message/cause. This is held by the carrier API and boundary review; no separate mechanical fence is admitted.

A shared helper that accepts status, code, or envelope fields and writes an error response is a second boundary. It owns registry decisions the canonical handler must make and can bypass trace IDs, category, retryability, localization, and the single structured log. A valid helper may enrich context and then delegate to the canonical boundary; it must not select status or construct the response envelope. Enforce or review the shape that carries those decisions, including a conditional expression that selects between statuses and values passed as parameters.

**M17**: The boundary handler **MUST** attach a correlation / trace id to the error response, and the same id **MUST** appear in the failure log (logging policy) and in any crash-reporting event — one id correlates client ↔ log ↔ crash report.

**M18**: The boundary handler **MUST NOT** itself throw. Resolving the user message (`messageKey` → i18n) **MUST** be wrapped so a missing / failing translation falls back to a generic message instead of raising.
