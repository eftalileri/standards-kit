# Monorepo — cross-repository contract mirror rules

```kit-cover
type: normative
part-of: README.md
binds: how a cross-repository contract mirror is inventoried, classified, compared and ratcheted without publishing a false green
open-when: signal:workspace-boundary
skip-when: none
owns: MRP-M17
```

Scope: The cross-repository mirror case left outside
[monorepo-rules.md](monorepo-rules.md): one repository cannot import the other
at compile time, so a blocking gate must compare their declared contracts without
turning the checked-out sample into the supported contract universe.

Document type: Normative part — **MRP-M17**.

Admission first: **MRP-M17** governs how a mirror gate is built once [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) admits it; it does not admit one. A mirror whose drift harms only an internal operator surface, and whose request direction the authority already rejects at runtime, is declined and carries a written manual sync procedure instead ([**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)). The gated mirrors are the ones with user-visible or compliance impact.

References: [README.md](README.md);
[monorepo-rules.md](monorepo-rules.md) (the shared-package, wire-compatibility
and boundary prohibition sibling rules);
[check-design-rules.md](../false-positive/check-design-rules.md)
([**FP-M18**](../false-positive/check-design-rules.md), staged ratchet;
[**FP-M19**](../false-positive/check-design-rules.md), fail-loud derived inputs);
[check-verification-rules.md](../false-positive/check-verification-rules.md)
([**FP-M20**](../false-positive/check-verification-rules.md));
[ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md)
([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

---

## **MUST**

| ID | Rule |
|----|------|
| **MRP-M17** | A cross-repository contract-mirror gate **MUST** derive membership from the mirror’s compiler project plus its real source tree, and **MUST** classify every discovered declaration before comparison. The canonical identity is the pair *(declaring path, symbol)* — a name alone aliases unrelated declarations, while file hash/text equality freezes layout rather than contract. One declarative project mapping is the sole authority for three disjoint classes: mapped (an exact authority path, authority symbol and relation), local (a written non-mirror reason), and pending (an exact staged-ratchet debt identity). The gate fails on an unlisted new identity, a stale or duplicate record, an unreadable member, unresolved path/import/symbol, an empty derived set, or a pending count/digest mismatch; it never constructs success by intersecting configured and discovered sets. The pending ceiling lives outside the bounded data and only decreases ([**FP-M18**](../false-positive/check-design-rules.md)). Comparison follows the wire direction: closed enum/set authorities are exact unless an explicitly-directed subset is the contract; a response passes only when every producer value is accepted by the consumer type; a request passes only in the reverse direction. Unresolved `any` or `unknown` is a failed comparison, never compatibility. CI checks out the compiler config, manifest and complete governed source subtree at an immutable revision, and reports the actual read denominator plus mapped/local/pending/drift counts. Where pull requests or reverse-repository changes cannot supply that private revision, the gate states that reachability limit at the runner/check rather than treating “not measured” as clean. A user-visible text or visual token that two client surfaces in different repositories both show **MUST** have one authority in one repository and reach the other only through a mirror of this kind (never a hand-written second copy), because two hand-kept copies drift until the same screen reads or looks different per surface. [Consequence: a green mirror gate can otherwise mean only that its hand-list omitted the new contract, that one repository was unavailable, or that a consumer rejects a value the type-name comparison called equal.] [Verify: real-tree inventory/config partition with zero new/stale/duplicate/unresolved; directional nullability and set probes; whole-scope negative run; binding proof at the blocking CI command. No source file is executed.] |
