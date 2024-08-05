import { groq } from "next-sanity";
import { linkQueryFields } from "@webicient/sanity-kit/queries";

export const getQuery = (language?: string): string => groq`{
  cards[] {
    title,
    text,
    link {
      ${linkQueryFields(language)}
    }
  }
}`;
