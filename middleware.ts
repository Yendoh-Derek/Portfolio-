import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Force HTTPS redirects (Vercel handles this, but explicit for clarity)
  const host = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (protocol === "http" && host.includes("ai-portfolio")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  // Security Headers
  // Strict-Transport-Security: enforce HTTPS for 1 year
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // X-Frame-Options: prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options: prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy: restrict referrer info
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: disable unnecessary features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  // Content-Security-Policy: strict but functional
  const isProd = process.env.NODE_ENV === "production";
  const cspRules = [
    "default-src 'self'",
    // KNOWN LIMITATION: Framer Motion requires unsafe-eval; unsafe-inline could be replaced
    // with nonce-based CSP (Next.js 14.2+). Post-launch hardening: use strict-dynamic + nonce.
    // See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "frame-src 'self'",
    "connect-src 'self' https:",
    "base-uri 'self'",
    "form-action 'self' https://api.web3forms.com",
  ];

  if (isProd) {
    cspRules.push("upgrade-insecure-requests");
  }

  response.headers.set("Content-Security-Policy", cspRules.join("; "));

  return response;
}

export const config = {
  // Apply middleware to all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
