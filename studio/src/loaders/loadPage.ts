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
  slug: string[];
};

export async function loadPage({ slug }: PageParams) {
  return await loadContentType<PagePayload | null>({
    name: "page",
    slug,
  });
}
