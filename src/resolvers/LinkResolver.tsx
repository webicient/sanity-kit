import type { LinkProps as NextLinkProps } from "next/link";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { LinkPayload } from "../types/object";
import { resolveDocumentHref } from "../utils/url";

type LinkResolverProps = NextLinkProps & HTMLAttributes<HTMLAnchorElement>;

export function LinkResolver({
  children,
  link,
  ...props
}: {
  link?: LinkPayload;
  children: ReactNode;
  defaultToTop?: boolean;
} & Omit<LinkResolverProps, "href">): JSX.Element {
  const linkProps: any = {
    // Defaults to home.
    href: "/",
    target: undefined,
  };

  if (link?.isExternal) {
    if (link.external) {
      linkProps.href = link.external;
    }
  } else {
    linkProps.href = resolveDocumentHref(link?.internal);
  }

  if (link?.openInNewTab) {
    linkProps.target = "_blank";
  }

  if (link?.rel) {
    linkProps.rel = link.rel;
  }

  return (
    <Link {...linkProps} {...props}>
      {children}
    </Link>
  );
}
