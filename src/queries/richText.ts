import { imageQueryFields } from "./image";
import { linkQueryFields } from "./link";

function richTextImageQueryField(): string {
  return `_type == "image" => { ${imageQueryFields} }`;
}

function richTextBlockQueryField(language?: string): string {
  return `
    _type == "block" => {
      ...,
      markDefs[] {
        ...,
        _type == "link" => { ${linkQueryFields(language)} }
      }
    },
  `;
}

export function richTextQueryFields(language?: string): string {
  return `
    ...,
    ${richTextImageQueryField()},
    ${richTextBlockQueryField(language)}
  `;
}
