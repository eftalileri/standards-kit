# SSOT readiness and form data — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../ssot-readiness/ssot-readiness-and-form-data.md`](../../ssot-readiness/ssot-readiness-and-form-data.md).

Anti-copy: Adapt to your store, Query keys, and i18n.

---

## Readiness gate (pattern)

```typescript
// Derive isReady from all required sources (lists, init, etc.)
const isReady = servicesLoaded && packagesLoaded && initDone;

if (!isReady) {
  return <ScreenLoading statusText="Form data is loading" />; // or field-level skeletons plus a visible status
}

return <FormShell>...</FormShell>;
```

---

## Submit guard (pattern)

```typescript
const onSubmit = () => {
  if (!isReady) {
    // Keep the guard even when the UI disables submit; explain why the action is unavailable.
    setSubmitStatus('Form data is still loading. Try again when loading finishes.');
    return;
  }
  // ...
};

// In the rendered form, disable the action and expose loading/status feedback:
<SubmitButton disabled={!isReady} onPress={onSubmit} />
{!isReady && <StatusMessage role="status">Form data is loading.</StatusMessage>}
{submitStatus && <StatusMessage role="status">{submitStatus}</StatusMessage>}
```

---

## Validation message shape (pattern)

```text
[Field label] — [validation text]. Root cause: [why]. Solution: [one action].
```

Align with [error-handling **M3**](../../error-handling/error-handling.md).
