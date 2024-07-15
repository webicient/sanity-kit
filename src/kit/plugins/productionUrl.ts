import { ResolveProductionUrlContext } from "sanity";
import { resolveHref } from "../../utils/url";
import { API_VERSION } from "../defaults/constants";
import { SanityClient } from "sanity";

const MAX_DEPTH = 10;

async function getHierarchy(client: SanityClient, documentId: string | null) {
  const composeQuery = (depth: number = MAX_DEPTH): string => {
    return `"parent": parent->{ _id, "slug": slug.current, ${depth > 0 ? composeQuery(depth - 1) : ""}}`;
  };

  const query = `
    *[_id == $id][0] {
      _id,
      "slug": slug.current,
      ${composeQuery(MAX_DEPTH)}
    }
  `;

  const result = await client.fetch(query, { id: documentId });

  let hierarchy = [];
  let currentDoc = result;

  while (currentDoc) {
    hierarchy.unshift({ id: currentDoc._id, slug: currentDoc.slug });
    currentDoc = currentDoc.parent;
  }

  return hierarchy;
}

export async function productionUrl(
  prev: string,
  context: ResolveProductionUrlContext,
): Promise<string | undefined> {
  const { getClient, dataset, document } = context;

  const slugSegments = await getHierarchy(
    getClient({ apiVersion: API_VERSION }),
    document._id,
  );
  const slug = slugSegments.map(({ slug }) => slug).join("/");
  const params = new URLSearchParams();

  params.set("preview", "true");
  params.set("dataset", dataset);

  return resolveHref(document._type, slug) || prev;
}
