# RN / Expo hubs — merge lens (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Help maintainers decide keep vs consolidate without opening parallel SSOT. Does not change matrix rows or binding rules until a deliberate migration (see [README](../README.md) Standards change discipline).

Part of: [agent-routing-aid.md](agent-routing-aid.md).

| Folder | Verdict | Note |
|--------|---------|------|
| `analytics-rn` | Keep | Product behavior (PAN-\*); separate from crash/session reporting owned by the selected client observability provider (COB-\*). |
| `app-lifecycle-rn` | Keep | AppState / foreground-background; do not merge into `realtime-rn` — different [decision-matrix](../decision-matrix/decision-matrix.md) problem classes. |
| `accessibility-rn` | Keep | Cross-cutting a11y; complements [forms](../forms/README.md), not a duplicate. |
| `client-observability-rn` | Keep | Crash/session only. |
| `connectivity-rn` | Keep | Retry/rate-limit UX is already a part file (`retry-rate-limit-ux-rn.md`) — no second hub. |
| `feature-flags-rn` | Keep | Server flags + TanStack; merging into `tanstack-query/` would need matrix + hub edits. |
| `internationalization-rn` | Keep | App strings; [locale-names](../locale-names/README.md) is ISO labels only. The folder also owns the stack-independent catalog part (I18N-CAT-\*, server-emitted user text and cross-language parity): the `-rn` suffix is a stack tag on the folder, not a subject boundary, so a part file declaring backend scope inside it is preferred over a second i18n topic folder. |
| `local-authentication-rn` | Keep | Biometrics gate vs [auth](../auth/README.md) session. |
| `local-database-rn` | Keep | expo-sqlite vs [MMKV](../mmkv/README.md) — different roles. |
| `maps-location-rn` | Keep | Do not merge with `native-media-rn` (different modules, permissions, matrix rows). |
| `native-media-rn` | Keep | Camera / files / media library. |
| `offline-sync-strategy-rn` | Keep | Domain outbox; does not replace TanStack/MMKV matrix rows. |
| `pagination-ux-rn` | Keep; optional move | If shrinking folder count: norms could become a part file under `tanstack-query/` only with matrix + [README](../README.md) index update — not scheduled. |
| `realtime-rn` | Keep | WebSocket policy; not app lifecycle. |

RN-adjacent (not under `*-rn/`): [expo-notifications](../expo-notifications/README.md), [mobile-ui-patterns](../mobile-ui-patterns/README.md), [routing](../routing/README.md), [styling](../styling/README.md) (theming part), [error-handling](../error-handling/README.md) (display UX part), [forms](../forms/README.md) (interaction part).
