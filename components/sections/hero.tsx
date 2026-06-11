"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useProfile } from "@/components/profile-provider";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

const ParticleField = dynamic(
  () =>
    import("@/components/effects/particle-field").then((m) => m.ParticleField),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-full overflow-hidden rounded-3xl bg-white/[0.02] animate-pulse" />
    ),
  },
);

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  const { personal } = useProfile();
  const displayName = personal.shortName || personal.name;

  return (
    <section
      id="home"
      className="relative h-auto flex flex-col justify-start overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8 sm:pb-10 md:pb-12 lg:pb-16 max-w-[100vw]"
    >
      <div className="absolute top-[15%] left-[5%] w-[420px] h-[420px] bg-primary/15 rounded-full blur-[130px] mix-blend-screen pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[0%] w-[380px] h-[380px] bg-accent/10 rounded-full blur-[110px] mix-blend-screen pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="container relative z-10 px-6 sm:px-8 md:px-10 lg:px-14 xl:px-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8 lg:gap-16 w-full">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-primary/80 mb-3"
            >
              {personal.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-bold mb-4 tracking-tight leading-[0.95] antialiased"
            >
              <span className="block text-[clamp(2.2rem,7vw,4.5rem)] md:text-[clamp(3rem,7.5vw,5rem)] lg:text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/55 leading-[0.95]">
                {displayName}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-base md:text-lg text-muted-foreground mb-8 max-w-[560px] leading-[1.6] mx-auto lg:mx-0"
            >
              {personal.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-row gap-3 sm:gap-4 justify-center md:justify-start flex-shrink-0 relative z-20"
            >
              <motion.button
                onClick={onOpenChat}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(157,78,221,0)",
                    "0 0 24px rgba(157,78,221,0.25)",
                    "0 0 0px rgba(157,78,221,0)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                whileHover={{
                  y: -2,
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(138,43,226,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                className="group relative px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-[1.125rem] rounded-full bg-primary text-white font-semibold sm:font-bold flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0"
                style={{
                  transitionTimingFunction: `cubic-bezier(${PREMIUM_EASE.join(",")})`,
                }}
              >
                <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <SparkleIcon
                  size={14}
                  className="relative z-10 sm:size-4 md:size-5"
                />
                <span className="relative z-10">Chat with my AI</span>
              </motion.button>
              <motion.a
                href="/services"
                whileHover={{
                  y: -2,
                  scale: 1.02,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(138,43,226,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                className="group px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-[1.125rem] rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md flex items-center justify-center gap-1.5 sm:gap-2 text-white/90 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(138,43,226,0.12)] text-xs sm:text-sm md:text-base font-semibold sm:font-bold whitespace-nowrap flex-shrink-0"
                style={{
                  transitionTimingFunction: `cubic-bezier(${PREMIUM_EASE.join(",")})`,
                }}
              >
                Explore Services
                <ArrowRight
                  size={12}
                  className="sm:size-4 md:size-[1.125rem] group-hover:translate-x-1 transition-transform duration-300"
                />
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex-1 w-full max-w-[500px] aspect-square relative z-0 pointer-events-none md:pointer-events-auto mx-auto md:mx-0"
          >
            <ParticleField />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
