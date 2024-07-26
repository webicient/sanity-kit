import { serverClient } from "../serverClient";
import { PARENT_FIELD_QUERY } from "../groq";
import {
  getDocumentHierarchyPath,
  WithHierarchyPayload,
} from "./loadHierarchy";

type GenerateStaticSlugsParams = {
  /**
   * Sanity valid document type.
   */
  type: string;
};

export async function generateStaticSlugs({ type }: GenerateStaticSlugsParams) {
  const query = `*[_type == $type && defined(slug)]{
    slug,
    ${PARENT_FIELD_QUERY}
  }`;

  const docs = await serverClient
    .withConfig({
      perspective: "published",
      useCdn: false,
      stega: false,
    })
    .fetch<WithHierarchyPayload[]>(query, { type });

  return docs.map((doc) => {
    return {
      slug: getDocumentHierarchyPath(doc),
    };
  });
}
