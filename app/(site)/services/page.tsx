import { getServices } from "@/lib/content";
import { ServicesPageClient } from "@/components/sections/services/services-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI & Software Services",
  description: "Specialized AI automation, full-stack development, and technical consulting services to help your business scale.",
};

export default async function ServicesPage() {
  const content = await getServices();
  return <ServicesPageClient content={content} />;
}
