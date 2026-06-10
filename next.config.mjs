/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
  // Keep firebase-admin and its deps out of page bundles (avoids @opentelemetry chunk errors)
  experimental: {
    serverComponentsExternalPackages: [
      "firebase-admin",
      "@google-cloud/firestore",
      "@opentelemetry/api",
    ],
  },
};

export default nextConfig;
