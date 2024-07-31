import { serverClient } from "../serverClient";
import { PARENT_FIELD_QUERY } from "../groq";
import { HierarchyPayload } from "../../types";
import { getDocumentHierarchyPath } from "../../utils/hierarchy";

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
    .fetch<HierarchyPayload[]>(query, { type });

  return docs.map((doc) => {
    return {
      slug: getDocumentHierarchyPath(doc),
    };
  });
}
