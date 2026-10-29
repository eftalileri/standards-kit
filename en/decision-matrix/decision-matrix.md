# Decision matrix

```kit-cover
type: normative
part-of: README.md
binds: the problem class to system to standard-file mapping every mapped task follows
open-when: signal:stack-choice
skip-when: none
owns: none
```

Scope: Bind which system and which standard file apply for a known problem class (mostly client/server stack). Not a substitute for [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) when documentation is missing or ambiguous.

Part of this topic: [decision-matrix-governance.md](decision-matrix-governance.md) — the agent execution contract (**C1**–**C7**), the agent role, the **MUST** rows (**M1**–**M8**), the **MUST NOT** rows (**N1**–**N5**), the layer precedence, the change-impact steps and the ordered usage. This file keeps the Matrix itself, because [agent-planning-procedure](../agent-planning/agent-planning-procedure.md) **P2** names this path.

Environment: This file routes only; host / runtime constraints live in linked standards (e.g. Environment variables, Backend logging matrix rows). The matrix itself defines no transport or prod logging rules.

Binding principle: Wrong stack choice for a mapped row, or inventing a row, is a bug. Remedy: fix the implementation or update the matrix / linked standard — no silent substitute.

Goal: Zero interpretation for mapped rows: one route per problem type. A project adopting this matrix records the exact implementation for each project-selected system in the linked standard or architecture record; an unresolved choice is not an invitation to guess and follows **M8**.

Hand-maintained; not an authority for which topics exist — the generated index in [`../README.md`](../README.md) is. Why, what fences it, what does not: [decision-matrix-governance.md](decision-matrix-governance.md) "How this list stays true".

Adoption note: A system description names a problem-solving role, not a mandatory vendor. Technology-specific links are conditional: TanStack Query links apply only when TanStack Query is selected; Zustand links only when Zustand is selected; Forms and Auth links only when their documented Zod/TanStack assumptions match the project; Routing applies only when its supported routing framework is selected. The same condition applies to other platform- or vendor-specific targets. Before treating an adopted matrix as binding, replace each inapplicable target with the selected system's canonical standard and record the exact implementation there or in the architecture record. An unresolved stack choice follows **M8**.

---

## Matrix

