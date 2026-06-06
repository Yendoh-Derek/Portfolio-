import type { LucideIcon } from "lucide-react";

export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Icon size={20} className="text-primary" />
        </span>
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/50 text-sm md:text-base pl-[3.25rem]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
