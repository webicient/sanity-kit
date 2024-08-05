import groq from "groq";
import { baseQueryFields } from "./document";
import { supportsQueryField } from "./supports";
import { appendField, isValidStatement } from "./projection";

export function getEntityQuery(
  name: string,
  language?: string,
  projection?: string,
): string {
  let query = groq`*[_id == $type][0]`;

  if (projection) {
    if (!isValidStatement(projection)) {
      throw new Error(
        "getContentTypeQuery: Projection must start and close with a curly brace.",
      );
    }

    query = appendField(groq`${query}${projection}`, baseQueryFields);
    query = appendField(query, supportsQueryField(name, language));
  } else {
    query = groq`${query}{
      ${baseQueryFields},
      ${supportsQueryField(name, language)}
    }`;
  }

  return query;
}
