import { loadHome } from "@/loaders/loadHome";
import { loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { ModuleResolver } from "@webicient/sanity-kit/resolvers";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slug: string[];
    language: string;
  };
};

export const dynamicParams = true;

export async function generateMetadata({ params: { language } }: RouteParams) {
  const [{ data: home }, { data: generalSettings }] = await Promise.all([
    loadHome({ language }),
    loadSettings({ name: "generalSettings", language }),
  ]);

  return getMetadata(home, {}, generalSettings.domain);
}

export default async function Home({ params: { language } }: RouteParams) {
  const { data: home } = await loadHome({ language });

  if (!home) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-2xl font-bold">{home.title}</h1>
      {home.modules?.length && <ModuleResolver data={home.modules} />}
    </main>
  );
}
