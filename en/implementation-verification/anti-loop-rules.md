# Implementation verification — anti-loophole rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: the chunking, consumer-sweep, dead-code and tool-backed-Evidence obligations that stop a long verification pass from drifting
open-when: signal:md-code-verification, signal:large-refactor
skip-when: signal:no-implementation-bound-md
owns: IV-AM1, IV-AM2, IV-AM3, IV-AM4, IV-AN1, IV-AN2
```

Scope: Same as [README.md](README.md) hub Scope. Applies during large refactors and any MD–code verification to prevent context loss, hallucinated Evidence, and hidden ripple effects.

Relation to other rows: These rules add to IV-M / IV-N in [verification-must-rules.md](verification-must-rules.md). **IV-AM1** limits execution ([execution-procedure.md](execution-procedure.md) steps 7–11), not global inventory construction (steps 2–5). On conflict with "finish everything in one shot", **IV-AM1** + user approval wins for chunk boundaries only — not for skipping IV-O or Evidence inside a chunk.

---

## **MUST** (normative) — IV-AM

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **IV-AM1** | When the frozen inventory ([execution-procedure.md](execution-procedure.md) after step 5) is large or the MD is explicitly split into phases / parts, the agent must process execution in bounded chunks with an explicit list of Item ids per chunk (locate → read → Evidence → status for those ids, and **IV-M7** if implementing within the same chunk). Agree the chunk size and boundaries with the user before work proceeds. After each chunk, obtain explicit user approval before the next chunk, unless an explicit written standing approval covers the exact sequence of chunks and their listed Item-id sets; do not ask again between boundaries it covers. Any item/scope expansion or chunk-size increase exceeds that standing approval and requires new written approval before proceeding. Inside a chunk, **IV-M3**–**IV-M5** and IV-O for those rows must pass fully (no partial Evidence). Inventory listing (steps 2–5) is not chunked — it remains global per [execution-procedure.md](execution-procedure.md). | Reject "big bang" execution that violates agreed chunking; STOP until the next boundary has either direct approval or a matching written standing approval. | Pass: user message or written standing approval specifies chunk boundaries and Item id lists; final merged table still **IV-O1**-complete. |
| **IV-AM2** | After renaming / deleting / changing a public export, route, hook, or shared type, the agent must run repo-wide search for old symbols and fix or document every consumer; "only edited the MD target file" is insufficient. | Bug — reject until consumer check logged. | Pass: `rg` / search results attached or summarized with 0 stale references or Invalid rows for intentional breaks with user record. |
| **IV-AM3** | When new code replaces old behavior and the MD does not require a backward-compatible wrapper, the agent must remove dead code, delete commented-out blocks left as copies, and remove unused imports in touched files. | Bug — reject dirty diff. | Pass: linter / CI clean per **IV-M8**; reviewer sees no orphan imports. |
| **IV-AM4** | Evidence in the verification table must come from tool-backed reads or searches executed in the same session. If the environment cannot read files or search, the agent must STOP and request the user to paste paths / file contents — must not invent quotes (**IV-F3**). | STOP — invalid verification. | Pass: tool log correlates with each Evidence snippet or user-provided paste referenced in Change note. |

---

## **MUST NOT** (normative) — IV-AN

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **IV-AN1** | Must not fabricate or paraphrase from memory code as Evidence when no tool read occurred. | **IV-F3** — STOP — invalid. | Session audit: read / grep before quote. |
| **IV-AN2** | Must not complete locate + **IV-D2** read + **IV-M5** Evidence + status across unapproved execution boundaries. Every completed chunk must follow **IV-AM1** (per-boundary approval or a matching written standing approval). A single final table listing all rows is allowed if built across approved chunks. | Reject output. | Compare completed Item ids with the agreed chunk boundaries and approval record. |
