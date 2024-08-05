import { loadContentType } from "@webicient/sanity-kit/query";
import { ContentTypePayload } from "@webicient/sanity-kit";
import { QueryResponseInitial } from "@sanity/react-loader";

export interface ServicePayload extends ContentTypePayload {
  /* No other types. */
}

type ServiceParams = {
  slug: string[];
};

export async function loadService({
  slug,
}: ServiceParams): Promise<QueryResponseInitial<ServicePayload | null>> {
  return await loadContentType<ServicePayload | null>({
    name: "service",
    slug,
  });
}
