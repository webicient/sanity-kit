import { loadContentType } from "@webicient/sanity-kit/query";
import { ContentTypePayload } from "@webicient/sanity-kit";

export interface PagePayload extends ContentTypePayload {
  /* No other types. */
}

type PageParams = {
  slug: string[];
};

export async function loadPage({ slug }: PageParams) {
  return await loadContentType<PagePayload | null>({
    name: "page",
    slug,
  });
}
