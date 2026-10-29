# Agent planning — obligations and deliverable quality

```kit-cover
type: normative
part-of: README.md
binds: the MUST / MUST NOT rows an agent plan must satisfy
open-when: shape:floor
skip-when: none
owns: M1, M2, M3, M4, M5, M6, M7, M8, M10, M11, M12, M13, M14, M15, M20, N1, N2, N3, N4, N5, N6, N7, N8
```

Scope: What a plan under [agent-planning-procedure.md](agent-planning-procedure.md) must contain and must never do; the procedure's **P1**–**P8** order and **C1**–**C8** contract trigger these rows.

Document type: Normative part — **M1**–**M8**, **M10**–**M15**, **M20**, **N1**–**N8**. **M9** and the checklist rows Q1–Q9 are not defined; the gaps are never back-filled.

---

## **MUST**

**M1**: When **P2** ran, every matrix-covered problem class in scope must appear in the deliverable with problem class, matrix reference, and Standard file path(s) per markdown-authoring **M16**.

**M2**: The deliverable References section must include README.md and every topic hub file used to justify an obligation (**M19**).

**M3**: Open a topic's file (e.g. MMKV, TanStack Query) before claiming persistence or server-state behavior from it in the plan.

**M4**: If the task touches backend handler deduplication, outbound cache, or request-scoped efficiency, align with backend-http-efficiency.md (BHE-*) and cross-impact analysis when XIA applies — cite in References.

**M5**: Optional: use task-skill-hints.md after **P4** for task-shape skill routing; it does not replace **P2** or topic **MUST** rows.

**M6**: Plan scope follows procedure **C8** — neither expanded nor narrowed against the user's request without explicit approval, recorded as a Decisions / facts row (markdown-authoring **M15**).

**M7**: Problem class labels in the deliverable must map to Matrix rows via Problem class extraction; freestyle class names are forbidden where a row exists.

**M8**: Before **P7**, must apply Multi-standard and multi-layer conflict resolution; must not use gray only because two matrix rows appeared — use matrix Precedence first.

**M10**: Legacy / migration / time pressure: must not silently waive matrix or topic **MUST** rows; record constraints and any approved deviation in Decisions / facts or project docs per gray-situation and **M15**.

**M11**: If the work touches lists, scroll performance, navigation perf, bundle/lazy screens, or matrix rows Performance optimization / Bundle size optimization, must open Performance (PERF-*) in **P5** alongside the TanStack / Zustand hubs — no "performance override" that contradicts matrix Precedence.

**M12**: Verification planning **MUST** follow the applicable topic standards and the adopting project's documented policy for tests, fixtures, snapshots, E2E flows, rule-tester or guard-selfcheck runners, live probes and other verification artifacts. Do not treat one project's prohibition as universal kit policy, and do not evade an applicable prohibition by renaming or relabeling an artifact. A kit row whose Verify text names a test still binds: where that test is unavailable or prohibited, it is verified by a static command over the real tree, by an admitted lint rule or guard proven with the three proofs of [**FP-M20**](../false-positive/check-verification-rules.md), or by a named review predicate with `file:line` evidence, and is recorded as unverifiable with its reason only when all three are impossible. An exemption whose condition is a test is re-expressed with one of those three; it does not lapse.

**M13**: A plan, orchestrator brief, or sub-agent brief is a fallible hypothesis, not a binding authority. Before acting, the agent **MUST** verify its claims against the governing rules, current code (file:line), and measured results. If they conflict, the rule/evidence/result wins; the agent **MUST NOT** knowingly execute the wrong brief and **MUST** record the divergence through the project's approved decision or divergence mechanism.

**M14**: Observed or live data validates a design; it **MUST NOT** define the complete supported scenario space. For multi-tenant, role, locale, and data-shape behavior, the plan **MUST** enumerate the structurally possible input classes allowed by the contract and address each relevant class by name. "Not present in current data" is not proof that a permitted case is unnecessary; a guarantee requires structural reasoning or repeatable evidence.

