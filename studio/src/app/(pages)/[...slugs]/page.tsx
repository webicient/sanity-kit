import { loadPage } from "@/loaders/loadPage";
import { loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slugs: string[];
  };
};

export async function generateMetadata({ params: { slugs } }: RouteParams) {
  const [{ data: page }, { data: generalSettings }] = await Promise.all([
    loadPage({ slugs }),
    loadSettings({ name: "generalSettings" }),
  ]);

  return getMetadata(page, { slug: slugs.join("/") }, generalSettings.domain);
}

export default async function Page({ params: { slugs } }: RouteParams) {
  const { data: page } = await loadPage({ slugs });

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
