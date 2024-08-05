import groq from "groq";

/**
 * Returns as a full image query projection.
 */
export const imageQueryFields = groq`
  _type,
  asset->{
    "_ref": _id,
    _type,
    url,
    altText,
    description,
    title,
    originalFilename,
    mimeType,
    "width": metadata.dimensions.width,
    "height": metadata.dimensions.height
  }
`;
