/**
 * Extract the first https:// URL from a line of text
 * @param line - The line of text to search
 * @returns The first URL found, or null if none
 */
export function extractUrl(line: string): string | null {
  const match = line.match(/https:\/\/[^\s]+/);
  return match ? match[0] : null;
}
