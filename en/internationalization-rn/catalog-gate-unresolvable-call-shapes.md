# Catalog parity gates — the call shapes the source direction cannot resolve

```kit-cover
type: normative
part-of: README.md
binds: the two stated limits of the source-to-catalog direction -- a key assembled while the program runs, and a translator whose namespace binding is established in a different file from the call -- and what a closing check would need for each
open-when: shape:frontend-heavy, shape:full-stack, signal:user-facing-string, signal:translation-catalog, signal:new-language
skip-when: signal:no-user-facing-string
owns: none
```

**Keywords:** stated enforcement limit, unresolvable call, dynamic key, translator namespace binding, cross-file binding graph, declared limit, review-carried

Part of: [user text catalogs and parity](user-text-catalogs-and-parity.md), through [catalog gate scope and source direction](catalog-gate-scope-and-source-direction.md). **I18N-CAT-M8** itself — the rule these limits belong to, including clause (d)'s obligation to count an unresolvable call rather than skip it — is defined in that band and is not restated here, so the rule keeps exactly one definition site ([**KIT-INV-3**](../authoring/kit-structural-invariants.md)).

References: [catalog gate scope and source direction](catalog-gate-scope-and-source-direction.md) (**I18N-CAT-M8** — the rule whose clause (d) these limits belong to); [user text catalogs and parity](user-text-catalogs-and-parity.md) (**I18N-CAT-M4** — the parity obligations the source band scopes); [README.md](README.md); [mechanism-selection.md](../false-positive/mechanism-selection.md) (**FP-MS1** — a limit that closes only by a product change is not a gate change); [kit-structural-invariants.md](../authoring/kit-structural-invariants.md) (**KIT-INV-8**); [kit-stated-limits.md](../authoring/kit-stated-limits.md) (**KIT-LIM**-* — the kit's own stated limits, and the shape a stated limit takes).

---

## Stated enforcement limits — the two call shapes the source direction cannot resolve

Clause (d) requires both of these to be counted rather than assumed, and neither is decided by any check in this family. They are different questions and they close differently, so a single sentence covering "unresolvable calls" would hide one behind the other.

1. The key is assembled while the program runs. What a closing check would need: a binding from the call site to the catalog entry the assembled key resolves to — either a value-tracking analysis able to enumerate every string the expression can produce across the whole program, or a call contract narrow enough that the key is a literal again. Why an adopting project may not have it: the operands are ordinary program values — an enum member, a database field, a function result, a branch — so enumerating them is a whole-program question, and the catalogs carry no reverse index from a key prefix back to the calls allowed to complete it. Narrowing the contract is a product change to the calling code, not a gate change, and it is the only route that converts this population into one a single file's syntax tree can decide ([**FP-MS1**](../false-positive/mechanism-selection.md)).

2. The translator's namespace binding is established in a different file from the call. Where a client translator is produced by a hook and then passed onward — as a parameter, a prop, or the return of a screen hook that lives beside the screen rather than in it — the call site does not say which namespaces its lookup will search, so the same literal key is resolvable in one binding and not in another. What a closing check would need: a cross-file binding graph from each call's translator back to the expression that produced it, which is an inter-procedural question a per-file reader cannot answer; the alternative is the same product route as (1) — an explicit namespace at every call, making the binding local. Why this shape is the larger half in practice: the composing screen hook is the normal shape, not the exception. 

