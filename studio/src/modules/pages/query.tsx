import { hierarchyProjection, imageProjection } from "@webicient/sanity-kit/utils";
import { groq } from "next-sanity";

export const QUERY = groq`{
  title,
  description,
  image { ${imageProjection()} },
  "pages": *[_type == "page"] { ${hierarchyProjection()} }
}`;
