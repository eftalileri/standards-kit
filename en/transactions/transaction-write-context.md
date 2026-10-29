# Transaction write context of a shared write helper

```kit-cover
type: normative
part-of: README.md
binds: required write context and document-session agreement
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-19
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-decision-gates.md](transaction-decision-gates.md); [repository-boundary-and-atomic-claims.md](../repository/repository-boundary-and-atomic-claims.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md); [Mechanism selection — FP-MS1](../false-positive/mechanism-selection.md).

---

<a id="must"></a>

## Explicit write context — [TX-M-19](transaction-write-context.md)

**TX-M-19**: A store-writing helper reachable from a transaction **MUST** require its context: a session or a named no-transaction token. **MUST NOT** default/omit it or accept `null`/`undefined` silently. Thread it through every hop and explicitly give it to writes. A document saver compares the document-owned session with that declared context; mismatches fail loud, including a no-transaction declaration for a session-bound document. Implicit document-session inheritance or explicit `undefined` can otherwise persist a write outside the unit that later rolls back.

Required context types prevent omission. A project check, using the enforcement mechanism the adopting project documents, rejects direct opt-out arguments, including function-property calls, inside managed callbacks; record its actual scope and limits. Helpers hiding token flow remain review-held; required threading and runtime document-session agreement hold those boundaries.
