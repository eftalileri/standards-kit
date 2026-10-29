# Serializing operations on one transaction session

```kit-cover
type: normative
part-of: README.md
binds: the TX obligation that operations issued on one transaction session run strictly one after another — why concurrency on one session is a deterministic start conflict that no runner retry can repair, why the rule binds a session-accepting helper as much as the unit's owner, and the stated limit of its single-file fence
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-15
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-callback-failure-and-retry.md](transaction-callback-failure-and-retry.md); [transaction-write-context.md](transaction-write-context.md); [transaction-read-session-join.md](transaction-read-session-join.md); [Mechanism selection — FP-MS1](../false-positive/mechanism-selection.md).

---

<a id="must"></a>

## Session serialization — [TX-M-15](transaction-session-serialization.md)

**TX-M-15**: Operations sharing a database transaction session **MUST** be awaited serially. Promise combinators, fan-out and fire-and-forget **MUST NOT** concurrently use that session. Helpers accepting an optional session serialize when present; sessionless or distinct-session work may run concurrently.

A type-aware single-file check, using the enforcement mechanism the adopting project documents, resolves session types in direct branch arguments/object properties and fan-out, respecting flow narrowing when the session is absent. Callee-hidden work, closure-captured sessions outside the branch and missing type information remain review-held; record the check's actual scope and limits, since a reference to a check is not evidence that it exists or covers the full rule.
