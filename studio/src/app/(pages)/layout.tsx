import { loadSettings } from "@webicient/sanity-kit/query";
import { SiteProvider } from "@/components/SiteProvider";

export async function generateMetadata() {
  const { data: seoSettings } = await loadSettings({ name: "seoSettings" });

  return {
    title: seoSettings.title,
    description: seoSettings.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await loadSettings();
  return <SiteProvider settings={settings}>{children}</SiteProvider>;
}
