import { linkProjection } from "@webicient/sanity-kit/utils";
import { groq } from "next-sanity";

export const QUERY = groq`{
  cards[] {
    title,
    text,
    link {
      ${linkProjection()}
    }
  }
}`;
