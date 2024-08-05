import { loadSettings } from "@webicient/sanity-kit/query";
import { KitVisualEditing } from "@webicient/sanity-kit/visual-editing";
import { KitProvider } from "@webicient/sanity-kit/provider";

type RouteParams = {
  params: {
    language: string;
  };
};

export async function generateMetadata({ params: { language } }: RouteParams) {
  const { data: seoSettings } = await loadSettings({
    name: "seoSettings",
    language,
  });

  return {
    title: seoSettings?.title
      ? { template: `%s | ${seoSettings?.title}` }
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
  RouteParams) {
  const { data: settings } = await loadSettings({ language });

  return (
    <KitProvider settings={settings}>
      {children}
      <KitVisualEditing />
    </KitProvider>
  );
}
