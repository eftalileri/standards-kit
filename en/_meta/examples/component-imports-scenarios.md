# Component imports — scenarios (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — training and illustration only. Normative rules: [`../../imports/component-and-module-imports.md`](../../imports/component-and-module-imports.md).

---

## Metro "Unable to resolve" (typical root cause)

Symptom: `Unable to resolve "../../auth/Button"`.

Explanation: The bundler resolves relative paths from the importing file. If the shared UI root segment (for example `components`) is missing, the resolver may look under `screens/auth/` or another feature folder for `Button`, not `src/components/auth/Button`.

What to check first (aligns with **IMP-M2**, **IMP-N1**, GIM2):

1. Does the specifier include the shared UI root segment `components` where required?
2. Is the `../` depth correct for the file location (**IMP-M3**)?

---

## Bundler cache

Clearing cache (for example `npx expo start --clear`) may help diagnose stale graphs but does not replace correct import paths (normative **IMP-C5**).
