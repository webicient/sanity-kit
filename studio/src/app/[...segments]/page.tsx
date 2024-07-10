import { metadata, type MetadataParams } from "@webicient/sanity-kit/utils";

export async function generateMetadata(params: MetadataParams) {
  return await metadata(params);
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        Hello World
      </div>
    </main>
  );
}
