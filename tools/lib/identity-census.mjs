/**
 * Rule-identity census: which identities each kit file DEFINES (not merely mentions).
 *
 * Two extractors, chosen per file by `census-groups.mjs`:
 *
 *   - `fenceAwareDefinitions` — a faithful port of the kit's original POSIX-ERE (awk) census.
 *     POSIX `match()` is leftmost-LONGEST, JavaScript is leftmost-first, so the port measures the
 *     longest match explicitly where the length of a match changes the extracted identity.
 *   - `broadDefinitions` — a faithful port of the kit's original Python census. Python's `\b`
 *     and `str.isalnum()` are Unicode-aware; the port uses the same Unicode classes, and reads
 *     files with universal newlines exactly as Python's text mode does.
 *
 * Both run in-process on Node built-ins: no awk, no Python, no npm package.
 *
 * FAIL-LOUD: an empty definition set over a non-empty file set throws. A silent "0 definitions"
 * would make every `owns: none` look consistent and would publish an empty lookup table.
 */

import fs from 'node:fs';

import { BROAD_EXTRACTOR_TOPICS } from './census-groups.mjs';
import { KIT_EN_ROOT_RELATIVE, toAbsolute } from './kit-tree.mjs';

// ---------------------------------------------------------------------------------------------
// Fence-aware extractor (port of the POSIX ERE census)
// ---------------------------------------------------------------------------------------------

const EM = '—';
const EN = '–';
const P = String.raw`[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-[A-Z]{0,8}[0-9]{1,3}[a-z]?`;
const G = String.raw`G[A-Z]{2,9}[0-9]{1,2}`;
const BB = String.raw`[A-Z]{1,3}[0-9]{1,2}[a-z]?`;
const ID = `(?:${P}|${G}|${BB})`;
const SEP = `(?:[-:.)]|${EM}|${EN}|$)`;
const D1 = String.raw`^[ ]{0,3}(?:\*\*)?` + ID + String.raw`(?:\*\*)?[ ]*(?:\([^)]{0,90}\))?[ ]*:`;
const D2 = String.raw`^[ ]{0,3}\|[ ]*[${'`'}*\\ ]*` + ID + String.raw`[${'`'}*\\ ]*[ ]*\|`;
const D3 = String.raw`^#{1,6}[ ]+(?:\*\*)?` + ID + String.raw`(?:-[A-Z0-9]+)*(?:\*\*)?[ ]*` + SEP;
const D4 = String.raw`^[ ]{0,7}[-*+][ ]+(?:\*\*)?` + ID + String.raw`(?:\*\*)?[ ]*(?:[-:)]|${EM}|${EN})`;
const D6 = String.raw`^[ ]{0,3}\*\*` + ID + String.raw`\*\*[ ]*(?:-|${EM}|${EN})`;
const D5 = String.raw`^[ ]{0,3}\|[ ]*[${'`'}*~]*[ ]*[0-9]{1,4}[a-z]?[ ]*[${'`'}*~]*[ ]*\|`;
const ID_AT_START = `^${ID}`;
const IDX = `^${ID}(?:-[A-Z0-9]+)*`;

