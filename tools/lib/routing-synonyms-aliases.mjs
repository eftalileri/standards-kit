/**
 * GENERIC ALIASES — the hand-kept, non-derivable half of `routing-synonyms.tsv`.
 *
 * Each row: a natural English word an agent is likely to type -> the canonical routing token the
 * kit uses for that subject. Rows appear in the table with provenance `alias`.
 *
 * WHY HAND-KEPT: which word an agent will type is a property of tasks, readable from no file in
 * the kit. A word the kit spells one way and an agent spells another (kit "scheduler", agent
 * "cron") can only be paired by hand. Only add words the kit's own text does not already yield:
 * an alias for a word the kit already uses hides a broken derivation.
 *
 * KEY ON THE SYMPTOM, NOT THE REMEDY: a phrase must name the problem a task arrives with. A row
 * keyed on the name of the solution is unreachable from the problem, and an agent who can already
 * name the solution does not need the rule. When one phrase has two real homes, write two rows
 * and let the fan-out column decide. Never invent a token for a concept with no home: report the
 * gap instead.
 *
 * These aliases travel with the kit and target the kit's own topics. If an adopting project
 * removes a topic, an alias whose token no longer exists is skipped with a warning. Project- or
 * language-specific phrases belong in `routing-synonyms-local-aliases.mjs`, not here.
 */
