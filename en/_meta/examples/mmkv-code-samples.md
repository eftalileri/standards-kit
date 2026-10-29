# MMKV code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustrate lazy init and async adapter patterns aligned with [mmkv/mmkv.md](../../mmkv/mmkv.md) and parts. Not SSOT. Do not contradict normative IDs (MMK- / MMI- / MMA- / MMR- ).

---

## Lazy singleton getter (sketch)

```typescript
import { createMMKV } from 'react-native-mmkv';

let storage: ReturnType<typeof createMMKV> | null = null;

export function getQueryCacheMmkv(): ReturnType<typeof createMMKV> | null {
  if (storage) return storage;
  try {
    storage = createMMKV({ id: 'myapp-query-cache' });
    return storage;
  } catch (error) {
    // Pseudocode: report fixed operation identity through the app's shared
    // client classification boundary. It must be no-throw, redact raw text,
    // and deduplicate repeated initialization failures.
    reportStorageFailure(error, 'initialize-query-cache');
    return null;
  }
}
```

---

## Async adapter (sketch)

```typescript
import type { StateStorage } from 'zustand/middleware';

export const mmkvQueryCacheAdapter: StateStorage = {
  getItem: async (name) => {
    const s = getQueryCacheMmkv();
    if (!s) return null;
    try {
      return s.getString(name) ?? null;
    } catch (error) {
      // The existing fallback remains null; report once through the shared
      // classification boundary without including `name` or stored values.
      reportStorageFailure(error, 'read-query-cache');
      return null;
    }
  },
  setItem: async (name, value) => {
    const s = getQueryCacheMmkv();
    if (!s) return;
    s.set(name, value);
  },
  removeItem: async (name) => {
    const s = getQueryCacheMmkv();
    if (!s) return;
    s.delete(name);
  },
};
```

TanStack persister and Zustand `createJSONStorage(() =>` `adapter)` — see [mmkv-async-adapter.md](../../mmkv/mmkv-async-adapter.md) **MMA-M6** / **MMA-M7**.

---

## Optional: JSON guard before middleware (**MMA-M8** sketch)

When middleware `JSON.parse` would throw on corrupt persisted data, validate in `getItem`, report through the shared classification authority, then preserve the established `null` fallback:

```typescript
function safePersistString(raw: string | undefined): string | null {
  if (raw == null || raw === '') return null;
  try {
    JSON.parse(raw);
    return raw;
  } catch (error) {
    // `raw` may contain user data. Report only the fixed operation identity
    // and sanitized structural error through the shared authority.
    reportStorageFailure(error, 'parse-persisted-query-cache');
    return null;
  }
}

// Inside getItem after getString:
// return safePersistString(s.getString(name));
```

Key prefixes per writer (**MMI-M7**): keep storage namespaces distinct for each writer (for example, a query cache and a Zustand store) in the adopting project’s registry. The `reportStorageFailure` calls above are pseudocode adapters: connect them to the project’s single client classification authority; do not introduce a local logger or a second reporting path. Read/write failures not absorbed by this adapter must continue to their existing owner.
