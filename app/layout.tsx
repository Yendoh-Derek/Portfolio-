import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { getProfile } from "@/lib/content";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const { name, title, tagline } = profile.personal;
  const url =
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-portfolio.vercel.app";

  const twitterLink = profile.personal.links.twitter;
  const twitterCreator = (() => {
    if (!twitterLink) return "";
    const cleaned = twitterLink.split("?")[0].replace(/\/+$/, "");
    if (cleaned.startsWith("@")) return cleaned;
    if (cleaned.startsWith("https://x.com/")) return `@${cleaned.slice(14)}`;
    if (cleaned.startsWith("https://twitter.com/"))
      return `@${cleaned.slice(20)}`;
    return "";
  })();

  return {
    metadataBase: new URL(url),
    title: {
      default: `${name} | AI-Powered Portfolio`,
      template: `%s | ${name}`,
    },
    description: tagline || title,
    keywords: [
      "AI Engineer",
      "Machine Learning",
      "Portfolio",
      "Software Engineer",
      name,
    ],
    authors: [{ name: name }],
    creator: name,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: url,
      title: `${name} | AI-Powered Portfolio`,
      description: tagline || title,
      siteName: `${name} Portfolio`,
      images: [
        {
          url: "/images/derek-pic.jpg", // Default OG image
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | AI-Powered Portfolio`,
      description: tagline || title,
      images: ["/images/derek-pic.jpg"],
      creator: twitterCreator,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const { name, title, tagline } = profile.personal;
  const url =
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-portfolio.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    jobTitle: title,
    description: tagline,
    url: url,
    sameAs: [
      profile.personal.links.github,
      profile.personal.links.linkedin,
    ].filter(Boolean),
  };

  return (
    <html lang="en" className="relative scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${syne.variable} relative antialiased min-h-screen selection:bg-accent selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
