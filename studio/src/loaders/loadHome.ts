import { type WithSEOPayload, loadEntity } from "@webicient/sanity-kit/query";

export interface HomePayload extends WithSEOPayload {
  _id: string;
  _type: string;
  title: string;
  modules: any[];
}

export async function loadHome() {
  return await loadEntity<HomePayload | null>({
    name: "home",
  });
}
