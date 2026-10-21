/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build (compiled app + only the node_modules it needs) for
  // hosts with no build step, e.g. cPanel. Only on for `npm run build:deploy`
  // (scripts/build-deploy.js); a normal build stays as-is for `next start`.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" } : {}),

  // In development Next blocks dev assets (client JS, hot reload) for any
  // hostname other than "localhost". Opening the site as http://127.0.0.1:3000
  // then leaves every page un-hydrated: forms such as the admin login just
  // reload with no error. Add other hostnames you browse the dev server by
  // (e.g. a LAN IP like "192.168.1.20") here. Dev only; ignored in production.
  allowedDevOrigins: ["127.0.0.1"],

  // Don't advertise the framework in every response.
  poweredByHeader: false,

  // Baseline hardening headers for every response. HSTS is deliberately not
  // set here: it belongs on the TLS-terminating proxy (Caddy adds it by
  // default), since sending it over plain HTTP does nothing.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
