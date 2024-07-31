import { serverClient } from "../serverClient";
import { HierarchyPayload } from "../../types/payload";
import { getDocumentHierarchyPath } from "../../utils/hierarchy";
import { parentProjection } from "../../utils/groq";

type GenerateStaticSlugsParams = {
  /**
   * Sanity valid document type.
   */
  type: string;
};

export async function generateStaticSlugs({ type }: GenerateStaticSlugsParams) {
  const query = `*[_type == $type && defined(slug)]{
    slug,
    ${parentProjection()}
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
