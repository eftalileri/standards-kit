/**
 * LOCAL ALIASES — the adopting project's own layer of `routing-synonyms.tsv`.
 *
 * Put here the phrases that belong to YOUR project rather than to the kit:
 *   - phrases in the team's working language when it is not English
 *     (e.g. ['regla de lint', 'signal:new-lint-rule'], ['geplanter job', 'signal:scheduled-job']);
 *   - your product's domain vocabulary (e.g. ['booking-reminder', 'signal:notification']);
 *   - vendor or in-house tool names your team types (e.g. ['pagerduty', 'signal:crash-reporting']).
 *
 * Rows appear in the table with provenance `local-alias`, so the layer is machine-visible:
 *     grep -v "local-alias$" routing-synonyms.tsv    # the kit's portable table
 *
 * RULES (enforced by the generator):
 *   - each target must be a token some cover block declares in `open-when`
 *     (routing-vocabulary.tsv); an unknown target fails with SYNONYM_ALIAS_TARGET_UNKNOWN;
 *   - a phrase must not also be a generic alias (compared accent-folded); that fails with
 *     SYNONYM_ALIAS_LAYER_OVERLAP.
 * Phrases are normalised like every other phrase (lower case, separators -> "-"); spaced and
 * accent-folded spellings are published automatically. Name the SYMPTOM a task arrives with,
 * not the remedy, and never invent a token for a concept the kit has no home for.
 *
 * Shipped empty: the kit carries no project's vocabulary.
 */
export const LOCAL_ALIASES = Object.freeze([
  // ['phrase in your words', 'signal:existing-token'],
]);
