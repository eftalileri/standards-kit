# Agent planning procedure

```kit-cover
type: normative
part-of: README.md
binds: the strict P1-P8 planning order, the C1-C8 contract that decides when it applies, and the file set P5 opens
open-when: shape:floor
skip-when: none
owns: C1, C2, C3, C4, C5, C6, C7, C8, P1, P2, P3, P4, P5, P6, P7, P8, SEL-M1
```

Scope: How an agent plans or scopes work using `$KIT_ROOT/en/` — which files it opens, how a layer or technology choice is taken from the [decision matrix](../decision-matrix/decision-matrix.md), how the plan is recorded, and verification after implementation. Product requirements (what to build) come from the user or project docs; topic rules live in their hubs — this file routes only.

Document type: Normative — **C1**–**C8**, **P1**–**P8**, **SEL-M1**. **SEL-M2**–**SEL-M9**, **SEL-N1** and **SEL-N2** are not defined; the gaps are never back-filled.

Binding principle: Skipping a **P1**–**P8** step that applies, inventing a non-documented stack where the decision matrix maps the problem class, or claiming compliance with a rule that was never opened is a bug. Compliance means satisfying the documented **MUST** / **MUST NOT** rows of the opened files — not the most complex design. Where any cited identity is defined is answered by the identity lookup (**P4** (a)), not by a list here.

---

## Agent execution contract

**C1**: This procedure applies to every task that plans or implements work in the kit's scope. A written plan document (**P6**) is produced only when the user asks for a plan, or when the work will be handed to another agent; otherwise the plan is a short chat summary of scope, chosen approach, the signals declared in **P4** with the files they opened, and the rules it rests on. Exception: the user explicitly restricts the task to a single already-named normative file and forbids broader planning — then open only that file and skip **P2**–**P5** breadth (still follow its **MUST** rows).

**C2**: This procedure sequences reading and recording; it does not replace **MUST** rows inside topic standards.

**C3**: "Strictest allowed" means: apply matrix **C2** (strictest reading of soft wording) and satisfy every applicable **MUST** / **MUST NOT** in the linked Standard file(s). It does not mean maximum complexity, maximum performance tuning, or extra abstractions — if a trade-off is not in binding docs, use gray-situation step 5 instead of inventing a tie-break.

**C4**: Steps **P1**–**P8** are strict order; do not skip or reorder a step that applies (**P2** applies only on a layer or technology choice, **P8** only when **C6** applies).

**C5**: If **P7** still leaves a blocking uncertainty, STOP planning implementation that depends on it — follow gray-situation Procedure step 5 (ask user or Uncertainty: …; blocked).

**C6**: **P8** is mandatory when the deliverable is implementation-bound (markdown-authoring **M6**) and implementation has been done or is being closed out; optional for analysis-only deliverables.

**C7**: When the user @ references or names an authoritative execution document (AED — project Markdown with References, Decisions / facts, and Technical plan or equivalent, usually markdown-authoring **M6** implementation-bound), the agent must also follow [agent-runner-protocol.md](agent-runner-protocol.md) **AR1**–**AR5**: evidence-first reads of the AED, its cited specs and listed code paths, and one end-only User decisions required block for items the AED has not already fixed. **C7** adds execution discipline; it does not change the **P1**–**P8** order.

**C8**: User scope preservation (binding): when the user explicitly lists multiple items, features, files or phases to plan or implement, the agent must plan and address all of them. Narrowing to a subset (deferring the rest) and expanding with unrequested items are bugs of equal severity; either requires explicit user approval. When a technical decision arises during planning, the agent must read the relevant production code and standards and make the standards-compliant decision — never narrow scope to avoid it. **T4** (ask user) applies only to product ambiguity (what to build).

---

## Procedure (strict order)

**P1**: Do not read the kit index for orientation — topics are reached through the **P4** lookups. Open the kit's `en/README.md` (topic index and standards change discipline) only when the task changes the kit (`signal:kit-rule-change`, `signal:standards-change`) or a **P4** lookup returns nothing.

