# Meta files (`_meta/`)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** meta, routing aid, precedence, agent contract, crosswalk, examples

`_meta/` is mixed, not uniformly non-normative. Two files in it bind; the rest route, track or illustrate. Normativity is declared per file — read the file's own cover block `type:` key, never the folder name. The authoritative topic tree is the generated index in [`../README.md`](../README.md); this folder keeps no copy of it.

| File | Type | Role |
|------|------|------|
| [`agent-contract.md`](agent-contract.md) | normative | The shared **C1**–**C12** execution contract a hub inherits by linking here, plus the `<TOPIC-PREFIX>-C<n>` resolution notation. |
| [`precedence.md`](precedence.md) | normative | What a precedence ladder must satisfy, which side wins when two kit statements conflict ([**KIT-PRE-1**](precedence.md)–[**KIT-PRE-3**](precedence.md)), and the named boundary between the kit and the root agent-rule file. The ladder between tiers is the root file's and is not restated here; the normative row **SSG-P1-5** routes here. |
| [`agent-routing-aid.md`](agent-routing-aid.md) | routing | **P3** closed shape table; **P4** task-kind table and lookup commands. |
| [`rn-hub-merge-lens.md`](rn-hub-merge-lens.md) | reference | Keep-vs-consolidate guidance for `*-rn/` folders. |
| [`task-skill-hints.md`](task-skill-hints.md) | routing | Pointer only — names the three routing authorities and carries no list. |
| [`architecture-core.md`](architecture-core.md) | reference | One-screen client map: terminology, layer edges, boundary identifier definition sites, file placement. Restates no rule text. |
| [`legacy-mapping.md`](legacy-mapping.md) | reference | Optional project-local crosswalk from legacy standards to their kit destinations. |
| [`standards-completion-status.md`](standards-completion-status.md) | reference | Optional project-local migration tracker; it does not certify that standards are current or debt-free. Debt status is read from the note registry, never from this tracker. |
| [`maintenance.md`](maintenance.md) | reference | Migration scaffolding and version gates; not read during ordinary task execution. |
| [`examples/`](examples/) | reference | Non-normative code samples and scenarios. Never a rule source — open one only when a hub points at it. |

Reading path: none of these files is opened by default. The planning procedure opens [`agent-routing-aid.md`](agent-routing-aid.md) at **P3**/**P4**; everything else is opened only when a rule or a hub names it.
