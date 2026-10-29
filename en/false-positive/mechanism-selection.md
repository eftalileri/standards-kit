# False positive prevention — mechanism selection (normative)

```kit-cover
type: normative
part-of: README.md
binds: mechanism selection, contract-file reduction and re-measured capability claims
open-when: shape:mechanical-enforcement, signal:new-lint-rule, signal:new-guard
skip-when: signal:no-enforcement-change
owns: FP-MS1, FP-MS2, FP-MS3, FP-MS4, FP-MS4a, FP-MS4b, FP-MS5, FP-MS6, FP-MS9, FP-MS8
```

Scope: Mechanism selection and reduction to the contract-producing file.

Document type: Normative part — **FP-MS1**–**FP-MS6**, **FP-MS9**. **FP-MS7** is not defined; the gap is never back-filled.

References: [README.md](README.md) — topic map; [rules.md](rules.md) — definitions, output and failures.

---

## Mechanism selection — narrow lint rule before guard (normative) — FP-MS

Purpose: Decide whether a guard may exist at all for a given check. A guard is the last mechanism, not the default one. A check reaches these rows only after passing [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) and the higher rungs of [**ENA-P1**](../enforcement-architecture/enforcement-admission.md).

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-MS1** | Decompose a check into its smallest conditions; every single-file-decidable one is a lint rule — defined by [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md). | — | See **ENA-G1**. |
| **FP-MS2** | "It spans lines / needs context / reads the whole file" is not a reason for a guard — defined by [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md). | — | See **ENA-G1**. |
| **FP-MS3** | A guard splittable into lint rules is split, as rows where they ask one question — defined by [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md) and [**ENA-N2**](../enforcement-architecture/enforcement-anti-patterns.md). | — | See **ENA-G1**. |
| **FP-MS4** | A guard holds only the cross-file residue, and a migrated condition leaves the guard in the same change — defined by [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md) and [**ENA-N18**](../enforcement-architecture/enforcement-anti-patterns.md). | — | See **ENA-G1**. |
| **FP-MS4a** | Before accepting a concern as cross-file, attempt to reduce it to the contract-producing file (for example, an exported raising function's name/signature). A canonical opaque/unique-symbol branded type that makes an invalid cross-file call fail compilation is such a reduction: a narrow single-file rule may then verify exact import/model provenance and local terminal-write dominance, while a second call-graph guard would duplicate the type authority. Only the irreducible directory/registry/parity residue belongs in a guard; the rule and guard **MUST NOT** share a condition. | Reject — premature guard or parallel authority. | Rule/guard responsibility table and source evidence, including the compiler-owned opaque contract when used. |
| **FP-MS4b** | Local declaration/callable classification and its local public export name belong only to the single-file lint rule. A cross-file guard MAY seed that local fact for downstream traversal, but **MUST NOT** emit the same local decision or carry a local-only self-check. The guard owns only relations that cross a module boundary: canonical re-export provenance, imported typed-value contracts, and cross-file public aliases. Provenance starts from an exact canonical exported binding, never a matching symbol name. For cross-file callable composites, union/conditional contracts are accepted only when every callable branch is guaranteed to satisfy them; intersections follow the callable-signature contract, and an unsupported composite that cannot be proved exactly is machine-readable UNKNOWN and fails loud instead of being flattened to weak dependency evidence. UNKNOWN is decision-bearing only when the unresolved cross-file composite is the public value's callable contract; imported data used as a function return, property, or unrelated generic argument is not a callable candidate. A statically non-callable top-level type shape (for example array/tuple, including `readonly`) or an immutable value initializer proven to be a literal/object/array removes the value from the callable worklist even when a nested/imported data type is unresolved; casts and `satisfies` wrappers do not erase that runtime value-shape proof. A local immutable alias may inherit that proof, but an unresolved/imported identifier, call, or dynamic initializer does not; direct imported callable annotations therefore remain in the worklist. Every reachable local import **MUST** resolve inside an explicit canonical source-root inventory derived from the consuming project's package/workspace/local-module authority; blanket repository-root scans and silently ignoring local imports are forbidden. Every such root is subject to the same symlink/realpath/root-containment, inventory, and resource budgets. Resolution and the iterative fact worklist carry explicit limits for directory depth, per-file and total bytes, file count, AST node/depth, import/export, edge, fact, fixpoint work, and type-graph work. Ambiguity, unresolved/path escape, symlink, export/module cycle, decision-bearing UNKNOWN, or any budget exhaustion fails loud with a named error; a file-count-derived pass fixpoint is forbidden. | Reject local guard duplication, return/property/type-argument promotion into callable evidence, weak type-evidence flattening, name heuristics, loose alias trust, file-count/pass fixpoints, blanket-root scans, ignored local imports, or unbounded traversal. | Review source roots, inventory and resource budgets; verify representative resolved and rejected cases through the consuming project's applicable verification policy (**M12**). |
| **FP-MS5** | Whether a file format is in lint scope is read from the production configuration; precision is measured whole-tree before landing — defined by [**ENA-G1**](../enforcement-architecture/enforcement-authoring.md) and [**ENA-A5**](../enforcement-architecture/enforcement-admission.md)(ii). | — | See **ENA-G1**. |
| **FP-MS6** | The verification path for an authorized rule or guard change is the three proofs — defined by [**ENA-R6**](../enforcement-architecture/enforcement-authoring.md). | — | See **ENA-R6**. |
| **FP-MS9** | Before choosing a mechanism, search existing checks by predicate, never by name, and extend a found one — defined by [**ENA-A4**](../enforcement-architecture/enforcement-admission.md). | — | See **ENA-A4**. |

---

## False positive prevention — a mechanism's claim about itself (normative)


Document type: Normative part — **FP-MS8**.


---

Parser compatibility: resolved ambient globals are not necessarily local declarations; inspect scope and declaration evidence and prove local shadows still fail. A source resolver follows compiler specifier semantics (for example NodeNext `.js` to `.ts`), measures the newly reachable graph and retires dead suppressions before claiming clean coverage.

## A mechanism's claim about its own reach (normative) — FP-MS

Purpose: This row fires at the moment an author is about to stop looking — because the guard's header says the residue is already narrow, or because the rule's header says its mechanism cannot reach the fact. A sentence that ends an enquiry is the one sentence that has to be re-derived.

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-MS8** | A mechanism's declared capability **MUST** be re-measured when extending it or relying on that declaration. For a guard, derive and record assertions whose whole input is one file's text versus relations between multiple sources; single-text helpers are **FP-MS1** candidates regardless of the header. For a rule's claimed cross-file limit, name the needed capability and search the rule tree by predicate for reusable production specifier-resolution/module-parser consumers. The subject spanning files does not prove the mechanism cannot resolve them; a found stronger lint capability forbids a guard for that residue. Existing limit prose is not evidence. | Reject self-declared residue/capability without the measured count and capability search. | Record both assertion counts, searched capability and resolving consumer file/helper or actual searched surface. A prose-claim ratchet is declined under **FP-M17**: a phrase scan cannot tell a limit claim from prose describing the healthy opposite direction. |
