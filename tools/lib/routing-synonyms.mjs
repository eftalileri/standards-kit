/**
 * NATURAL PHRASE -> ROUTING TOKEN lookup table: `routing-synonyms.tsv` at the kit root.
 *
 * Each row is one mapping:
 * `<natural phrase><TAB><canonical token><TAB>open|skip<TAB><fan-out><TAB>derived|alias|local-alias`.
 * Phrase first, sorted, so ONE anchored grep answers "what is this concept called here?".
 *
 * WHY IT EXISTS: the planning procedure asks the agent to DECLARE tokens, but a token whose name
 * cannot be guessed cannot be declared, and the files it opens are never read. Natural guesses
 * (`cron`, `multi-instance`, `http-status`) return zero against the vocabulary.
 *
 * NOT A SECOND AUTHORITY: this table does not answer "which files exist". It maps phrases to
 * canonical tokens only; the file set is still `routing-vocabulary.tsv`, derived from cover blocks,
 * and this generator reads that rendering as its SOURCE instead of deriving a second one.
 *
 * WHERE PHRASES COME FROM:
 *   (1) `derived` — the token's own name, plus the `**Keywords:**` line and H1 subject fragments
 *       of the files the token opens. Source: the kit's own text.
 *   (2) `alias` — a generic English word absent from the kit text but likely typed by an agent
 *       (kit "scheduler", agent "cron"). Hand-kept in `routing-synonyms-aliases.mjs`; travels with
 *       the kit.
 *   (3) `local-alias` — the adopting project's own phrases (working language, product domain,
 *       vendor names). Hand-kept in `routing-synonyms-local-aliases.mjs`; shipped empty.
 *
 * EVERY SPELLING IS PUBLISHED: normalisation turns separators into hyphens, so each hyphenated
 * phrase is ALSO published with spaces, and each accented phrase ALSO accent-folded, as extra
 * rows. Otherwise a multi-word or unaccented query returns zero, and that zero is
 * indistinguishable from "no rule exists". The canonical spelling is never replaced.
 *
 * COARSE-FILTER TOKENS GET NO DERIVED KEYWORDS: a signal whose fan-out is at or above the
 * coarse-filter width narrows, it does not select; attaching file keywords to it would route a
 * natural word to a token that selects nothing. Such tokens are listed by their own name only.
 *
 * COMPLETENESS IS MECHANICAL: the target set is machine-derived (every `open` token in the
 * vocabulary), so "every open token has at least one phrase" is decidable and fenced here. The
 * reverse — "every phrase a task might type is covered" — is not derivable and is stated as a
 * limit in the table header.
 *
 * FAIL-LOUD: empty vocabulary, empty phrase set, a local alias naming a token that does not exist,
 * an uncovered `open` token, or a documented unanchored grep against this table — each throws.
 */

import fs from 'node:fs';

import { coarseFilterWidth } from './coarse-filter.mjs';
import { listKitMarkdownFiles, toAbsolute } from './kit-tree.mjs';
import { ALIASES } from './routing-synonyms-aliases.mjs';
import { LOCAL_ALIASES } from './routing-synonyms-local-aliases.mjs';
import { renderRoutingVocabulary, VOCABULARY_FILE } from './routing-vocabulary.mjs';

/** The lookup table, kit-root-relative. Not `.md`. */
export const SYNONYMS_FILE = 'routing-synonyms.tsv';

const COLUMN_SEPARATOR = '\t';

/**
 * Words that carry no subject on their own. They stay inside a phrase; only a phrase made solely
 * of stopwords (or numbers) is not produced.
 */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is', 'it', 'its',
  'not', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'what', 'when', 'which', 'with', 'md',
]);

/**
 * The accent-free spelling of a phrase. Language-independent (Unicode decomposition + removal of
 * combining marks, plus a few letters that do not decompose). It produces an extra SEARCH KEY
 * only; no user-facing text is transformed.
 * @param {string} phrase - Normalised phrase.
 * @returns {string} Folded spelling (the input itself when nothing changes).
 */
export function foldDiacritics(phrase) {
  return phrase
    .normalize('NFD')
    .replaceAll(/\p{M}/gu, '')
    .replaceAll('ı', 'i')
    .replaceAll('ø', 'o')
    .replaceAll('ß', 'ss')
    .replaceAll('æ', 'ae')
    .replaceAll('œ', 'oe')
    .replaceAll('đ', 'd')
    .replaceAll('ł', 'l');
}

/**
 * Every spelling of a canonical phrase to publish — the canonical one first, never changed.
 * @param {string} phrase - Canonical (normalised) phrase.
 * @returns {string[]} Spellings, canonical first.
 */
