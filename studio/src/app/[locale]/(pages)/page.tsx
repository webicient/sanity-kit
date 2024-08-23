import { loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { ModuleResolver } from "@webicient/sanity-kit/resolvers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { loadHome } from "@/loaders/loadHome";

interface RouteParams {
  params: {
    slug: string[];
    locale: string;
  };
}

export const dynamicParams = true;

export async function generateMetadata({
  params: { locale },
}: RouteParams): Promise<Metadata> {
  const [{ data: home }, { data: generalSettings }] = await Promise.all([
    loadHome({ language: locale }),
    loadSettings({ name: "generalSettings", language: locale }),
  ]);

  return getMetadata(home, {}, generalSettings.domain);
}

export default async function Home({
  params: { locale },
}: RouteParams): Promise<JSX.Element> {
  const { data: home } = await loadHome({ language: locale });

  if (!home) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col p-24 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold">{home.title}</h1>
      {home.modules?.length ? <ModuleResolver data={home.modules} /> : null}
    </main>
  );
}
