# Agent routing aid (non-normative)

```kit-cover
type: routing
part-of: README.md
binds: nothing
open-when: shape:floor
skip-when: none
owns: none
```

Purpose: The closed shape table, the task-kind table and the lookup commands that [`agent-planning-procedure.md`](../agent-planning/agent-planning-procedure.md) **P3** and **P4** use. Which files a task opens is decided by **P5** from each file's own cover block; this file lists no files and states no condition of its own.

Lookups — query, never read whole. Every `open-when` / `skip-when` token, the files that declare it and its fan-out are generated into `routing-vocabulary.tsv` at the kit root; the natural phrases that name those tokens are generated into `routing-synonyms.tsv` beside it. Both are generated on demand by the kit's own lookup tool — run `node tools/kit-lookups.mjs` from the kit root (or `node <kit>/tools/kit-lookups.mjs`) first when they are absent or older than the kit; `--check` reports whether they are current.

```bash
# run from the kit root (or prefix each file with "$KIT_ROOT/")
grep -iE '(^|[ -])scheduler' routing-synonyms.tsv           # 1. word -> token
grep "^signal:form-input	open	" routing-vocabulary.tsv   # 2. token -> files
cut -f1 routing-vocabulary.tsv | grep -v "^#" | sort -u     # last resort only
```

Start from the **Task kinds** table below: every row whose work the task does gives signals to declare, and each one goes straight to hop 2. Hop 1 finds a token whose name you do not know; keep its word-start anchor `(^|[ -])`, because an unanchored `grep -i` matches mid-word and returns a plausible token from another subject. Hop 3 is a fallback, never an entry point.

Shapes are a closed set of seven, and this table is their authority — the generator fails with `ROUTING_SHAPE_UNKNOWN` on any cover block naming a shape absent from it.

| Shape | The task is |
|---|---|
| `shape:floor` | any task at all — this is what no task can route away |
| `shape:backend-heavy` | mostly server work: handlers, domain services, data access, jobs |
| `shape:frontend-heavy` | mostly client work: screens, client state, navigation, forms |
| `shape:full-stack` | one feature slice crossing the FE↔BE contract in the same change |
| `shape:refactoring` | moving or consolidating existing code without changing behaviour |
| `shape:bug-fix` | repairing a defect against evidence, in whichever tier holds the cause |
| `shape:mechanical-enforcement` | adding, changing or removing a lint rule, guard, CI step or gate |
## Task kinds

A task usually does several of these; declare the signals of every row it matches, then resolve each with hop 2 before writing code. The table is kept by hand because which signals a kind of work always carries is a judgement across topics that no single cover block states; the vocabulary generator fails with `ROUTING_TASK_KIND_TOKEN_UNKNOWN` on a signal here that no cover block opens, and with `ROUTING_TASK_KIND_TOPIC_UNCOVERED` on a topic no row reaches.

