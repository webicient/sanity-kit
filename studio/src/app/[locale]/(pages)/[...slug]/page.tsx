import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { ModuleResolver } from "@webicient/sanity-kit/resolvers";
import {
  getMetadata,
  getDocumentTranslationPathname,
} from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";
import type { Slug } from "sanity";
import type { Metadata } from "next";
import { loadPage } from "@/loaders/loadPage";

interface RouteParams {
  params: {
    slug: string[];
    locale: string;
  };
}

export const dynamicParams = true;

export async function generateStaticParams(): Promise<
  { slug: (string | Slug)[]; locale?: string }[]
> {
  return generateStaticSlugs({ type: "page" });
}

export async function generateMetadata({
  params: { slug, locale },
}: RouteParams): Promise<Metadata> {
  const [{ data: page }, { data: generalSettings }] = await Promise.all([
    loadPage({ slug, language: locale }),
    loadSettings({ name: "generalSettings", language: locale }),
  ]);

  return getMetadata(page, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Page({
  params: { slug, locale },
}: RouteParams): Promise<JSX.Element> {
  const { data: page } = await loadPage({ slug, language: locale });

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
