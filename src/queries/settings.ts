import { canTranslate, getSettings } from "../utils/config";

export function getSettingQueryFields(name: string, language?: string): string {
  const setting = getSettings().find((setting) => setting.name === name);

  let queryFields = "...,";

  if (
    canTranslate(Boolean(setting?.translate)) &&
    setting?.fields &&
    language
  ) {
    setting.fields.forEach((field) => {
      queryFields += `"${field.name}": ${field.name}.${language},`;
    });
  }

  return queryFields;
}

export function getSettingsQuery(name?: string, language?: string): string {
  const settingsNames = getSettings().map((setting) => setting.name);

  if (!name) {
    let query = `*[][0]{`;

    settingsNames.forEach((settingName, index) => {
      query +=
        '"' +
        settingName +
        '": *[_type == "' +
        settingName +
        '"][0]' +
        "{" +
        getSettingQueryFields(settingName, language) +
        "}" +
        (index < settingsNames.length - 1 ? "," : "");
    });

    query += "}";

    return query;
  }

  if (!settingsNames.includes(name)) {
    throw new Error(`Settings group "${name}" does not exist.`);
  }

  return `*[_type == "${name}"][0]{ ${getSettingQueryFields(name, language)} }`;
}
