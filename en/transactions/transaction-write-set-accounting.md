# Write-set accounting of a shared write helper

```kit-cover
type: normative
part-of: README.md
binds: writer-owned counting and required aggregate accounting context
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-21
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-write-context.md](transaction-write-context.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md); [Mechanism selection — FP-MS1](../false-positive/mechanism-selection.md).

---

<a id="must--tx-m-21"></a>

## Writer-owned accounting — [TX-M-21](transaction-write-set-accounting.md)

**TX-M-21**: A shared writer in an accounted transaction **MUST** count its own persisted documents; callers **MUST NOT** duplicate that count.

- (a) Count in the write authority so every caller inherits the same accounting.
- (b) Require the accounting handle and a named opt-out token. Opt-out is legitimate only where no such accounting exists, including a helper's independent own-session path.
- (c) Count before the first persisted write. Entry upper-bound preflight and terminal actual accounting are successive obligations: neither replaces the other.

The type system prevents omitted handles. A project check, using the enforcement mechanism the adopting project documents, rejects passing the named opt-out while holding the handle (record its actual scope and limits); `handle ?? TOKEN` binds opt-out to genuine absence. It reads enclosing parameters/local declarations rather than recreating lexical-scope authority. A hop that accepts no handle hides downstream opt-out, so require threading through every hop. Bare document/model writes are outside the token predicate: holders persist through the one saver accepting the handle, whose count-or-bare-save branch has one owner.
