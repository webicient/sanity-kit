import { Language } from "@sanity/language-filter";
import { getSettings } from "../../utils/config";
import { loadQuery } from "../loadQuery";
import { getSettingsQuery } from "../../queries/settings";
import { ResponseQueryOptions } from "next-sanity";

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
export function loadSettings(
  { name, language }: LoadSettingsParams = {},
  options?:
    | Pick<
        ResponseQueryOptions,
        "perspective" | "cache" | "next" | "useCdn" | "stega"
      >
    | undefined,
) {
  return loadQuery<any>(
    getSettingsQuery(name, language),
    {},
    {
      ...options,
      next: {
        ...options?.next,
        tags: [
          ...(options?.next?.tags || []),
          ...(name ? [name] : getSettings().map((setting) => setting.name)),
        ],
      },
    },
  );
}
