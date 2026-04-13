/**
 * Utility functions for route naming (Excel-style: A, B, ..., Z, AA, AB, AC...)
 */

/**
 * Convert a zero-based index to Excel-style column name
 * @param num - Zero-based index (0->A, 25->Z, 26->AA, etc.)
 * @returns Excel-style column name (A, B, ..., Z, AA, AB, ...)
 */
export function numberToColumnName(num: number): string {
  let result = '';
  let n = num;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * Convert Excel-style column name to a zero-based index
 * @param name - Excel-style column name (A, B, ..., Z, AA, AB, ...)
 * @returns Zero-based index (A->0, Z->25, AA->26, etc.)
 */
export function columnNameToNumber(name: string): number {
  let result = 0;
  for (let i = 0; i < name.length; i++) {
    result = result * 26 + (name.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Get the next available route name based on existing routes
 * @param existingRouteNames - Array of existing route names (e.g., ["Route A", "Route B"])
 * @returns Next available route name (e.g., "Route C")
 */
export function getNextRouteName(existingRouteNames: (string | undefined)[]): string {
  if (!existingRouteNames || existingRouteNames.length === 0) {
    return 'Route A';
  }

  // Extract all route letters from existing routes and convert to indices
  const usedIndices = existingRouteNames
    .filter((name): name is string => typeof name === 'string')
    .map(name => name.replace('Route ', '').trim())
    .filter(letters => /^[A-Z]+$/i.test(letters))
    .map(letters => columnNameToNumber(letters.toUpperCase()));

  // Find the maximum index used
  const maxIndex = Math.max(-1, ...usedIndices);

  // Return the next route name
  return `Route ${numberToColumnName(maxIndex + 1)}`;
}
