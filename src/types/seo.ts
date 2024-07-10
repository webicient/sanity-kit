export interface SEO {
  title: string;
  description: string;
  openGraph: OpenGraph;
  advanced: AdvancedSeoSettings;
}

interface OpenGraph {
  title: string;
  description: string;
  image: Image;
}

interface Image {
  asset: {
    _ref: string;
    _type: string;
  };
}

interface AdvancedSeoSettings {
  canonical: string;
  redirect: RedirectSettings;
  robots: RobotsMeta;
}

interface RedirectSettings {
  enabled: boolean;
  type: "301" | "302" | "307" | "410" | "451";
  url: string;
}

interface RobotsMeta {
  index: boolean;
  follow: boolean;
  archive: boolean;
  imageIndex: boolean;
  snippet: boolean;
}
