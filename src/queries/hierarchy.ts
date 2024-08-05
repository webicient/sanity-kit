const MAX_DEPTH = 5;

export function parentQueryField(language?: string): string {
  let queryField = `"parent": parent->{ _type, _id, title, slug`;

  for (let i = 1; i < MAX_DEPTH; i++) {
    queryField += `, "parent": parent->{ _type, _id, title, slug`;
  }

  queryField += "}".repeat(MAX_DEPTH);

  if (language) {
    queryField = queryField.replaceAll("slug", `"slug": slug.${language}`);
  }

  return queryField;
}

export function hierarchyQueryFields(language?: string): string {
  return `
    _id,
    _type,
    title,
    slug,
    ${parentQueryField(language)}
  `;
}
