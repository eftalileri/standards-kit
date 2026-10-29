# Keeping a mandatory write surface writable

```kit-cover
type: normative
part-of: README.md
binds: the room a file must keep when another rule forces writes into it
open-when: signal:kit-rule-change, signal:standards-change
skip-when: signal:no-kit-change
owns: KIT-INV-9
```

Scope

- Included: Why a file that another rule forces writes into — a routing table every part must be listed in, a registry every authority must be recorded in, a contract file every recorded row must have a block in — must never refuse a record for size.
- Excluded: The size guidance itself ([kit-structural-invariants.md](kit-structural-invariants.md), **KIT-INV-5**); the order a writer follows when a file has grown hard to read ([kit-rule-addition.md](kit-rule-addition.md), **KIT-ADD-3**, **KIT-ADD-4**); the stated-limit form ([kit-stated-limits.md](kit-stated-limits.md)).

Binding principle: A kit that cannot be written to has stopped being a standard and become a museum. A new rule is lost the moment there is nowhere to put it; what may be written at all is [**KIT-ADD-12**](kit-rule-addition.md).

References: [README.md](README.md); [kit-structural-invariants.md](kit-structural-invariants.md) (**KIT-INV-5**, **KIT-INV-8**); [kit-rule-addition.md](kit-rule-addition.md) (**KIT-ADD-3**, **KIT-ADD-4**); [kit-stated-limits.md](kit-stated-limits.md) (**KIT-LIM-12**); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) (**SSG-M8**).

---

## Invariants

| ID | Invariant |
|----|-----------|
| **KIT-INV-9** | A mandatory write surface **MUST** stay writable: a record it is obliged to carry is never refused, shortened or moved to a foreign topic because of the file's size. A surface is *mandatory* when some other rule forces a write into it. *Reason:* a decision with nowhere to be written dies with the task that settled it. The record is written where its subject belongs; if the file has grown hard to read, it is split afterwards at a subject boundary inside the same topic ([**KIT-ADD-4**](kit-rule-addition.md)). |
