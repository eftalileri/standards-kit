# Auth — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Binding rules: [auth-governance.md](../../auth/auth-governance.md), [auth-client-behavior.md](../../auth/auth-client-behavior.md), and [Security](../../security/README.md).

---

## tokenManager sketch (calls SecureStore)

```typescript
// Pseudonym: align with SEC-M-STORE-1 — use expo-secure-store on RN, not AsyncStorage.
import * as SecureStore from 'expo-secure-store';

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync('accessToken', token);
}
```

---

## Zod login shape (sketch)

```typescript
import { z } from 'zod';

export const loginRequestSchema = z.object({
  phoneNumber: z.string().min(10),
  countryCode: z.string().length(2),
  verificationCode: z.string().length(6),
});
```

---

## TanStack mutation + Zustand sync (conceptual)

After a successful login mutation, update the auth slice and call `tokenManager` to persist tokens per **AUTH-M-TOKEN-1** — do not persist token strings in MMKV-backed Zustand persist (**AUTH-N-TOKEN-1**).
