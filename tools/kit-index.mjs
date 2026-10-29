#!/usr/bin/env node
/**
 * Regenerates the topic table in `en/README.md` — the region between
 * `<!-- kit-index:topics -->` and `<!-- /kit-index:topics -->`: one row per `en/` topic folder,
 * the folder slug plus a link to its hub file titled with the hub's own H1.
 *
 * WHERE THE HUB COMES FROM: the cover block, not the file name. A folder's hub is the file that
 * says `part-of: self`. Trusting the file name would silently swallow "README.md exists but does
 * not declare itself the hub" and "the hub moved to another name"; the cover block turns both into
 * named errors.
 *
 * WHY NO `binds` COLUMN: rendering each folder's `binds` sentences would multiply the README's
 * size far past the single-read guidance. `binds` stays in its single authority, each file's own
 * cover block.
 *
 * FAIL-LOUD: an empty topic set, a folder with no hub or with more than one, a hub without an H1,
 * or missing markers each throw here. A silently incomplete index makes a vanished topic look
 * like it never existed.
 *
 * USAGE (Node >= 18, built-ins only, runnable from any directory):
 *   node <kit>/tools/kit-index.mjs                # rewrite the region in en/README.md
 *   node <kit>/tools/kit-index.mjs --check        # compare only; exit 1 on drift
 *   node <kit>/tools/kit-index.mjs --root <dir>   # kit root other than <kit>/tools/.. (or KIT_ROOT)
 */

import fs from 'node:fs';

import { parseCoverBlock } from './lib/cover-block.mjs';
import {
  configureKitRoot,
  HUB_PART_OF_VALUE,
  KIT_EN_ROOT_RELATIVE,
  listTopicFiles,
  listTopicSlugs,
  parseArgs,
  readHeadingOne,
  toAbsolute,
} from './lib/kit-tree.mjs';

const TOOL_ID = 'kit-index';

/** The file the region lives in, kit-root-relative. */
const INDEX_FILE = `${KIT_EN_ROOT_RELATIVE}/README.md`;

const REGION_OPEN_MARKER = '<!-- kit-index:topics -->';
const REGION_CLOSE_MARKER = '<!-- /kit-index:topics -->';

const TABLE_HEADER = ['| Topic | Hub |', '|-------|-----|'];

const HELP = `Usage: node tools/kit-index.mjs [--check] [--root <dir>]

Regenerates the topic table between ${REGION_OPEN_MARKER} and ${REGION_CLOSE_MARKER}
in ${INDEX_FILE}.
  --check         compare only; exit 1 when the region has drifted (writes nothing)
  --root <dir>    kit root (default: KIT_ROOT env, else the parent of tools/)`;

/**
 * Renders the region body (markers excluded) from the tree and the cover blocks.
 * @returns {string} Text to place between the markers.
 */
function renderTopicRegion() {
  const slugs = listTopicSlugs(TOOL_ID);
  const rows = [];
  const problems = [];
  for (const slug of slugs) {
    const hubs = listTopicFiles(slug).filter(file => {
      const { values } = parseCoverBlock(file);
      return values != null && values['part-of'] === HUB_PART_OF_VALUE;
    });
    if (hubs.length === 0) {
      problems.push(
        `KIT_INDEX_HUB_MISSING: ${KIT_EN_ROOT_RELATIVE}/${slug}/ — no file in this topic folder ` +
          `declares \`part-of: ${HUB_PART_OF_VALUE}\`. Solution: add the folder's hub (README.md) ` +
          `with \`part-of: ${HUB_PART_OF_VALUE}\` in its cover block.`
      );
      continue;
    }
    if (hubs.length > 1) {
      problems.push(
        `KIT_INDEX_HUB_AMBIGUOUS: ${hubs.join(', ')} — more than one file declares itself the ` +
          `hub. Solution: keep one hub; give the others the hub's relative path in \`part-of\`.`
      );
      continue;
    }
    const hub = hubs[0];
    const title = readHeadingOne(hub);
    if (title === '') {
      problems.push(
        `KIT_INDEX_HUB_TITLE_EMPTY: ${hub}:1 — the hub has no H1 on line 1. Solution: write ` +
          `\`# <title>\` on the first line.`
      );
      continue;
    }
    const hubName = hub.slice(`${KIT_EN_ROOT_RELATIVE}/${slug}/`.length);
    rows.push(`| \`${slug}\` | [${title}](${slug}/${hubName}) |`);
  }
  if (problems.length > 0) {
    throw new Error(`${problems.length} topic folder problem(s):\n${problems.map(p => `  - ${p}`).join('\n')}`);
  }
  if (rows.length === 0) {
    throw new Error(`KIT_INDEX_ROW_SET_EMPTY: ${KIT_EN_ROOT_RELATIVE}/ — not one index row could be produced.`);
  }
  // The marker line's own newline plus a blank line: the body starts and ends with two `\n`, so
  // the block renders as a valid Markdown table (a table cannot start on an adjacent line).
  return ['', '', ...TABLE_HEADER, ...rows, '', ''].join('\n');
}

