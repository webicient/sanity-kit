import Section from "@/components/Section";
import { PagePayload } from "@/loaders/loadPage";
import { resolveDocumentHref } from "@webicient/sanity-kit/utils";
import Link from "next/link";

type PagesProps = {
  title: string;
  pages: PagePayload[];
};

export default function Pages({ title, pages }: PagesProps): JSX.Element {
  return (
    <Section className="flex flex-col gap-y-10 my-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-10 lg:grid-cols-3">
        {pages.map((page, index) => (
          <Link
            href={resolveDocumentHref(page) || ""}
            className="shadow-sm bg-white p-6 rounded-md hover:shadow-lg"
            key={index}
          >
            <h3 className="text-lg font-bold">{page.title}</h3>
          </Link>
        ))}
      </div>
    </Section>
  );
}