function spellingsOf(phrase) {
  const spellings = [phrase];
  if (phrase.includes('-')) spellings.push(phrase.replaceAll('-', ' '));
  for (const spelling of [...spellings]) {
    const folded = foldDiacritics(spelling);
    if (folded !== spelling) spellings.push(folded);
  }
  return [...new Set(spellings)];
}

/**
 * Normalises a text fragment to canonical phrase form: lower case, hyphenated, plain. The carrier
 * class is `\p{L}\p{N}` (not ASCII), so non-English phrases are not mangled.
 * @param {string} raw - Raw fragment.
 * @returns {string|null} Normalised phrase, or `null` when it carries nothing.
 */
function normalizePhrase(raw) {
  const cleaned = raw
    .toLowerCase()
    .replace(/`[^`]*`/gu, ' ')
    .replace(/\*+/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .replace(/-{2,}/gu, '-');
  if (cleaned.length < 3) return null;
  const words = cleaned.split('-');
  if (words.length > 4) return null;
  if (words.every(word => STOPWORDS.has(word) || /^\d+$/u.test(word))) return null;
  return cleaned;
}

/** A documented `grep ... routing-synonyms.tsv` command on one line (grep before the file name). */
const DOCUMENTED_QUERY_RE = /grep\b[^`\n]*?routing-synonyms\.tsv/gu;

/**
 * Collects the natural-language surface of every kit file: H1 subject fragments + `**Keywords:**`.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {Map<string, Set<string>>} File -> normalised phrases.
 */
function readFileVocabularySources(consumerId) {
  const sources = new Map();
  const unanchored = [];
  for (const file of listKitMarkdownFiles(consumerId)) {
    const text = fs.readFileSync(toAbsolute(file), 'utf8');
    const phrases = new Set();

    // EVERY QUERY DOCUMENTED AGAINST THIS TABLE MUST BE ANCHORED, and this generator is where that
    // is checked because it prints the authoritative form in the table header. An unanchored grep
    // matches MID-WORD and returns the token of an unrelated subject — worse than an empty result,
    // because an empty result is a reported gap while a plausible wrong token gets declared.
    for (const [offset, line] of text.split('\n').entries()) {
      for (const match of line.matchAll(DOCUMENTED_QUERY_RE)) {
        if (match[0].includes('^') || match[0].includes('$')) continue;
        unanchored.push(`${file}:${offset + 1}`);
      }
    }

    // H1 — the subject; split into fragments ("Idempotency — financial ledger, scheduler keys").
    const heading = /^#\s+(.+)$/mu.exec(text);
    if (heading != null) {
      for (const fragment of heading[1].split(/[—–:,()]|--|\/|\+/u)) {
        // Identity lists ("IDEMP-M18–IDEMP-M22") are not natural phrases; upper-case codes drop.
        if (/^[\s*`]*[A-Z][A-Z0-9-]{2,}[\s*`]*$/u.test(fragment.trim())) continue;
        const phrase = normalizePhrase(fragment);
        if (phrase != null) phrases.add(phrase);
      }
    }

    // `**Keywords:**` — the subject's own natural-language surface, comma-separated.
    const keywords = /^\*\*Keywords:\*\*\s*(.+)$/mu.exec(text);
    if (keywords != null) {
      for (const fragment of keywords[1].split(',')) {
        const phrase = normalizePhrase(fragment);
        if (phrase != null) phrases.add(phrase);
      }
    }

    sources.set(file, phrases);
  }
  if (unanchored.length > 0) {
    throw new Error(
      `SYNONYM_QUERY_FORM_UNANCHORED: ${unanchored.join(', ')} — Root cause: a kit document ` +
        `shows an UNANCHORED grep against ${SYNONYMS_FILE}; it matches mid-word and returns the ` +
        `token of an unrelated subject. Solution: use the anchored form the table header prints ` +
        `(\`grep -iE '(^|[ -])<phrase>' ${SYNONYMS_FILE}\`), or drop the copy and point the ` +
        `reader at the table header.`
    );
  }
  return sources;
}

/**
 * Resolves the vocabulary (the single authority) into token -> {field, fanOut, files}.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @param {string} [vocabularyText] - An already rendered vocabulary, to avoid rendering twice.
 * @returns {Map<string, {token: string, field: string, fanOut: number, files: string[]}>}
 */
