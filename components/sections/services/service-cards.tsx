"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle, Code, Zap } from "lucide-react";
import type { ServicesCard } from "@/lib/content/types";

const ICONS = {
  zap: Zap,
  code: Code,
  chart: BarChart3,
} as const;

const ICON_COLORS = {
  zap: "text-primary",
  code: "text-accent",
  chart: "text-emerald-400",
} as const;

export function ProblemCard({
  item,
  delay,
}: {
  item: ServicesCard;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-6 md:p-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
    >
      <p className="text-sm font-mono text-primary mb-3">{item.number}</p>
      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
      <p className="text-muted-foreground">{item.description}</p>
    </motion.div>
  );
}

export function ServicePillar({
  item,
  delay,
}: {
  item: ServicesCard;
  delay: number;
}) {
  const iconKey = (item.icon ?? "zap") as keyof typeof ICONS;
  const Icon = ICONS[iconKey] ?? Zap;
  const iconColor = ICON_COLORS[iconKey] ?? "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
    >
      <div className="mb-4">
        <Icon className={iconColor} size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{item.description}</p>
      <ul className="space-y-2">
        {(item.items ?? []).map((entry) => (
          <li
            key={entry}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
            <span>{entry}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function OutcomeCard({
  item,
  delay,
}: {
  item: ServicesCard;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-xl bg-white/5 border border-white/10 text-center hover:border-white/20 transition-colors"
    >
      <p className="text-4xl font-bold text-primary mb-2">{item.metric}</p>
      <p className="text-muted-foreground">{item.description}</p>
    </motion.div>
  );
}

export function ProcessStep({
  item,
  delay,
}: {
  item: ServicesCard;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mx-auto mb-4">
        {item.number}
      </div>
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-muted-foreground text-sm">{item.description}</p>
    </motion.div>
  );
}

export function OfferIcon({ icon }: { icon: string }) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Zap;

  return (
    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-6 overflow-hidden">
      <Icon size={32} />
    </div>
  );
}
