import type { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();
    const { name, title, tagline } = profile.personal;

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
        title: `${name} | AI-Powered Portfolio`,
        description: tagline || title,
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${dmSans.variable} ${syne.variable} antialiased min-h-screen selection:bg-accent selection:text-white`}
            >
                {children}
            </body>
        </html>
    );
}
