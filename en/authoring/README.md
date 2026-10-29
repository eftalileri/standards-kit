# Authoring standards

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** markdown, deliverable, plan, analysis, blueprint, cross-impact, **M14**

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1**–**P8** when this topic is in scope (**P8** verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Normative rules for Markdown deliverables (plans, analysis, implementation notes) created by humans or agents, and for changing this kit itself — the procedure for adding, changing or deleting a kit rule lives here because the identity, cover-block and citation rules it depends on are already this topic's subject. Runtime TypeScript module size and splits are under [Code modularity](../code-modularity/README.md), not here. Server handler deduplication, outbound API cache, and related implementation-bound obligations live under [Backend HTTP efficiency](../backend-http-efficiency/README.md) (BHE-\*); pair with [Cross-impact analysis](cross-impact-analysis.md) (XIA-\*) when **M14** full section triggers.

- [Markdown authoring (SSOT)](markdown-authoring.md) — **C1**–**C8**, **M1**–**M20**, **N1**–**N11**
- [Markdown authoring — deliverable shape](markdown-authoring-deliverable-shape.md) — section order, **G1**/**G2**, **I1**–**I3**, **KV0**–**KV3**
- [Markdown authoring — the bare file-local identifier limit](markdown-authoring-bare-identifier-limit.md) — the frozen bare-family set, the mandatory link form for a cross-file citation, and the declared gap where a root agent-rule file cites one. Defines no identifier.
- [Cross-impact analysis (**M14** extension)](cross-impact-analysis.md)
- [Adding a rule to the standards kit (procedure)](kit-rule-addition.md) — KIT-ADD steps, including what may be written (**KIT-ADD-12**) and how it is formatted (**KIT-ADD-13**)
- [Structural invariants of the standards kit](kit-structural-invariants.md) — KIT-INV invariants (banded with `kit-rule-addition.md` at the family boundary)
- [Keeping a mandatory write surface writable](kit-write-surface-writability.md) — **KIT-INV-9**: a record a file is obliged to carry is never refused, shortened or moved to another topic because of the file's size
- [Changing a kit rule, and fencing it mechanically](kit-rule-change-and-enforcement.md) — KIT-ENF (banded with `kit-rule-identity-and-relocation.md` at the `## Changing, moving and deleting` heading and with `kit-stated-limits.md` at the `## Stated enforcement limits` heading)
- [A kit rule's identity when its text changes, moves or is deleted](kit-rule-identity-and-relocation.md) — **KIT-CHG-1**–**KIT-CHG-6**, byte-identical relocation, identity continuity, permanent retirement of a deleted number, same-change citation repointing
- [Stated limits of the kit's own fences](kit-stated-limits.md) — KIT-LIM, the steps no check covers and what each would need
- [Retiring a kit rule](kit-rule-retirement.md) — KIT-RET, when a rule may be retired or merged at all, the loss proof, and the retired-identity ledger
- [Rule reachability — a written rule that no declaration opens](kit-rule-reachability.md) — **KIT-RCH-1**, the cover-block condition that keeps every defined rule selectable from the reading path
- [Backend HTTP efficiency (server plans, BHE)](../backend-http-efficiency/README.md)
- [Implementation verification — MD vs code (KONTROL)](../implementation-verification/README.md)
- [Scenario examples (non-normative)](../_meta/examples/markdown-authoring-scenarios.md)