**P2**: Only when the task chooses a new layer or technology (declare `signal:stack-choice`): read decision-matrix/decision-matrix.md, extract problem classes per [**A1**–**A5**](agent-planning-problem-class.md), and note the System and Standard file per row. A task that changes code inside an already-chosen stack skips this step.

**P3**: Name this task's one shape from the closed shape table in [_meta/agent-routing-aid.md](../_meta/agent-routing-aid.md).

**P4**: Name this task's routing tokens, then resolve them with the generated lookups at the kit root — queried, never read whole (the kit tool `node tools/kit-lookups.mjs` generates them when absent or older than the checkout; `--check` reports whether they are fresh). (a) Identity: a rule identity named by the task, a plan, a review finding or a citation is resolved first — one anchored lookup of `rule-id-index.tsv` returns its defining file. (b) Signals and negatives: start from the Task kinds table in [_meta/agent-routing-aid.md](../_meta/agent-routing-aid.md) — every row whose work the task does adds its signals — then write down the other signals present in the task and the negatives true of it; a negative is a sentence about this task ("this change is backend-only"), never a label for files to drop. A task that writes source declares `signal:source-file-change`, plus `signal:client-source-change` when the shape is client-side or full-stack. When a token's name is unknown, look the word up in `routing-synonyms.tsv` with the query its header prints before guessing one. (c) Authority registry: search the registry for the data or operation the task touches (with the adopting project's registry search tool where one exists, or a text search); read only the matching rows and their contract blocks, and cite the authority path in the deliverable. **P4** is done only when the declared tokens and the files their lookups returned are written in the plan or chat summary (**C1**), before the first source edit; a source change whose summary names no signal skipped **P4**, because reading this procedure is not running it.

**P5**: Open the file set **SEL-M1** defines. Do not open a hub README for orientation, a sibling part because one part was opened, or a file no lookup result, matrix row or declared token names. Extract obligations only from the files actually opened. **M12** applies to every task type — plan verification only through the methods the applicable topic standards and the adopting project's verification policy allow.

**SEL-M1**: Open the files whose `open-when` is `shape:floor` alone, the files the identity lookup returns, the files the matrix rows name when **P2** ran, and the files the declared signals open — minus those a declared negative skips; when that set is too large to read, narrow the declared tokens, never cut the set. A rule the task's own declaration selected and the agent then skipped is one it will contradict while believing it complied.

**P6**: When **C1** calls for a written plan, produce or update it per authoring/markdown-authoring.md: Scope (**M18**), References (**M4**, **M19**), Decisions / facts with matrix citations when **P2** ran (**M15**, **M16**), Technical plan / Risk when **M6** applies — one chosen approach (**M10**); no parallel option branches in the body. Otherwise state the same content briefly in chat.

**P7**: If a required choice is not in binding docs after **P1**–**P5**, or documents conflict after applying gray-situation **M7**/**M8** and Multi-standard and multi-layer conflict resolution, run the [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) Procedure — no guessing.

**P8**: If **C6** applies: reconcile plan vs implementation — perform markdown-authoring **M17** verification only through methods **M12** and the applicable standards allow when triggered; otherwise verify every numbered Technical plan / Blueprint item is done and References still match code. Verify **M12** was not violated and no verification artifact the applicable policy prohibits remains (do not execute one while checking); record drift (missed items, wrong stack) in Risk or a follow-up Decisions / facts row — no silent mismatch.

---

## Reading-path resolutions (binding reading of **P5**)

These add no obligation of their own; they say which clause decides.

- A named identity is resolved before anything is opened; the file its lookup returns is the only file that identity adds to the **P5** set.
- A file the adopting project's root agent-rule file names as always-on or "read before designing" joins the **P5** set only when its `open-when` carries a signal present in the task.
- A "Normative detail" pointer is a link, not a read order; each listed file is opened only when its own `open-when` matches this task.
- `_meta/examples/` holds illustration only and is never a rule source; open one only when a hub points at it.
