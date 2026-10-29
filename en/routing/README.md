# Routing (React Navigation)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** React Navigation, guard, deep link, screen, flow


Purpose: Normative navigation, route guards, deep linking, and flow orchestration for React Native applications that adopt React Navigation. Detailed API examples assume the v7 family; adapt them to the version and navigator selected by the application.

## Agent TL;DR

- Follow the selected React Navigation version and stack-compatible RTG-M-* rules. No navigation inside mutation callbacks (**RTG-N2**) or Zustand store actions (**RTG-N1**). Deep linking follows RTG rules; lazy-screen performance follows PERF-BIM-*.
- Stability thresholds: RTG-T-STAB-* before gate decisions.
- Decision gates: GRTG1–GRTG5 (in routing.md).

Non-normative samples: [`../_meta/examples/routing-code-samples.md`](../_meta/examples/routing-code-samples.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: RTG- layer-edge subset, file placement defaults, full kit topic index).

Deterministic stability predicates (**RTG-T-STAB**-\* ) and decision gates (GRTG1–GRTG5) are in [routing.md](routing.md).

---

## Reading order (normative)

1. [routing.md](routing.md) — Scope, agent contract (**RTG-C\***), technology gate, stability thresholds (**RTG-T-STAB**-\*), decision gates (GRTG1–GRTG5), guard model.
2. [navigation-rules.md](navigation-rules.md) — **MUST** / **MUST NOT** (**RTG-M\***, **RTG-N\***), the normative failure paths, modal vs push, hardware back.
3. [navigation-flow-and-layout.md](navigation-flow-and-layout.md) — call order, deep linking, file layout, implementation checklist.

---

## Cross-links

- [Decision matrix](../decision-matrix/decision-matrix.md)
- [TanStack Query](../tanstack-query/README.md) — server state; **RTG-N2** forbids navigation inside mutation callbacks.
- [Zustand](../zustand/README.md) — **RTG-N1** forbids navigation inside the store.
- [Performance](../performance/README.md) — **PERF-BIM**-\* for lazy screens and navigator graph performance.
- [Error handling](../error-handling/error-handling.md) — user-visible errors on invalid deep links where applicable.

---

## Rule IDs

Use full RTG- and GRTG identifiers when citing these requirements so references remain unambiguous across the routing files.
