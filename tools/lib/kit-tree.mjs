/**
 * The single reader of the kit tree: which files are kit files, which folders are topics, and
 * where the kit root is.
 *
 * KIT ROOT RESOLUTION (one authority, independent of the current working directory):
 *   1. `--root <dir>` (or `--root=<dir>`) on the command line,
 *   2. otherwise the `KIT_ROOT` environment variable,
 *   3. otherwise the parent of the `tools/` directory these scripts live in.
 *
 * Every path this module hands out is KIT-ROOT-RELATIVE and POSIX-separated (`en/ssot/README.md`),
 * so generated tables stay valid wherever the kit is copied, symlinked or vendored.
 *
 * FAIL-LOUD: a missing root, an empty file set or an empty topic set throws a named error. A loop
 * over an empty set produces no findings and would report a clean result that is really a scan
 * failure. Error vocabulary: `<CODE>: <subject> — Root cause: ... Solution: ...`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory of this module: `<kit>/tools/lib`. */
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

/** Default kit root: `<kit>/tools/lib/../..`. */
const DEFAULT_KIT_ROOT = path.resolve(MODULE_DIRECTORY, '..', '..');

/** The English kit tree; topic folders are its direct subdirectories. */
export const KIT_EN_ROOT_RELATIVE = 'en';

/**
 * The one folder under `en/` that is not a topic. `en/README.md` lists one row per directory under
 * `en/` that is not `_meta/`; `_meta/` is routed by name in the same README's meta section, and
 * listing it in the topic table too would mirror one folder in two lists.
 */
const NON_TOPIC_DIRECTORY = '_meta';

/** The `part-of` cover-block value that marks a folder's hub file. */
export const HUB_PART_OF_VALUE = 'self';

/**
 * Top-level directories of the kit root that are not kit content and are never scanned
 * (`tools/` holds these scripts and their README). Hidden directories and `node_modules` are
 * skipped at every depth.
 */
const EXCLUDED_TOP_LEVEL_DIRECTORIES = new Set(['tools']);

let kitRoot = null;

/**
 * Parses the shared command-line options.
 * @param {string[]} argv - Arguments after the script name.
 * @returns {{root: string|null, check: boolean, lenient: boolean, only: string[]|null, help: boolean, unknown: string[]}}
 */
export function parseArgs(argv) {
  const options = {
    root: null,
    check: false,
    lenient: false,
    only: null,
    help: false,
    unknown: [],
  };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    const takeValue = name => {
      if (argument.startsWith(`${name}=`)) return argument.slice(name.length + 1);
      const value = argv[index + 1];
      if (value == null || value.startsWith('--')) {
        throw new Error(`ARG_VALUE_MISSING: ${name} — Solution: pass ${name} <value>.`);
      }
      index++;
      return value;
    };
    if (argument === '--check') options.check = true;
    else if (argument === '--lenient') options.lenient = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--root' || argument.startsWith('--root='))
      options.root = takeValue('--root');
    else if (argument === '--only' || argument.startsWith('--only='))
      options.only = takeValue('--only')
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    else options.unknown.push(argument);
  }
  return options;
}

/**
 * Resolves and fixes the kit root for this process.
 * @param {string|null} cliRoot - Value of `--root`, if given.
 * @returns {string} Absolute, real path of the kit root.
 */
export function configureKitRoot(cliRoot) {
  const requested = cliRoot ?? process.env.KIT_ROOT ?? DEFAULT_KIT_ROOT;
  const source =
    cliRoot != null ? '--root' : process.env.KIT_ROOT != null ? 'KIT_ROOT' : 'tools/..';
  const absolute = path.resolve(requested);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) {
    throw new Error(
      `KIT_ROOT_MISSING: ${absolute} (from ${source}) — Root cause: the kit root is not an ` +
        `existing directory. Solution: pass --root <kit dir> or set KIT_ROOT to the folder that ` +
        `contains en/.`
    );
  }
  kitRoot = fs.realpathSync(absolute);
  return kitRoot;
}

