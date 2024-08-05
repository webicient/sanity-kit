import {
  hierarchyQueryFields,
  imageQueryFields,
  richTextQueryFields,
} from "@webicient/sanity-kit/queries";
import { groq } from "next-sanity";

export const getQuery = (language?: string): string => groq`{
  title,
  text[] { ${richTextQueryFields(language)} },
  image { ${imageQueryFields} },
  "pages": *[_type == "page"] { ${hierarchyQueryFields(language)} }
}`;
