import { loadContentType } from "@webicient/sanity-kit/query";
import type { ContentTypePayload } from "@webicient/sanity-kit";
import type { QueryResponseInitial } from "@sanity/react-loader";

export type PostPayload = ContentTypePayload;

interface PostParams {
  slug: string[];
  language: string;
}

export async function loadPost({
  slug,
  language,
}: PostParams): Promise<QueryResponseInitial<PostPayload | null>> {
  return loadContentType<PostPayload | null>({
    name: "post",
    slug,
    language,
  });
}
