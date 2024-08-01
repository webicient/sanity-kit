import {
  hierarchyProjection,
  imageProjection,
  editorProjection,
} from "@webicient/sanity-kit/utils";
import { groq } from "next-sanity";

export const QUERY = groq`{
  title,
  text[] { ${editorProjection()} },
  image { ${imageProjection()} },
  "pages": *[_type == "page"] { ${hierarchyProjection()} }
}`;
