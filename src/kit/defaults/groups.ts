import { type FieldGroup } from "sanity";

/**
 * Content type groups are used to group fields together in the Sanity Studio. These groups are used
 * to organize fields in the Studio.
 */
export const coreGroups: FieldGroup[] = [
  {
    name: "content",
    title: "Content",
    description: "Content fields.",
    default: true,
  },
  {
    name: "seo",
    title: "SEO",
    description: "SEO fields.",
  },
];
