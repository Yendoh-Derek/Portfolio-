import { SiteShell } from "@/components/layout/site-shell";
import { getProfile } from "@/lib/content";

export default async function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const profile = await getProfile();

    return <SiteShell profile={profile}>{children}</SiteShell>;
}
