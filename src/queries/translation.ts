import {
  canTranslate,
  getContentTypeByName,
  getLanguages,
} from "../utils/config";
import { parentQueryField } from "./hierarchy";

export function translationQueryField(schemaName: string): string {
  if (!Boolean(getLanguages().length)) {
    return "";
  }

  if (getContentTypeByName(schemaName)?.translate) {
    return `"_translation": *[_type == "${schemaName}" && _id == ^._id][0] {
      _type,
      _id,
      title,
      slug,
      ${parentQueryField()}
    }`;
  }

  return "";
}
