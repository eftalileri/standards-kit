# False positive prevention — rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: the definitions, output shape, failure paths, cross-standard minima and decision gates of guard false-positive handling
open-when: shape:mechanical-enforcement, signal:guard-finding, signal:new-lint-rule, signal:new-guard
skip-when: signal:no-enforcement-change
owns: FP-D3, FP-D4, FP-D7, FP-F1, FP-F2, FP-F3, FP-O1, FP-O2, FP-O3, FP-XB1, FP-XB2, GFP1, GFP2, GFP3
```

Scope: Same as [README.md](README.md) hub Scope. This file is the rule engine for guard false-positive handling.

Document type: Normative — FP-F / FP-O / FP-D / FP-XB / GFP\* rows below are binding. **FP-D1**, **FP-D2**, **FP-D5** and **FP-D6** are not defined; the gaps are never back-filled.

Parts: [README.md](README.md#topic-map). Each part's `owns:` field names its identities.

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| FP-M* | **MUST** |
| FP-N* | **MUST NOT** |
| FP-F* | Failure path |
| FP-O* | Output shape |
| FP-D* | Definition |
| FP-MS* | Mechanism selection — may this check be a guard at all |
| FP-XB* | Cross-standard local minimum |
| GFP* | Decision gate |

---

## Definitions (normative) — FP-D

| ID | Definition |
|----|------------|
| **FP-D3** | reportError means: append a record to the guard's error reporter and ensure the guard process terminates such that CI receives a non-success result (non-zero exit or documented equivalent). Console-only logging without CI failure is not reportError. |
| **FP-D4** | logIgnore means: emit a structured record per **FP-O1** at INFO or WARN (per [logging.md](guard-runtime-rules.md)); it does not satisfy reportError. |
| **FP-D7** | Line-attributable finding means a finding the check can place on one source line of the file it scanned; every other shape (whole-file absence, parity, inventory) is an aggregate finding. How each is suppressed is [**ENA-G5**](../enforcement-architecture/enforcement-authoring.md). |

---

## Output shape (normative) — FP-O

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-O1** | Every logIgnore **MUST** include these keys with non-empty values where applicable: rule (the check's rule identity), file (repo-relative or tool-native path), line (1-based integer or tool-native line id), reason (short literal explaining the allow), level (INFO \| WARN). | Reject — invalid guard output. | Static review. |
| **FP-O2** | reportError records **MUST** include rule, file, line, and message (human-readable failure). A shared runner that consumes a structured finding **MUST** preserve its message and available file/line context; generic object-to-string coercion is forbidden, and an unrecognized JSON-compatible record is serialized instead of collapsed to an implementation-default placeholder. | Bug — incomplete diagnostics. | Static review + structured-record run. |
| **FP-O3** | GFP1 false-positive evidence (PR text, ticket, or review artifact) **MUST** include: file (path), line (number or id), guard output (verbatim finding / reporter payload or copy-paste), explanation (one short paragraph: why the hit is invalid under product rules). | Reject pattern PR — GFP1 not satisfied. | Reviewer checklist. |

---

## Failure paths (normative) — FP-F

| ID | Condition | Outcome |
|----|-----------|---------|
| **FP-F1** | Context cannot be extracted (index out of range, file unreadable, lines missing). | STOP — CI **MUST** fail; must not treat line as ignored. |
| **FP-F2** | The check's predicate throws or returns an unexpected value. | ERROR — CI **MUST** fail; must not swallow exception or coerce to false silently. |
| **FP-F3** | logIgnore or reportError sink throws (I/O, serializer). | ERROR — CI **MUST** fail. |

---

## Cross-standard binding (local minima) — FP-XB

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-XB1** | SSOT table rules **MUST** align with [SSOT guard and agent](../ssot/ssot-guard-and-agent.md): no hard-coded file whitelist in the rule body; owners are row globs and a verified FP takes the row-scoped allow comment ([**ENA-R8**](../enforcement-architecture/enforcement-authoring.md)). | Bug — **SSG-G-1** / **SSG-N15** class failure. | Audit rule + table. |
| **FP-XB2** | When guard output is application logging (not just CI stdout), fields and transport **MUST** follow [logging policy](../logging-policy/logging-policy.md) for that project. | Bug — reject until aligned. | Logger call review. |

---

## Decision gates (normative) — GFP*

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GFP1 | A documented false positive exists for this finding (evidence per **FP-O3**) | **FP-O3**, **FP-N4** | Do not add an exception or loosen the check. Fix the genuine source defect; if the check itself is wrong, re-prove it ([**ENA-R6**](../enforcement-architecture/enforcement-authoring.md)) before changing it. |
| GFP2 | The condition is genuinely cross-file / cross-format / aggregate — [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md) | **FP-MS1**–**FP-MS5** | Do not write or extend the guard; use a lint rule or a row. |
| GFP3 | Every line-attributable finding (**FP-D7**) honours the suppression authority — [**ENA-G5**](../enforcement-architecture/enforcement-authoring.md)(f) | **FP-M24** | Do not ship it: an unsuppressable check leaves a confirmed false positive no legal exit. |

---

## Enforcement (normative)

- FP-M violation → bug (must fix); merge blocked when found in review or CI.
- FP-N violation → reject (change not acceptable until corrected).
- Fail-closed violation (**FP-M4**, **FP-N2**, **FP-N10**) → CI **MUST** fail.
- FP-F\* → outcomes as table above; no silent fallback.

---

## Mapping note (SSOT principles)

[SSOT principles](../ssot/ssot-principles-and-precedence.md) reference false-positive rules for annotations and guard behavior; **FP-XB1** is the local minimum.

