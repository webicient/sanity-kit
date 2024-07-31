import { loadHome } from "@/loaders/loadHome";
import {
  loadSettings,
} from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { ModuleResolver } from "@webicient/sanity-kit/resolvers";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const [{ data: home }, { data: generalSettings }] = await Promise.all([
    loadHome(),
    loadSettings({ name: "generalSettings" }),
  ]);

  return getMetadata(home, {}, generalSettings.domain);
}

export default async function Home() {
  const { data: home } = await loadHome();

  if (!home) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      {home.modules?.length && <ModuleResolver data={home.modules} />}
    </main>
  );
}
