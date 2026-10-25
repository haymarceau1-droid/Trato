import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL((process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()).hostname;
  } catch {
    return undefined; // variable ausente o mal formada: el build no debe fallar
  }
})();

const isDev = process.env.NODE_ENV !== "production";

/**
 * Política de contenido: solo se cargan scripts, estilos, fuentes e imágenes de este sitio, de Supabase
 * (datos y fotos) y de las imágenes de relleno de la demo. Next.js necesita 'unsafe-inline' para sus scripts de arranque.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://fastly.picsum.photos https://lh3.googleusercontent.com`,
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isDev ? " ws:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Imágenes de relleno de la demo (scripts/seed-demo.ts)
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
};

export default nextConfig;
