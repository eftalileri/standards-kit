# Forms — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../forms/forms.md`](../../forms/forms.md).

Strict alignment: Copy [SSOT readiness **M7**](../../ssot-readiness/ssot-readiness-rules.md) for user-facing validation strings. Anti-copy: adapt to your form library (RHF, etc.).

---

## Zod schema (pattern)

```typescript
export const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});
```

---

## Submit-time parse (pattern)

```typescript
const result = formSchema.safeParse(formData);
if (!result.success) {
  // Map to field errors; user copy per M4 / SSOT readiness M7
  return;
}
await mutateAsync(result.data);
```