**M15**: When a defect originates from persisted or live output, completion evidence would normally include a safe replay of the same failing input shape with non-sensitive values against the current code, when that replay is safely possible and the applicable project policy permits it (**M12**). Otherwise use an allowed verification method that preserves the relevant failure conditions — for example static source evidence plus the lint/typecheck gate — and record the remaining limitation rather than claiming full runtime verification. Read-only production measurement and read-only probing of a live endpoint are not test artifacts and remain the preferred evidence when a claim can be settled that way and doing so is authorized and safe. Secrets and personal data **MUST** remain redacted or tokenized in recorded evidence without changing the failing structure.

**M20**: A defect the owner reports is fixed as a class, never as the one instance shown. (a) Name the wrong logic behind it; (b) search that logic across the whole repository — not only the callers of the changed code — and count every occurrence; (c) bind every occurrence to one authority that makes the bug unrepresentable: the existing SSoT authority where one exists (stray copies connected to it and deleted), otherwise a new registered one — a local patch beside a stray copy does not close the class; (d) prove the closing condition at the outcome the user sees (server response → client → screen), not only at the edited layer. Every occurrence of the reported class, and every SSoT violation (a second authority, a second writer, a parallel derivation) met in any task, is in scope by this row: it is never filtered by **M18**, never dropped for cost, and never counted as a cascade, because a reported or duplicated authority left in place re-produces the defect. Only a different defect in another subsystem the fix would chain into is recorded under **M18**; this row never widens scope to unrelated features (**C8**).

---

## **MUST NOT**

**N1**: Do not use gray-situation decisions as the primary source for mapped stack choices — use **P2** + **P5** first.

**N2**: Do not propose substitute stacks for a matrix row without a documented user exception recorded per markdown-authoring Decisions / facts (same as matrix **M5**).

**N3**: Do not label an undocumented approach "long-term optimum" — optimum here means documented + strictest allowed (**C3**).

**N4**: Do not expand or narrow plan scope against the user's request (procedure **C8**).

**N5**: Do not skip **P8** when **C6** applies and implementation exists — plan vs code drift is a bug if unrecorded.

**N6**: Where applicable project policy prohibits a verification artifact, the same artifact rebuilt under another name — a fixture runner, selfcheck or harness that exercises a rule or guard — is still prohibited (**M12**).

**N7**: Do not treat compliance with a delegated brief, one observed dataset, a screenshot, or a log excerpt as a substitute for **M13-M15** evidence. A standing grant of decision authority ("stop asking me; decide by the rules") is not one either: it moves only *who* answers an open question. (a) Evidence stays where it was produced — an external console reading, a legal-compliance sentence, or an operation on the owner's own third-party account is evidence or an act, not a judgement, so no grant closes it; on the status-line vocabulary in [registry-and-divergence](agent-planning-registry-and-divergence.md) such items move to the *event or external evidence* disposition, never to repository-closable, and the *owner decision* disposition keeps only the owner's own start or timing signal. (b) A procedure stays whole — where a rule sequences an irreversible step (measure, record the numbers, apply, re-verify), the grant authorises proceeding, never skipping a step. (c) A prohibition stays absolute — a grant cannot license what a **MUST NOT** forbids (an applicable verification prohibition under **M12** is a standing example); a permission is not a repeal. Record the grant once, in one place, with these limits beside it; a grant recorded only as "the agent decides now" is read next round as a general relaxation.

**N8**: Do not answer a read / analyse / review instruction by changing files: the requester loses the unmodified subject they asked to reason about, and a quietly fixed finding is one nobody else can verify. State what should change and where; change it when asked. Do not invent what you do not know: "I could not reach enough information", or naming the specific missing evidence, is a complete answer; a path, identifier, count or rule ID that was not read is a fabrication, and every later decision resting on it is void (**M13**).
