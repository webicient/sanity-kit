import { imageQueryFields } from "./image";
import { linkQueryFields } from "./link";

function richTextImageQueryField(): string {
  return `_type == "image" => { ${imageQueryFields} }`;
}

function richTextBlockQueryField(): string {
  return `
    _type == "block" => {
      ...,
      markDefs[] {
        ...,
        _type == "link" => { ${linkQueryFields()} }
      }
    },
  `;
}

export function richTextQueryFields(language?: string): string {
  return `
    ...,
    ${richTextImageQueryField()},
    ${richTextBlockQueryField()}
  `;
}
