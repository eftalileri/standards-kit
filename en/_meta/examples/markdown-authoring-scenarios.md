# Markdown authoring — scenario examples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Training only. Not SSOT. Not a rule source. Normative rules: [`../../authoring/markdown-authoring.md`](../../authoring/markdown-authoring.md).

In real deliverables use the section title `## Decisions / facts` and a table with `ID` and `Fact` columns (or a numbered list of single verifiable facts). No story paragraphs under that heading.

---

## Mini deliverable shape (copy pattern)

Use this as a short end-to-end pattern for a small **M6**-style doc. Omit sections you do not need per [`markdown-authoring.md`](../../authoring/markdown-authoring.md).

```markdown
## Scope

Add receivable payment marking for owner role; out of scope: exports.

## References

- [`../../authoring/markdown-authoring.md`](../../authoring/markdown-authoring.md)
- [`../../error-handling/error-handling.md`](../../error-handling/error-handling.md) — use the current error-handling authority; historical standard names are background only and should not be copied as active references

## Decisions / facts

| ID | Fact |
|----|------|
| F1 | Only owners may mark items paid from this screen. |
| F2 | If list state is server-owned, use the project’s selected server-state library (TanStack Query is one option) and cite the applicable standard at its verified path. |

## Technical plan

1. Add a permission check at the project’s actual service/controller boundary (record the verified path in the real plan).
2. Expose mutation per repository contract standard; invalidate list query keys X.
3. Surface semantic errors per error-handling standard.

## Cross-impact

Cross-impact reviewed; no negative impact identified.

When the Technical plan triggers [cross-impact-analysis.md](../../authoring/cross-impact-analysis.md) **XIA-M1**, replace the one-liner with the mandatory three-column table per **XIA-M2**/**XIA-M2b**; each row verifiable per **XIA-M3**. Omit the table when **XIA-M1** does not apply (**XIA-N3**). Violations are BLOCKER (**XIA-M4**, **XIA-C3**). Do not pad (**M14** / **XIA-N1**).

## Risk documentation

| Risk | Root cause | Fix | Standard ref |
|------|------------|-----|---------------|
| Stale list after a successful mutation | Missing cache synchronization | Apply the selected state library’s invalidation/update mechanism | If TanStack Query is selected: [`mutations-cache-sync.md`](../../tanstack-query/mutations-cache-sync.md); otherwise cite the chosen library’s standard |

## Implementation checklist

- [ ] Permission check at the verified service/controller path
- [ ] Mutation + invalidation keys X
- [ ] Error mapping per standard
```

Checklist lines must match only numbered plan items (and blueprint rows if you add a blueprint table). See **N9** in the normative file.

---

## Scenario A — product behavior

Question (to user; not part of the deliverable body): When assignment X happens and the home screen does not update, what is the expected user-visible behavior?

Paste block for the real MD:

```markdown
## Decisions / facts

| ID | Fact |
|----|------|
| F1 | Home list must reflect server state within one navigation cycle; no silent stale UI. |
```

---

## Scenario B — permissions

Question (to user): Do owners and staff differ on status changes?

```markdown
## Decisions / facts

| ID | Fact |
|----|------|
| F2 | Example only: owner and staff permissions follow the role matrix maintained by the target project; cite its actual path if one exists. |
```

---

## Scenario C — multi-tenant config

Question (to user): Per-tenant settings vs single global field?

```markdown
## Decisions / facts

| ID | Fact |
|----|------|
| F3 | Per-tenant settings are SSOT; no shared global mutable field for tenant configuration. |
```

---

## Scenario D — stack choice (**M16** pattern)

After user confirms, record problem class + matrix + standard in one row per choice.

```markdown
## Decisions / facts

| ID | Fact |
|----|------|
| F4 | Example only: problem class is server-owned list data plus mutations. Select the state-management stack after confirming the project’s constraints, then cite its current standard using a verified path. |
```

---

*Add scenarios only if onboarding needs them. Do not bloat the normative standard.*
