/**
 * ROUTING TOKEN -> FILE lookup table: `routing-vocabulary.tsv` at the kit root.
 *
 * Each row is one cover-block declaration:
 * `<token><TAB>open|skip<TAB><number of files declaring the token in that field><TAB><file>`.
 * Token first, sorted.
 *
 * WHY IT EXISTS: the planning procedure builds a task's file set from its SHAPE and SIGNALS, but
 * the vocabulary of those tokens lives scattered across every cover block. Without this table the
 * only way to learn it is to scan every cover block by hand.
 *
 * WHY THE THIRD COLUMN (fan-out): selection is ordered narrowest signal first. With the fan-out on
 * the row, one grep returns both the files and their place in that order.
 *
 * FAIL-LOUD: empty file set / no token derived / a `shape:` token missing from the published shape
 * glossary / a signal shadowing a published shape name — each throws a named error. An empty
 * vocabulary answers "none" to every query and silently sends the reader back to broad reading.
 */

import fs from 'node:fs';

import { parseCoverBlock } from './cover-block.mjs';
import { listKitMarkdownFiles, listTopicSlugs, toAbsolute } from './kit-tree.mjs';

/** The lookup table, kit-root-relative. Not `.md`. */
export const VOCABULARY_FILE = 'routing-vocabulary.tsv';

/**
 * Where the shape names are PUBLISHED, and their row format. The closed shape set is derived from
 * here, not from the scanned cover blocks — deriving the check's criterion from the data being
 * checked would be circular.
 */
export const SHAPE_GLOSSARY_FILE = 'en/_meta/agent-routing-aid.md';
const SHAPE_GLOSSARY_ROW_RE = /^\| `shape:([a-z0-9-]+)` \| /gmu;

const COLUMN_SEPARATOR = '\t';

/**
 * The single producer of the fan-out counter key. The separator is the column separator itself:
 * a token containing a TAB would already break the TSV, so it cannot exist in a valid tree.
 */
function fanOutKey(token, field) {
  return [token, field].join(COLUMN_SEPARATOR);
}

/**
 * Derives the shape names from the published glossary.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {Set<string>} `shape:<name>` tokens.
 */
export function publishedShapes(consumerId) {
  const absolute = toAbsolute(SHAPE_GLOSSARY_FILE);
  if (!fs.existsSync(absolute)) {
    throw new Error(
      `ROUTING_SHAPE_GLOSSARY_MISSING: ${SHAPE_GLOSSARY_FILE} — Root cause: the file that ` +
        `publishes the shape names does not exist; the closed shape set cannot be derived and ` +
        `${consumerId} would accept an invented \`shape:\` name. Solution: restore the file, or ` +
        `update SHAPE_GLOSSARY_FILE in tools/lib/routing-vocabulary.mjs if it moved.`
    );
  }
  const text = fs.readFileSync(absolute, 'utf8');
  const shapes = new Set([...text.matchAll(SHAPE_GLOSSARY_ROW_RE)].map(m => `shape:${m[1]}`));
  if (shapes.size === 0) {
    throw new Error(
      `ROUTING_SHAPE_GLOSSARY_EMPTY: ${SHAPE_GLOSSARY_FILE} — Root cause: not one shape name ` +
        `could be derived from the glossary (its table format must have changed). Solution: ` +
        `restore rows of the form \`| \`shape:<name>\` | <one sentence> |\`.`
    );
  }
  return shapes;
}

const TASK_KIND_HEADING = '## Task kinds';
const TASK_KIND_SIGNAL_RE = /`(signal:[a-z0-9-]+)`/gu;

/**
 * Signals named by the hand-kept Task kinds table (KIT-RCH-10) in the shape glossary file.
 * @param {string} consumerId - Consumer id shown in the error message.
 * @returns {Set<string>} `signal:<name>` tokens.
 */
