import { HierarchyPayload } from "./payload";
import type { PortableTextBlock } from "@portabletext/types";

export interface InternalLinkPayload extends HierarchyPayload {
  /* No other types. */
}

export interface LinkPayload {
  _type?: string;
  label: string;
  isExternal: boolean;
  external?: string;
  internal?: InternalLinkPayload;
  openInNewTab: boolean;
  rel: string;
}

export interface ImagePayload {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
    originalFilename?: string;
    mimeType?: string;
    url?: string;
    altText?: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
  }
}
