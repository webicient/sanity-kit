import {
  loadContentType,
  type WithSEOPayload,
  type WithHierarchyPayload,
} from "@webicient/sanity-kit/query";
import { Slug } from "sanity";

export interface PagePayload extends WithSEOPayload, WithHierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug;
}

type PageParams = {
  slugs: string[];
};

export async function loadPage({ slugs }: PageParams) {
  return await loadContentType<PagePayload | null>({
    name: "page",
    slugs,
  });
}
