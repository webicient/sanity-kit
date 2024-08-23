import { loadSettings } from "@webicient/sanity-kit/query";
import { KitVisualEditing } from "@webicient/sanity-kit/visual-editing";
import { KitProvider } from "@webicient/sanity-kit/provider";
import type { Metadata } from "next";

interface RouteParams {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: RouteParams): Promise<Metadata> {
  const { data: seoSettings } = await loadSettings({
    name: "seoSettings",
    language: locale,
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
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
}> &
  RouteParams): Promise<JSX.Element> {
  const { data: settings } = await loadSettings({ language: locale });

  return (
    <KitProvider settings={settings}>
      {children}
      <KitVisualEditing />
    </KitProvider>
  );
}
