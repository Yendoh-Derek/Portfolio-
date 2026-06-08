"use client";

import { motion } from "framer-motion";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

export function ConsultationButton({ label }: { label: string }) {
  const handleContactClick = () => {
    if (window.location.pathname === "/") {
      document
        .getElementById("form-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#form-section";
    }
  };

  return (
    <motion.button
      onClick={handleContactClick}
      className="group relative px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-[1.125rem] rounded-full bg-primary text-white font-semibold sm:font-bold flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0"
    >
      <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
      <SparkleIcon size={14} className="relative z-10 sm:size-4 md:size-5" />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