| The task adds or changes … | Declare |
|---|---|
| an endpoint that writes: create, update, delete, POST, PUT, PATCH, DELETE, a form submit or payment call reaching the server | `signal:mutation-endpoint`, `signal:api-endpoint`, `signal:error-raise` |
| a webhook or provider callback receiver | `signal:webhook`, `signal:provider-integration` |
| an endpoint that returns a list, a search, a feed, an export source | `signal:list-endpoint`, `signal:api-endpoint` |
| who may call an endpoint or see a record: permissions, roles, tenant or customer scope | `signal:authorization`, `signal:multi-tenant-scope` |
| a request handler that reads per item, calls another service, or caches in process memory | `signal:http-handler`, `signal:outbound-call`, `signal:per-item-query` |
| a database read or write, a query filter built from input, an index | `signal:repository-write`, `signal:mongo-query`, `signal:index-migration` |
| one operation that writes several records or collections | `signal:multi-step-write`, `signal:db-transaction` |
| a new piece of data, a value computed from other values, a business decision or validation | `signal:derived-field`, `signal:domain-decision`, `signal:validation-function` |
| prices, amounts, discounts, payments, balances, commissions | `signal:payment-field`, `signal:money-derivation` |
| dates, times, schedules, time zones, recurring events | `signal:timezone-resolution`, `signal:local-to-utc`, `signal:calendar-day-display` |
| appointments or bookings: create, reschedule, status, occupancy | `signal:appointment-lifecycle` |
| a name or label that users can rename and that other records copy | `signal:editable-attribute`, `signal:display-name` |
| phone numbers | `signal:phone-number` |
| push or in-app notifications, reminders | `signal:push-notification`, `signal:notification` |
| e-mail | `signal:transactional-email` |
| state, cache, lock or rate limit that must hold across server instances | `signal:cross-instance-state`, `signal:distributed-lock` |
| a background job, scheduler, queue worker | `signal:scheduled-job`, `signal:background-worker` |
| a feature that calls a language model: an AI assistant, summary or classifier, an agent's tools | `signal:model-provider-call`, `signal:outbound-call`, `signal:rate-limit`, `signal:log-write` |
| raising errors or writing logs on the server | `signal:error-raise`, `signal:log-write` |
| text the user sees: labels, messages, error copy, a new language, country or currency names | `signal:user-facing-string`, `signal:display-names` |
| a form or input field | `signal:form-input` |
| a screen or UI component, its style, theme, accessibility or empty state | `signal:rn-screen-ui`, `signal:theme-token`, `signal:accessibility-label`, `signal:empty-state` |
| a screen whose choices load from several sources, or a selection on screen | `signal:multi-source-form`, `signal:selection-state` |
| client fetching or caching server data, or a client call that writes | `signal:server-state-cache`, `signal:model-mutation` |
| a paged or infinite list on screen | `signal:infinite-list`, `signal:paged-fetch` |
| client global state or on-device key-value storage | `signal:client-state-store`, `signal:key-value-storage-only` |
| client navigation, routes, deep links | `signal:navigation-change`, `signal:deep-link-open` |
| client error handling, crash and error reporting | `signal:client-failure-path`, `signal:crash-session` |
| sign-in, sign-out, sessions, tokens | `signal:client-auth-integration`, `signal:token-storage` |
| offline behaviour, connectivity, a queue of writes made offline | `signal:offline-ui`, `signal:offline-mutation-queue` |
| app background and foreground, live updates, websockets | `signal:appstate-transition`, `signal:websocket-client` |
| device features: camera, files, location, maps, biometrics, local SQL database | `signal:camera-photo-library`, `signal:device-location`, `signal:biometric-gate`, `signal:client-sqlite` |
| screen or list performance, slowness, bundle size | `signal:render-performance` |
| a speed or memory optimization anywhere, client or server | `signal:optimization-change` |
| feature flags, remote config, forced update | `signal:feature-flag`, `signal:remote-config` |
| Android window insets, edge-to-edge, target SDK | `signal:edge-to-edge` |
| product analytics, conversion or ad attribution events | `signal:product-analytics`, `signal:analytics-attribution` |
| PDF or Excel reports | `signal:pdf-report`, `signal:excel-export` |
| public web pages, search or AI visibility | `signal:web-property-content` |
| environment variables, build config, dependencies | `signal:env-variable`, `signal:build-config`, `signal:dependency-upgrade` |
| types shared between client and server, imports across packages | `signal:shared-type`, `signal:cross-package-import`, `signal:import-path` |
| moving or splitting files | `signal:module-split` |
| deleting code, endpoints or fields reported unused | `signal:dead-code-removal`, `signal:wire-surface-removal` |
| a lint rule, guard or gate | `signal:new-lint-rule`, `signal:new-guard` |
| checking a plan or document against the code | `signal:md-code-verification` |
| an unclear requirement, or two rules that conflict | `signal:ambiguous-requirement`, `signal:conflicting-standards` |
| a new layer, library or technology | `signal:stack-choice` |
| this kit itself | `signal:kit-rule-change` |
