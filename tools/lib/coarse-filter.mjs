/**
 * The single derivation of the COARSE-FILTER WIDTH.
 *
 * WHAT: the fan-out at and above which an `open-when` signal "narrows but does not select". The
 * value is never hard-coded: it is the width just above the LARGEST GAP in the signal fan-out
 * distribution, so it moves as the tree grows instead of becoming a stale hand-kept number.
 *
 * A degenerate distribution (a single width, or none) has no "largest gap"; the derivation throws
 * rather than fall back to a silent default that would skip the coarse-token branch entirely.
 */

/**
 * Derives the coarse-filter width from the signal fan-out distribution.
 * @param {Iterable<number>} signalFanOuts - Fan-out of every `open-when` SIGNAL.
 * @param {string} consumerId - Consumer id shown in error messages.
 * @returns {number} Width; a signal at or above it narrows, it does not select.
 */
export function coarseFilterWidth(signalFanOuts, consumerId) {
  const widths = [...new Set(signalFanOuts)].sort((a, b) => a - b);
  if (widths.length < 2) {
    throw new Error(
      `KIT_FANOUT_DISTRIBUTION_DEGENERATE: ${widths.length} distinct width(s) — Root cause: ` +
        `${consumerId} cannot derive the coarse-filter threshold from the signal fan-out ` +
        `distribution; with one width (or none) the "largest gap" is undefined. Solution: check ` +
        `that cover blocks parse and declare \`signal:\` tokens in \`open-when\`.`
    );
  }
  let gap = 0;
  let width = widths[widths.length - 1];
  for (let index = 1; index < widths.length; index++) {
    const distance = widths[index] - widths[index - 1];
    if (distance > gap) {
      gap = distance;
      width = widths[index];
    }
  }
  return width;
}
