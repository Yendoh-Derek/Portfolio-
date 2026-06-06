import { getServices } from "@/lib/content";
import { ServicesPageClient } from "@/components/sections/services/services-page-client";

export default async function ServicesPage() {
  const content = await getServices();
  return <ServicesPageClient content={content} />;
}