export function taskKindSignals(consumerId) {
  const text = fs.readFileSync(toAbsolute(SHAPE_GLOSSARY_FILE), 'utf8');
  const start = text.indexOf(`\n${TASK_KIND_HEADING}\n`);
  const section = start === -1 ? '' : text.slice(start + 1).split(/\n## /u)[0];
  const signals = new Set(
    section
      .split('\n')
      .filter(line => line.startsWith('| ') && !line.startsWith('| The task'))
      .flatMap(line => [...line.matchAll(TASK_KIND_SIGNAL_RE)].map(m => m[1]))
  );
  if (signals.size === 0) {
    throw new Error(
      `ROUTING_TASK_KIND_TABLE_EMPTY: ${SHAPE_GLOSSARY_FILE} — Root cause: no signal could be ` +
        `read from the \`${TASK_KIND_HEADING}\` table; ${consumerId} cannot confirm any topic is ` +
        `reachable from a kind of work, and an agent is left to guess token names. Solution: ` +
        `restore rows of the form \`| <work> | \`signal:<name>\`, … |\`.`
    );
  }
  return signals;
}

/**
 * Fails when a Task kinds signal opens nothing, or a topic folder is opened by no row (KIT-RCH-10).
 * @param {Array<{token: string, field: string, file: string}>} declarations - Cover declarations.
 * @param {string} consumerId - Consumer id shown in the error message.
 */
function assertTaskKindCoverage(declarations, consumerId) {
  const signals = taskKindSignals(consumerId);
  const openFiles = new Map();
  for (const d of declarations.filter(x => x.field === 'open')) {
    openFiles.set(d.token, [...(openFiles.get(d.token) ?? []), d.file]);
  }
  const unknown = [...signals].filter(s => !openFiles.has(s)).sort();
  if (unknown.length > 0) {
    throw new Error(
      `ROUTING_TASK_KIND_TOKEN_UNKNOWN: ${unknown.join(', ')} — Root cause: the Task kinds table ` +
        `in ${SHAPE_GLOSSARY_FILE} names a signal no cover block opens; an agent doing that row's ` +
        `work declares it and opens nothing. Solution: use the signal's real name from the cover ` +
        `blocks, or align the row in the change that renamed it.`
    );
  }
  const topics = new Set(listTopicSlugs(consumerId));
  for (const signal of signals) {
    for (const file of openFiles.get(signal)) topics.delete(file.split('/')[1]);
  }
  if (topics.size > 0) {
    throw new Error(
      `ROUTING_TASK_KIND_TOPIC_UNCOVERED: ${[...topics].sort().join(', ')} — Root cause: no Task ` +
        `kinds row opens a file of this topic; an agent declares only the signals it is shown, so ` +
        `the topic is not read by the work it governs. Solution: add a row to the table in ` +
        `${SHAPE_GLOSSARY_FILE} naming the topic's typical work and the narrow signal that opens it.`
    );
  }
}

/**
 * Renders the full vocabulary table text from the tree.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {{text: string, meta: Record<string, number|string>, warnings: string[]}}
 */
export function renderRoutingVocabulary(consumerId) {
  const files = listKitMarkdownFiles(consumerId);
  const shapes = publishedShapes(consumerId);

  /** @type {Array<{token: string, field: string, file: string}>} */
  const declarations = [];
  const fanOut = new Map();
  const unknownShapes = [];
  for (const file of files) {
    const { values } = parseCoverBlock(file);
    if (values == null) continue;
    for (const field of ['open-when', 'skip-when']) {
      const raw = values[field];
      if (raw == null) continue;
      for (const token of raw.split(',').map(part => part.trim())) {
        // The mandatory empty spellings are not conditions; they never enter the vocabulary.
        if (token === '' || token === 'none' || token === 'never-by-default') continue;
        if (token.startsWith('shape:') && !shapes.has(token))
          unknownShapes.push(`${file}: ${token}`);
        const resolved = field === 'open-when' ? 'open' : 'skip';
        const key = fanOutKey(token, resolved);
        fanOut.set(key, (fanOut.get(key) ?? 0) + 1);
        declarations.push({ token, field: resolved, file });
      }
    }
  }

  // A `signal:` name may not SHADOW a published `shape:` name. The shape set is closed and
  // published, signals are free-form; one name meaning two things in two vocabularies is a token
  // an agent cannot declare on purpose — it would take the signal for the shape's counterpart and
  // read the narrow file set it opens as the whole subject.
  const shapeNames = new Set([...shapes].map(shape => shape.slice('shape:'.length)));
  const shadowingSignals = [
    ...new Set(declarations.filter(d => d.token.startsWith('signal:')).map(d => d.token)),
  ]
    .filter(token => shapeNames.has(token.slice('signal:'.length)))
    .sort();
  if (shadowingSignals.length > 0) {
    throw new Error(
      `ROUTING_SIGNAL_SHADOWS_SHAPE: ${shadowingSignals.join(', ')} — Root cause: a signal reuses ` +
        `a name from the published closed shape set; a reader sees the same name in two fields ` +
        `and declares the wrong one. Solution: rename the signal after what it actually gates, ` +
        `or fold it into one of the file's existing narrow signals.`
    );
  }

  if (unknownShapes.length > 0) {
    throw new Error(
      `ROUTING_SHAPE_UNKNOWN: ${unknownShapes.join(', ')} — Root cause: a cover block declares a ` +
        `\`shape:\` name that is not in the published glossary (${SHAPE_GLOSSARY_FILE}); an ` +
        `invented shape matches no task and the file silently drops out of the reading path. ` +
        `Solution: use one of the published shapes, or add the new shape to the glossary with ` +
        `one sentence in the same change.`
    );
  }

  assertTaskKindCoverage(declarations, consumerId);

  const rows = declarations
    .map(d =>
      [d.token, d.field, String(fanOut.get(fanOutKey(d.token, d.field))), d.file].join(
        COLUMN_SEPARATOR
      )
    )
    .sort();
  if (rows.length === 0) {
    throw new Error(
      `ROUTING_VOCABULARY_EMPTY — Root cause: not one routing token could be derived; with an ` +
        `empty vocabulary the signal step of file selection returns nothing. Solution: check the ` +
        `cover blocks and the kit root.`
    );
  }

  const openTokens = new Set(declarations.filter(d => d.field === 'open').map(d => d.token));
  const skipTokens = new Set(declarations.filter(d => d.field === 'skip').map(d => d.token));
  const openSignals = [...openTokens].filter(t => t.startsWith('signal:'));
  const singleFileSignals = openSignals.filter(t => fanOut.get(fanOutKey(t, 'open')) === 1);
  const widest = openSignals
    .map(t => [t, fanOut.get(fanOutKey(t, 'open'))])
    .sort((a, b) => b[1] - a[1])[0] ?? ['(none)', 0];
  // The two widest negatives are written into the header by NAME and COUNT. Total order: count
  // descending, then name ascending — two runs must be byte-identical.
  const widestSkips = [...skipTokens]
    .map(t => [t, fanOut.get(fanOutKey(t, 'skip'))])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 2);

  const header = [
    '# standards-kit — routing vocabulary. LOOKED UP, NEVER READ.',
    '#',
    '# One line per cover-block declaration:',
    '#   <token><TAB>open|skip<TAB><how many files declare it in that field><TAB><file>',
    '# Token first, sorted, so one anchored grep answers "which files does this token open?":',
    '#',
    `#     grep "^signal:form-input${COLUMN_SEPARATOR}open${COLUMN_SEPARATOR}" ${VOCABULARY_FILE}`,
    '#',
    '# and the whole vocabulary is one command, not a read:',
    '#',
    `#     cut -f1 ${VOCABULARY_FILE} | grep -v "^#" | sort -u`,
    '#',
    '# The third column is the fan-out. P5 orders its selection narrowest-first, so the number is',
    '# carried on the line: one grep gives both the files and their place in the order.',
    '# File paths are relative to the kit root (the folder holding this file).',
    '#',
    `# DO NOT OPEN THIS FILE WHOLE. ${rows.length} rows. The kit byte ceiling does not apply: it`,
    '# measures single-read ingestion, and nothing here is ingested whole. Exemption and reasoning:',
    '# en/authoring/kit-structural-invariants.md KIT-INV-5.',
    '#',
    `# ${openTokens.size} distinct open-when tokens (${openSignals.length} signals, of which`,
    `# ${singleFileSignals.length} name exactly one file; widest is ${widest[0]} at ${widest[1]}),`,
    `# and ${skipTokens.size} distinct skip-when tokens. A skip-when token is a NEGATIVE the task`,
    '# declares about itself ("this change is client-only"); P5 requires those declarations, because',
    '# a skip condition no task ever states can never fire and is decoration.',
    '#',
    '# POLARITY: THE TOKEN THAT READS LIKE YOUR WORK IS THE WRONG ONE HERE (SEL-M7). A skip-when',
    '# token is a sentence about THIS task, so a backend-only change declares the backend-only',
    '# negative and NEVER the client-only one. Measured on this tree, the two widest negatives:',
    ...widestSkips.map(
      ([token, count]) =>
        `#   declaring ${token} drops ${count} files - so declare it only when that sentence is` +
        ` true of your task, and never because the token reads like the work you are doing`
    ),
    '# A mis-polarised negative silences EXACTLY like a correct one: no warning is emitted, and the',
    '# hub you most needed leaves the candidate set unseen. So MEASURE YOUR OWN NEGATIVE BEFORE YOU',
    '# DECLARE IT - the third column is that number, one grep away - because a CORRECT pole can also',
    '# remove the one hub the task depends on: a client-surface task that declares the client-only',
    '# negative, correctly, can still drop the only files that support it. Whether a task declared',
    '# the right pole, or measured at all, is task-side and unfenceable; that limit is stated, not',
    '# left to read as covered (KIT-INV-8). The obligation itself is P4 in',
    '# en/agent-planning/agent-planning-procedure.md.',
    '#',
    `# The ${shapes.size} shape names are published with a sentence each in ${SHAPE_GLOSSARY_FILE};`,
    '# that table is the authority and this table is derived, so an invented shape name fails',
    '# generation with ROUTING_SHAPE_UNKNOWN rather than routing to nothing. A signal may not reuse',
    '# a shape name either: that fails with ROUTING_SIGNAL_SHADOWS_SHAPE, because one name meaning',
    '# two different things in two fields is a token an agent cannot declare on purpose.',
    '#',
    '# Generated by `node tools/kit-lookups.mjs` from every cover block. NOT committed:',
    '# derived on demand — regenerate before a lookup that matters.',
    '#',
  ];

  return {
    text: `${[...header, ...rows].join('\n')}\n`,
    warnings: [],
    meta: {
      kitFiles: files.length,
      rows: rows.length,
      openTokens: openTokens.size,
      skipTokens: skipTokens.size,
      openSignals: openSignals.length,
      singleFileSignals: singleFileSignals.length,
      widestSignal: widest[0],
      widestFanOut: widest[1],
      shapes: shapes.size,
    },
  };
}
