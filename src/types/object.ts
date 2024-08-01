import { HierarchyPayload } from "./payload";

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
