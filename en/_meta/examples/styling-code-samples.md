# Styling — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Illustration only. Normative rules live in [`../../styling/styling.md`](../../styling/styling.md).

Naming note: This sample uses the export name `TYPOGRAPHY`. Use the spelling declared by the target project’s canonical theme-token module; this illustration is not an authority for another project’s export names. See [`../../styling/README.md`](../../styling/README.md) (**STY-M3**, **STY-N4**).

---

## Theme module shape (illustrative)

Illustrative path: `src/constants/theme.ts`. Your repository must document the real canonical path per **STY-M3** in [`../../styling/stylesheet-and-theme-tokens.md`](../../styling/stylesheet-and-theme-tokens.md).

```typescript
export const COLORS = {
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#111111',
  PRIMARY: '#0066CC',
} as const;

export const TYPOGRAPHY = {
  H5: { fontSize: 20, fontWeight: '600' as const },
  BODY_MEDIUM: { fontSize: 16, fontWeight: '400' as const },
} as const;

export const SPACING = { XS: 4, SM: 8, MD: 16, LG: 24 } as const;
export const BORDER_RADIUS = { SM: 4, MD: 8, LG: 12 } as const;
export const SHADOWS = {
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
```

Token values in the theme file are allowed to use literals; **STY-M4** applies to StyleSheet.create in screens and components, not to the theme definition file itself.

---

## Inline StyleSheet (co-located)

```typescript
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Title</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.CARD,
    ...SHADOWS.LEVEL_1,
  },
  title: {
    ...TYPOGRAPHY.H5,
    color: COLORS.TEXT_PRIMARY,
  },
});
```

---

## Split file pattern (`*.styles.ts`)

`AppointmentListScreen.styles.ts`:

```typescript
import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
});
```

`AppointmentListScreen.tsx`:

```typescript
import { styles } from './AppointmentListScreen.styles';
```

---

## Allowed inline slot (runtime only)

```tsx
<View style={[styles.container, { width: dynamicWidth }]} />
<View style={[styles.box, { opacity: isVisible ? 1 : 0 }]} />
```

---

## Patterns that violate SSOT (do not copy)

```tsx
// STY-N2 / STY-N3: static literals in inline style
<View style={{ padding: 16, backgroundColor: '#ffffff' }} />

// STY-M4: literals inside StyleSheet.create (outside theme)
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#ffffff', borderRadius: 8 },
});
```
