---
name: task-orchestration
description: Complete owner-authorized work in this repository with autonomous agents that own outcomes, make technical decisions, verify and deliver finished changes, and clean their worktrees. The coordinator dispatches goals and follows completion. Use for implementation assignments in this repository or explicit /task-orchestration invocation; skip unrelated read-only analysis and other repositories.
---

# Task orchestration

Apply this workflow to the concrete outcome the owner requests. Agents have full technical autonomy within that outcome and complete their work without routine questions to the owner or coordinator. The coordinator dispatches goals, starts needed follow-ups and follows completion rather than prescribing each edit or becoming another approval queue. This does not authorize unrelated work or override higher-priority tool policies or repository obligations.

Repository rules (standards, SSoT, gates, test policy, commit format, push authority) live only in the repository-root agent file (`CLAUDE.md` / `AGENTS.md`) and the standards kit it points to; this skill never restates them, it only adds how work is divided, reviewed and delivered.

## Entry and authority

1. Before analysis, planning, delegation, or edits, open and read the repository-root agent file completely. Require every delegated agent to do the same as its first action. If it cannot be read, stop and report that blocker.
2. Establish whether the owner requested planning only or execution. For planning only, explain the intended order in plain `<OWNER_LANGUAGE>` at approximately age-ten reading level, then wait for the execution instruction. Do not start implementation, create worktrees, commit, or push. For execution, continue until the assigned outcome is complete or a genuine decision or external blocker prevents progress.
3. Treat plans, memory, and agent reports as leads; verify claims from current files.

## Divide and delegate

4. Assign cohesive **outcomes**, not tiny edits. Give an agent the complete user-visible result and evidence that proves it. Let it choose architecture, files, implementation order, necessary adjacent repairs and verification. It may split genuinely large work or delegate independent portions without requesting permission. Run independent outcomes concurrently within runtime capacity and the owner's parallel-agent limit. A real dependency delays dependent writes, not independent investigation. Start new item branches from the current remote mainline; use separate worktrees so concurrent writers cannot overwrite each other. Continue an unfinished item in its existing checkout instead of creating duplicate copies or stacking other unfinished item branches into it.
5. Include the common [agent brief](references/agent-brief.md) and applicable role, followed by the goal, observable completion conditions, repository/worktree, real dependencies and useful evidence. The initial file list is context, not a permission fence: the agent owns every path required for its outcome. Keep a single writer for a shared checkout or conflicting data authority; agents resolve ownership and ordering directly rather than waiting for file-by-file approval. When parallel branches may each add rows to a numbered registry (SSoT registry, note registry), the coordinator assigns each branch its own number range in the brief.
5a. **Model tier and effort per role.** Every dispatch sets the model tier and effort explicitly:

   | Role | Tier / effort |
   |------|---------------|
   | Planner (splits an outcome, writes the contract or brief for workers) | Most capable tier, medium; high when the outcome is hard (security/auth/tenant, money/entitlement, data integrity or migration, SSoT authority design, concurrency/distributed state, a cross-subsystem engine) |
   | Any worker that writes or changes source code, schemas, migrations or registry authority design | Most capable tier, medium (high only when the planner names why) |
   | Mechanical worker: translating existing source-locale keys into other locales; read-only search/inventory; web research; conflict resolution whose outcome a rule already fixes; lint-warning cleanup without behaviour change; registry row/doc text updates that apply a decision already made; running gates and summarizing their output | Fast tier, medium |
   | Reviewer (step 7) | Most capable tier, medium, for any source change; fast tier only for a mechanical-only change |
   | Release owner (step 9: integration, pre-push gate, security review) | Most capable tier, medium |
   | Drawings / screen design | Most capable tier, medium (never the fast tier) |

   A code-writing outcome that needs all locales is split: the most-capable-tier worker writes the source-locale strings, a fast-tier worker translates the rest from them. An agent never raises its own or a sub-agent's tier or effort beyond this table on its own judgement; a fast-tier worker whose task turns out to need a code or design decision stops at a safe point and hands back with the reason.
5b. **Minimal code.** Write only the code the outcome needs: no speculative options, unused parameters, wrappers, abstractions for a single caller, defensive branches for states the types or the authority already exclude, or comments restating the code. Reuse the registered authority or UI piece instead of writing a parallel one. The reviewer deletes any such code it finds.
6. The agent carries the outcome through source tracing, implementation, required documentation, verification and commit. Follow the target repository's actual gates; do not impose one repository's commands on another. Do not rerun successful unchanged checks as a ceremony. The full pre-push gate and security review run once on the final integrated outgoing set by its release owner. Deliver concise completion evidence, commit identity and genuine remaining blockers.

## One independent review

7. Each implementation receives one independent broad review, dispatched autonomously by the outcome owner or coordinator without an approval question. The reviewer fixes confirmed defects and returns an evidence-backed verdict instead of only a repair list. The review is also the item's root-agent-file compliance check: the reviewer walks the changed set against every section of that file and the kit rules it points to, and decides for each new source file whether it holds one responsibility per the kit's module-shape rule (COD-M3): split it when it mixes unrelated responsibilities, keep it whole when it does not (see the review-agent block). These checks add nothing to the report. Do not restart a completed general review or recursively review the reviewer. Required scoped security phases remain repository release obligations, not a reason to reopen the whole implementation review. Remove each finished clean worktree promptly once its commits and handoff are preserved; an unmerged branch does not require a dependency-heavy checkout. Preserve dirty work before cleanup and delete temporary refs only after verified integration/push.

