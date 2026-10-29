# False positive prevention — guard runtime rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: fail-closed exits, line-attributable suppression evidence, context windows and structured ignore logging
open-when: shape:mechanical-enforcement, signal:guard-runtime, signal:suppression-review, signal:new-lint-rule, signal:new-guard
skip-when: signal:no-enforcement-change
owns: FP-M4, FP-M24, FP-N2, FP-N3, FP-N4, FP-N6, FP-N7, FP-N10, FP-M21, FP-N16, FP-N19
```

Scope: Fail-closed execution, visible ignore records and suppression form.

Document type: Normative part — **FP-M4**, **FP-M24**, **FP-N2**–**FP-N4**, **FP-N6**, **FP-N7**, **FP-N10**. **FP-M1**–**FP-M3**, **FP-M5**–**FP-M16**, **FP-N1**, **FP-N5**, **FP-N8**, **FP-N9**, **FP-N11** and **FP-LC1** are not defined; the gaps are never back-filled.

References: [README.md](README.md) — topic map; [rules.md](rules.md) — definitions, output and failures.

---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M4** | A check fails closed and leaves an audit trail. Every finding makes the check's process exit non-zero (**FP-D3**). A finding is excused only by an inline reasoned suppression or a configured aggregate exception, and every excuse emits an ignore record (**FP-O1**) that stays visible in the output and through any runner that consolidates it. A check error — unreadable input, a predicate that throws, a sink that fails — fails the run and is never swallowed or turned into zero findings (**FP-F1**–**FP-F3**). Reason: a green exit must mean "measured clean", never "did not run" or "silenced unseen". | CI **MUST** fail; a check that can pass silently is a bug. | Run the check on a real violation and see a non-zero exit; read its ignore records in the consolidated output. |
| **FP-M24** | Suppression form — defined by [**ENA-G5**](../enforcement-architecture/enforcement-authoring.md); its lettered clauses (a) placement, (b) attribution, (c) reason are cited under this identity. | — | See **ENA-G5**. |

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N2** | Skip a finding without an applicable suppression or exception, or without emitting its ignore record (**FP-M4**). | CI **MUST** fail — reject. | Review of every skip branch. |
| **FP-N3** | Emit an ignore record without level or without any **FP-O1** key. | Reject. | Read the emitted records. |
| **FP-N4** | Widen an exception or loosen a predicate to silence noise without GFP1 evidence. | Reject. | PR review. |
| **FP-N6** | Swallow an exception thrown by a check's predicate (**FP-F2**). | CI **MUST** fail. | Try/catch audit. |
| **FP-N7** | Use console output as the sole signal of a finding without a non-zero exit (**FP-D3**). | Reject. | Exit-path review. |
| **FP-N10** | Treat an INFO/WARN ignore record as a substitute for failing on a finding. | CI **MUST** fail. | **FP-M4**. |

---

## False positive prevention — context windows and path exemptions (normative)


---

## Context windows (normative)

- A window bound is INCLUSIVE at both ends, and the contract is restated where it becomes a slice. `{ before: b, after: a }` at line `i` means the closed range `[i - b, i + a]` — `b + a + 1` lines, the flagged line included. Slice/substring primitives take an exclusive end, so the conversion is `slice(i - b, i + a + 1)`; writing `slice(i - b, i + a)` silently yields `a - 1` following lines. A bound stated only in a doc comment, a field name or a description is not a contract — it is restated at the conversion site.
- A range bound is proved AT the bound, never from a specimen inside the range ([**ENA-R6**](../enforcement-architecture/enforcement-authoring.md); form-set discipline: **FP-M26**). Place the decisive text at exactly `i ± bound` and again one element beyond it, and show the predicate's answer changing across that step. A bound no run ever crossed is an assumed bound.
- Both directions a context window feeds fail silently. An exemption window (an allow-marker) that is one element short withholds an exemption the code has earned, and the suppression line written in answer then swallows the next genuine finding there. A narrowing window ("fire only if the context also shows X") that is one element short drops a real finding with no trace. When a bound is corrected, both counts are reported: findings moved and exemptions moved.



---

## Path exemptions (normative)

A check **MUST NOT** test the scanned file's path against a list naming project source files or components. A branch reading *"if the path is one of these files, this is a false positive"* is the bypass the false-positive policy forbids in its most durable form ([**FP-M32**](check-verification-rules.md), [**FP-M33**](check-verification-rules.md)): it silences every later finding of that check in those files, including ones nobody has written yet. Membership read from a path is legitimate only where it derives from structure — a directory, a declared naming convention, an extension — never from identities. A confirmed false positive belongs on the finding's own line as an inline, reasoned suppression ([**ENA-G5**](../enforcement-architecture/enforcement-authoring.md)).

A name-list exemption is LATENT, so a clean tree is not evidence that it is harmless. It fires only for a file that would *otherwise* be a finding and leaves no trace on a green run. The only measurement that reveals it is differential: restore a genuine defect of that check's own class in one of the named files, then run the check with and without the branch. 

A literal-shape path-exemption check is declined under FP-M18: literal path-shaped sets also include legitimate authority-symbol sets, and the check would need scope resolution to distinguish path matching from content matching.

---

## False positive prevention — guard logging (normative)


---

## Levels for logIgnore (normative)

| Level | Use |
|-------|-----|
| INFO | Expected suppression or configured exception |
| WARN | An excuse the check itself flags as weak and wants reviewed (the check's source states when) |

ERROR **MUST NOT** replace failing on a finding (**FP-M4**) — **FP-D3** reportError is the failure path; optional ERROR-level diagnostic lines may accompany reportError per project policy without violating **FP-N7**.

---

## Field population (**FP-O1**)

| Key | Rule |
|-----|------|
| rule | The check's rule identity |
| file | Path as scanned by guard |
| line | Integer ≥1 |
| reason | Short literal ≤ 200 characters (hard cap for CI log size) |
| level | INFO \| WARN |

Optional keys (**MUST NOT** replace required keys): pattern (substring), contextSnippet (truncated, ≤ 200 chars) — if present, must not contain secrets.

| Key | Rule |
|-----|------|
| correlationId | Optional; recommended when guard runs inside a CI job that emits multiple log lines — same id on all records for one guard invocation (string ≤ 64 chars). |

---

## Automated and remote logging sinks

When logs are ingested by a remote service or shared CI system, **MUST** use structured one-line records or the consuming project's logger per [logging policy](../logging-policy/logging-policy.md) (**FP-XB2**).

When a shared runner consolidates a child's structured ignore records, it retains the emitted `rule`, `file`, `line`, `reason` and `level`, with any additional supplied context, in both its persistent result and its human-readable report. INFO/WARN ignore records are audit outcomes; they are not added to error/warning finding counts and do not change either reported-finding or process-exit failure authority. The producer supplies a valid **FP-O1** record under the existing level/field/length contract; the runner forwards that carrier without a new severity map, token parser, reason truncation or placeholder coercion. Existing child summary carriers may have different established names; consolidation retains their records rather than recomputing the allowance from source. A child that reports real errors also supplies its existing structured error carrier so aggregation preserves the original message and available location (**FP-O2**). Process failures and reported findings remain independent fail-closed outcomes; a recorded ignore cannot turn either into success.

---

---

## False positive prevention — suppression and exemption evidence (normative)


Document type: Normative part — **FP-M21**, **FP-N16**, **FP-N19**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M21** | A suppression reason **MUST** be verified against its current referent. (a) Open the delegate, caller, schema or validation it names; an unread referent leaves a real finding. (b) Confirm the mechanism rejects the unauthorized actor class with the writer's criterion, rather than narrowing records, resolving/classifying an actor or enforcing a business rule. (c) Re-read inherited reasons and producers; another check's adjudication, a plan or an earlier review is not transferable evidence. If the producer no longer does what the reason claims, fix the genuine finding at its source and delete the suppression; rewording the reason is not a repair. This is the same proof required by any claim that protection exists. | Reject the unverified suppression; its finding stands and conclusions relying on it are void. | Record current referent file:line and the actor-class rejection, not a narrowing clause; for inherited reasons state when it was read and what the producer now emits. |

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N16** | Treat a suppression as settled because it carries a written reason; accept a reason without opening the referent it names; or accept the presence of a mechanism (a scope/record filter, a resolver or classifier call, a delegated helper, a business-rule check) as proof that the mechanism rejects the unauthorized actor class (**FP-M21**). | Reject — the finding stands; conclusions drawn from the unverified reason are void. | Referent opened and the rejection quoted, or the suppression is removed and the code fixed. |
| **FP-N19** | Silence a cross-file or aggregate finding by editing the check's own configuration. A mirror, registry-parity, enum-parity or inventory check has no single source line, so it cannot be suppressed inline — its exceptions live in its own config or registry by design. That mechanism exists for a declared, structural exception (something genuinely outside the contract), never for a finding that is true: adding an entry to turn today's red green is the same violation as editing the rule to special-case it (**FP-M20**(b)), one indirection further from review. A genuine aggregate finding is fixed at the two sides it compares. Where the exception really is structural, the config entry carries the same reason a line suppression would (**FP-M24**), and the exception set only shrinks (**FP-M18**). | A parity check that no longer compares the thing it is named after — and a drift CI now certifies as intended. | Review: for every entry in an aggregate check's exception config, name the structural reason and when it was added; an entry whose reason is "the check was failing" is a violation. Static: each aggregate check's exception set is smaller than or equal to its previous state. |

---

## A suppression closes a finding — it does not replace one (reading aid for **FP-M18** (b) / **FP-M21**)

A check that resolves an inline suppression at candidate discovery — before computing whether
that candidate would produce a finding at all — does not silence a finding; it removes the point
from analysis. The exit code then cannot separate "the token closed a real finding" from "this
point was never measured", and the day the underlying code changes (a helper gains a throw, a field
gains a second writer) every suppressed point stays silent by construction. Resolve the token
after the finding is computed, and record which finding it closed, so the written reason is
falsifiable by the record rather than believed.

Two per-line consequences of rules already stated. (a) A token closing no finding is a
dead exemption and **MUST** fail the check, forcing its removal — **FP-M18** (b) at line
granularity; otherwise a renamed call or repaired helper leaves a token that pre-authorizes the
next, unrelated finding there. (b) Inline suppressions are an exemption baseline: count the
load-bearing ones under a ceiling constant in the check's own source (**FP-M18** (c)).
