import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { ModuleResolver } from "@webicient/sanity-kit/resolvers";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";
import type { Slug } from "sanity";
import type { Metadata } from "next";
import { loadPage } from "@/loaders/loadPage";

interface RouteParams {
  params: {
    slug: string[];
    language: string;
  };
}

export const dynamicParams = true;

export async function generateStaticParams(): Promise<
  { slug: (string | Slug)[]; language?: string }[]
> {
  return generateStaticSlugs({ type: "page" });
}

export async function generateMetadata({
  params: { slug, language },
}: RouteParams): Promise<Metadata> {
  const [{ data: page }, { data: generalSettings }] = await Promise.all([
    loadPage({ slug, language }),
    loadSettings({ name: "generalSettings", language }),
  ]);

  return getMetadata(page, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Page({
  params: { slug, language },
}: RouteParams): Promise<JSX.Element> {
  const { data: page } = await loadPage({ slug, language });

  if (!page) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col p-24 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold">{page.title}</h1>
      {page.modules?.length ? <ModuleResolver data={page.modules} /> : null}
    </main>
  );
}
