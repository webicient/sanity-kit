import { loadSettings } from "@webicient/sanity-kit/query";
import { KitVisualEditing } from "@webicient/sanity-kit/visual-editing";
import { KitProvider } from "@webicient/sanity-kit/provider";
import type { Metadata } from "next";

interface RouteParams {
  params: {
    language: string;
  };
}

export async function generateMetadata({
  params: { language },
}: RouteParams): Promise<Metadata> {
  const { data: seoSettings } = await loadSettings({
    name: "seoSettings",
    language,
  });

  return {
    title: seoSettings?.title
      ? { absolute: seoSettings.title, template: `%s | ${seoSettings?.title}` }
      : undefined,
    description: seoSettings?.description,
  };
}

export default async function RootLayout({
  children,
  params: { language },
}: Readonly<{
  children: React.ReactNode;
}> &
  RouteParams): Promise<JSX.Element> {
  const { data: settings } = await loadSettings({ language });

  return (
    <KitProvider settings={settings}>
      {children}
      <KitVisualEditing />
    </KitProvider>
  );
}
