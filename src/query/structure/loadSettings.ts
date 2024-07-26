import { getSettings } from "../../utils/config";
import { loadQuery } from "../loadQuery";

type LoadSettingsParams = {
  /**
   * Target certain settings group.
   */
  name?: string;
};

/**
 * Loads the settings based on the provided parameters.
 *
 * @param params - The parameters for loading the settings.
 * @returns The loaded settings.
 * @throws Error if the specified settings group does not exist.
 */
export function loadSettings(params: LoadSettingsParams = {}) {
  const settingsNames = getSettings().map((setting) => setting.name);

  if (params.name && !settingsNames.includes(params.name)) {
    throw new Error(`Settings group "${params.name}" does not exist.`);
  }

  // Get the settings by params.name.
  if (params.name) {
    return loadQuery<any>(
      `*[_type == $name][0]`,
      { name: params.name },
      { next: { tags: [params.name] } },
    );
  }

  let query = `*[][0]{`;

  settingsNames.forEach((settingName, index) => {
    query +=
      '"' +
      settingName +
      '": *[_type == "' +
      settingName +
      '"][0]' +
      (index < settingsNames.length - 1 ? "," : "");
  });

  query += "}";

  return loadQuery<any>(query, {}, { next: { tags: settingsNames } });
}