/** Reads the index file and splits it around the region. */
function readCurrentRegion() {
  const absolute = toAbsolute(INDEX_FILE);
  if (!fs.existsSync(absolute)) {
    throw new Error(`KIT_INDEX_FILE_MISSING: ${INDEX_FILE} — the file holding the generated region does not exist.`);
  }
  const text = fs.readFileSync(absolute, 'utf8');
  const openIndex = text.indexOf(REGION_OPEN_MARKER);
  const closeIndex = text.indexOf(REGION_CLOSE_MARKER);
  if (openIndex === -1 || closeIndex === -1 || closeIndex < openIndex) {
    throw new Error(
      `KIT_INDEX_MARKER_MISSING: ${INDEX_FILE} — "${REGION_OPEN_MARKER}" / "${REGION_CLOSE_MARKER}" ` +
        `not found in order. Solution: restore both markers; this tool fills the space between them.`
    );
  }
  return {
    before: text.slice(0, openIndex + REGION_OPEN_MARKER.length),
    current: text.slice(openIndex + REGION_OPEN_MARKER.length, closeIndex),
    after: text.slice(closeIndex),
  };
}

/** Line-level difference between two region bodies. */
function diffRegions(expected, actual) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const expectedSet = new Set(expectedLines);
  const actualSet = new Set(actualLines);
  return {
    missing: expectedLines.filter(line => !actualSet.has(line) && line !== ''),
    unexpected: actualLines.filter(line => !expectedSet.has(line) && line !== ''),
    identical: expected === actual,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return 0;
  }
  if (options.unknown.length > 0 || options.only != null || options.lenient) {
    console.error(`[${TOOL_ID}] unsupported argument(s)\n\n${HELP}`);
    return 2;
  }
  const root = configureKitRoot(options.root);
  const expected = renderTopicRegion();
  const region = readCurrentRegion();
  const difference = diffRegions(expected, region.current);
  const rowCount = expected.split('\n').filter(line => line.startsWith('| `')).length;

  if (difference.identical) {
    console.log(`[${TOOL_ID}] OK ${INDEX_FILE} topic table matches the tree (${rowCount} topics) — ${root}`);
    return 0;
  }
  if (options.check) {
    console.error(`[${TOOL_ID}] DRIFT ${INDEX_FILE} topic table differs from the tree — ${root}`);
    for (const line of difference.missing) console.error(`  MISSING    ${line}`);
    for (const line of difference.unexpected) console.error(`  UNEXPECTED ${line}`);
    console.error(
      `  ${difference.missing.length} missing, ${difference.unexpected.length} unexpected line(s). ` +
        `Fix: node tools/kit-index.mjs`
    );
    return 1;
  }
  fs.writeFileSync(toAbsolute(INDEX_FILE), region.before + expected + region.after, 'utf8');
  console.log(
    `[${TOOL_ID}] WROTE ${INDEX_FILE} topic table (${rowCount} topics; ${difference.missing.length} ` +
      `missing, ${difference.unexpected.length} unexpected line(s) corrected) — ${root}`
  );
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`[${TOOL_ID}] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 2;
}
