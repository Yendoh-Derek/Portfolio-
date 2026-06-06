"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function VisitCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await fetch("/api/analytics/visit");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as unknown;
        if (
          data &&
          typeof data === "object" &&
          "enabled" in data &&
          "visits" in data &&
          data.enabled === true &&
          typeof data.visits === "number"
        ) {
          setVisits(data.visits);
        }
      } catch (error) {
        // Analytics optional when Firebase is not configured
        console.debug("Analytics unavailable");
      }
    };
    fetchVisits();
  }, []);

  if (visits === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-xs font-mono text-white/50">
      <Eye size={12} className="text-primary" />
      <span>{visits.toLocaleString()} Visits</span>
    </div>
  );
}