| Problem class | System | Standard file |
|---------------|--------|----------------|
| Data from API | Project-selected server-state system | [TanStack Query standard](../tanstack-query/tanstack-query.md), only if TanStack Query is selected; otherwise the selected system's standard |
| Server state | Project-selected server-state system | [TanStack Query standard](../tanstack-query/tanstack-query.md), only if TanStack Query is selected; otherwise the selected system's standard |
| Data fetching | Project-selected server-state system | [TanStack Query fetching standard](../tanstack-query/queries-and-transforms.md), only if TanStack Query is selected; otherwise the selected system's standard |
| Mutations (create, update, delete) | Project-selected server-state mutation system | [TanStack Query mutation and cache standard](../tanstack-query/mutations-cache-sync.md), only if TanStack Query is selected; otherwise the selected system's standard |
| Cache (server state) | Project-selected server-state cache | [TanStack Query cache and key standard](../tanstack-query/query-client-and-keys.md), only if TanStack Query is selected; otherwise the selected system's standard |
| Persist (server state) | Project-selected persistence adapter | [TanStack Query offline-persistence standard](../tanstack-query/ui-persist-offline.md), only if TanStack Query is selected; otherwise the selected adapter's standard |
| Server-data readiness inside a render derivation (component / memo / selector) | The selected server-state system's explicit readiness state; pending and transient errors are not thrown from rendering | [TanStack Query loading standard](../tanstack-query/ui-loading-and-persist-options.md) (**UIP-M17**) / [offline persistence standard](../tanstack-query/ui-persist-offline.md) (**UIP-N3**), only if TanStack Query is selected; [SSoT readiness **M1**](../ssot-readiness/ssot-readiness-rules.md) applies independently |
| UI state | Project-selected client-state system | [Zustand standard](../zustand/zustand.md), only if Zustand is selected; otherwise the selected system's standard |
| User preferences | Project-selected client-state system | [Zustand standard](../zustand/zustand.md), only if Zustand is selected; otherwise the selected system's standard |
| Local state (e.g. modal open) | Project-selected local-state mechanism | [Zustand standard](../zustand/zustand.md), only if Zustand is selected; otherwise the selected mechanism's standard |
| Authentication state | Project-selected client session/state mechanism | [Zustand store-boundary standard](../zustand/store-boundaries.md), only if Zustand is selected; otherwise the selected system's standard |
| Active selection state | Project-selected client-state mechanism | [Zustand selector standard](../zustand/selectors-and-hooks.md), only if Zustand is selected; otherwise the selected system's standard |
| Persist (client state) | Project-selected client-state persistence | [Zustand persistence standard](../zustand/store-persist-and-module.md), only if Zustand is selected; otherwise the selected system's standard |
| Rehydration issues | Explicit hydration/readiness state | [Zustand persistence standard](../zustand/store-persist-and-module.md), only if Zustand is selected; otherwise the selected system's standard |
| Form validation | Project-selected schema validator | [Forms standard](../forms/forms.md), only where the project's validator matches its documented Zod requirements; otherwise the selected validator's standard |
| Mutation parameter validation | Project-selected schema validator | [Forms standard](../forms/forms.md), only where the project's validator matches its documented Zod requirements; otherwise the selected validator's standard |
| Request body validation | Project-selected request-schema validator, enforced at the server boundary | [Error policy](../error-policy/error-policy.md) + [Forms](../forms/forms.md) only if its Zod-based shared-schema assumptions apply; otherwise the selected validator's standard |
| Form state management | Project-selected form-state mechanism | [Forms standard](../forms/forms.md), only if its documented form-state implementation applies; otherwise the selected mechanism's standard |
| Form submission | Project-selected mutation system | [Forms standard](../forms/forms.md), only if its TanStack Query submission assumptions apply; otherwise the selected mutation system's standard |
| Route parameters | Project-selected typed routing system | [Routing standard](../routing/routing.md), only if its supported framework is selected; otherwise the selected router's standard |
| Navigation guards | Project-selected routing and authorization boundary | [Routing standard](../routing/routing.md), only if its supported framework is selected; otherwise the selected router's standard |
| Deep linking | Project-selected routing system | [Routing standard](../routing/routing.md), only if its supported framework is selected; otherwise the selected router's standard |
| Error handling (client) | Project-defined semantic error contract | [Error handling](../error-handling/error-handling.md) |
| API error response (client) | Project-defined semantic error contract | [Error handling](../error-handling/error-handling.md) |
| Form error display | Project-defined semantic error contract | [Forms](../forms/forms.md) only where its validation/submission assumptions apply + [Error handling](../error-handling/error-handling.md) |
| Token management | Project-selected session and secure-storage mechanisms | [Auth integration standard](../auth/auth-client-behavior.md), only if its Zustand/TanStack assumptions apply; [Security](../security/security-secrets-and-logging.md) for storage requirements |
| Login / logout | Project-selected session lifecycle mechanism | [Auth integration standard](../auth/auth-client-behavior.md), only if its Zustand/TanStack assumptions apply; otherwise the selected session system's standard |
| Role-based access control | Client-side UX gate plus authoritative server authorization | [Auth integration standard](../auth/auth-client-behavior.md), only if its Zustand/TanStack assumptions apply; [Security](../security/security-zero-trust-authority.md) for server authorization |
| Performance optimization | Project renderer's documented profiling and memoization mechanisms | [React list and memoization standard](../performance/react-lists-and-memoization.md), only for React renderers; otherwise the selected renderer's standard |
| Bundle size optimization | Project bundler's documented splitting and loading mechanisms | [Bundle and navigation standards](../performance/bundle-navigation-images-memory.md), where its client platform applies; otherwise the selected bundler's standard |
| Environment variables | Project-selected configuration mechanism | [Build environment](../build-environment/build-environment.md) |
| Build configuration | Project-selected build and task configuration | [Build environment](../build-environment/build-environment.md) |
| UI styling | Project design tokens and styling system | [Styling standard](../styling/styling.md), where its target UI platform applies; otherwise the selected styling system's standard |
| Screen composition (help panels, action grids, module shells, elevation lists) | Project platform's documented screen-composition patterns | [Mobile UI patterns](../mobile-ui-patterns/mobile-ui-patterns.md), only for the supported mobile UI platform; otherwise the selected platform's standard |
| Component styles | Project styling system | [Styling standard](../styling/styling.md), where its target UI platform applies; otherwise the selected styling system's standard |
| Colors | Project color tokens | [Styling standard](../styling/styling.md), where its target UI platform applies; otherwise the selected design-system standard |
| Typography | Project typography tokens | [Styling standard](../styling/styling.md), where its target UI platform applies; otherwise the selected design-system standard |
| Spacing | Project spacing tokens | [Styling standard](../styling/styling.md), where its target UI platform applies; otherwise the selected design-system standard |

