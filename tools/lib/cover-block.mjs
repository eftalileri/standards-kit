/**
 * The single parser of the `kit-cover` block grammar, as the generators need it.
 *
 * CONTRACT: in every kit `.md` file line 1 is the H1, line 2 is blank and line 3 is the
 * ```kit-cover fence; then six keys in a FIXED order (type, part-of, binds, open-when, skip-when,
 * owns), one line each, no blank line inside the block, the value being everything after the
 * first `: `.
 *
 * WHY ONE MODULE: the topic-index generator, the rule-identity index and the routing vocabulary
 * all read the block. Two parsers would drift — one would recognise `part-of: self` while the other
 * did not, and a topic would silently disappear from the index. The grammar lives here only.
 *
 * SCOPE: this is the generators' reader, not a linter. It returns the parsed values (or `null`
 * when there is no block at line 3 or the fence is never closed) and does not report style
 * findings; a malformed line inside the block is skipped, so its key reads as absent.
 */

import fs from 'node:fs';

import { toAbsolute } from './kit-tree.mjs';

/** Fence line that opens the block — matched exactly on line 3. */
const COVER_FENCE_OPEN = '```kit-cover';

/** Fence line that closes the block. */
const COVER_FENCE_CLOSE = '```';

/**
 * Parses a kit file's cover block.
 * @param {string} relativePath - Kit-root-relative file path.
 * @returns {{values: Record<string, string>|null}} Values, or `null` when no parsable block exists.
 */
export function parseCoverBlock(relativePath) {
  const lines = fs.readFileSync(toAbsolute(relativePath), 'utf8').split('\n');
  if ((lines[2] ?? '') !== COVER_FENCE_OPEN) return { values: null };

  const entries = [];
  let closed = false;
  for (let index = 3; index < lines.length; index++) {
    if (lines[index] === COVER_FENCE_CLOSE) {
      closed = true;
      break;
    }
    if (lines[index] === '') continue;
    const match = /^([a-z][a-z-]*): (.+)$/u.exec(lines[index]);
    if (match == null) continue;
    entries.push([match[1], match[2]]);
  }
  if (!closed) return { values: null };
  return { values: Object.fromEntries(entries) };
}

/** Splits an `owns` value into literal identities and globs. */
function splitOwns(rawValue) {
  if (rawValue == null || rawValue === 'none') return { literals: [], globs: [] };
  const literals = [];
  const globs = [];
  for (const token of rawValue.split(',').map(part => part.trim())) {
    if (token === '') continue;
    if (token.includes('*')) globs.push(token);
    else literals.push(token);
  }
  return { literals, globs };
}

/** Turns an `owns` glob into an identity-matching regular expression. */
function globToRegExp(glob) {
  const escaped = glob
    .split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('.*');
  return new RegExp(`^${escaped}$`, 'u');
}

/**
 * Resolves a file's `owns` value against the kit-wide ownership map into the set of DECLARED
 * identities (literals + legitimate glob expansion). A glob is legitimate only for identities
 * this very file defines; a glob that matches nothing, or that reaches an identity defined in
 * another file, contributes nothing and is reported.
 *
 * @param {string} relativePath - File carrying the declaration.
 * @param {string|undefined} ownsValue - Raw `owns` value from the cover block.
 * @param {Map<string, string[]>} owners - Identity -> files that DEFINE it (kit-wide).
 * @returns {{declared: Set<string>, findings: string[]}}
 */
export function resolveDeclaredIdentities(relativePath, ownsValue, owners) {
  const findings = [];
  const { literals, globs } = splitOwns(ownsValue);
  const declared = new Set(literals);
  const allIds = [...owners.keys()];

  for (const glob of globs) {
    const pattern = globToRegExp(glob);
    const matched = allIds.filter(id => pattern.test(id));
    if (matched.length === 0) {
      findings.push(
        `COVER_OWNS_GLOB_EMPTY: ${relativePath} — \`${glob}\` matches no defined identity.`
      );
      continue;
    }
    for (const id of matched) {
      const definedIn = owners.get(id);
      if (!definedIn.includes(relativePath)) {
        findings.push(
          `COVER_OWNS_GLOB_LEAKS: ${relativePath} — \`${glob}\` -> \`${id}\` is defined in ` +
            `${definedIn.join(', ')}.`
        );
        continue;
      }
      declared.add(id);
    }
  }
  return { declared, findings };
}
