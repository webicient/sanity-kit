import { loadService } from "@/loaders/loadService";
import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Slug } from "sanity";

type RouteParams = {
  params: {
    slug: string[];
    locale: string;
  };
};

export const dynamicParams = true;

export async function generateStaticParams(): Promise<
  { slug: (string | Slug)[] }[]
> {
  return await generateStaticSlugs({ type: "service" });
}

export async function generateMetadata({
  params: { slug, locale },
}: RouteParams): Promise<Metadata> {
  const [{ data: service }, { data: generalSettings }] = await Promise.all([
    loadService({ slug, language: locale }),
    loadSettings({ name: "generalSettings", language: locale }),
  ]);

  return getMetadata(service, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Post({
  params: { locale, slug },
}: RouteParams): Promise<JSX.Element> {
  const { data: service } = await loadService({ slug, language: locale });

  if (!service) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {service.title}
      </div>
    </main>
  );
}