| Data access layer | Repository pattern | [Repository](../repository/repository-contract.md) |
| Domain business aggregation (authoritative KPIs, totals, invariants, cross-entity rules; excludes transport adapters, thin CRUD-only paths, and client-side second truth for the same metric) | Project's domain/application service boundary | [Code modularity](../code-modularity/code-modularity.md) + [Monorepo boundaries](../monorepo/monorepo-architecture.md), where applicable; follow a domain-specific authority standard when one exists |
| Atomic operations | DB transactions | [Transactions](../transactions/transaction-policy.md) |
| Backend error handling | Project-defined semantic error contract | [Error policy](../error-policy/error-policy.md) |
| Backend error model (code registry, category, derived severity, single boundary handler, typed carrier) | Project's single typed error registry and category-driven boundary | [Error policy](../error-policy/error-model-registry-and-boundary.md) (M12–M18) |
| Backend expected vs unexpected error routing (incident reporting vs metric channel) | Category → severity → project-selected reporting channel | [Failure-level and channel routing](../logging-policy/failure-level-and-channel-routing.md) (M16–M18) + [Error policy](../error-policy/error-policy.md) |
| Backend logging | Project's documented structured-logging interface | [Logging policy](../logging-policy/logging-policy.md) |
| Backend performance / N+1 read elimination | Backend HTTP efficiency | [Backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (BHE-*) |
| Mutation idempotency | Idempotency key | [Idempotency](../idempotency/idempotency.md) |
| Durable notification caused by a database transaction | Same-transaction outbox plus a worker; no callback or provider send inside the transaction | [Transactions](../transactions/transaction-policy.md) + [Idempotency](../idempotency/boundary-stores-and-provider-callbacks.md) + [Push dispatcher standards](../expo-notifications/backend-dispatcher.md), where applicable |
| Push provider attempt / crash boundary | Durable intent with explicit provider-attempt phases; token correlation alone is not phase evidence | [Push dispatcher standards](../expo-notifications/backend-dispatcher.md) (**NOTIF-BE-M4/M5**) + [receipt and delivery](../expo-notifications/receipt-and-delivery.md), where applicable |
| Bulk write / insertMany | DB transactions + Idempotency key | [Transactions](../transactions/transaction-policy.md) + [Idempotency](../idempotency/idempotency.md) |
| Backend distributed cache / coordination / shared state (cross-instance cache, distributed lock, rate-limit store, idempotency lease, pub/sub) | Project-selected shared coordination system; durable database remains authority for durable facts | [Distributed cache and coordination](../redis/redis.md) (RDS-*), where applicable |
| A recurring/scheduled unit of work that can stop, or keep ticking while producing nothing, with no channel saying so | Declaration at the registration site + one durable last-successful-completion trace on the record the scheduler already keeps + one supervising job raising one registered error per episode; the external monitor watches the supervisor, not the jobs | [scheduled-work-liveness-and-outcome.md](../logging-policy/scheduled-work-liveness-and-outcome.md) (**SJO-M1**–**SJO-M6**) + [scheduled-work-prohibitions-and-enforcement.md](../logging-policy/scheduled-work-prohibitions-and-enforcement.md) (**SJO-N1**–**SJO-N3**) |
| Transactional email sending (OTP / account-recovery codes / account notifications; excludes push and SMS) | Project-selected email provider behind an application-owned interface; state-coupled sends use a transactional outbox where required by the domain | [Email provider](../email-provider/email-provider-mandatory.md) (EMP-*) + [email delivery](../email-provider/email-delivery-mandatory.md) (EDP-*) |
| App strings / localization | Project-selected localization and locale-detection system | [Internationalization](../internationalization-rn/internationalization-rn.md), where applicable |
| Accessibility | Platform accessibility APIs and shared form semantics | [Accessibility standards](../accessibility-rn/accessibility-rn.md), where applicable |
| Crash / session observability | Project-selected client observability system and reporting contract | [Client observability](../client-observability-rn/client-observability-rn.md), where applicable |
| Client-side failure that is caught and NOT re-thrown (a `catch` whose only statement is a log; a path that degrades to a default and returns as if it worked) | Re-throw to an owning boundary, or report through the single client classification authority; the local log is never the channel and the degraded return value never changes | [Client observability standards](../client-observability-rn/classification-authority-and-outbound-links.md) (**COB-RN-M6**) + [silent-failure paths](../client-observability-rn/silent-failure-paths.md) (**COB-RN-M11**) + [absorbed defaults](../client-observability-rn/absorbed-defaults-and-global-nets.md) (**COB-RN-M12**), where applicable; use the adopted storage/persistence standard (for example [MMKV](../mmkv/mmkv-async-adapter.md) **MMA-M5**) only where that system is used |
| Network reachability | Project platform's supported network-state API | [Connectivity standards](../connectivity-rn/connectivity-rn.md), where applicable |
| Camera / files / media library | Platform-supported sandboxed file APIs and explicit permission handling; select capture/media capabilities per project requirements | [Native media standards](../native-media-rn/native-media-rn.md), where applicable |
| Device location, map rendering and directions hand-off | Project-selected location and mapping capabilities; preserve platform hand-off where available | [Maps and location standards](../maps-location-rn/maps-location-rn.md), where applicable |
| Biometric / local device gate | Project-selected local authentication capability; it never substitutes for the server session | [Local authentication standards](../local-authentication-rn/local-authentication-rn.md), where applicable |

| Feature flags / remote config | Project-selected feature configuration and state-refresh mechanisms | [Feature flag standards](../feature-flags-rn/feature-flags-rn.md), where applicable |
| Realtime transport | Project-selected realtime transport and lifecycle policy | [Realtime standards](../realtime-rn/realtime-rn.md), where applicable |
| Local relational storage | Project-selected embedded relational database | [Local database standards](../local-database-rn/local-database-rn.md), where applicable |
| Offline sync strategy (domain data) | Project-selected persistence, synchronization, and outbox mechanisms | [Offline sync standards](../offline-sync-strategy-rn/offline-sync-strategy-rn.md), where applicable |
| Product analytics / behavior | Project-selected analytics client and event taxonomy | [Analytics standards](../analytics-rn/analytics-rn.md), where applicable |
| Ad-platform install / conversion attribution (search-ad and social-ad install signals, web click ids; iOS + Android) | Provider signals validated at one owner path per signal, verdict by one server classifier | [Ad-platform attribution standards](../analytics-rn/ad-platform-attribution.md), where applicable |
| Push notification client UX (opt-in, foreground expectations) | Project-selected push-notification integration and presentation policy | [Notification UX standards](../expo-notifications/notification-opt-in-and-ux.md), where applicable |
| App foreground / background lifecycle | Platform lifecycle API and documented resource-cleanup policy | [App lifecycle standards](../app-lifecycle-rn/app-lifecycle-rn.md), where applicable |
| Client error display surface (toast vs modal vs inline) | Error handling display patterns | [error-display-ux.md](../error-handling/error-display-ux.md) |
| Network retry / rate-limit UX | Project-selected request-state and connectivity mechanisms | [Retry and rate-limit UX standards](../connectivity-rn/retry-rate-limit-ux-rn.md) |
| Platform back / modal exit | Platform navigation API and documented exit policy | [Navigation rules](../routing/navigation-rules.md) (RTG-M14–M15, RTG-N6) |
| Theme / appearance mode | Styling tokens plus the client preference authority | [Theme and appearance standards](../styling/theming-and-appearance.md) |
| Form interaction UX (submit loading, debounce) | Form state and project-selected mutation lifecycle | [Form interaction standards](../forms/form-interaction-ux.md), only where its form/mutation stack assumptions apply; otherwise the selected form and mutation standards |
| Client list / infinite scroll UX | Project-selected server-state pagination and list-rendering patterns | [Pagination UX standards](../pagination-ux-rn/pagination-ux-rn.md), where applicable |
| The mobile app compiled for the browser (same codebase, static web export) | The project-selected web target of the mobile framework; a phone-only capability answers through a web platform file beside its owning module (or the dependency's own web module), never a platform branch at the call site | [Outbound link ownership and visibility](../client-observability-rn/outbound-link-ownership-and-visibility.md) (**COB-RN-M15**), where applicable |

---

Usage (ordered), the contract, the role, the **MUST** / **MUST NOT** rows and the layer precedence: [decision-matrix-governance.md](decision-matrix-governance.md).
