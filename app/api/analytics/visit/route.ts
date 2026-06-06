import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestIp } from "@/lib/analytics/request-ip";
import { getVisitCount, incrementVisitCount } from "@/lib/analytics/visits";

export async function GET() {
  try {
    const visits = await getVisitCount();
    if (visits === null) {
      return NextResponse.json({ enabled: false });
    }
    return NextResponse.json({ enabled: true, visits });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ enabled: false }, { status: 500 });
  }
}

export async function POST() {
  try {
    const ip = getRequestIp(headers());
    const result = await incrementVisitCount(ip);

    if (result.duplicate) {
      return NextResponse.json({ ok: false, duplicate: true });
    }

    if (!result.ok) {
      return NextResponse.json({ ok: false, enabled: false });
    }

    return NextResponse.json({ ok: true, mode: result.mode });
  } catch (error) {
    console.error("Analytics POST error:", error);
    return NextResponse.json({ ok: false, enabled: false }, { status: 500 });
  }
}
