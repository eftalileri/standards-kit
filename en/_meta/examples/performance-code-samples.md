# Performance — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustrations only. Normative rules live in [`../../performance/`](../../performance/README.md).

---

## FlatList props (illustrative; tune from profiling)

The values below are sample starting points, not recommended defaults. Profile representative devices and realistic item complexity before choosing `initialNumToRender`, `maxToRenderPerBatch`, or `windowSize`; list performance depends on the workload and device.

```typescript
<FlatList
  data={items}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
/>
```

## Stable renderItem and keyExtractor (illustrative)

```typescript
const renderItem = useCallback(({ item }: { item: Item }) => <ItemCard item={item} onPress={handlePress} />, [handlePress]);
const keyExtractor = useCallback((item: Item) => item.id, []);

<FlatList renderItem={renderItem} keyExtractor={keyExtractor} />
```

## Inline `renderItem` example (illustrative anti-pattern)

```typescript
<FlatList renderItem={({ item }) => <ItemCard item={item} />} />
```
