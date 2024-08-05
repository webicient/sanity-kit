import { Language } from "@sanity/language-filter";
import { getSettings } from "../../utils/config";
import { loadQuery } from "../loadQuery";
import { getSettingsQuery } from "../../queries/settings";

type LoadSettingsParams = {
  /**
   * Target certain settings group.
   */
  name?: string;
  /**
   * The language of the content type.
   */
  language?: Language["id"];
};

/**
 * Loads the settings based on the provided parameters.
 *
 * @param params - The parameters for loading the settings.
 * @returns The loaded settings.
 * @throws Error if the specified settings group does not exist.
 */
export function loadSettings({ name, language }: LoadSettingsParams = {}) {
  return loadQuery<any>(
    getSettingsQuery(name, language),
    {},
    {
      next: {
        tags: name ? [name] : getSettings().map((setting) => setting.name),
      },
    },
  );
}
