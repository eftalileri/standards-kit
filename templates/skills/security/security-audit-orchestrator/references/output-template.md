# Assessment output template

Redact every secret value before writing (first 2-4 characters plus `****`). Keep exploit scenarios to one or two sentences; never include a working weaponized payload.

```
# Security assessment — <project> — <date>

Commit <sha> (dirty: yes/no) · mode <full|subsystem|change> · effort <level>
Environments observed read-only: <list or none> · Tools run: <list or none>

## 1. Summary for the owner
Three to six plain sentences: what an attacker could do today, to whom, and what it would cost
the business (money, customer data, tenant trust, store standing, legal duty). No jargon.

| Severity | Verified | Needs validation | Accepted risk |
|---|---|---|---|
| Critical | | | |
| High | | | |
| Medium | | | |
| Low | | | |

## 2. Fix first
Ordered list (at most five) with one line each: finding id, business impact, size of fix.

## 3. Verified findings
One block per finding, schema: security-finding-verification/references/finding-schema.md.
Sorted by severity, then business impact. Variants listed under their parent finding.

## 4. Needs validation
Candidates that cleared some but not all gates: what is missing and the exact step that would
settle it (read-only, non-production).

## 5. Accepted risks and project overrides
Item, the documented decision it rests on, compensating controls checked, evidence.

## 6. Coverage
- Components and lenses reviewed (link or table from the ledger).
- NOT reviewed: every skipped/blocked cell, tool not run, environment not observed, artifact
  not inspected — with reason.
- Assumptions that remain unverified.

## 7. Change-mode only
- Introduced by this change.
- Pre-existing, found while reviewing (not caused by the change).

## 8. Re-check plan
For each finding: what evidence will show it is fixed in every variant, and when to re-run.

## Appendix (optional)
Hardening notes without a demonstrated attacker gain. Scanner statistics.
```

Writing rules:
- Business impact in the owner's terms: "any logged-in staff member of one business can read another business's customer phone numbers" beats "IDOR (CWE-639)". Put the CWE and CVSS in the finding block, not the summary.
- No fabricated statistics, percentages or compliance scores.
- A clean section says what was checked, not "no issues".
