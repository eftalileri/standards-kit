/**
 * Which definition-site extractor counts which kit file.
 *
 * The kit's topic files were written against two identity grammars, and each file's `owns` cover
 * field was written against the output of the grammar its topic uses:
 *
 *   - FENCE-AWARE (the default): skips fenced code blocks, recognises definitions in leading
 *     `ID:` lines, table first cells, headings, list items and bold labels, and turns SSoT registry
 *     table rows into `#<row>` identities. Used for every file not listed below, including files
 *     outside `en/` and every topic folder an adopting project adds.
 *
 *   - BROAD: recognises more definition idioms (titled table cells, named identities such as
 *     `PERF-T-FPS` / `STY-LAYOUT-OK`, gate identities, bold-label lines) but does not skip fenced
 *     code and does not produce registry rows. Used for the topic folders listed here.
 *
 * Neither grammar alone reproduces the kit's `owns` declarations: the fence-aware one misses the
 * named / gate identities of the broad topics, and the broad one counts example text inside code
 * fences elsewhere. The per-topic split below is the partition the kit was written against.
 *
 * EXTENDING: when you add a topic whose identities follow the broad idioms, add its folder name
 * here. If a file's `owns` disagrees with what its extractor finds, the rule-index generator fails
 * with RULE_INDEX_OWNS_DISAGREEMENT and names the file — that is the signal to check this list.
 * Listing a folder that does not exist is harmless.
 */
export const BROAD_EXTRACTOR_TOPICS = Object.freeze([
  'accessibility-rn',
  'analytics-rn',
  'android-edge-to-edge',
  'app-lifecycle-rn',
  'auth',
  'client-observability-rn',
  'connectivity-rn',
  'error-handling',
  'feature-flags-rn',
  'forms',
  'internationalization-rn',
  'local-authentication-rn',
  'local-database-rn',
  'maps-location-rn',
  'mmkv',
  'mobile-ui-patterns',
  'native-media-rn',
  'offline-sync-strategy-rn',
  'pagination-ux-rn',
  'performance',
  'realtime-rn',
  'routing',
  'styling',
  'tanstack-query',
  'zustand',
]);
