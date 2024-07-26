"use client";

import { KitProvider } from "@webicient/sanity-kit/components";

interface SiteProviderProps {
  children: React.ReactNode;
  settings: Record<string, any>;
}

export function SiteProvider({ children, settings }: SiteProviderProps) {
  return <KitProvider settings={settings}>{children}</KitProvider>;
}
