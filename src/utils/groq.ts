type GroqQuery = string;

/**
 * Maximum depth of nested documents to retrieve.
 */
export const MAX_DEPTH = 10;

/**
 * Appends new fields to an existing GROQ query.
 *
 * @param existingQuery - The existing GROQ query.
 * @param newFields - The new fields to append to the query.
 * @returns The modified GROQ query with the new fields appended.
 * @throws {Error} If the existing query is not in the expected format.
 */
export function appendFieldToGROQStatement(
  existingQuery: GroqQuery,
  newFields: GroqQuery,
): GroqQuery {
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

/**
 * Composes the parent query field for retrieving hierarchical data.
 *
 * @param depth The depth of the hierarchy to retrieve. Defaults to MAX_DEPTH.
 * @returns The composed parent query field.
 */
export function composeParentFieldQuery(depth: number = MAX_DEPTH): string {
  let queryField = `"parent": parent->{ _type, _id, title, slug`;
  for (let i = 1; i < depth; i++) {
    queryField += `, "parent": parent->{ _type, _id, title, slug`;
  }
  // Close all opened braces.
  queryField += "}".repeat(depth);
  return queryField;
}
