import { loadContentType } from "@webicient/sanity-kit/query";
import { ContentTypePayload } from "@webicient/sanity-kit";

export interface PostPayload extends ContentTypePayload {
  /* No other types. */
}

type PostParams = {
  slug: string[];
};

export async function loadPost({ slug }: PostParams) {
  return await loadContentType<PostPayload | null>({
    name: "post",
    slug,
  });
}
