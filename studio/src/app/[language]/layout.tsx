import { Inter } from "next/font/google";
import "../globals.css";
import "../../../kit.config";
import { setCurrentLanguage } from "@webicient/sanity-kit/i18n";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { language },
}: Readonly<{
  children: React.ReactNode;
  params: { language: string };
}>) {
  setCurrentLanguage(language);

  return (
    <html lang={language}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
