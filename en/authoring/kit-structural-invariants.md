# Structural invariants of the standards kit

```kit-cover
type: normative
part-of: README.md
binds: the structural invariants every kit change must leave intact, each with the measured failure it prevents
open-when: signal:kit-rule-change, signal:standards-change
skip-when: signal:no-kit-change
owns: KIT-INV-1, KIT-INV-2, KIT-INV-3, KIT-INV-4, KIT-INV-5, KIT-INV-6, KIT-INV-7, KIT-INV-8
```

**Keywords:** kit invariant, rule identity, hub vs part file, file size guidance, directory depth, portability, stated limit

Scope

- Included: The invariants that every addition, change, move or deletion in this kit must leave intact — where a rule may be defined, how many files may define one identity, how another file's rule is cited, which identifier sets are frozen, the file size guidance, tree depth, bare identity families, and the portability plus stated-limit obligations every rule carries.
- Excluded: The steps of adding a rule ([kit-rule-addition.md](kit-rule-addition.md), the KIT-ADD family); changing, moving or deleting a rule and its mechanical fence ([kit-rule-change-and-enforcement.md](kit-rule-change-and-enforcement.md), the KIT-CHG, KIT-ENF and KIT-LIM families); what a rule says, which belongs to the topic that owns it.
- Document type: Normative — the KIT-INV invariant family.

Binding principle: These are not style preferences. Each row names the measured failure it prevents, and breaking one reproduces that failure — usually invisibly at review time and expensively later.

References: [README.md](README.md); [kit-rule-addition.md](kit-rule-addition.md); [kit-rule-change-and-enforcement.md](kit-rule-change-and-enforcement.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md) — one authority, no parallel path).

---

## Invariants

Each row states the invariant and the single measured reason it exists. Breaking one is not a style slip; it is the failure mode named beside it.

| ID | Invariant and its reason |
|----|--------------------------|
| **KIT-INV-1** | Hub READMEs route; part files bind. A hub is `type: routing`, `binds: nothing`, `owns: none`, and defines no rule row. *Reason:* the reading path forbids opening a hub for orientation, so a rule defined in a hub is a rule no reader is routed to. |
| **KIT-INV-2** | One identity, exactly one defining file, kit-wide. *Reason:* two defining sites is a mirror — one gets corrected, the other keeps the old text and nothing says which is current. The deliberate exception is the bare identifier: bare identifiers are file-scoped, and their existing collisions are frozen, not renamed, because renaming one is a rule-identity change. |
| **KIT-INV-3** | A citation of another file's rule is a link plus its identity — never a restatement, and never a bare identity at the head of a row or list line. *Reason:* the head-of-row form *is* the definition form, so a citation written that way becomes a second definition site with no visible difference. A restated copy is worse still: it can diverge, and a link cannot. |
| **KIT-INV-4** | A file whose bare identifiers are cited from outside the kit is never renumbered and never loses an identifier; additions are fine. In this kit those files are [agent-planning-procedure.md](../agent-planning/agent-planning-procedure.md) and [markdown-authoring.md](markdown-authoring.md), which the adopting project's root agent-rule file cites. *Reason:* a bare identifier cited from outside cannot be resolved by any check, so the breakage is undetectable at the citing end; the kit-side freeze, held by review, is the only protection available. |
| **KIT-INV-5** | Kit files stay readable in one pass — file size is authoring guidance, never a gate, and never a reason to shorten a rule. Aim for the one-read size the adopting project documents for kit `.md` files (for example 16 KiB); this kit sets no gated value. A file above it is a candidate for a subject boundary ([**KIT-ADD-4**](kit-rule-addition.md)); a file with no such boundary stays long, and that is not a defect. *Reason:* one read of a long file costs an agent's context, but the same value run as a gated ceiling decides how rules are split and worded — a prohibition gets narrowed so its file fits ([**ENA-N12**](../enforcement-architecture/enforcement-anti-patterns.md)). A generated lookup table is outside the guidance — it is queried, never read whole. Stated limit: file size is not mechanically checked — the check was declined because its harm class is reading ergonomics ([**ENA-A3**](../enforcement-architecture/enforcement-admission.md)). |
| **KIT-INV-6** | No new directory level below a topic folder. *Reason:* depth is where relative links break. The deep folders the kit already carries are frozen at their current count as pre-existing rather than endorsed; another is not created. |
| **KIT-INV-7** | No new bare identity family. Every family introduced from now on takes a hyphenated prefix unique in the kit. *Reason:* bare identifiers collide and cannot be resolved from outside their own file; a new bare family adds unresolvable citation surface for no gain. |
| **KIT-INV-8** | Every rule is written to survive being lifted into another repository, and names the check that enforces it, if any. (a) Portability: state the obligation by role ("the transport adapter", "the single writer", "the crash-report channel"), not by one repository's paths, package, script or symbol names; a concrete value appears only where the rule is unreadable without one, marked as an example. Project values live in the project's authority registry, which the rule points at rather than absorbs. (b) Enforcement: a rule enforced by a check names that check; a rule naming none is held by review and needs no "not enforced" sentence ([**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)). A rule that claims a check which does not exist is a defect. |
