import { loadEntity } from "@webicient/sanity-kit/query";
import { EntityPayload } from "@webicient/sanity-kit";

export interface HomePayload extends EntityPayload {
  /* No other types. */
}

type HomeParams = {
  language: string;
};

export async function loadHome({ language }: HomeParams) {
  return await loadEntity<HomePayload | null>({
    name: "home",
    language,
  });
}
