"use client";

import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { DynamicIslandNav } from "@/components/layout/dynamic-island-nav";
import { SiteEffects } from "@/components/layout/site-effects";
import type { Profile } from "@/lib/content/types";
import { ProfileProvider } from "@/components/profile-provider";
import { ChatProvider } from "@/components/chat-provider";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

export function SiteChrome({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider profile={profile}>
      <SmoothScroll>
        <SiteEffects />
        <ChatProvider>
          <DynamicIslandNav />
          <main className="relative z-10 min-h-screen">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
          <Footer />
        </ChatProvider>
      </SmoothScroll>
    </ProfileProvider>
  );
}
