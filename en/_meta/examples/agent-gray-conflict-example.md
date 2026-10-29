# Gray-situation conflict example (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../agent-gray-decisions/gray-situation-decisions.md`](../../agent-gray-decisions/gray-situation-decisions.md).

## Situation

Two statements inside this kit, both normative rule rows:

- Transaction standard: "All DB writes **MUST** run inside a transaction."
- Performance standard: "A read-only query MAY run outside a transaction."

## Expected agent behavior

| Step | Action |
|------|--------|
| 1 | Both sides are kit statements, so apply [**KIT-PRE-2**](../precedence.md). Rung (1) does not fire: neither file is `type: reference`. |
| 2 | Rung (2) prohibition over permission decides — but read the two extents first: the prohibition covers writes, the permission covers reads, so they do not overlap and there is no conflict to settle. |
| 3 | Change the permission to "any query" and the extents *do* overlap: rung (2) then decides for the prohibition, and the permission is narrowed only by editing the prohibition where it is defined — never by inference here. |
| 4 | Record the rung that decided and the file property it read. If nothing decides, that is a kit defect (rung 6): record it and STOP — do not carry two disagreeing rule texts to the user as a product question. |

This matches **M7** / **M8** in the normative standard.
