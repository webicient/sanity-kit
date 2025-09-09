"use client";

import type { LinkProps as NextLinkProps } from "next/link";
import Link from "next/link";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { LinkPayload } from "../types/object";
import { resolveDocumentHref } from "../utils/url";

type LinkResolverProps = NextLinkProps & HTMLAttributes<HTMLAnchorElement>;

export const LinkResolver = forwardRef<
  HTMLAnchorElement,
  {
    link?: LinkPayload;
    children: ReactNode;
    defaultToTop?: boolean;
    locale?: string;
  } & Omit<LinkResolverProps, "href">
>(({ children, link, locale, ...props }, ref) => {
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
    linkProps.href = resolveDocumentHref(link?.internal, locale);
  }

  if (link?.openInNewTab) {
    linkProps.target = "_blank";
  }

  if (link?.rel) {
    linkProps.rel = link.rel;
  }

  return (
    <Link ref={ref} {...linkProps} {...props}>
      {children}
    </Link>
  );
});

LinkResolver.displayName = "LinkResolver";
