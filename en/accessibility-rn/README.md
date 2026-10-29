# Accessibility (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** accessibilityLabel, accessibilityRole, screen reader, focus, RN Accessibility API

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for accessible React Native UI on Expo: labels, roles, focus, and screen reader behavior. Forms and inputs remain governed by [forms](../forms/forms.md) for accessibilityLabel on fields; this hub adds screen-level and non-form patterns.

Normative part file: [`accessibility-rn.md`](accessibility-rn.md).

---

## Scope (hub)

- Included: `accessibilityLabel` / `accessibilityHint` where product requires, accessibilityRole, accessible grouping, AccessibilityInfo announcements for significant state changes, focus management for modals and navigation.
- Excluded: Platform OS settings outside app control. Backend content accessibility. PDF accessibility -- report hubs.

Applicable rules: Screen-level and non-form accessibility obligations are defined in [accessibility-rn.md](accessibility-rn.md); form-field requirements remain in [forms](../forms/forms.md).

---

## Reading order (normative)

1. [accessibility-rn.md](accessibility-rn.md) -- Definitions (**A11Y-RN-D**\*), **MUST** / **MUST NOT** (**A11Y-RN-M**\* / **A11Y-RN-N**\*), agent contract (**A11Y-RN-C**\*).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **A11Y-RN-C**\* | Agent execution contract |
| **A11Y-RN-D**\* | Definitions |
| **A11Y-RN-M**\* | **MUST** |
| **A11Y-RN-N**\* | **MUST NOT** |

---

## Related

- [Forms](../forms/forms.md) -- accessibilityLabel on inputs and buttons (project rule).
- [Mobile UI patterns](../mobile-ui-patterns/README.md) -- composition patterns.
- [Error handling](../error-handling/error-handling.md) -- error surfacing and announcements.
