import Section from "@/components/Section";
import { LinkPayload } from "@webicient/sanity-kit";
import { LinkResolver } from "@webicient/sanity-kit/resolvers";

type Card = {
  title: string;
  text: string;
  link: LinkPayload;
};

type CardsProps = {
  title: string;
  text: string;
  cards: Card[];
};

export default function Cards({ title, text, cards }: CardsProps): JSX.Element {
  return (
    <Section className="flex flex-col gap-y-10 my-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>{text}</p>
      <ul className="grid gap-10 lg:grid-cols-3">
        {cards.map((card, index) => (
          <li className="shadow-sm bg-white p-6 rounded-md" key={index}>
            <h3 className="mb-6 text-lg font-bold">{card.title}</h3>
            <p>{card.text}</p>
            {card.link.label && (
              <LinkResolver
                link={card.link}
                className="inline-block mt-6 text-blue-500 underline"
              >
                {card.link.label}
              </LinkResolver>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
