# Enforcement architecture — anti-patterns learned (normative)

```kit-cover
type: normative
part-of: README.md
binds: the enforcement shapes that must not be built or kept, each with the failure mode it produced
open-when: shape:mechanical-enforcement, signal:new-lint-rule, signal:new-guard, signal:ci-pipeline, signal:kit-rule-change
skip-when: signal:no-enforcement-change
owns: ENA-N1, ENA-N2, ENA-N3, ENA-N4, ENA-N5, ENA-N6, ENA-N7, ENA-N8, ENA-N9, ENA-N10, ENA-N11, ENA-N12, ENA-N13, ENA-N14, ENA-N15, ENA-N16, ENA-N17, ENA-N18
```

**Keywords:** rule per incident, rule family, table-driven rule, rename bypass, shape lock, suppression-heavy rule, typed lint cost, formatter in linter, generated index churn, serial gate, flat config option replacement

Scope

- Included: The **MUST NOT** rows for rules, guards and gate pipelines, each with the failure mode it produced when it was built. They are the negative side of the admission test in [enforcement-admission.md](enforcement-admission.md) (**ENA-A1**) and of the authoring rows in [enforcement-authoring.md](enforcement-authoring.md).
- Excluded: The positive obligations (sibling parts of this topic); suppression form ([**ENA-G5**](enforcement-authoring.md)) and false-positive handling ([**FP-N19**](../false-positive/guard-runtime-rules.md)).
- Document type: Normative — **ENA-N1**–**ENA-N18**.

Binding principle: Every row below was built, measured and paid for before it was written here. A new check that takes one of these shapes is rejected at review; an existing one is a removal or merge item ([**ENA-GV4**](enforcement-admission.md)).

References: [README.md](README.md); [enforcement-admission.md](enforcement-admission.md); [enforcement-authoring.md](enforcement-authoring.md); [enforcement-gates-and-lifecycle.md](enforcement-gates-and-lifecycle.md) (gate budgets and lifecycle); [**FP-MS10**](../false-positive/check-verification-rules.md) (single-value option replacement); [**FP-N15**](../false-positive/check-verification-rules.md) (stream-input evidence).

---

## **MUST NOT**

