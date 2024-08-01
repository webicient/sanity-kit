import { InternalLinkPayload } from "./object";
import { ContentTypePayload, EntityPayload } from "./payload";

export type LinkablePayload =
  | InternalLinkPayload
  | ContentTypePayload
  | EntityPayload;
