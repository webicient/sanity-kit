import { hierarchyProjection } from "@webicient/sanity-kit/utils";
import { groq } from "next-sanity";

export const QUERY = groq`{
  title,
  "pages": *[_type == "page"] {
    ${hierarchyProjection()}
  }
}`;
