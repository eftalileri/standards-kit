---
name: security-finding-verification
description: Decides whether a suspected security issue is real by demanding an attacker-to-sink proof, running independent refutation, scoring confidence and severity (CVSS 4.0 plus business impact), checking exploit chains and finding every variant of the confirmed bug class. Use it on any candidate from a scanner, a review or a domain skill before it is reported, and when re-checking a fix.
---

# Security finding verification

## Purpose

Most noise in AI security review comes from reporting patterns instead of paths. This skill is the gate between "looks dangerous" and "reported": every finding leaves it as `confirmed`, `needs_validation` or `rejected`, with evidence a different reviewer can re-walk.

## When to use / not use

- Use: every candidate before it enters a report; triage of scanner output; re-check after a fix; a single suspected bug raised by a person.
- Not for: hunting new bugs (domain skills do that); "find every X" inventories (for those, list all instances and skip the confidence gate).

## Procedure

1. **Restate the claim (step 0).** In five lines: attacker (who, with what access), entry point (file:line), sink (file:line), impact (what they gain), preconditions. If any line cannot be written, stop: the candidate is `rejected` (unclear claim) or `needs_validation` with the missing piece named. Many false positives die here.
2. **Prove the path.** Walk source → each hop → sink, citing file:line at every hop. For each hop, name the strongest control on the path (validation, authz check, encoding, type guard, schema, middleware) and answer: does it run on every path to the sink, and does it fail closed? A control that can be skipped, is applied to a different field, or errors open does not count — except where a kit rule permits fail-open on purpose (a rate limiter whose action may safely proceed, kit RDS-M8); then judge the control against that rule.
3. **Check attacker control.** The input must be attacker-influenced in the deployment as configured: request data, headers, uploaded files, webhook bodies, third-party content, data another tenant or user wrote earlier (stored), LLM output. Server-generated values, operator-only config and environment variables are trusted unless the trace shows otherwise.
4. **Independent refutation.** Hand the restated claim and the trace (not your conclusion) to separate, read-only verifier contexts. Standard effort: three lenses, each defaulting to reject:
   - REACHABILITY — can the named attacker actually reach the entry and drive data to the sink?
   - IMPACT — if reached, is the gain real and as large as claimed?
   - DEFENSES — is there an effective control anywhere on the path, including framework and infrastructure?
   Each verifier must cite file:line for anything it relies on and may not invent a defense ("the framework probably escapes this" is not evidence). Tally votes by counting: 2 of 3 accept → confirmed; 1 of 3 → `needs_validation`; 0 → rejected. A split decision on a Critical/High goes to a fresh panel plus one challenger arguing the opposite. Verifiers may lower severity, never raise it.
5. **Confidence.** Score 1–10 from evidence completeness: full trace + no effective control + realistic attacker = 8–10. Report `confirmed` only at 8 or above; 5–7 goes to the needs-validation list with the exact missing evidence; below 5 is rejected with reason. Never drop a 5–7 silently. Static evidence alone never earns the label "proven"; that needs a reproducible step on a non-production environment the owner named.
6. **Hard exclusions and precedents.** Apply `references/exclusions-and-precedents.md`. Multi-tenant carve-outs there override any generic exclusion list.
7. **Chain check.** After individual verdicts, re-read the rejected and low items together. Two weak items can make one strong one (an information leak that reveals IDs plus an endpoint that trusts IDs; an open redirect plus an OAuth flow; an SSRF plus a metadata or internal admin endpoint; a missing rate limit plus a guessable code). Record a chain as its own finding with both parts cited.
8. **Severity.** Score CVSS 4.0 and always label the variant: CVSS-B (base only) unless you assessed threat (CVSS-BT), environment (CVSS-BE) or both (CVSS-BTE); include the vector string. Then add a one-sentence business impact. Tier: Critical / High / Medium / Low. Floors: cross-tenant data access, money or entitlement manipulation, account takeover and bulk PII exposure are at least High unless a cited control limits them; "unlikely" lowers likelihood in the text, not the floor. When in doubt between two tiers, pick the lower and say why.
9. **Run-to-run variance.** Treat any single AI review as one sample. For every Critical/High (and for all candidates in deep effort) do a second independent pass: fresh context or a different model, different file order. Union the candidates, verify each, and record which runs found it. Deterministic scanner hits are the backbone that every run re-checks. Persist results to a file with a stable fingerprint (rule/class + file + enclosing symbol, no line number) so later runs dedupe instead of re-triaging.
10. **Variant analysis.** For each confirmed finding, name the bug class as a searchable pattern (the syntactic shape and the semantic condition, e.g. "query built from request object without tenant filter"). Search the whole repository, count every instance, verify each with this procedure, and list them under the parent finding. Recommend one fix at the shared authority (one helper, one middleware, one schema) instead of N local patches. Ad-hoc search patterns live in scratch space outside the repo; a permanent rule goes through the project's own lint/guard process (kit ENA-A1 admission and the proof the project's policy requires). The fix of a reported class follows kit M20 in `agent-planning/agent-planning-obligations.md`.
12. **Findings from project checks.** When the candidate came from a project lint rule or guard and the verdict is `rejected`, it is a false positive of that check: kit FP-M20 decides how it is suppressed (one reasoned line, never an edit to the rule).
11. **Write the record** using `references/finding-schema.md`.

