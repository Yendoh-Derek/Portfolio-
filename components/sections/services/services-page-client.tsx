"use client";

import { motion } from "framer-motion";
import type { ServicesContent } from "@/lib/content/types";
import { ConsultationButton } from "./consultation-button";
import {
  OfferIcon,
  OutcomeCard,
  ProblemCard,
  ProcessStep,
  ServicePillar,
} from "./service-cards";

export function ServicesPageClient({ content }: { content: ServicesContent }) {
  return (
    <main className="min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      <div className="container mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-32 pb-16 md:pt-40 md:pb-24 text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            {content.hero.subtitle}
          </p>
          <div className="flex justify-center">
            <ConsultationButton label={content.hero.ctaLabel} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {content.problems.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.problems.items.map((item, index) => (
              <ProblemCard
                key={item.number ?? item.title}
                item={item}
                delay={0.1 * (index + 1)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32 bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <OfferIcon icon={content.offer.icon} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {content.offer.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {content.offer.description}
            </p>
            <div className="flex justify-center">
              <ConsultationButton label={content.offer.ctaLabel} />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {content.pillars.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.pillars.items.map((item, index) => (
              <ServicePillar
                key={item.title}
                item={item}
                delay={0.1 * (index + 1)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {content.outcomes.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.outcomes.items.map((item, index) => (
              <OutcomeCard
                key={item.metric ?? item.title}
                item={item}
                delay={0.1 * (index + 1)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 md:mb-32"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {content.process.heading}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.process.steps.map((item, index) => (
                <ProcessStep
                  key={item.number ?? item.title}
                  item={item}
                  delay={0.1 * (index + 1)}
                />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-12 md:py-20 border-t border-white/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {content.finalCta.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {content.finalCta.description}
          </p>
          <div className="flex justify-center">
            <ConsultationButton label={content.finalCta.ctaLabel} />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
