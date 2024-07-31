import Section from "@/components/Section";
import { PagePayload } from "@/loaders/loadPage";

type PagesProps = {
  title: string;
  pages: PagePayload[]
}

export default function Pages({ title, pages }: PagesProps): JSX.Element {
  return (
    <Section className="flex flex-col gap-y-10 my-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="grid gap-10 lg:grid-cols-3">
        {pages.map((page, index) => (
          <li className="shadow-sm bg-white p-6 rounded-md hover:shadow-lg" key={index}>
            <h3 className="text-lg font-bold">{page.title}</h3>
          </li>
        ))}
      </ul>
    </Section>
  );
}
