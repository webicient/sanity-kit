import groq from "groq";
import { baseQueryFields } from "./document";
import { supportsQueryField } from "./supports";
import { appendField, isValidStatement } from "./projection";
import { getContentTypeByName, isContentType } from "../utils/config";
import { parentQueryField } from "./hierarchy";

export function getSlugQueryFilter(slug: string[], language?: string): string {
  let queryFilter = `slug.current == "${slug[0]}"`;

  for (let i = 1; i < slug.length; i++) {
    let parentPath = "parent" + "->parent".repeat(i - 1);
    queryFilter += ` && ${parentPath}->slug.current == "${slug[i]}"`;
  }

  queryFilter = `&& ${queryFilter}`;

  if (language) {
    queryFilter = queryFilter.replaceAll(
      "slug.current",
      `slug.${language}.current`,
    );
  }

  return queryFilter;
}

export function getContentTypeQuery(
  name: string,
  slug: string[],
  language?: string,
  projection?: string,
): string {
  const reversedSlug = slug.reverse();

  let query = groq`*[_type == "${name}" ${getSlugQueryFilter(reversedSlug, language)}][0]`;

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

  if (isContentType(name)) {
    if (Boolean(getContentTypeByName(name)?.hierarchical)) {
      query = appendField(query, parentQueryField(language));
    }
  }

  return query;
}
