import { loadEntity } from "@webicient/sanity-kit/query";
import type { EntityPayload } from "@webicient/sanity-kit";
import type { QueryResponseInitial } from "@sanity/react-loader";

export type HomePayload = EntityPayload;

interface HomeParams {
  language: string;
}

export async function loadHome({
  language,
}: HomeParams): Promise<QueryResponseInitial<HomePayload | null>> {
  return loadEntity<HomePayload | null>({
    name: "home",
    language,
  });
}
