# Transaction decision gates

```kit-cover
type: normative
part-of: README.md
binds: TX-G decision gates for deciding transaction necessity, one-session participation and lifecycle ownership
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-G1, TX-G2, TX-G3
```

Part of [the topic index](README.md).

---

## Decision gates

**TX-G1**: Proceed only if YES -> Does the business operation require more than one persistent write, or a read-then-write pair that must not interleave with other commits as seen by this aggregate? [Binding: TX-M-6, TX-N-5] [If NO: Use single repository call or non-transactional read/write as appropriate; do not open a transaction for cosmetic grouping]

**TX-G2**: Proceed only if YES -> Will every participating repository call in this unit receive the same session instance (or documented equivalent single context)? [Binding: TX-M-2, TX-M-3] [If NO: STOP; refactor call chain before merge]

**TX-G3**: Proceed only if YES -> Is transaction lifecycle (start/commit/abort/end) owned only by the service layer or a service-invoked helper in the same process? [Binding: TX-M-1, TX-N-1] [If NO: STOP; move lifecycle out of repository/route]

---

## Binding reading of TX-G1

These clauses apply TX-M-6, TX-N-5, TX-M-9, TX-M-12, TX-M-13 and TX-M-10; they create no further identity.

Name the business unit from its domain rule and published response contract before answering TX-G1. A genuinely independent per-element batch remains a loop over atomic units with reported element failures; wrapping it in one transaction would remove its shipped independence guarantee. Request repetition is separately governed by idempotency. A domain rule that fixes all-or-none, such as PAY-M14 exact financial settlement, decides the unit even where a shipped endpoint incorrectly promises partial outcomes: [KIT-PRE-2](../_meta/precedence.md) definition ownership resolves that collision. Transaction lifecycle, session, budget, sealing and callback obligations still apply to that unit. Correct the defective response contract with released-client discipline; do not keep partial commits merely because the old response had per-item fields.

Measure the client's surviving branches before declaring a wire migration. Where fields stay and all-success/all-failure branches remain correct, making partial success unproducible needs no client change; a field change/removal or harmful surviving client action does. Preserve the selection on a rejected all-or-none batch. Decide every read-provable rejection before the first write; remaining write-time failures require the atomic boundary. Unreachable per-element copy is only a confirmed dead-code candidate.

A read/derive/write confined to one document may use TX-M-9's exact conditional update instead of a transaction: reassert the observed version/length/balance and reject a miss. It is atomic at the document level; TX-N-5 prohibits a cosmetic session. Multi-document units require the transaction.

Count idempotency completion as a participant when the effect lacks independent durable dedupe. Classify each effect, rather than each guarded route, by its unique natural key, conditional write, transactional anchor or terminal-state proof. With independent dedupe, transport control is advisory; without it, effect and control completion **MUST** commit together or neither may commit (TX-M-4/M-10). A post-response finish hook is not that guarantee. Bound completion payload before opening the unit (TX-M-13); its failure must not introduce an unbounded storage limit into the business write. Commit before sending; if a framework cannot offer pre-wire capture, explicitly name that ordering gap.

When TX-G1 is YES but irreversible outbound effects (TX-M-12) or write-set budget (TX-M-13) prevent one transaction, use one server-owned forward-repair orchestrator:

- One request/endpoint owns the whole sequence, rather than an abandonable client loop.
- Each retry re-derives remaining work from its authority and each step is idempotent; irreversible progress is repaired forward, not compensated.
- Failure after irreversible progress raises its own registered partial-progress code with progress; failure before progress preserves the original carrier. Atomic sub-units retain their own TX-M-1 owner without a second session wrapper.

The broad loop/try/await syntax fence was declined because both its broad loop/try/await form and catch-push narrowing flagged legitimate independent fan-outs, operator migration or read-only planning (ENA-A1 false-positive condition). Boundary-owned logging, registered-code types and locale coverage retain their existing checks.
