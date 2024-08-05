import { CORE_FIELDS } from "../config/defaults/fields";
import {
  getContentTypes,
  getEntities,
  getTaxonomies,
  isSupports,
} from "../utils/config";
import { modulesQueryField } from "./modules";

export function supportsQueryField(name: string, language?: string): string {
  const schemaObject = [
    ...getContentTypes(),
    ...getEntities(),
    ...getTaxonomies(),
  ].find((obj) => obj.name === name);

  if (!schemaObject) {
    return "";
  }

  const fields = [];

  for (const type of Object.keys(CORE_FIELDS)) {
    if (type === "modules" && isSupports(schemaObject, type)) {
      fields.push(`${modulesQueryField(language)}`);
    } else if (isSupports(schemaObject, type)) {
      if (language) {
        fields.push(`"${type}": ${type}.${language}`);
      } else {
        fields.push(`"${type}": ${type}`);
      }
    }
  }

  return fields.join(",");
}
