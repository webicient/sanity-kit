import { loadEntity } from "@webicient/sanity-kit/query";
import { EntityPayload } from "@webicient/sanity-kit";

export interface HomePayload extends EntityPayload {
  /* No other types. */
}

export async function loadHome() {
  return await loadEntity<HomePayload | null>({
    name: "home",
  });
}
