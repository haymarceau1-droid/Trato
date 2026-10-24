import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL((process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()).hostname;
  } catch {
    return undefined; // variable ausente o mal formada: el build no debe fallar
  }
})();

const nextConfig: NextConfig = {
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
