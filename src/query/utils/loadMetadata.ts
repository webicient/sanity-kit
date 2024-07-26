import { SEO } from "../../types/seo";
import { WithHierarchyPayload } from "./loadHierarchy";

export interface WithSEOPayload extends WithHierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  seo: SEO;
}
