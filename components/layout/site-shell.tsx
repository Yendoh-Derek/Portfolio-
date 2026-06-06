import { SiteChrome } from "@/components/layout/site-chrome";
import type { Profile } from "@/lib/content/types";

export function SiteShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return <SiteChrome profile={profile}>{children}</SiteChrome>;
}