## Rationalizations to reject

| Heard | Why it fails | Do instead |
|---|---|---|
| "The pattern is dangerous, so it is a bug." | A pattern is not a path. | Trace attacker input to it or reject. |
| "This is obviously critical." | Models over-rate severity. | Score CVSS 4.0 with a vector; justify each metric. |
| "Similar code elsewhere was vulnerable." | Each instance has its own controls. | Verify this instance separately. |
| "A comment says it is validated upstream / safe." | Comments are claims, not evidence. | Open the upstream code and cite it. |
| "The framework probably handles it." | Unnamed defenses are invented defenses. | Cite the framework behavior and version, or treat as absent. |
| "The user is authenticated." | Authentication is not ownership or tenant membership. | Find the object-level and tenant check. |
| "IDs are random/unguessable." | Lowers likelihood; IDs leak via URLs, logs, exports, other endpoints. | Keep the finding; adjust likelihood with evidence. |
| "Only admins can call it." | Check how "admin" is decided and whether the role is tenant-scoped. | Trace the role check. |
| "It is only internal / behind the proxy." | Network position must be evidenced. | Cite config showing it is unreachable. |
| "The client validates it." | Clients are attacker-controlled. | Find the server check. |
| "Small diff / just a refactor." | Tiny changes remove checks. | Review at full rigor; count callers. |
| "I tried a generic payload and it failed, so false positive." | Generic payloads miss context-specific sinks. | Reason from the sink's semantics, not payload luck. |
| "No exploit scenario, but it feels risky." | Unfalsifiable. | Downgrade to a hardening note. |

## Checks

### SK-VER-01 Claim restated
- Look for: findings without a named attacker, entry, sink and gain.
- Confirm: the five-line restatement exists and matches the trace.
- False positives: none; incomplete claims are not findings.
- Kit: SEC-GC-15 (attacker, capability, added harm and verdict before any fix or dismissal).

### SK-VER-02 Complete trace with file:line
- Look for: gaps between source and sink, "somewhere" hops, guessed call paths.
- Confirm: every hop cites file:line; callers were found by search, not assumed.
- False positives: dynamic dispatch (event names, DI containers) — resolve by searching registrations.
- Kit: M13 in `agent-planning/agent-planning-obligations.md` (a brief or agent report is a hypothesis until verified against code at file:line).

### SK-VER-03 Strongest control evaluated
- Look for: verdicts that ignore middleware, schema validation, type coercion, ORM/ODM casting or infra controls.
- Confirm: the control is named with file:line and judged on "every path" and "fails closed".
- False positives: a control that exists but is mis-scoped (wrong field, wrong route) still leaves the finding open.
- Kit: SEC-GC-15 (c).

### SK-VER-04 Independent verifiers did not see the producer's verdict
- Look for: verifiers given the conclusion instead of the claim and trace.
- Confirm: verifier inputs contain no "this is a vulnerability" framing; votes counted, not summarized.
- False positives: none.

### SK-VER-05 Severity labelled and floored correctly
- Look for: unlabeled CVSS scores, CVSS 3.1 vectors, tenant/money/ATO findings rated Medium "because unlikely".
- Confirm: CVSS 4.0 variant label + vector + business impact sentence; floor rule applied or the limiting control cited.
- False positives: an effective, cited compensating control legitimately lowers the tier.

### SK-VER-06 Variants searched and counted
- Look for: a confirmed finding reported as a single instance.
- Confirm: pattern stated, search scope = whole repo, count recorded, each instance verified.
- False positives: instances already protected by the shared authority; list them as checked-clean.
- Kit: M20 in `agent-planning/agent-planning-obligations.md` (name the wrong logic, search the whole repository, count, bind every occurrence to one authority), SSG-M8 (one authority).

### SK-VER-07 Second run for Critical/High
- Look for: Critical/High resting on one AI pass.
- Confirm: an independent run's result is recorded (found / not found / found differently).
- False positives: deterministic evidence (configuration export, exposed secret) needs no second run.

### SK-VER-08 Secrets handled safely in evidence
- Look for: full secret values in findings, logs or chat.
- Confirm: masked value, file:line, what it grants, live-or-test judgment, rotation advice; liveness checked only by metadata calls the owner approved, never by using the access.
- False positives: documented placeholders (`changeme` in an example file never loaded at runtime) — but a placeholder the app falls back to at runtime is a real finding.

## Output format

One record per finding (`references/finding-schema.md`), plus a triage log: every rejected candidate with fingerprint and one-line reason, so re-runs do not re-triage it.

## Do-not-report

See `references/exclusions-and-precedents.md`. Rejected candidates go to the triage log, not the report.
