/* eslint-disable @typescript-eslint/no-shadow -- Invalid rule */
/* eslint-disable react/no-unstable-nested-components -- Invalid rule */
import type { PortableTextComponents } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import { EditorPayload, ImagePayload } from "@webicient/sanity-kit";
import { ImageResolver, LinkResolver } from "@webicient/sanity-kit/resolvers";

export default function EditorResolver({
  value,
}: {
  value: EditorPayload[];
}): JSX.Element {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => {
        return <p className="text-white body-1">{children}</p>;
      },
    },
    marks: {
      link: ({ children, value }) => {
        return (
          <LinkResolver link={value} className="underline">
            {children}
          </LinkResolver>
        );
      },
    },
    types: {
      image: ({ value }: { value: ImagePayload }) => (
        <ImageResolver image={value} width={1024} height={768} />
      ),
    },
  };

  return <PortableText components={components} value={value} />;
}
