import { loadSettings } from "@webicient/sanity-kit/query";
import { KitVisualEditing } from "@webicient/sanity-kit/visual-editing";
import { KitProvider } from "@webicient/sanity-kit/provider";

export async function generateMetadata() {
  const { data: seoSettings } = await loadSettings({ name: "seoSettings" });

  return {
    title: seoSettings.title
      ? { template: `%s | ${seoSettings.title}` }
      : undefined,
    description: seoSettings.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await loadSettings();

  return (
    <KitProvider settings={settings}>
      {children}
      <KitVisualEditing />
    </KitProvider>
  );
}
