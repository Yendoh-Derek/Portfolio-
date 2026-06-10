import { SiteChrome } from "@/components/layout/site-chrome";
import { getProfile } from "@/lib/content";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return <SiteChrome profile={profile}>{children}</SiteChrome>;
}
