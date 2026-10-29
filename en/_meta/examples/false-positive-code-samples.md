# False positive prevention — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Illustrative only. Normative rules: [`../../false-positive/rules.md`](../../false-positive/rules.md), [`../../false-positive/guard-runtime-rules.md`](../../false-positive/guard-runtime-rules.md).

---

## GFP1 evidence (illustrative — **FP-O3**)

Non-normative template for a PR or ticket. Replace the sample path and values with evidence from the consuming repository; `src/foo/bar.ts` and line `42` are placeholders only.

- file: `src/foo/bar.ts`
- line: `42`
- guard output: (paste verbatim reporter line or JSON)
- explanation: The guard flags X, but this line is Y because Z (product rule / SSOT link).

---

## Context window and matcher (JavaScript-style)

An inclusive `{before:b, after:a}` window at index `i` becomes `slice(i-b, i+a+1)`. The flagged line and both end points are included; an admitted check's boundary observation uses the end point and the next element, per [context windows](../../false-positive/guard-runtime-rules.md#context-windows-normative).

## Annotation override

Use the finding's line-attributable, reasoned suppression through the central authority ([ENA-G5](../../enforcement-architecture/enforcement-authoring.md)); the old range-scanned `@non-decision` engine has no live contract here.

## Registry entry shape (illustrative)

A new subject belongs in an existing table rule's row ([ENA-R3](../../enforcement-architecture/enforcement-authoring.md)). The old versioned pattern/matcher/scenario registry and its test recipes are retired; do not recreate them.
