# Zustand — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

SSOT: [`zustand/`](../../zustand/README.md) — ZST- / ZSB- / ZSP- / ZSS- / ZSA-\* rows.

Purpose: Short patterns only; must not contradict normative tables.

---

## Persist skeleton (illustrative)

```typescript
export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'light',
      hasHydrated: false,
      hydrationStatus: 'pending' as 'pending' | 'ready' | 'failed',
      hydrationError: undefined as string | undefined,
      setTheme: (theme) => set({ theme }),
      reset: () => set({ theme: 'light', hasHydrated: true }),
    }),
    {
      name: 'prefs',
      version: 1,
      storage: createJSONStorage(() => storageAdapter),
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          usePrefsStore.setState({
            hydrationStatus: 'failed',
            hydrationError: 'Preferences could not be loaded.',
          });
          // Send the failure through the configured safe observability boundary.
          reportPersistenceFailure(error, {
            action: 'prefs.rehydrate',
            rootCause: 'Persisted preferences could not be restored',
            solution: 'Retry loading preferences or reset them explicitly.',
          });
          return;
        }
        usePrefsStore.setState({
          hasHydrated: true,
          hydrationStatus: 'ready',
          hydrationError: undefined,
        });
      },
    }
  )
);
```

The UI can render the explicit `failed` status and offer a retry that reruns the failed prerequisite:

```typescript
export function retryPrefsHydration() {
  usePrefsStore.setState({ hasHydrated: false, hydrationStatus: 'pending', hydrationError: undefined });
  return usePrefsStore.persist.rehydrate();
}
```

`hasHydrated` becomes `true` only after successful rehydration; the failure message is a separate, visible state. `reportPersistenceFailure` stands for the consuming application's configured, safe error-reporting boundary.

---

## Decision vs non-decision (illustrative)

- Non-decision getter may return `null` when user absent.
- Decision action `setRole`: if `!get().user` → `throw` Error with root cause + remedy (**ZSA-M1**); do not return `null`.

---

## Multi-field selector with `useShallow`

```typescript
import { useShallow } from 'zustand/react/shallow';

const { a, b } = useMyStore(
  useShallow((s) => ({ a: s.a, b: s.b }))
);
```

---

## Devtools (optional)

Wrap `persist` with `devtools` in development only per project policy — no secrets in state.
