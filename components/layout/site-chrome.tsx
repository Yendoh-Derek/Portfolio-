"use client";

import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { DynamicIslandNav } from "@/components/layout/dynamic-island-nav";
import { SiteEffects } from "@/components/layout/site-effects";
import type { Profile } from "@/lib/content/types";
import { ProfileProvider } from "@/components/profile-provider";
import { ChatProvider } from "@/components/chat-provider";

export function SiteChrome({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider profile={profile}>
      <SiteEffects />
      <Suspense fallback={null}>
        <ChatProvider>
          <DynamicIslandNav />
          <div className="relative z-10">{children}</div>
          <Footer />
        </ChatProvider>
      </Suspense>
    </ProfileProvider>
  );
}
