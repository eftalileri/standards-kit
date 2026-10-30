# Coverage ledger

The ledger is the run's memory. It makes long audits resumable, lets a re-run target only gaps and changes, and keeps the report honest about what was not reviewed. Write it to disk before the first cell is worked and update it after every cell.

## Header

```
run_id:        <date>-<mode>-<short-sha>
commit:        <full sha>  dirty: <yes|no>
mode:          full | subsystem:<name> | change:<base>..<head>
effort:        quick | standard | deep
environments observed (read-only): <list or "none">
tools run:     <name version scope>  (or "none")
prior ledger:  <path or "none">
```

## Top-level accounting

| Path | Component id(s) | Out of scope? (reason) |
|---|---|---|

Every top-level directory and workspace appears exactly once.

## Components

| Id | Paths | Approx. files | Entry points (file:line) | Depends on (cross-cutting ids) | Priority (from threat model) |
|---|---|---|---|---|---|

Sizing rule: one component fits in one focused context with room for tracing (roughly 25 files or a few thousand lines). Cross-cutting components (auth, tenant scoping, validation, error handling, data access) get their own ids and are reviewed first.

## Cell status

| Component | Lens | Status | Candidates | Verified | Notes / reason |
|---|---|---|---|---|---|

Status values: `not-started`, `in-progress`, `reviewed-clean`, `findings`, `skipped: <reason>`, `blocked: needs owner evidence <what>`, `n/a: <reason>`.

`reviewed-clean` means the lens checklist was applied and every nominated input was traced; it is not a guarantee. Record the nominated inputs count so a reviewer can judge depth.

## Cross-component edges

| From (component:file:line) | To (component:file:line) | Data | Traced? |
|---|---|---|---|

Flows that cross components (a value validated in one module and used in another) are traced once here so no component assumes the other did the check.

## Outside-the-code evidence

| Asset | Setting checked | Evidence (export, CLI output, owner screenshot, date) | Result |
|---|---|---|---|

## Assumptions register

| Id | Assumption | Source (threat model / reviewer) | Confidence | Verification task | Result |
|---|---|---|---|---|---|

## Not reviewed (copied verbatim into the report)

- Cells skipped or blocked, with reason.
- Tools not run, with reason.
- Environments not observed.
- Artifacts not inspected (e.g. store binary not available).

## Re-run rule

A re-run reads the prior ledger, re-opens cells whose files changed since the prior commit, works every `not-started`, `skipped` and `blocked` cell whose blocker is resolved, and re-verifies every open finding. Results are added; earlier entries are not deleted, only superseded with a date.
