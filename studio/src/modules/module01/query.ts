import { groq } from "next-sanity";

export const QUERY = groq`{
  title,
  description
}`;
