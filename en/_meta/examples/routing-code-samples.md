# Routing — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustrations only. Normative rules live in [`../../routing/routing.md`](../../routing/routing.md).

---

## Guard result type (illustrative)

```typescript
type GuardResult =
  | { allow: true }
  | { allow: false; redirect: keyof RootStackParamList };
```

---

## Param list shape (illustrative)

```typescript
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Appointment: { appointmentId: string };
};
```

---

*End of non-normative samples.*
