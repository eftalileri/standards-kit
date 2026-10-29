# TanStack Query — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Short illustrations only. Binding rules are in the [TanStack Query standard](../../tanstack-query/README.md); apply them when this library is selected.

## Same-scope placeholderData + keepPreviousData (v5, illustrative)

```typescript
import { keepPreviousData, useQuery } from '@tanstack/react-query';

useQuery({
  queryKey: ['items', scopeId, page],
  queryFn: fetchItems,
  placeholderData: keepPreviousData,
});
```

Here only `page` changes; `scopeId` remains the same proven semantic scope. For an authorization/tenant/viewer/member/filter transition, locally disable the global previous-data placeholder and gate current-key readiness (**CLI-M12**/**N3**):

```typescript
useQuery({
  queryKey: ['payable-items', tenantId, viewerId, memberFilterId],
  queryFn: fetchPayableItems,
  placeholderData: undefined,
});
```

## Query key factory (illustrative)

```typescript
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (scope: string) => [...resourceKeys.lists(), scope] as const,
  detail: (id: string) => [...resourceKeys.all, 'detail', id] as const,
};
```

## Per-item list transform (illustrative)

```typescript
for (const item of rawItems) {
  try {
    out.push(mapRow(item));
  } catch (error) {
    // Pseudocode: delegate to the app's single classification authority.
    // It resolves category/severity and sanitizes the error; pass no row ID,
    // payload, raw message, or stack. Replace with the project's actual helper.
    reportQueryRowFailure(error, 'map-row');
  }
}
```

## Screen + hook split (illustrative)

```text
screens/appointments/ListScreen.tsx     # UI only
screens/appointments/ListScreen.hooks.ts  # useListQuery, handlers, Zustand
```

## Method A — server-confirmed, the default (illustrative; normative rules in **MUT-M28** / **MUT-M15**)

The orchestrator returns its promise; the callback returns it, so `isPending` covers the reconciliation and the form closes only after it settles:

```typescript
// Orchestrator: granular, returns the work it starts (never `void` inside).
export function syncItems(queryClient: QueryClient, scopeId: string, saved: Item): Promise<void> {
  queryClient.setQueryData(itemKeys.detail(saved.id), saved); // confirmed response bridge (G3)
  return queryClient.invalidateQueries({ queryKey: itemKeys.list(scopeId) });
}

const saveItem = useMutation({
  mutationKey: mutationKeys.saveItem,
  mutationFn: putItem,
  // Returned so `pending` covers it; in real code wrapped in the project's terminal
  // no-throw boundary (COB-RN-M13) so a cache failure cannot fail the confirmed write.
  onSuccess: (saved) => syncItems(queryClient, scopeId, saved),
});
```

```typescript
// Caller: non-blocking ...
saveItem.mutate(input, { onSuccess: () => closeForm() });
// ... or blocking behind progress when the next step needs the confirmed entity.
try {
  const saved = await saveItem.mutateAsync(input);
  navigation.navigate('ItemDetail', { id: saved.id });
} catch (error) {
  showSaveError(error); // MUT-M19 — never an empty catch
}
```

## Method B — UI-optimistic (illustrative; normative rules in **MUT-M28** / **MUT-M29**)

The pending row comes from the mutation's own `variables`, never from a cache write. Returning the invalidation promise keeps the mutation `pending` until the refetch settles, so the pending row is replaced by the confirmed row with no empty frame in between:

```typescript
const createItem = useMutation({
  mutationKey: mutationKeys.createItem,
  mutationFn: postItem,
  // Returned promise is awaited by the library -> status stays `pending` until the refetch lands.
  onSettled: () => queryClient.invalidateQueries({ queryKey: itemKeys.list(scopeId) }),
});
```

```tsx
{/* Status gate is mandatory: `variables` survive settle, so an ungated render leaves a ghost row after a failure. */}
{createItem.isPending ? <ItemRow item={createItem.variables} pending /> : null}
```

Another surface reads the same pending intent from the mutation cache — not from a mirrored store copy (**SSG-M8**):

```typescript
const pendingItems = useMutationState({
  filters: { mutationKey: mutationKeys.createItem, status: 'pending' },
  select: (mutation) => mutation.state.variables as CreateItemInput,
});
```

`useMutationState` returns an array — render every entry where the surface allows repeat submits.

---

See [tanstack-query README](../../tanstack-query/README.md) for normative file list.
