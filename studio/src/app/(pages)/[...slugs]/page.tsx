import { loadPage } from "@/loaders/loadPage";
import { loadMetadata } from "@webicient/sanity-kit/query";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slugs: string[];
  };
};

export async function generateMetadata({ params: { slugs } }: RouteParams) {
  return await loadMetadata({ contentType: "page", slugs });
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
