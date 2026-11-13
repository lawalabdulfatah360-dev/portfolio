import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getContent } from "@/lib/content";

const inter = Inter({ subsets: ["latin"] });

function siteUrl(configured: string): string {
  if (configured && !configured.includes("your-domain")) return configured;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent();
  const url = siteUrl(seo.url);
  return {
    metadataBase: new URL(url),
    title: { default: seo.title, template: `%s — ${seo.author}` },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: seo.author }],
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: seo.title,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.title }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
