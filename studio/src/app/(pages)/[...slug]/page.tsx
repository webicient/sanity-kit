import { loadPage } from "@/loaders/loadPage";
import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slug: string[];
  };
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return await generateStaticSlugs({ type: "page" });
}

export async function generateMetadata({ params: { slug } }: RouteParams) {
  const [{ data: page }, { data: generalSettings }] = await Promise.all([
    loadPage({ slug }),
    loadSettings({ name: "generalSettings" }),
  ]);

  return getMetadata(page, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Page({ params: { slug } }: RouteParams) {
  const { data: page } = await loadPage({ slug });

  if (!page) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {page.title}
      </div>
    </main>
  );
}
