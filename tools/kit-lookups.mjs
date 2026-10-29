#!/usr/bin/env node
/**
 * Generates the kit's three lookup tables at the kit root:
 *
 *   rule-id-index.tsv       identity -> file that defines it
 *   routing-vocabulary.tsv  routing token -> files that declare it (with fan-out)
 *   routing-synonyms.tsv    natural phrase -> canonical routing token
 *
 * The tables are derived from the tree on demand and are meant to be LOOKED UP with one anchored
 * grep (each table's header prints the query), never read whole and never hand-edited.
 *
 * USAGE (Node >= 18, built-ins only, runnable from any directory):
 *   node <kit>/tools/kit-lookups.mjs                 # write all three tables
 *   node <kit>/tools/kit-lookups.mjs --check         # exit 1 if any table is stale or missing
 *   node <kit>/tools/kit-lookups.mjs --root <dir>    # kit root other than <kit>/tools/..
 *   node <kit>/tools/kit-lookups.mjs --only rule-index,routing-vocabulary
 *   node <kit>/tools/kit-lookups.mjs --lenient       # publish the rule index despite owns mismatches
 * The kit root can also be given with the KIT_ROOT environment variable.
 */

import fs from 'node:fs';

import { configureKitRoot, parseArgs, toAbsolute } from './lib/kit-tree.mjs';
import { renderRuleIndex, RULE_INDEX_FILE } from './lib/rule-index.mjs';
import { renderRoutingSynonyms, SYNONYMS_FILE } from './lib/routing-synonyms.mjs';
import { renderRoutingVocabulary, VOCABULARY_FILE } from './lib/routing-vocabulary.mjs';

const TOOL_ID = 'kit-lookups';

const TABLES = ['rule-index', 'routing-vocabulary', 'routing-synonyms'];

const HELP = `Usage: node tools/kit-lookups.mjs [--check] [--root <dir>] [--only <list>] [--lenient]

Writes rule-id-index.tsv, routing-vocabulary.tsv and routing-synonyms.tsv at the kit root.
  --check         compare only; exit 1 when a table is stale or missing (writes nothing)
  --root <dir>    kit root (default: KIT_ROOT env, else the parent of tools/)
  --only <list>   comma-separated subset of: ${TABLES.join(', ')}
  --lenient       write the rule index even when cover-block owns and definitions disagree`;

function summarize(name, meta) {
  if (name === 'rule-index')
    return `${meta.rows} rows, ${meta.identities} identities, ${meta.kitFiles} kit files`;
  if (name === 'routing-vocabulary')
    return `${meta.rows} rows; ${meta.openTokens} open tokens, ${meta.skipTokens} skip tokens, ${meta.shapes} shapes`;
  return (
    `${meta.rows} rows; ${meta.aliasRows} alias + ${meta.localAliasRows} local-alias rows, ` +
    `coarse-filter width ${meta.coarseWidth}`
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return 0;
  }
  if (options.unknown.length > 0) {
    console.error(`[${TOOL_ID}] unknown argument(s): ${options.unknown.join(' ')}\n\n${HELP}`);
    return 2;
  }
  const selected = options.only ?? TABLES;
  const invalid = selected.filter(name => !TABLES.includes(name));
  if (invalid.length > 0) {
    console.error(`[${TOOL_ID}] --only: unknown table(s) ${invalid.join(', ')}; valid: ${TABLES.join(', ')}`);
    return 2;
  }

  const root = configureKitRoot(options.root);
  console.log(`[${TOOL_ID}] kit root: ${root}`);

  let vocabulary = null;
  const renderVocabulary = () => {
    vocabulary ??= renderRoutingVocabulary(TOOL_ID);
    return vocabulary;
  };
  const renderers = {
    'rule-index': () => ({ file: RULE_INDEX_FILE, ...renderRuleIndex(TOOL_ID, { lenient: options.lenient }) }),
    'routing-vocabulary': () => ({ file: VOCABULARY_FILE, ...renderVocabulary() }),
    'routing-synonyms': () => ({
      file: SYNONYMS_FILE,
      ...renderRoutingSynonyms(TOOL_ID, { vocabularyText: renderVocabulary().text }),
    }),
  };

  let failures = 0;
  for (const name of TABLES.filter(table => selected.includes(table))) {
    let result;
    try {
      result = renderers[name]();
    } catch (error) {
      failures++;
      console.error(`[${TOOL_ID}] FAILED ${name}:\n${error instanceof Error ? error.message : error}`);
      continue;
    }
    for (const warning of result.warnings ?? []) console.warn(`[${TOOL_ID}] WARNING ${warning}`);
    const absolute = toAbsolute(result.file);
    const current = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : null;
    if (options.check) {
      if (current === result.text) {
        console.log(`[${TOOL_ID}] OK ${result.file} is current (${summarize(name, result.meta)}).`);
      } else {
        failures++;
        console.error(
          `[${TOOL_ID}] ${current == null ? 'MISSING' : 'STALE'} ${result.file} — regenerate with: node tools/kit-lookups.mjs`
        );
      }
      continue;
    }
    fs.writeFileSync(absolute, result.text, 'utf8');
    console.log(`[${TOOL_ID}] WROTE ${result.file} (${summarize(name, result.meta)}).`);
  }
  return failures > 0 ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`[${TOOL_ID}] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 2;
}
