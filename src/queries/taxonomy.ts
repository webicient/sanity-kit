import groq from "groq";
import { baseQueryFields } from "./document";
import { supportsQueryField } from "./supports";
import { appendField, isValidStatement } from "./projection";
import { getContentTypeByName, isContentType } from "../utils/config";
import { parentQueryField } from "./hierarchy";

export function getTaxonomyQuery(
  name: string,
  slug: string[],
  language?: string,
  projection?: string,
): string {
  const reversedSlug = slug.reverse();

  let query = language
    ? groq`*[_type == $type && slug.${language}.current == "${reversedSlug[0]}"][0]`
    : groq`*[_type == $type && slug.current == "${reversedSlug[0]}"][0]`;

  if (projection) {
    if (!isValidStatement(projection)) {
      throw new Error(
        "getTaxonomyQuery: Projection must start and close with a curly brace.",
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
