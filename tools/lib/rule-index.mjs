/**
 * IDENTITY -> DEFINING FILE lookup table: `rule-id-index.tsv` at the kit root.
 *
 * Each row is one DEFINITION SITE: `<identity><TAB><kit-root-relative path of the file that
 * DEFINES it>`. Identity first, sorted.
 *
 * WHY IT EXISTS: the topic index routes topic -> hub and never mentions rule identities, so an
 * agent holding a named identity (`SSG-M8`, `COD-M3`) had no lookup path other than opening hubs
 * and scanning their parts — exactly the over-reading the kit is cut to avoid.
 *
 * LOOKED UP, NOT READ — AND THE FORMAT ENFORCES IT: the file exists to be queried with ONE
 * anchored grep (`grep "^SSG-M8<TAB>" rule-id-index.tsv`). One identity per line, identity first,
 * TAB separator: `^<id><TAB>` matches only that identity, never a neighbour sharing its prefix
 * (`M1` vs `M12`). What enters the reader's context is the matched line, not the file.
 *
 * AUTHORITY — TWO SOURCES, ONE TRUTH: the row set is the census output (`identity-census.mjs`),
 * and every row is cross-checked against the `owns` declaration in that file's cover block. If
 * the two disagree the generator throws a named error — publishing no answer beats publishing a
 * wrong one. `--lenient` publishes anyway (rows still come from the census) and prints the
 * disagreements as warnings. No row is hand-written.
 */

import { parseCoverBlock, resolveDeclaredIdentities } from './cover-block.mjs';
import { collectDefinitions, extractorOf } from './identity-census.mjs';
import { listKitMarkdownFiles } from './kit-tree.mjs';

/** The lookup table, kit-root-relative. Not `.md`: it is not a kit document. */
export const RULE_INDEX_FILE = 'rule-id-index.tsv';

/** Column separator — fixed, because the documented grep anchors on it. */
const COLUMN_SEPARATOR = '\t';

/**
 * Renders the full table text from the tree (header included; every number in it is derived).
 * @param {string} consumerId - Consumer id shown in error messages.
 * @param {{lenient?: boolean}} [options]
 * @returns {{text: string, meta: Record<string, number|string>, warnings: string[]}}
 */
