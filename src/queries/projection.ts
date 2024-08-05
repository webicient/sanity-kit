/**
 * Removes all whitespace characters from a string.
 *
 * @param str - The input string to clean.
 * @returns The cleaned string with no whitespace characters.
 */
export function clean(str: string) {
  return str.replace(/\s+/g, "");
}

/**
 * Validates a GROQ projection string.
 *
 * @param projection - The GROQ projection string to validate.
 * @throws {Error} If the projection string is invalid.
 */
export function isValidStatement(str: string): boolean {
  let cleanStr = clean(str);
  return cleanStr.startsWith("{") && cleanStr.endsWith("}");
}

export function appendField(existingQuery: string, newFields: string): string {
  // Find the index of the last closing brace '}'.
  const lastBraceIndex = existingQuery.lastIndexOf("}");

  // If the last brace index is found, insert the new fields before it
  if (lastBraceIndex !== -1) {
    // Construct the new query by appending new fields before the last closing brace
    const newQuery = `${existingQuery.substring(0, lastBraceIndex).trim()}, ${newFields.trim()} \n}`;
    return newQuery;
  } else {
    // If the existing query is not in the expected format, return it unmodified
    throw new Error("Invalid GROQ query format");
  }
}
