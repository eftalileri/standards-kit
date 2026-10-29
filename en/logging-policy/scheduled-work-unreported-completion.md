# Scheduled work — the run that completes without reporting its outcome (**SJO-M10**)

```kit-cover
type: normative
part-of: README.md
binds: what a recurring unit of work owes when a run completes normally and reports nothing — why that is a breach rather than a status line, why it carries no tolerance threshold, and the counter that keeps the fact readable by a supervisor that samples on its own cadence
open-when: shape:backend-heavy, signal:scheduled-job, signal:background-worker, signal:crash-sink
skip-when: signal:client-only
owns: SJO-M10
```

**Keywords:** scheduled job, cron, unreported outcome, outcome reporting, supervisor sampling, liveness blind spot, breach without threshold

Scope: **SJO-M10** governs normal completion without an outcome report; it has no tolerance threshold. Consecutive failures follow **SJO-M9**; retry/backoff belongs to the job.

---

## **MUST** (normative) — **SJO-M10**

**SJO-M10**: A run that completes normally without reporting its outcome **MUST** be a supervised BREACH, it **MUST NOT** carry a tolerance threshold, and the fact **MUST** survive the supervisor's sampling. [**SJO-M3**](scheduled-work-liveness-and-outcome.md) obliges every terminating path to record what the run produced, and a seam that finds no report writes an *unreported* terminal label rather than inventing one. That label is where most projects stop, and stopping there is the defect: nothing reads it, so the row still satisfies the liveness predicate and is judged healthy — absence counted as proof ([**SJO-N2**](scheduled-work-prohibitions-and-enforcement.md)), and precisely for the job whose output half has just become unmeasurable. Three obligations, each answering a weaker design.

(a) It is a BREACH, not a non-breach status line. The tempting classification is the one already used for "the job was structurally unable to run" and "the due candidates could not be delivered" — real conditions the job *states*, which belong on the warning/metric channel. An unreported completion states nothing. It is not an environmental or business fact at all: the run reached the shared seam's completion write, so a normally-completing path in our own source is missing the mandated call. That is a defect of the same class as any other unhandled source defect and takes the error channel ([**M15**](failure-level-and-channel-routing.md)–[**M19**](failure-level-and-channel-routing.md)). The episode unit of [**SJO-M4**](scheduled-work-liveness-and-outcome.md) bounds it to one recorded error per job, and a later reporting run closes it, so the correct routing costs no flood.

(b) There is NO threshold, and the asymmetry with **SJO-M9** is the reason. A failed run has transient causes — a network, a dependency, a lock — which is exactly why (a) of **SJO-M9** demands a declared tolerance. An unreported completion has none: the run got far enough to write its completion, so the missing call is a property of the *source*, not of the day. One occurrence is positive evidence of the defect, and adding a tolerance count would not change the verdict, only delay its discovery — the same move **SJO-N3** forbids, wearing the clothes of prudence. This is the one place the "a threshold of 1 is per-evaluation alerting" objection does not apply, because the episode, not the evaluation, is still the alert unit.

(c) The fact **MUST** outlive the last run's label. The terminal label is overwritten by every completion; a job that reports on most paths and stays silent on a rare one leaves the label unreported only in the instants a sampling supervisor is unlikely to observe — the blind spot (d) of **SJO-M9** names, reached by a different route. So the record carries a count of unreported completions since the supervisor last consumed it, incremented in the same atomic update as the completion. A reporting run **MUST NOT** reset it: resetting would restore the very sampling dependence the counter exists to remove. The supervisor consumes it in the write that opens or continues the episode, which is also what lets the episode close once the source is repaired. The alert carries the observed count even though no threshold exists, because one silent run and a day of silent runs are not the same situation, and the label alone cannot tell them apart.

[Consequence: A job's output half goes unmeasurable and every surface keeps calling it healthy — the failure class **SJO-M3** exists for, restored in full behind a label that is written and never read.] [Verify: a driven run whose task returns without reporting produces the unreported label, increments the counter, and opens exactly one episode + a later reporting run closes it + a reporting run does not reset the counter + the counter is consumed only by the episode write + a corrupt counter yields the unmeasurable verdict, not a healthy one + the alert payload carries the observed count.]

Counter single-writer enforcement: where the adopting project uses source checks, a single-writer field rule over the counter is the mechanism; record its actual scope and limits. Inline/same-file callback exit analysis cannot establish imported or delegated reporting; the runtime trace still records unreported completion and the supervisor consumes its durable counter.


---

Related: [scheduled-work-failure-streak.md](scheduled-work-failure-streak.md) (**SJO-M9** — the input half of the same blind spot, and the row whose tolerance threshold this one deliberately lacks). [scheduled-work-liveness-and-outcome.md](scheduled-work-liveness-and-outcome.md) (**SJO-M1**–**SJO-M6** — the fence this row complements; **SJO-M3** is the obligation it makes observable). [scheduled-work-prohibitions-and-enforcement.md](scheduled-work-prohibitions-and-enforcement.md) (**SJO-N2**, **SJO-N3**). [scheduled-work-expiring-eligibility.md](scheduled-work-expiring-eligibility.md) (**SJO-M8** — the other fact the output magnitude alone cannot carry). [failure-level-and-channel-routing.md](failure-level-and-channel-routing.md) (**M15**–**M19**).
