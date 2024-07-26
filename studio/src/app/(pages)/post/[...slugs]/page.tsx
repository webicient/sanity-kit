import { loadPost } from "@/loaders/loadPost";
import { loadSettings } from "@webicient/sanity-kit/query";
import { getMetadata } from "@webicient/sanity-kit/utils";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slugs: string[];
  };
};

export async function generateMetadata({ params: { slugs } }: RouteParams) {
  const [{ data: post }, { data: generalSettings }] = await Promise.all([
    loadPost({ slugs }),
    loadSettings({ name: "generalSettings" }),
  ]);

  return getMetadata(post, { slug: slugs.join("/") }, generalSettings.domain);
}

export default async function Post({ params: { slugs } }: RouteParams) {
  const { data: post } = await loadPost({ slugs });

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
