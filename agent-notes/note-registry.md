# Agent note registry

This registry is intentionally empty. Add a note only when an observation needs explicit owner direction or records a justified divergence from an authorized plan.

## A. Deferred observations

| ID | Observation | Evidence | Decision needed | Status |
|----|-------------|----------|----------------|--------|

## B. Plan divergences

| ID | Governing rule | Evidence | Why implementation differs | Status |
|----|---------------|----------|----------------------------|--------|

## C. Retired rule identities

Retired rule identities are not recorded here. The single authority is [`../retired-rule-ids.tsv`](../retired-rule-ids.tsv) at the kit root: one row per identity a kit rule once carried, its mirror file, its retirement class, and its successor when one exists. Add a retirement there, in the same change that removes the rule, and never keep a second table here.

## Entry rules

- Use stable identifiers and link evidence to repository-relative paths and line numbers.
- Keep each entry specific, actionable, and limited to one concern.
- Record a retired rule identity in [`../retired-rule-ids.tsv`](../retired-rule-ids.tsv), not in this registry; a retired identity is never back-filled or renumbered.
- Do not treat this registry as a substitute for normative standards or an implementation plan.
- Update or close an entry when the owner decides or the work is completed.
