import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {}

export default function Section(props: SectionProps): JSX.Element {
  return <section {...props}>{props.children}</section>;
}
