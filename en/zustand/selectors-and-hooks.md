# Zustand — selectors and subscription discipline

```kit-cover
type: normative
part-of: README.md
binds: ZSS obligations - how a component subscribes to store state through selectors and useShallow
open-when: shape:frontend-heavy, signal:client-state-store, signal:store-subscription
skip-when: signal:backend-only, signal:no-store-subscription
owns: ZSS-M*, ZSS-N*
```

Scope: Only how components subscribe to store state: selectors, `useShallow`, forbidden whole-store subscription. Excluded: Store shape ([store-persist-and-module.md](store-persist-and-module.md)); server ban ([store-boundaries.md](store-boundaries.md)).

Rule prefix: **ZSS-M**\* / **ZSS-N**\* — rules in this file only.

Environment: Applies to React / React Native component subscriptions only when the decision matrix selects Zustand for this client-state concern. Server-authoritative state remains in the project's selected server-state system; see [GZ3](zustand.md#decision-gates-normative-index) and the [decision matrix](../decision-matrix/decision-matrix.md).

Compliance: Violations are bugs; **must not** ship; STOP — [zustand.md](zustand.md) **ZST-C4**, **ZST-C11**.

---

## **MUST**

| ID | Rule |
|----|------|
| **ZSS-M1** | Components **must** subscribe with a selector `useStore(s => s.field)` for each primitive or stable reference needed — not the whole store object. |
| **ZSS-M2** | Selecting two or more top-level slice fields as one object **must** use `useShallow` from `zustand/react/shallow` wrapping the selector — not a raw `s => ({ a: s.a, b: s.b })` without `useShallow`. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **ZSS-N1** | `useXxxStore()` with no selector argument to subscribe to entire state — forbidden (debug-only getState in non-render code exempt). |
| **ZSS-N2** | `const { a, b } = useXxxStore()` (destructure default hook return) — forbidden; same as **ZSS-N1** (whole-slice subscription). |
| **ZSS-N3** | Multi-field object selector without `useShallow` — forbidden (**ZSS-M2**). |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Performance regression from subscriptions | Audit for **ZSS-N1**–**ZSS-N3**; refactor to **ZSS-M1** / **ZSS-M2**. |

---

## Implementation checklist

- [ ] **ZSS-M1** single-field selectors
- [ ] **ZSS-M2** / **ZSS-N3** multi-field useShallow
- [ ] **ZSS-N1** / **ZSS-N2** no whole-store hook pattern

Testability: Static: ESLint / review — `useStore()` calls have selector; multi-field uses `useShallow`.

---

Part of: [README.md](README.md) — Zustand SSOT.
