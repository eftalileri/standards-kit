# Rule reachability — a written rule that no declaration opens

```kit-cover
type: normative
part-of: README.md
binds: the cover-block condition and the task-kind coverage that keep every kit rule selectable from the planning reading path
open-when: signal:kit-rule-change, signal:standards-change, shape:mechanical-enforcement
skip-when: signal:no-kit-change
owns: KIT-RCH-1, KIT-RCH-10
```

**Keywords:** reachability, cover block, open-when, skip-when, never-by-default, unreachable rule

Scope

- Included: The cover-block condition every file that defines a rule must meet so a task can open it, and the task-kind row every topic needs so a task declares the signal that opens it.
- Excluded: How a rule is added, numbered or split ([kit-rule-addition.md](kit-rule-addition.md), **KIT-ADD-4** — every part carries the family's opening token); how a task opens the files its tokens select ([agent-planning-procedure.md](../agent-planning/agent-planning-procedure.md) **SEL-M1**).
- Document type: Normative part — **KIT-RCH-1**, **KIT-RCH-10**. **KIT-RCH-2**–**KIT-RCH-9** are not defined; the gaps are never back-filled.

References: [kit-rule-addition.md](kit-rule-addition.md) (**KIT-ADD-4**, **KIT-ADD-8**); [agent-planning-procedure.md](../agent-planning/agent-planning-procedure.md) (**P4**, **P5**); [kit-stated-limits.md](kit-stated-limits.md) (**KIT-LIM-12**).

---

## The condition

| ID | Rule |
|----|------|
| **KIT-RCH-1** | A file that defines a rule **MUST** carry at least one narrow signal in its `open-when` — or `shape:floor` as its only token when the rule binds every task, which **P5** opens on every task and so is kept to the planning core; its `skip-when` **MUST NOT** cover its `open-when`; and `open-when: never-by-default` appears only on a file that defines no rule. A rule no declaration can open is followed by no one while the agent believes it complied. |
| **KIT-RCH-10** | Every topic **MUST** be reached by at least one row of the Task kinds table in [agent-routing-aid.md](../_meta/agent-routing-aid.md), and a row **MUST** name only signals some cover block opens; a new topic, or a signal a common kind of work needs, adds its row in the same change. An agent reads the floor files and declares the signals it is shown, never a name it would have to guess, so a topic reachable only through a guessed token is skipped by the work it governs. Checked by the vocabulary generator (`ROUTING_TASK_KIND_TOKEN_UNKNOWN`, `ROUTING_TASK_KIND_TOPIC_UNCOVERED`); whether a row's signals fit its kind of work is review-held. |
