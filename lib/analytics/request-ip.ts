export function getRequestIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown-ip";
  }

  return headersList.get("x-real-ip")?.trim() || "unknown-ip";
}

function sanitizeDocId(value: string): string {
  return value.replace(/[/\\]/g, "_");
}

export function getVisitDedupDocId(ip: string, dateKey?: string): string {
  const day = dateKey ?? new Date().toISOString().slice(0, 10);
  return sanitizeDocId(`${ip}_${day}`);
}
