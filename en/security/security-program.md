# Security program — ownership, IR, and operational readiness

```kit-cover
type: normative
part-of: README.md
binds: SEC-PROG-M-1, SEC-PROG-M-2, SEC-PROG-M-3, SEC-PROG-M-4, SEC-PROG-N1, SEC-PROG-S-1 and SEC-PROG-S-2 -- who owns security, how an outsider reports a vulnerability, what incident response must exist, how often the whole project is audited and where the audit is kept, and the operational readiness expectations around it
open-when: signal:security-ownership, signal:incident-response, signal:operational-readiness, signal:security-audit
skip-when: signal:no-security-surface
owns: SEC-PROG-M-1, SEC-PROG-M-2, SEC-PROG-M-3, SEC-PROG-M-4, SEC-PROG-N1, SEC-PROG-S-1, SEC-PROG-S-2
```

Scope

- Included: Program layer items that are not a substitute for SEC-M/SEC-N technical controls: accountability, the vulnerability-reporting channel, incident response minimums, the periodic full audit cadence, optional SLOs, tabletop exercises, audit readiness bridge.

Document type: Normative minimums (SEC-PROG-M-1–SEC-PROG-M-4); SEC-PROG-S-\* are SHOULD (enterprise hardening).

Environment: Organization / product team; applies per production service boundary.

References: [Governance](security-governance.md); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [CI and monitoring](security-ci-and-monitoring.md) (SEC-M-MON-1, SEC-S-MON-2).

This file does not repeat SEC-C1 or SEC-CRYPTO rules — it sits above them for governance and operations.

---

## Ownership and accountability

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-PROG-M-1** | A named security accountability path (role + escalation contact) for production **must** be documented in `SECURITY.md` (or equivalent single page) — not orphaned wiki only. | Audit / ops gap. | Doc exists + link from repo README or runbook index. |
| **SEC-PROG-M-2** | Incident response (IR) **must** define: severity levels (at least *low / medium / high / critical* or equivalent), who is contacted first, and where incidents are tracked (ticket, hotline). | Cannot execute coherent response. | IR one-pager. |
| **SEC-PROG-M-4** | A production service **must** publish a vulnerability-reporting channel: a monitored contact address stated on the **SEC-PROG-M-1** page, and on each public web domain a `/.well-known/security.txt` file (RFC 9116) carrying that contact and an `Expires` date at most one year ahead, renewed before it passes. The page states how soon a report is acknowledged, and each report is triaged under [SEC-GC-15](security-governance.md). *Reason:* without a published channel an outside finder either gives up or discloses publicly, and an expired file tells them the channel is dead. | Reports reach no one or go public first. | The page section and the served file with a future `Expires` date. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-PROG-N1** | **Must not** treat process documentation as a waiver of SEC-M / SEC-N technical controls — SEC-PROG-\* adds ownership and IR, not exceptions to crypto, authz, or SEC-C1. | Compliance theater. | Joint audit of controls + IR page. |

---

## Detection and response (SHOULD targets)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-PROG-S-1** | SHOULD: document MTTD / MTTR targets (or N/A per SEC-NA-1) for prod security incidents — ties to SEC-S-MON-2 alerts. | Roadmap gap. | Runbook / SLO doc. |
| **SEC-PROG-S-2** | SHOULD: tabletop or walkthrough annually for *credential leak*, *bad deploy*, *data exposure* scenarios — output stored (notes, actions). | Maturity gap. | Calendar + notes link. |

---

## Periodic full audit

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-PROG-M-3** | A full security audit of every production surface — code, shipped artifacts, data stores, hosting, DNS and mail, the delivery pipeline, third parties, AI features and human accounts — **must** run at the cadence the **SEC-PROG-M-1** page declares: at most one calendar month apart for a service that holds tenant or money data, and before every major release. Each run walks the applicable security rules of this kit against every surface, triages each candidate under [SEC-GC-15](security-governance.md), and stores its report, coverage ledger (including what was not reviewed and why), findings with stable fingerprints and rejected-candidate log in the durable location that page names, so the next run re-checks additively and a missed run is visible from the newest record's date. *Reason:* the per-release review of [SEC-GC-9](security-governance.md) sees only the change set; drift in consoles, DNS, dependencies and code no recent change touched is found only by a periodic whole-project pass. | Undetected drift outside every reviewed change. | Dated run record in the named location; the **SEC-PROG-M-1** page states cadence and location. |

---

## Audit readiness bridge (non-normative checklist)

Purpose: FAANG-style readiness without duplicating SEC- rows.

- [ ] SEC-NA-1 register current for every claimed N/A
- [ ] Enforcement matrix in [security-enforcement-and-na.md](security-enforcement-and-na.md) matches actual CI jobs
- [ ] GSEC1–GSEC6 considered on auth, crypto, secret, and CI changes
- [ ] SEC-M-MON-1 codes appear in sample prod logs; drain destination documented
- [ ] SEC-PROG-M-1 / SEC-PROG-M-2 page linked from onboarding

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Production incident, no SEC-PROG-M-2 path | STOP after containment — document IR before next release promotion. |

---

Part of: [README.md](README.md). Not a replacement for technical controls in other security parts.
