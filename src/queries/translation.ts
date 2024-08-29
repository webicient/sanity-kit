import { getContentTypeByName } from "../utils/config";

export function translationQueryField(schemaName: string): string {
  if (getContentTypeByName(schemaName)?.translate) {
    return `"_translations": slug`;
  }

  return "";
}