const DEFINITION_PATTERNS = [D1, D2, D3, D4, D6];
const DEFINITION_REGEXES = DEFINITION_PATTERNS.map(source => new RegExp(source, 'u'));
const REGISTRY_ROW_RE = new RegExp(D5, 'u');
const FENCE_RE = /^[ \t]*(?:```|~~~)/u;

/** How far past the leftmost-first match the longest-match search looks (characters). */
const LONGEST_MATCH_WINDOW = 400;

const exactCache = new Map();
const fullCache = new Map();

/**
 * A regex that matches a whole string exactly as `source` would match a PREFIX of a longer text.
 * Only SEP may contain `$` (end of the whole line); on a strict prefix that alternative cannot
 * apply, so it is removed. Compiled once per pattern.
 */
function exactPrefixRegex(source) {
  let regex = exactCache.get(source);
  if (regex == null) {
    const withoutEnd = source.split(SEP).join(SEP.replace('|$)', ')'));
    regex = new RegExp(`^(?:${withoutEnd})$`, 'u');
    exactCache.set(source, regex);
  }
  return regex;
}

/**
 * POSIX leftmost-longest length of an `^`-anchored pattern on `text`, or -1 when it does not match.
 */
function longestAnchoredMatch(source, regex, text) {
  const first = regex.exec(text);
  if (first == null) return -1;
  const firstLength = first[0].length;
  const upper = Math.min(text.length, firstLength + LONGEST_MATCH_WINDOW);
  // The full line: the pattern's own `$` may apply.
  if (upper === text.length && upper > firstLength) {
    let full = fullCache.get(source);
    if (full == null) {
      full = new RegExp(`^(?:${source})$`, 'u');
      fullCache.set(source, full);
    }
    if (full.test(text)) return upper;
  }
  const exact = exactPrefixRegex(source);
  for (let end = upper === text.length ? upper - 1 : upper; end > firstLength; end--) {
    if (exact.test(text.slice(0, end))) return end;
  }
  return firstLength;
}

const ID_AT_START_RE = new RegExp(ID_AT_START, 'u');
const IDX_RE = new RegExp(IDX, 'u');

/** Registry part files whose numeric table rows are identities. */
function isRegistryFile(relativePath) {
  const probe = `/${relativePath}`;
  return /\/ssot\/registry\//u.test(probe) || /\/ssot\/ssot-registry-screen-regions\.md$/u.test(probe);
}

/**
 * Definition sites of one file by the fence-aware grammar.
 * @param {string} relativePath - Kit-root-relative path (used for the registry rule).
 * @param {string} text - File content.
 * @returns {Set<string>} Defined identities.
 */
export function fenceAwareDefinitions(relativePath, text) {
  const ids = new Set();
  const registry = isRegistryFile(relativePath);
  const screenRegions = /ssot-registry-screen-regions\.md$/u.test(relativePath);
  let fence = false;
  const lines = text.split('\n');
  // awk does not see an empty record after the final newline.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  for (const line of lines) {
    if (FENCE_RE.test(line)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    for (let r = 0; r < DEFINITION_PATTERNS.length; r++) {
      const length = longestAnchoredMatch(DEFINITION_PATTERNS[r], DEFINITION_REGEXES[r], line);
      if (length < 0) continue;
      let seg = line.slice(0, length);
      seg = seg.replaceAll('**', '').replaceAll('`', '');
      seg = seg.replace(/^[ ]*[|#*+-]+[ ]*/u, '').replace(/^[ ]+/u, '');
      const isHeading = DEFINITION_PATTERNS[r] === D3;
      const source = isHeading ? IDX : ID_AT_START;
      const regex = isHeading ? IDX_RE : ID_AT_START_RE;
      const idLength = longestAnchoredMatch(source, regex, seg);
      if (idLength > 0) ids.add(seg.slice(0, idLength));
      break;
    }
    if (registry) {
      const row = REGISTRY_ROW_RE.exec(line);
      if (row != null) {
        const digits = row[0].replace(/[^0-9a-z]/gu, '');
        ids.add(screenRegions ? `S2-${digits}` : `#${digits}`);
      }
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------------------------
// Broad extractor (port of the Python census)
// ---------------------------------------------------------------------------------------------

/** Python 3 `\w` for str patterns: Unicode alphanumerics plus underscore. */
const WORD = String.raw`[\p{L}\p{N}_]`;
const WB_START = `(?<!${WORD})`;
const WB_END = `(?!${WORD})`;

const PREFIXED_SRC = String.raw`[A-Z][A-Z0-9]{0,7}(?:-[A-Z0-9]{1,8})*-[A-Z]{0,3}[0-9]{1,3}[a-z]?`;
const GATE_SRC = String.raw`G[A-Z]{1,8}[0-9]{1,2}[a-z]?`;
const BARE_SRC = String.raw`[MNCDGXSRVWQPTAKF][0-9]{1,2}[a-z]?`;
const NAMED_SRC = String.raw`[A-Z][A-Z0-9]{1,9}(?:-[A-Z0-9]{1,9}){1,4}`;

const bounded = source => `${WB_START}${source}${WB_END}`;
const RE_PREFIXED_G = new RegExp(bounded(PREFIXED_SRC), 'gu');
const RE_GATE_G = new RegExp(bounded(GATE_SRC), 'gu');
const RE_BARE_G = new RegExp(bounded(BARE_SRC), 'gu');
const fullmatch = source => new RegExp(`^(?:${bounded(source)})$`, 'u');
const RE_PREFIXED_FULL = fullmatch(PREFIXED_SRC);
const RE_GATE_FULL = fullmatch(GATE_SRC);
const RE_BARE_FULL = fullmatch(BARE_SRC);
const RE_NAMED_FULL = fullmatch(NAMED_SRC);

const DENY = new Set([
  'UTF-8', 'UTF-16', 'SHA-1', 'SHA-256', 'SHA-512', 'AES-128', 'AES-256', 'ISO-8601',
  'RFC-7231', 'RFC-6265', 'HTTP-2', 'HTTP-1', 'BCP-47', 'E-164', 'RGBA-8', 'API-2',
  'IPV-4', 'IPV-6', 'CVE-2', 'MD-5',
]);
const CLEAN = /[*_`[\]]/gu;
const ALNUM = /^[\p{L}\p{N}]$/u;

const stripMd = text => text.replace(CLEAN, '');

function classify(token) {
  if (DENY.has(token)) return null;
  if (RE_GATE_FULL.test(token)) return 'gate';
  if (RE_PREFIXED_FULL.test(token)) return 'prefixed';
  if (RE_BARE_FULL.test(token)) return 'bare';
  return null;
}

function allIds(text) {
  const out = [];
  const spans = [];
  for (const m of text.matchAll(RE_PREFIXED_G)) {
    if (DENY.has(m[0])) continue;
    out.push(['prefixed', m[0]]);
    spans.push([m.index, m.index + m[0].length]);
  }
  const inside = (a, b) => spans.some(([s, e]) => s <= a && b <= e);
  for (const m of text.matchAll(RE_GATE_G)) {
    if (!inside(m.index, m.index + m[0].length)) out.push(['gate', m[0]]);
  }
  for (const m of text.matchAll(RE_BARE_G)) {
    const i = m.index;
    const j = i + m[0].length;
    if (inside(i, j)) continue;
    if (i > 0 && (ALNUM.test(text[i - 1]) || '-/.'.includes(text[i - 1]))) continue;
    if (j < text.length && (ALNUM.test(text[j]) || text[j] === '-')) continue;
    out.push(['bare', m[0]]);
  }
  return out;
}

const IDPAT =
  String.raw`(?:[A-Z][A-Z0-9]{0,7}(?:-[A-Z0-9]{1,8})*-[A-Z]{0,3}[0-9]{1,3}[a-z]?)` +
  String.raw`|(?:G[A-Z]{1,8}[0-9]{1,2}[a-z]?)` +
  String.raw`|(?:[MNCDGXSRVWQPTAKF][0-9]{1,2}[a-z]?)`;
const NAMEDPAT = String.raw`(?:[A-Z][A-Z0-9]{1,9}(?:-[A-Z0-9]{1,9}){1,4})`;
const re = source => new RegExp(source, 'u');
const RE_TROW = re(String.raw`^\s*\|(?<c1>[^|]*)\|`);
const SEP_ONLY = re(String.raw`^[\s/,+&]*$`);
const RANGE_SEP = re('[–—-]');
const RANGE_SEP_G = new RegExp('[–—-]', 'gu');
const RE_LEAD_COLON = re(String.raw`^\s*(?<id>${IDPAT})\s*(?:\([^)]{0,40}\))?\s*:\s+\S`);
const RE_LEAD_LIST = re(String.raw`^\s*[-*+]\s+(?<id>${IDPAT})\s*[:–—]\s+\S`);
const RE_LEAD_HEAD = re(String.raw`^\s*#{1,6}\s+(?<id>${IDPAT})\s*[:–—]?`);
const RE_NAMED_COLON = re(String.raw`^\s*(?<id>${NAMEDPAT})\s*:\s+\S`);
const RE_NAMED_HEADP = re(String.raw`^\s*#{1,6}\s+.*?\((?<id>${NAMEDPAT})\)`);
const RE_NAMED_HEAD = re(String.raw`^\s*#{1,6}\s+(?<id>${NAMEDPAT})${WB_END}`);
const RE_NAMED_BOLDL = re(String.raw`^\s*(?<id>${NAMEDPAT})\s*(?:\([^)]{0,40}\))\s*:\s+\S`);
const RE_TITLED = re(String.raw`^(?<id>${IDPAT})\s*[–—]\s+[A-Za-z${'`'}'"(]`);
const RE_HEADP_NUM = re(String.raw`^\s*#{1,6}\s+.*?\((?<id>${IDPAT})\)\s*$`);
const RE_FAMILY_DECL = re(String.raw`^\s*\**[A-Z][A-Z0-9\-]*\\?\*+\s*\**\s*:`);
const STUB_TAIL = re(String.raw`-(?:[MNCDGXSRVW]|EX|NA|LOG)$`);
const NAMED_DENY_PREFIX = re('^(?:YYYY|UTF|ISO|RFC|HTTP|BCP|SHA|AES)');

function namedOk(token) {
  if (!RE_NAMED_FULL.test(token)) return false;
  if (NAMED_DENY_PREFIX.test(token)) return false;
  const segs = token.split('-');
  if (/[0-9]$/u.test(segs[segs.length - 1])) return false;
  if (segs.length <= 3 && STUB_TAIL.test(token)) return false;
  if (segs.length === 2 && segs[segs.length - 1].length <= 2) return false;
  return true;
}

/** Python `str.strip()` (whitespace only). */
const pyStrip = text => text.replace(/^\s+|\s+$/gu, '');

function defsInLine(raw) {
  const out = [];
  if (RE_FAMILY_DECL.test(raw)) return out;
  const row = RE_TROW.exec(raw);
  const line = row ? raw : stripMd(raw);
  if (row) {
    const cell = pyStrip(stripMd(row.groups.c1));
    if (cell) {
      const tokens = allIds(cell);
      if (tokens.length > 0) {
        let residue = cell;
        for (const [, token] of tokens) residue = residue.replace(token, () => '');
        if (SEP_ONLY.test(residue)) {
          for (const [, token] of tokens) out.push(token);
        } else if (RANGE_SEP.test(residue) && SEP_ONLY.test(residue.replace(RANGE_SEP_G, ' '))) {
          // An identity range ("A-M1 – A-M5") is a reference span, not a definition.
        } else {
          const titled = RE_TITLED.exec(cell);
          if (titled && tokens.length === 1 && cell.startsWith(titled.groups.id)) {
            if (classify(titled.groups.id)) out.push(titled.groups.id);
          }
        }
      }
    }
    return out;
  }
  for (const regex of [RE_LEAD_COLON, RE_LEAD_LIST, RE_LEAD_HEAD, RE_HEADP_NUM]) {
    const match = regex.exec(line);
    if (match) {
      if (classify(match.groups.id)) out.push(match.groups.id);
      return out;
    }
  }
  for (const regex of [RE_NAMED_COLON, RE_NAMED_BOLDL, RE_NAMED_HEADP, RE_NAMED_HEAD]) {
    const match = regex.exec(line);
    if (match && namedOk(match.groups.id)) {
      out.push(match.groups.id);
      return out;
    }
  }
  const titled = RE_TITLED.exec(line);
  if (titled && raw.replace(/^\s+/u, '').startsWith('**')) {
    if (classify(titled.groups.id)) {
      out.push(titled.groups.id);
      return out;
    }
  }
  const stripped = pyStrip(raw);
  if (stripped.startsWith('**') && stripped.endsWith('**')) {
    const token = pyStrip(stripped.length >= 4 ? stripped.slice(2, -2) : '');
    if (RE_PREFIXED_FULL.test(token) || (RE_NAMED_FULL.test(token) && namedOk(token))) {
      out.push(token);
    }
  }
  return out;
}

/**
 * Definition sites of one file by the broad grammar.
 * @param {string} text - File content.
 * @returns {Set<string>} Defined identities.
 */
export function broadDefinitions(text) {
  const ids = new Set();
  // Python text mode: universal newlines.
  for (const line of text.replace(/\r\n?/gu, '\n').split('\n')) {
    for (const id of defsInLine(line)) ids.add(id);
  }
  return ids;
}

// ---------------------------------------------------------------------------------------------
// Census over the kit
// ---------------------------------------------------------------------------------------------

/** Which extractor counts a file: `broad` for the listed topic folders, `fence-aware` otherwise. */
export function extractorOf(relativePath) {
  const prefix = `${KIT_EN_ROOT_RELATIVE}/`;
  if (!relativePath.startsWith(prefix)) return 'fence-aware';
  const topFolder = relativePath.slice(prefix.length).split('/')[0];
  return BROAD_EXTRACTOR_TOPICS.includes(topFolder) ? 'broad' : 'fence-aware';
}

/**
 * Computes the identities every kit file defines.
 * @param {string[]} kitFiles - Kit-root-relative `.md` paths.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {{definitions: Map<string, Set<string>>, meta: Record<string, number>}}
 */
export function collectDefinitions(kitFiles, consumerId) {
  const definitions = new Map();
  let fenceAwareFiles = 0;
  let broadFiles = 0;
  let totalSites = 0;
  for (const file of kitFiles) {
    const text = fs.readFileSync(toAbsolute(file), 'utf8');
    let ids;
    if (extractorOf(file) === 'broad') {
      broadFiles++;
      ids = broadDefinitions(text);
    } else {
      fenceAwareFiles++;
      ids = fenceAwareDefinitions(file, text);
    }
    if (ids.size > 0) {
      definitions.set(file, ids);
      totalSites += ids.size;
    }
  }
  if (totalSites === 0) {
    throw new Error(
      `CENSUS_DEFINITION_SET_EMPTY: ${kitFiles.length} files — Root cause: neither extractor ` +
        `found a single identity definition; over an empty set every \`owns: none\` would look ` +
        `consistent and ${consumerId} would publish an empty table. Solution: check the kit ` +
        `root (--root / KIT_ROOT) and that the files define rule identities.`
    );
  }
  return {
    definitions,
    meta: { fenceAwareFiles, broadFiles, definitionSites: totalSites },
  };
}
