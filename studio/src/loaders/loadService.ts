import { loadContentType } from "@webicient/sanity-kit/query";
import { ContentTypePayload } from "@webicient/sanity-kit";

export interface ServicePayload extends ContentTypePayload {
  /* No other types. */
}

type ServiceParams = {
  slug: string[];
};

export async function loadService({ slug }: ServiceParams) {
  return await loadContentType<ServicePayload | null>({
    name: "service",
    slug,
  });
}
