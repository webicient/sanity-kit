import { generateStaticSlugs, loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";
import type { Slug } from "sanity";
import { Metadata } from "next";
import { loadPost } from "@/loaders/loadPost";

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
  return generateStaticSlugs({ type: "post" });
}

export async function generateMetadata({
  params: { slug, language },
}: RouteParams): Promise<Metadata> {
  const [{ data: post }, { data: generalSettings }] = await Promise.all([
    loadPost({ slug, language }),
    loadSettings({ name: "generalSettings", language }),
  ]);

  return getMetadata(post, { slug: slug.join("/") }, generalSettings.domain);
}

export default async function Post({
  params: { slug, language },
}: RouteParams): Promise<JSX.Element> {
  const { data: post } = await loadPost({ slug, language });

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
