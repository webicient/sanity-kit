import {
  loadContentType,
  type WithSEOPayload,
  type WithHierarchyPayload,
} from "@webicient/sanity-kit/query";
import { Slug } from "sanity";

export interface PostPayload extends WithSEOPayload, WithHierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug;
}

type PostParams = {
  slugs: string[];
};

export async function loadPost({ slugs }: PostParams) {
  return await loadContentType<PostPayload | null>({
    name: "post",
    slugs,
  });
}
