import { loadPost } from "@/loaders/loadPost";
import { loadMetadata } from "@webicient/sanity-kit/query";
import { notFound } from "next/navigation";

type RouteParams = {
  params: {
    slugs: string[];
  };
};

export async function generateMetadata({ params: { slugs } }: RouteParams) {
  return await loadMetadata({ type: "contentType", name: "post", slugs });
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
