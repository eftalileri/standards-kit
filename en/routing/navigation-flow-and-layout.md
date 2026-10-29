# Routing — call order, deep linking, file layout, hardware back

```kit-cover
type: normative
part-of: README.md
binds: the deterministic order in which the RTG and GRTG rows are applied at a navigation call site, the deep-link sequence and the minimum navigation file layout - it defines no rule identity of its own
open-when: shape:frontend-heavy, signal:navigation-change, signal:deep-link-open, signal:navigation-file-layout
skip-when: signal:backend-only, signal:no-navigation-change
owns: none
```

Scope: The deterministic order in which routing gates and rules are applied at a call site, the deep-linking sequence, a parameterized navigation-module layout, modal-vs-push and hardware-back pointers, failure-path and environment coverage, and an implementation checklist.

Document type: Normative part file under [README](README.md) — carries no rule identity of its own. Every RTG- and GRTG row named here is defined in [routing.md](routing.md) (**RTG-C\***, **RTG-T-STAB**-\*, GRTG\*) or [navigation-rules.md](navigation-rules.md) (**RTG-M\***, **RTG-N\***).

References: [README.md](README.md); [routing.md](routing.md); [navigation-rules.md](navigation-rules.md); [`../_meta/examples/routing-code-samples.md`](../_meta/examples/routing-code-samples.md) (non-normative).

---

## Deterministic navigation flow (normative)

1. User event or deep link opens handler.  
2. Persist state updates through TanStack / Zustand per their SSOTs.  
3. GRTG1 — stability predicates.  
4. GRTG2 — navigation vs state-only.  
5. GRTG3 — guard.  
6. GRTG4 — params.  
7. GRTG5 — reset policy when applicable.  
8. **RTG-M12** — confirm this flow owner module is the only trigger.  
9. **RTG-M13** — idempotency guard for duplicate invocations.  
10. Call `navigate`/`dispatch`/`reset`.  

---

## Deep linking (normative)

- Central `linking` config (**RTG-M6**) maps path → route + params.  
- After parse, run **RTG-M5**.  
- Unknown paths → GRTG4 NO branch (fallback ).  
- Param names must match `ParamList` (**RTG-M3**).

---

## File layout (minimum)

```
<navigation-root>/
├─ types.ts          # Central route-parameter types and guard types
├─ routes.ts         # Route constants, central definitions
├─ linking.ts        # Deep link config; parse then RTG-M5
├─ guards.ts         # Sync pure guards
└─ navigators/
   ├─ AppNavigator.tsx
   └─ AuthNavigator.tsx
```

Orchestrator hooks or policies (for example, `useXRedirectFlow`) live in the navigation or feature-orchestration modules designated by the architecture (**RTG-M9**).

---

## Failure-path and environment notes

| Dimension | Coverage |
|-----------|----------|
| Failure / invalid state | Failure paths table above ; **RTG-M5**, **RTG-M7**, **RTG-M13**. |
| Environment | React Native navigation ref readiness (**RTG-T-STAB-3**) ; deep link hosts per platform. |
| N/A | Pure server services with no RN tree — Scope excludes them. |

*(The failure paths table this row points at is in [navigation-rules.md](navigation-rules.md).)*

---

## Implementation checklist (non-blocking migration aid)

- [ ] GRTG1 predicates documented on each new orchestrator  
- [ ] **RTG-N1** / **RTG-N2** checks cover store and mutation-callback boundaries where configured
- [ ] **RTG-M4** / **RTG-N5** guards remain synchronous and side-effect free
- [ ] **RTG-M5** param validation per routed screen  
- [ ] **RTG-M6** / **RTG-M7** linking + session reset  
- [ ] **RTG-M8** determinism (no time / random in decision path )  
- [ ] **RTG-M12** flow manifest owner paths  
- [ ] **RTG-M13** idempotency evidence (static pattern )  
- [ ] **RTG-M10** / **RTG-M11** docs + routes table  

---

Part of: [README.md](README.md) — routing hub.
