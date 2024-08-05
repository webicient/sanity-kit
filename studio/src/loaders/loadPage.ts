import { loadContentType } from "@webicient/sanity-kit/query";
import type { ContentTypePayload } from "@webicient/sanity-kit";
import type { QueryResponseInitial } from "@sanity/react-loader";

export type PagePayload = ContentTypePayload;

interface PageParams {
  slug: string[];
  language: string;
}

export async function loadPage({
  slug,
  language,
}: PageParams): Promise<QueryResponseInitial<PagePayload | null>> {
  return loadContentType<PagePayload | null>({
    name: "page",
    language,
    slug,
    projection: `{ name }`,
  });
}