export const ALIASES = Object.freeze([
  // --- scheduling, scaling, time ---
  ['cron', 'signal:scheduled-job'],
  ['cron-schedule', 'signal:scheduled-job'],
  ['cron-job', 'signal:async-job'],
  ['scheduler', 'signal:scheduled-job'],
  ['scheduled-task', 'signal:scheduled-job'],
  ['multi-instance', 'signal:cross-instance-state'],
  ['horizontal-scaling', 'signal:cross-instance-state'],
  ['timezone-conversion', 'signal:timezone-resolution'],
  // --- empty values, notifications, i18n, migrations, errors ---
  ['default-value', 'signal:empty-semantics'],
  ['config-default', 'signal:empty-semantics'],
  ['engagement', 'signal:engagement-inactivity'],
  ['notification-suppression', 'signal:notification-suppression'],
  ['audience-eligibility', 'signal:audience-eligibility'],
  ['placeholder-parity', 'signal:translation-catalog'],
  ['backend-i18n', 'signal:i18n-error-message'],
  ['locale-parity', 'signal:translation-catalog'],
  ['legacy-record', 'signal:schema-migration'],
  ['null-handling', 'signal:empty-semantics'],
  ['http-status', 'signal:error-raise'],
  ['error-code', 'signal:error-raise'],
  // --- synonyms of the same class ---
  ['backfill-old-rows', 'signal:schema-migration'],
  ['data-migration', 'signal:schema-migration'],
  ['race-condition', 'signal:distributed-lock'],
  ['duplicate-request', 'signal:idempotency'],
  ['retry-storm', 'signal:idempotency'],
  ['zero-value', 'signal:empty-semantics'],
  ['empty-string', 'signal:empty-semantics'],
  ['writes-code', 'signal:source-file-change'],
  ['writing-source-code', 'signal:source-file-change'],
  ['new-source-file', 'signal:source-file-change'],
  ['client-code', 'signal:client-source-change'],
  ['push-notification-metrics', 'signal:notification-analytics'],
  ['inactive-user', 'signal:engagement-inactivity'],
  ['do-not-disturb', 'signal:notification-suppression'],
  // --- single words that occur nowhere in the routable kit text ---
  ['preference', 'signal:zustand-store'],
  ['notification-preference', 'signal:notification-suppression'],
  ['monday', 'signal:recurrence-schedule'],
  ['weekday', 'signal:recurrence-schedule'],
  ['monthly', 'signal:recurrence-schedule'],
  ['daily', 'signal:recurrence-schedule'],
  ['annual', 'signal:recurrence-schedule'],
  ['annual-plan', 'signal:subscription'],
  ['purchase', 'signal:store-subscription'],
  ['home', 'signal:screen-composition'],
  ['card', 'signal:payment-field'],
  ['ui-card', 'signal:ui-primitive'],
  ['remove', 'signal:subject-deletion'],
  ['remove-unused-code', 'signal:dead-code-removal'],
  ['setting', 'signal:zustand-store'],
  ['remote-setting', 'signal:remote-config'],
  ['toggle', 'signal:feature-flag'],
  // --- English phrases the spaced spelling alone does not reach ---
  ['enforcement-scope', 'signal:lint-scope'],
  ['config-scope', 'signal:lint-scope'],
  ['allowlist', 'signal:lint-scope'],
  ['lint-coverage', 'signal:lint-scope'],
  ['plan-reconciliation', 'signal:plan-vs-code-drift'],
  ['stale-document', 'signal:plan-vs-code-drift'],
  ['session-validity', 'signal:device-session'],
  ['privacy', 'signal:pii-masking'],
  ['observability', 'signal:crash-reporting'],
  ['unused-export', 'signal:unused-report'],
  ['orphan-file', 'signal:unused-report'],
  // --- phrases from real task sentences ---
  ['breadcrumb', 'signal:error-classification'],
  ['transport-layer', 'signal:client-transport'],
  ['local-log', 'signal:silent-failure'],
  ['build-number', 'signal:build-config'],
  ['first-monday', 'signal:recurrence-schedule'],
  ['local-time', 'signal:timezone-resolution'],
  ['in-app-purchase', 'signal:store-subscription'],
  ['daily-notification', 'signal:notification'],
  ['user-preference', 'signal:zustand-store'],
  ['old-record', 'signal:schema-migration'],
  ['localized-label', 'signal:locale-sourced-label'],
  ['build-time-predicate', 'signal:idempotency-coverage-predicate'],
  ['duplicate-suppression-coverage', 'signal:idempotency-coverage-predicate'],
  // --- "I am going to write a rule": the rule-writing rules open only on these two signals;
  // a mechanical-enforcement SHAPE narrows but does not open them, so the phrases bind here ---
  ['write-a-rule', 'signal:new-lint-rule'],
  ['writing-a-rule', 'signal:new-lint-rule'],
  ['new-rule', 'signal:new-lint-rule'],
  ['eslint-rule', 'signal:new-lint-rule'],
  ['custom-eslint-rule', 'signal:new-lint-rule'],
  ['ast-rule', 'signal:new-lint-rule'],
  ['write-a-guard', 'signal:new-guard'],
  ['new-check', 'signal:new-guard'],
  ['ci-gate', 'signal:new-guard'],
  ['mechanical-enforcement', 'signal:new-lint-rule'],
  ['mechanical-lock', 'signal:new-lint-rule'],
  ['encode-as-a-rule', 'signal:new-lint-rule'],
  ['three-proofs', 'signal:new-lint-rule'],
  ['positive-proof', 'signal:new-lint-rule'],
  ['negative-proof', 'signal:new-lint-rule'],
  ['ratchet', 'signal:new-lint-rule'],
  ['staged-ratchet', 'signal:check-rollout'],
  ['staged-rollout', 'signal:check-rollout'],
  ['existing-debt', 'signal:check-rollout'],
  ['mechanism-choice', 'signal:new-guard'],
  ['rule-or-guard', 'signal:new-guard'],
  // --- remaining verified phrases ---
  ['stale-plan', 'signal:plan-vs-code-drift'],
  ['error-code-registry', 'signal:error-raise'],
  ['error-taxonomy', 'signal:error-raise'],
  ['log-level', 'signal:log-write'],
  ['background-failure', 'signal:background-worker'],
  // Mirror / parity has no rule family of its own: the essence is single authority
  // (`signal:duplicate-writer`), the mechanism is a cross-file check (`signal:new-guard`).
  ['mirror-parity', 'signal:duplicate-writer'],
  ['enum-parity', 'signal:duplicate-writer'],
  ['second-copy', 'signal:duplicate-writer'],
  ['parity-check', 'signal:new-guard'],
  ['mirror-check', 'signal:new-guard'],
  // --- SYMPTOM -> REMEDY: the duplicate-read rules open only on the signal named after the cache
  // that fixes them, so the symptoms an agent arrives with are bound to it ---
  ['duplicate-read', 'signal:process-local-cache'],
  ['repeated-read', 'signal:process-local-cache'],
  ['same-document-twice', 'signal:process-local-cache'],
  ['per-request-read', 'signal:process-local-cache'],
  ['request-scoped-memo', 'signal:process-local-cache'],
  ['n-plus-one', 'signal:process-local-cache'],
  ['too-many-queries', 'signal:process-local-cache'],
  ['query-cost', 'signal:process-local-cache'],
  ['slow-request', 'signal:process-local-cache'],
  ['slow-endpoint', 'signal:log-write'],
  ['span', 'signal:log-write'],
  ['trace-id', 'signal:log-write'],
  // A token whose name reads like a backend cache boundary may own a client-state file; the
  // phrase is bound to the real backend home too, and the fan-out column decides.
  ['server-cache-boundary', 'signal:process-local-cache'],
  ['backend-cache-boundary', 'signal:process-local-cache'],
  ['cache-boundary', 'signal:process-local-cache'],
  ['cross-request-cache', 'signal:process-local-cache'],
  ['pdf-export', 'signal:pdf-report'],
  ['analysis-report', 'signal:analysis-deliverable'],
]);