## Findings and scope

8. Which defects are fixed in the outcome and which go to the note registry is decided by the root agent file and the kit (M20 whole-class fix, M18 admission filter and its never-dropped classes): an owner-reported defect class and any SSoT violation are always fixed at the root; other noticed defects pass the filter. Ask only for a genuinely missing owner product/authority decision, unavailable access or a higher-priority mandatory confirmation; explain the exact blocker and continue independent authorized work.

## Integrate and finish

9. Name one **release owner per repository**; this may be a delegated agent. It owns integration, shared-document conflicts, final acceptance, the actual pre-push gate and security review, commit, push, authorized deployment verification and cleanup. Other agents never concurrently mutate its release checkout. Integrate reviewed work promptly in dependency order without waiting for unrelated work or another coordinator approval. Push to the mainline only when the root agent file grants standing push authority for finished, gate-green work; otherwise ask the owner. That authority never extends to unrelated external actions. The coordinator tracks delivery evidence and starts the next required goal; it does not repeat completed release reviews and gates. Distinguish source-complete, deployed and live-verified states. The owner goal is complete only when all its required outcomes are true and verified.

## Run ledger, compaction and interruption

- Keep one concise run ledger in the session scratchpad: one row per outcome with owner, branch/worktree, base, state, delivered commit and real blocker. The coordinator maintains it from agent handoffs; bookkeeping is not an approval gate. Answer status questions from reconciled evidence.
- Every ledger row also records the measurement columns the owner uses to judge the tier table: role, tier/effort, start and end time, hand-backs (count and reason), review findings fixed (count), gate re-runs after a failure (count). At the end of a run, append the rows to `<AGENT_NOTES_PATH>/agent-run-metrics.md`.
- After every context compaction, before any other action, re-read this SKILL.md, `references/agent-brief.md` and the ledger, then reconcile the ledger with `git worktree list` and branch state before any dispatch or mutation.
- On an owner stop or a handoff, record every open worktree in the ledger with branch, ahead/behind and dirty count. A successor continues an item in its existing worktree or re-applies it on a fresh branch from the mainline; it never opens a parallel copy of an item that already has one. Stop a predecessor agent before its successor starts. A dirty worktree is never deleted before its changes are saved or judged worthless.
- Worktrees created with `git worktree add` are never removed automatically; remove this run's copies after integration.

## Throughput: the coordinator removes bottlenecks

The coordinator watches for waiting and piling-up work and fixes it on its own initiative, without asking the owner; then it updates this skill with the resulting directive.

- **Gate queue.** When the full gate can run only one at a time and agents wait for it, the coordinator batches ready items into one integrated run on the release checkout instead of one run per item, and lets waiting agents continue independent work meanwhile. Agents run only the commit gate on their own change; the full gate runs once per batch.
- **Uncommitted work piling up.** No agent holds unfinished changes while waiting for a merge window: it commits at every gate-green point on its branch (intermediate commits are allowed; the final diff is what is reviewed). When reviewed branches wait for integration, the release owner integrates them in dependency order at once; a branch that falls behind is synced with the mainline immediately, not at the end.
- **Any other recurring wait** (dependency install per worktree, a slow reviewer, an agent blocked on another's file) gets a concrete fix the same run: reuse a checkout, merge two small outcomes, reorder dependencies, or split the blocking file's work to one writer.
- **Skill upkeep.** This file holds only current directives: no dates, owner quotes, history or reasons. When a directive changes, edit it in place and append the reason to `<AGENT_NOTES_PATH>/orchestration-rationale.md` as at most three short lines ("what changed / because / effect sought").

## Conditional client release

Use this section only when the project ships a client (web app, mobile app with over-the-air updates) and the owner has authorized client releases from this workflow; otherwise delete it.

After the mainline commit and push, decide from the actual changed files whether a client release is needed. Documentation-only and server-only changes do not trigger it. A script or bundled-asset change can ship over the air only if it stays compatible with the installed binary's native modules and runtime version; a native or configuration change that needs a new binary is never sent as an incompatible over-the-air update.

Before publishing, read the current release configuration, the relevant kit clauses and the production environment of the release service. Confirm the production channel targets the intended branch and that every public build value the client needs comes from the production authority for that command. Build-profile values are not automatically available to an over-the-air update command; supply verified values from the current production authority at execution time. Never copy an API URL, key, DSN or similar value into this skill.

Run from a clean, synchronized mainline checkout after the release commit is on the remote mainline. After pulling, confirm `HEAD` is still the reviewed release commit; if the remote advanced, assess the added commits before publishing.

Release order (kit **BE-M34**): every release goes out from one reviewed commit. If the commit changes anything the web app ships, run `<WEB_RELEASE_COMMAND>` first and wait for it to succeed; only then, if the change qualifies, run `<OTA_PUBLISH_COMMAND>`. An over-the-air update without a successful web release from the same commit is not allowed. The release report records the commit SHA, the web deployment id and the update group id, in that order. A failed web release is a failed release: fix it and retry before closing. Record why a client release was needed or skipped. Never publish an unrelated or incompatible update merely because client files changed.

Do not stop at a partial answer merely because an item is difficult. State the concrete blocker when the rules, an unavailable resource, or a genuine owner decision prevents completion.
