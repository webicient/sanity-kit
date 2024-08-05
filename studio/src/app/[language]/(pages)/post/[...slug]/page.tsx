import { loadPost } from "@/loaders/loadPost";
import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slug: string[];
    language: string;
  };
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return await generateStaticSlugs({ type: "post" });
}

export async function generateMetadata({
  params: { slug, language },
}: RouteParams) {
  const [{ data: post }, { data: generalSettings }] = await Promise.all([
    loadPost({ slug }),
    loadSettings({ name: "generalSettings", language }),
  ]);

  return getMetadata(post, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Post({ params: { slug } }: RouteParams) {
  const { data: post } = await loadPost({ slug });

  if (!post) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {post.title}
      </div>
    </main>
  );
}