/** @returns {string} The configured absolute kit root (defaults to `tools/..`). */
export function getKitRoot() {
  if (kitRoot == null) configureKitRoot(null);
  return kitRoot;
}

/** Converts a kit-root-relative path to an absolute path. */
export function toAbsolute(relativePath) {
  return path.join(getKitRoot(), relativePath);
}

/** Converts an absolute path to a POSIX kit-root-relative path. */
function toRelative(absolutePath) {
  return path.relative(getKitRoot(), absolutePath).replaceAll('\\', '/');
}

/** Collects every `.md` file below a directory (recursive). */
function collectMarkdown(directory, collected, depth) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      if (depth === 0 && EXCLUDED_TOP_LEVEL_DIRECTORIES.has(entry.name)) continue;
      collectMarkdown(full, collected, depth + 1);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      collected.push(toRelative(full));
    }
  }
  return collected;
}

/**
 * Returns every kit `.md` file, kit-root-relative and sorted.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {string[]} Sorted relative paths (never empty — throws instead).
 */
export function listKitMarkdownFiles(consumerId) {
  const root = getKitRoot();
  const files = collectMarkdown(root, [], 0).sort();
  if (files.length === 0) {
    throw new Error(
      `KIT_FILE_SET_EMPTY: ${root} — Root cause: the scan root holds no \`.md\` file; ` +
        `${consumerId} would report "0 findings" over an empty set, which is a scan failure, not ` +
        `a clean result. Solution: point --root / KIT_ROOT at the kit folder.`
    );
  }
  return files;
}

/**
 * Returns the TOPIC folders under `en/` (direct subdirectories, `_meta` excluded), sorted.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {string[]} Sorted topic slugs.
 */
export function listTopicSlugs(consumerId) {
  const enRoot = toAbsolute(KIT_EN_ROOT_RELATIVE);
  if (!fs.existsSync(enRoot)) {
    throw new Error(
      `KIT_EN_ROOT_MISSING: ${KIT_EN_ROOT_RELATIVE}/ under ${getKitRoot()} — Root cause: the root ` +
        `the topic folders are derived from does not exist; ${consumerId} would produce an empty ` +
        `topic list. Solution: point --root / KIT_ROOT at the folder that contains en/.`
    );
  }
  const slugs = fs
    .readdirSync(enRoot, { withFileTypes: true })
    .filter(
      entry =>
        entry.isDirectory() &&
        entry.name !== NON_TOPIC_DIRECTORY &&
        !entry.name.startsWith('.')
    )
    .map(entry => entry.name)
    .sort();
  if (slugs.length === 0) {
    throw new Error(
      `KIT_TOPIC_SET_EMPTY: ${KIT_EN_ROOT_RELATIVE}/ — Root cause: no topic folder could be ` +
        `derived under en/; ${consumerId} would produce an empty index and report "no drift". ` +
        `Solution: restore the topic folders or point --root at the right kit.`
    );
  }
  return slugs;
}

/**
 * Returns the DIRECT `.md` children of a topic folder (deeper folders such as `ssot/registry/**`
 * can never hold the topic's hub).
 * @param {string} slug - Topic folder name.
 * @returns {string[]} Sorted relative paths.
 */
export function listTopicFiles(slug) {
  const directory = toAbsolute(`${KIT_EN_ROOT_RELATIVE}/${slug}`);
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => `${KIT_EN_ROOT_RELATIVE}/${slug}/${entry.name}`)
    .sort();
}

/**
 * Returns a file's H1 title (first line), or an empty string when line 1 is not an H1.
 * @param {string} relativePath - Kit-root-relative path.
 * @returns {string} Title text.
 */
export function readHeadingOne(relativePath) {
  const firstLine = fs.readFileSync(toAbsolute(relativePath), 'utf8').split('\n')[0];
  const match = /^#\s+(.+?)\s*$/u.exec(firstLine);
  return match ? match[1] : '';
}
