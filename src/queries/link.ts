import { parentQueryField } from "./hierarchy";

export function internalLinkQueryFields(language?: string): string {
  return `
    _id,
    _type,
    title,
    slug,
    ${parentQueryField(language)}
  `;
}

export function linkQueryFields(language?: string): string {
  return `
    ...,
    internal->{ ${internalLinkQueryFields(language)} }
  `;
}