export function renderRuleIndex(consumerId, options = {}) {
  const files = listKitMarkdownFiles(consumerId);
  const { definitions, meta } = collectDefinitions(files, consumerId);
  const warnings = [];

  // Identity -> files that define it. Input to both the rows and `owns` glob legitimacy.
  const owners = new Map();
  for (const [file, ids] of definitions) {
    for (const id of ids) {
      if (!owners.has(id)) owners.set(id, []);
      owners.get(id).push(file);
    }
  }

  // CROSS-CHECK: every definition site must also be declared in that file's cover block. A table
  // generated from a disagreeing tree sends the reader to an owner that does not exist.
  const disagreements = [];
  for (const file of files) {
    const { values } = parseCoverBlock(file);
    const actual = definitions.get(file) ?? new Set();
    if (values == null) {
      if (actual.size > 0) {
        disagreements.push(
          `${file} [${extractorOf(file)}]: no parsable cover block, ${actual.size} undeclared ` +
            `definition(s) -> ${[...actual].sort().join(', ')}`
        );
      }
      continue;
    }
    const { declared } = resolveDeclaredIdentities(file, values.owns, owners);
    const missing = [...actual].filter(id => !declared.has(id)).sort();
    const extra = [...declared].filter(id => !actual.has(id)).sort();
    if (missing.length > 0)
      disagreements.push(
        `${file} [${extractorOf(file)}]: defined but not declared in owns -> ${missing.join(', ')}`
      );
    if (extra.length > 0)
      disagreements.push(
        `${file} [${extractorOf(file)}]: declared in owns but not defined -> ${extra.join(', ')}`
      );
  }
  if (disagreements.length > 0) {
    const detail = disagreements.map(line => `  - ${line}`).join('\n');
    const explanation =
      `Root cause: a cover block's \`owns\` declaration and the file's actual definition set ` +
      `disagree; a table generated from this tree would point at an owner that does not exist ` +
      `or hide the real one. Solution: align each listed file's \`owns\` line with what it ` +
      `defines. If a whole topic disagrees, its files may follow the other identity grammar — ` +
      `see tools/lib/census-groups.mjs. Use --lenient to publish anyway.`;
    if (!options.lenient) {
      throw new Error(
        `RULE_INDEX_OWNS_DISAGREEMENT: ${disagreements.length} finding(s)\n${detail}\n${explanation}`
      );
    }
    warnings.push(
      `RULE_INDEX_OWNS_DISAGREEMENT (published anyway, --lenient): ${disagreements.length} ` +
        `finding(s)\n${detail}`
    );
  }

  const rows = [];
  for (const [id, definedIn] of owners) {
    for (const file of definedIn) rows.push(`${id}${COLUMN_SEPARATOR}${file}`);
  }
  rows.sort();
  if (rows.length === 0) {
    throw new Error(
      `RULE_INDEX_ROW_SET_EMPTY — Root cause: not one definition site was produced; an empty ` +
        `lookup table answers "not found" to every query. Solution: check the kit root and the ` +
        `census output.`
    );
  }

  // Every number in the header is derived. Prefixed identities must resolve to ONE file kit-wide;
  // bare, file-local identities legitimately live in several files and the table lists them all.
  const prefixed = [...owners.keys()].filter(id => id.includes('-'));
  const prefixedMultiHome = prefixed.filter(id => owners.get(id).length > 1);
  const bareMultiHome = [...owners.keys()].filter(
    id => !id.includes('-') && owners.get(id).length > 1
  );
  const registryRows = [...owners.keys()].filter(id => id.startsWith('#'));
  const longestRow = rows.reduce((longest, row) => (row.length > longest ? row.length : longest), 0);

  const header = [
    '# standards-kit — rule identity index. LOOKED UP, NEVER READ.',
    '#',
    '# One line per definition site: <identity><TAB><kit-root-relative path of the file that DEFINES it>.',
    '# Identity first, sorted, so ONE anchored grep answers "which file defines this rule?":',
    '#',
    `#     grep "^SSG-M8${COLUMN_SEPARATOR}" ${RULE_INDEX_FILE}`,
    '#',
    '# The column separator is a literal TAB, and anchoring on it is what stops M1 matching M12.',
    '# Header lines are "#" followed by a SPACE; a data line starting with "#" is a registry row',
    '# number (e.g. "#363e"), so a comment filter must key on "# ", never on "#" alone.',
    '# Paths are relative to the kit root (the folder holding this file).',
    '#',
    `# DO NOT OPEN THIS FILE WHOLE. It carries ${rows.length} rows; the longest is ${longestRow} bytes,`,
    '# and one matched line is the entire cost of a resolved lookup. Reading it whole would',
    '# re-create the over-reading this kit was cut to remove. The kit file-size guidance',
    '# (en/authoring/kit-structural-invariants.md KIT-INV-5) does not apply: it is',
    '# about single-read ingestion, and nothing here is ingested whole.',
    '#',
    `# ${prefixed.length} prefixed identities (SSG-M8, IDEMP-M14, COD-M1) each resolve to exactly one file`,
    `# — ${prefixedMultiHome.length} of them have a second home — so a prefixed grep returns a single line.`,
    '# A bare, file-local identity (M8, C4, N2) legitimately lives in several files:',
    `# ${bareMultiHome.length} bare identities list more than one home here. Cite a bare identity only`,
    '# together with a link that names its file.',
    `# ${registryRows.length} SSoT registry authority rows appear as #<row> and resolve to their registry part file.`,
    '#',
    '# Generated by `node tools/kit-lookups.mjs` from the identity census (tools/lib/identity-census.mjs),',
    "# cross-checked against every cover block's `owns`. It is NOT committed: it is",
    '# derived on demand, so a copy is only as fresh as its last run —',
    '# regenerate before a lookup that matters. Never hand-edit it.',
    '#',
  ];

  return {
    text: `${[...header, ...rows].join('\n')}\n`,
    warnings,
    meta: {
      ...meta,
      kitFiles: files.length,
      rows: rows.length,
      identities: owners.size,
      prefixedIdentities: prefixed.length,
      prefixedMultiHome: prefixedMultiHome.length,
      bareMultiHome: bareMultiHome.length,
      registryRows: registryRows.length,
      longestRow,
    },
  };
}
