# Transaction callback attempt state and permanent enqueue conflicts

```kit-cover
type: normative
part-of: README.md
binds: attempt-local callback state, repeatable outbox payloads and driver attempt identity
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-16, TX-M-17, TX-M-18
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-callback-failure-and-retry.md](transaction-callback-failure-and-retry.md); [transaction-session-serialization.md](transaction-session-serialization.md); [repository-atomic-claims.md](../repository/repository-atomic-claims.md); [repository-boot-readiness-prerequisite-proof.md](../repository/repository-boot-readiness-prerequisite-proof.md); [registry-cause-permanence-fact.md](../error-policy/registry-cause-permanence-fact.md); [Check verification](../false-positive/check-verification-rules.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md).

---

<a id="must"></a>

## Attempt state and enqueue — [TX-M-16–18](transaction-callback-attempt-state.md)

**TX-M-16**: Callback-mutated state **MUST** be attempt-local; captured inputs are read-only. Build fresh per-attempt bindings/copies/session reads and publish only the returning attempt. Publication may return the result or overwrite an outer binding on every completing attempt, with no earlier callback read of that binding; an unconditional final-statement assignment is the clearest form. A first-statement reset followed by an attempt failure marker is also permitted. Outer reassignment is accumulation if its RHS reads itself or a variable condition can skip it.

A focused single-file rule, using the enforcement mechanism the adopting project documents, covers managed driver/project callbacks in application and migration trees. It rejects outer-root increments, compound assignments, deletes, mutating collection calls, `Object.assign`, self-reading assignments and property writes skipped by a completing attempt or read earlier. Trees where the rule is disabled wholesale require an explicit scope boundary, recorded with its actual scope and limits. Conditional variable reassignment, aliases, imported state and mutations hidden in helpers remain review-held. Re-read a captured record on-session after a callee changes it.

Captured hydrated documents are state too: `save()` consumes modified paths; ODM callback-throw restoration does not restore a transient commit failure, and deep copies may break owner links. Read anew on the session each attempt, applying prepared plain path/value edits. The rule covers outer save receivers, captured `this` and outer-collection `for…of`; parameter-saving helpers require call-graph review.

A callback marker names its last RUN attempt, not the last OPEN attempt. A runner may refuse a retry before invoking/resetting the body. Post-runner claim fate **MUST** read its classification first: unknown commit keeps; proved rollback/refused attempt/exhausted transient/body carrier releases; only raw commit-step driver failure falls back to the marker. One shared predicate owns each claim type, and the managed-transaction runner declares a pre-body refusal.

**TX-M-17**: A natural-key outbox enqueue **MUST** use a key whose every emission has the same payload. A different payload under insert-only key+digest upsert causes permanent unique-key abort, rather than transient retry. Admit only (a) a registered proof that the emitting branch is unreachable for every current caller, or (b) an event/CAS-transition epoch key. Remove emissions on unrelated later writes. Until admission holds, retain after-commit dispatch with its declared crash gap rather than trade it for permanent domain abort. The registry lists producers and variable payload fields per key. Payload variance/event meaning are runtime facts; named resolver/provider-call syntax fences do not establish admission.

**TX-M-18**: Attempt identity **MUST** use a documented driver surface where available. If only an undocumented internal exposes it:

- (a) Exactly one module reads and shape-validates it; all consumers call that module.
- (b) Missing/reshaped fields raise the module's registered dependency defect (a system-class, non-retryable defect) with observed shape, never surrounding business mismatch or permissive fallback.
- (c) Startup measures the idle→new-attempt transition, with no driver command or mutation. Mere field presence is insufficient because lazy transaction numbering can still name the previous attempt. A guarantee affecting only part of traffic reports through the error/alert channel rather than take down the whole traffic gate.

One module owns the reader/probe. Any fence on foreign reads of the internal uses only distinctive internals excluded by installed published types, never common names; a reference to such a check is not evidence that it exists or covers the full rule. Computed/destructured/dependency-wrapped reads remain review-held; upgrades recheck transition meaning and newly available documented equivalents.