function readVocabulary(consumerId, vocabularyText) {
  const text = vocabularyText ?? renderRoutingVocabulary(consumerId).text;
  const tokens = new Map();
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;
    const [token, field, fanOut, file] = line.split(COLUMN_SEPARATOR);
    if (token == null || field == null || fanOut == null || file == null) continue;
    const key = `${token} ${field}`;
    if (!tokens.has(key)) tokens.set(key, { token, field, fanOut: Number(fanOut), files: [] });
    tokens.get(key).files.push(file);
  }
  if (tokens.size === 0) {
    throw new Error(
      `SYNONYM_VOCABULARY_EMPTY: ${VOCABULARY_FILE} — Root cause: not one declaration could be ` +
        `read from the rendered vocabulary. Solution: check the vocabulary generator's row format.`
    );
  }
  return tokens;
}

/**
 * Renders the full synonym table text from the tree.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @param {{vocabularyText?: string}} [options]
 * @returns {{text: string, meta: Record<string, number>, warnings: string[]}}
 */
export function renderRoutingSynonyms(consumerId, options = {}) {
  const warnings = [];
  const tokens = readVocabulary(consumerId, options.vocabularyText);
  const fileSources = readFileVocabularySources(consumerId);
  const coarseWidth = coarseFilterWidth(
    [...tokens.values()]
      .filter(entry => entry.field === 'open' && entry.token.startsWith('signal:'))
      .map(entry => entry.fanOut),
    consumerId
  );

  // Key: `<phrase>\t<token>\t<field>`; the same triple is written once.
  const rows = new Map();
  const addSpelling = (phrase, entry, provenance) => {
    const key = [phrase, entry.token, entry.field].join(COLUMN_SEPARATOR);
    if (!rows.has(key)) rows.set(key, { phrase, entry, provenance });
  };
  const add = (phrase, entry, provenance) => {
    if (phrase == null) return;
    for (const spelling of spellingsOf(phrase)) addSpelling(spelling, entry, provenance);
  };

  for (const entry of tokens.values()) {
    // (1) The token's OWN name — unconditionally. This guarantees completeness.
    add(normalizePhrase(entry.token.replace(/^(signal|shape):/u, '')), entry, 'derived');

    // File keywords attach ONLY to a narrow `open` signal: (a) a `shape:` narrows, it never
    // selects; (b) a coarse signal likewise; (c) a `skip` token is a sentence about the TASK, so
    // the subject of a file it CLOSES must never become its name.
    if (entry.field !== 'open') continue;
    if (!entry.token.startsWith('signal:')) continue;
    if (entry.fanOut >= coarseWidth) continue;
    for (const file of entry.files) {
      for (const phrase of fileSources.get(file) ?? []) add(phrase, entry, 'derived');
    }
  }

  const aliasTargets = new Map();
  for (const entry of tokens.values()) {
    if (entry.field === 'open') aliasTargets.set(entry.token, entry);
  }

  // A phrase living in both seeds blurs the boundary between the kit's portable table and the
  // project layer. Compared accent-folded: two seeds can differ raw and collide folded.
  const localFolded = new Set(LOCAL_ALIASES.map(([phrase]) => foldDiacritics(phrase.toLowerCase())));
  const overlap = ALIASES.map(([phrase]) => phrase).filter(phrase =>
    localFolded.has(foldDiacritics(phrase.toLowerCase()))
  );
  if (overlap.length > 0) {
    throw new Error(
      `SYNONYM_ALIAS_LAYER_OVERLAP: ${overlap.join(', ')} — Root cause: the same phrase is in ` +
        `both the generic alias table and the local alias seed. Solution: keep it in one seed ` +
        `only — the generic table if it is a kit-language word, the local seed otherwise.`
    );
  }

  const skippedGeneric = [];
  for (const [phrase, token] of ALIASES) {
    const entry = aliasTargets.get(token);
    if (entry == null) {
      skippedGeneric.push(`${phrase} -> ${token}`);
      continue;
    }
    add(normalizePhrase(phrase), entry, 'alias');
  }
  if (skippedGeneric.length > 0) {
    warnings.push(
      `SYNONYM_GENERIC_ALIAS_SKIPPED: ${skippedGeneric.length} generic alias(es) name a token no ` +
        `cover block declares in open-when (topic removed or token renamed) and were left out: ` +
        `${skippedGeneric.join(', ')}. Fix the target in tools/lib/routing-synonyms-aliases.mjs ` +
        `or delete the row.`
    );
  }

  const unknownLocal = [];
  for (const [phrase, token] of LOCAL_ALIASES) {
    const entry = aliasTargets.get(token);
    if (entry == null) {
      unknownLocal.push(`${phrase} -> ${token}`);
      continue;
    }
    add(normalizePhrase(phrase), entry, 'local-alias');
  }
  if (unknownLocal.length > 0) {
    throw new Error(
      `SYNONYM_ALIAS_TARGET_UNKNOWN: ${unknownLocal.join(', ')} — Root cause: a local alias names ` +
        `a token no cover block declares in \`open-when\`; the table would send the reader to a ` +
        `token that selects no file. Solution: add the token to the right file's \`open-when\` ` +
        `first, or point the alias at an existing token (see ${VOCABULARY_FILE}).`
    );
  }

  const covered = new Set([...rows.values()].map(row => `${row.entry.token} ${row.entry.field}`));
  const uncovered = [...tokens.values()]
    .filter(entry => entry.field === 'open' && !covered.has(`${entry.token} open`))
    .map(entry => entry.token);
  if (uncovered.length > 0) {
    throw new Error(
      `SYNONYM_TOKEN_UNCOVERED: ${uncovered.join(', ')} — Root cause: not one natural phrase ` +
        `could be produced for these \`open\` tokens; a reader who cannot guess their names ` +
        `cannot declare them. Solution: make the token name normalisable, or add a phrase for it ` +
        `in tools/lib/routing-synonyms-aliases.mjs (or the local seed).`
    );
  }

  const lines = [...rows.values()]
    .map(row =>
      [row.phrase, row.entry.token, row.entry.field, String(row.entry.fanOut), row.provenance].join(
        COLUMN_SEPARATOR
      )
    )
    .sort();
  if (lines.length === 0) {
    throw new Error(
      `SYNONYM_TABLE_EMPTY — Root cause: not one mapping row was produced. Solution: check ` +
        `phrase normalisation and the vocabulary.`
    );
  }

  const openTokens = new Set([...tokens.values()].filter(e => e.field === 'open').map(e => e.token));
  const skipTokens = new Set([...tokens.values()].filter(e => e.field === 'skip').map(e => e.token));
  const aliasRows = [...rows.values()].filter(row => row.provenance === 'alias').length;
  const localAliasRows = [...rows.values()].filter(row => row.provenance === 'local-alias').length;
  const spacedRows = [...rows.values()].filter(row => row.phrase.includes(' ')).length;
  const accentedRows = [...rows.values()].filter(row => row.phrase !== foldDiacritics(row.phrase))
    .length;

  const header = [
    '# standards-kit — routing SYNONYMS (natural phrase -> token). LOOKED UP, NEVER READ.',
    '#',
    '# One line per mapping:',
    '#   <natural phrase><TAB><canonical token><TAB>open|skip<TAB><fan-out><TAB>provenance',
    '# Phrase first, sorted, so ONE anchored grep answers "what is this concept called?":',
    '#',
    `#     grep -iE '(^|[ -])dead code' ${SYNONYMS_FILE}`,
    `#     grep -iE '(^|[ -])scheduler' ${SYNONYMS_FILE}`,
    '#',
    '# THE ANCHOR IS PART OF THE ANSWER, NOT DECORATION. `(^|[ -])` binds the query to the START OF',
    '# A WORD. A bare `grep -i` matches MID-WORD, and a mid-word match returns rows about an',
    '# unrelated concept - which is WORSE than an empty result, because a zero is a reported gap',
    '# (SEL-M9) while a plausible wrong token is declared and never questioned. Measured: a bare',
    '# grep for a short word returned seven rows, all of them for one unrelated token whose name',
    '# merely contains the same letters, while the concept the word named was not reachable at all.',
    '# Do NOT reach for `grep -iw` instead: whole-word matching drops suffixed forms, and in an',
    '# agglutinative working language that is most of them.',
    '#',
    '# ALL SPELLINGS ARE CARRIED, so type the phrase the way you would say it. Every hyphenated',
    '# phrase is published again with spaces, and every accented phrase again without accents, all',
    '# pointing at the same token - so "dead code" and "dead-code", or an accented phrase and its',
    '# unaccented twin, reach the same row and no spelling has to be guessed. The canonical spelling',
    '# is never replaced; these are additional search keys and no user-facing text is transformed.',
    '# Without them a multi-word or unaccented query returns zero, and that zero is',
    '# indistinguishable from "no rule exists" (SEL-M8).',
    '#',
    '# Then confirm the token and get its files from the vocabulary, which stays the authority for',
    `# which files exist and which files a token opens: ${VOCABULARY_FILE}`,
    '#',
    '# THIS TABLE IS NOT AN AUTHORITY FOR WHICH FILES OR RULES EXIST. It maps words to tokens and',
    '# nothing else. The file set is decided by cover blocks; the topic list by the generated index.',
    '#',
    '# POLARITY IS COLUMN 3 AND IT MATTERS. `open` = declare this token to OPEN the files it names.',
    '# `skip` = a sentence about the task itself that CLOSES files; declare it only when that',
    '# sentence is true of your task. A backend-only change declares the backend-only negative and',
    '# never the client-only one - in a skip-when field the token that reads like the work being',
    '# done belongs to the other kind of work. The opposite pole removes the most relevant hub',
    '# from the candidate set with no warning of any kind.',
    '#',
    "# WHAT IS DERIVED AND WHAT IS NOT (KIT-ENF-4). `derived` rows come from the kit's own text:",
    '# the token name, plus the `**Keywords:**` line and the H1 subject fragments of the files that',
    '# token declares. `alias` rows are hand-kept (tools/lib/routing-synonyms-aliases.mjs), because',
    '# the fact they encode - WHICH WORD AN AGENT WILL TYPE - is a property of tasks and is readable',
    '# from no file in this tree. A word the kit spells one way and an agent spells another (kit',
    '# "scheduler", agent "cron") can only be paired by hand.',
    '#',
    '# `local-alias` IS THE ADOPTING PROJECT\'S LAYER, AND IT IS STRIPPABLE. The kit text is English,',
    '# so an English synonym travels with the kit. A team\'s working language, product vocabulary and',
    '# vendor names are properties of the project, not of the kit, so those phrases live in one seed',
    '# named for it - tools/lib/routing-synonyms-local-aliases.mjs - which the kit ships empty.',
    '# The boundary is machine-visible, not a prose claim:',
    `#     grep -v "local-alias$" ${SYNONYMS_FILE}    # the portable table`,
    '# The accent-folded spelling of a local phrase stays in that layer too, and the generator',
    '# FAILS if one phrase lands in both seeds under either spelling.',
    '#',
    '# WHAT IS FENCED AND WHAT IS NOT. Fenced, mechanically: every `open` token in the vocabulary',
    '# has at least one phrase here (generation FAILS otherwise), every local alias names a token',
    '# that exists (generation FAILS otherwise; a generic alias whose topic was removed is skipped',
    '# with a warning), and the table is derived on demand, never committed, so it cannot drift',
    '# from the tree. NOT fenced, and stated rather than left to read as coverage: whether every',
    '# phrase a future task might type is present. That would need the universe of task wordings,',
    '# which lives in no file here. A miss is a gap in this table - report it, never invent a token.',
    '#',
    '# THE INPUT IS THE SYMPTOM, THE OUTPUT IS THE REMEDY. A hand-kept row keyed on the name of the',
    '# solution is unreachable from the problem a task arrives with, and an agent who could already',
    '# name the solution would not need the rule. Example: the home of the duplicate-read rules is',
    '# opened by one signal named after the cache that fixes them, so `duplicate read`, `slow',
    '# request` and `too many queries` are bound to it here. The sharper case: a token whose NAME',
    '# reads like a backend cache boundary can open a client-state file — a wrong answer that makes',
    '# the reader confident. Such a token is not renamed when it is correct for its own file; the',
    '# phrase is bound to BOTH real homes and the fan-out column decides.',
    '#',
    '# File keywords are attached ONLY to narrow `open` signals. Shapes and coarse-filter signals',
    '# narrow without selecting, so a subject word attached to them would route to a token that',
    '# selects nothing; and a `skip` token is a sentence about the TASK, so the subject of a file it',
    '# closes must never become its name. Those three carry only their own spelling here.',
    '#',
    `# ${lines.length} rows, of which ${spacedRows} carry a space and ${accentedRows} carry an`,
    '# accent - and each of those has a published unaccented twin pointing at the same token.',
    `# ${openTokens.size} open tokens + ${skipTokens.size} skip tokens are covered; ${aliasRows} rows`,
    `# are hand-kept English aliases and ${localAliasRows} are the strippable project layer.`,
    '# The kit file-size guidance does not apply: it is about single-read ingestion, and nothing',
    '# here is ingested whole (en/authoring/kit-structural-invariants.md KIT-INV-5).',
    '#',
    '# Generated by `node tools/kit-lookups.mjs`. NOT committed: derived on demand',
    '# — regenerate before a lookup that matters.',
    '#',
  ];

  return {
    text: `${[...header, ...lines].join('\n')}\n`,
    warnings,
    meta: {
      rows: lines.length,
      openTokens: openTokens.size,
      skipTokens: skipTokens.size,
      aliasRows,
      localAliasRows,
      spacedRows,
      accentedRows,
      coarseWidth,
      kitFiles: fileSources.size,
    },
  };
}