| ID | Do not | Failure mode |
|----|--------|--------------|
| **ENA-N1** | Write one rule per bug or incident. A fix answers with the admission test ([**ENA-A1**](enforcement-admission.md)), not with a new rule identity named after the incident. | Hundreds of single-commit rules, each guarding one historical line; most never fire again and all are maintained forever. |
| **ENA-N2** | Build a family of near-identical rules instead of one table-driven rule. "Import X only in file Y", "field F written only by W", "call C only after gate G" are each one rule with a shared table of rows, not one rule per X, F or C. A new member of an existing question is a row. | Dozens of copies of one predicate drift apart; config size, runtime and review cost scale with the number of rules instead of the number of distinct questions. |
| **ENA-N3** | Rely on a name- or shape-based matcher that a rename defeats — a function name, a variable spelling, a marker comment — where the protected fact is an identity (an import binding, a model, a field) the tool can resolve. Where only the name is available, the escape is a stated limit in the rule header. Where the protected identity is a protocol string — a cookie, header or storage key — the rule resolves it at every write sink from literals and same-file constants, and a write sink whose key it cannot resolve outside the owner file is itself a finding, so an imported constant or a variable closes the gate instead of opening it. | False confidence: the class reopens under a new name with the gate green, and reviewers stop looking because "a rule covers it". |
| **ENA-N4** | Write a rule that pins one file's current internal shape — its statement order, which argument it passes, which wiring it uses — when that file *is* the authority. | The rule fires only when someone edits that exact file, a move or second file bypasses it, and every legitimate refactor of the authority churns the rule. The single authority plus review is the protection. |
| **ENA-N5** | Keep or add a rule for a class a type, authority or runtime already makes impossible ([**ENA-A4**](enforcement-admission.md)). | Pure cost: runtime, config and maintenance for a check that can never find anything. |
| **ENA-N6** | Keep a suppression-heavy rule by silencing the code. A high suppression count is evidence that the predicate or the API is wrong: fix the predicate, or change the API so the flagged call cannot be written (rung 1 of [**ENA-P1**](enforcement-admission.md)). | A rule born with dozens of findings, all suppressed "the owner is elsewhere", which then fixed nothing — while every suppression hides the next real finding on that line. |
| **ENA-N7** | Ask the type checker before a cheap syntactic prefilter has narrowed the candidates ([**ENA-R2**](enforcement-authoring.md)). | A handful of type-aware rules dominate lint time on every file, including files that cannot contain the pattern. |
| **ENA-N8** | Run the code formatter as a lint rule. Formatting is its own cached step ([**ENA-PL2**](enforcement-gates-and-lifecycle.md)). | The single most expensive "rule" in the linter, re-run uncached on every file in every gate, for a check that has a fast standalone cached mode. |
| **ENA-N9** | Write a guard that resolves the linter's configuration per file, or re-runs the linter. | The guard re-pays the linter's largest fixed cost — configuration resolution over the whole tree — and becomes the slowest step of the guard phase. |
| **ENA-N10** | Gate on a guard that protects only documentation or bookkeeping — document size, self-description, link tidiness, identifier-index freshness, gate-membership lists, self-reported numbers. Run such a check on demand if it is useful; it fails [**ENA-A3**](enforcement-admission.md) as a gate. | Guards with no production effect sit on every commit's critical path and generate their own follow-up work. |
| **ENA-N11** | Commit a generated index or inventory that changes on almost every commit, enforced by a drift check that requires regenerating it. Derive it on demand, or compute it inside the check that needs it. | A large share of all commits touch the artefact, it causes merge conflicts between parallel branches, and authors learn a "regenerate, then restore the unrelated rows" dance. |
| **ENA-N12** | Let a byte or line ceiling on documents drive how rules are split and worded. Size is a reading-ergonomics signal for review, not a gate. | Rules banded and re-banded to fit a number, prose spent recording the arithmetic of each cut, and dozens of commits a month that exist only to make room. |
| **ENA-N13** | Run independent gate steps serially, or launch every guard at once. Independent steps run in parallel with bounded concurrency ([**ENA-PL2**](enforcement-gates-and-lifecycle.md)). | Serial: the gate costs the sum of its steps. Unbounded: the processes contend for memory and CPU until each runs two to three times slower than alone. |
| **ENA-N14** | Register one table-driven rule in several flat-config blocks with different options. For one file the linter takes the option value of the last matching block — options are replaced, not merged — so rows from the earlier block silently vanish for files both blocks match ([**FP-MS10**](../false-positive/check-verification-rules.md)(b) states the same trap for single-value keys). Register the rule once and let it read one shared table whose rows carry their own file globs. | Rows stop running for exactly the overlapping files, with no error and a green gate. The same trap applies to core restriction rules configured in more than one block. |
| **ENA-N15** | Let one suppression silence every row of a table-driven rule. Suppressions of a table rule name the row they excuse, and the rule honours only that row ([**ENA-R8**](enforcement-authoring.md)). | A line excused for row A is also excused, silently, for rows B and C added later. |
| **ENA-N16** | Verify or gate through a stream-input channel (source piped on standard input with a pretend filename). The tool may lint the file on disk instead, or match a different configuration block, skipping the custom rules scoped by file patterns — and still exit 0 ([**FP-N15**](../false-positive/check-verification-rules.md)). | A "rule fires" or "file is clean" conclusion drawn from an artefact the tool never checked. |
| **ENA-N17** | Change a gate pipeline without measuring it — its total, and each step the change touched ([**ENA-PL4**](enforcement-gates-and-lifecycle.md)). | Gate time grows by increments nobody sees until a full gate takes many minutes and agents start avoiding it. |
| **ENA-N18** | Enforce one condition with two mechanisms — a regex guard and a syntax-tree rule for the same class, or a guard re-checking what the type system already rejects ([**ENA-G1**](enforcement-authoring.md)). | The weaker copy carries the false positives and the suppressions, the stronger one carries the real findings, and both are maintained. |
