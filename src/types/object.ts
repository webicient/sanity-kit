import { HierarchyPayload } from "./payload";

export interface InternalLinkPayload extends HierarchyPayload {
  label: string;
  link: {
    _type: string;
    slug: string;
  };
}

export interface LinkPayload {
  _type?: string;
  label: string;
  isExternal: boolean;
  external?: string;
  internal?: InternalLinkPayload;
  openInNewTab: boolean;
}
