"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const CursorEffect = dynamic(
  () => import("@/components/effects/cursor-effect").then((m) => m.CursorEffect),
  { ssr: false },
);

const FloatingSigils = dynamic(
  () =>
    import("@/components/effects/floating-sigils").then((m) => m.FloatingSigils),
  { ssr: false },
);

const AtmosphereLayer = dynamic(
  () =>
    import("@/components/effects/atmosphere-layer").then((m) => m.AtmosphereLayer),
  { ssr: false },
);

const GrainOverlay = dynamic(
  () => import("@/components/effects/grain-overlay").then((m) => m.GrainOverlay),
  { ssr: false },
);

export function SiteEffects() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) {
    return <GrainOverlay />;
  }

  return (
    <>
      <CursorEffect />
      <FloatingSigils />
      <AtmosphereLayer />
      <GrainOverlay />
    </>
  );
}
