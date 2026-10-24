import type { Metadata, Viewport } from "next";
import { brand, brandCss } from "@/config/brand";
import { site } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CookieNotice } from "@/components/legal/cookie-notice";
import { SwRegister } from "@/components/layout/sw-register";
import "@fontsource/changa-one/latin-400.css";
import "@fontsource-variable/dm-sans/index.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${brand.name} — Autos y motos usados en México`,
    template: `%s | ${brand.name}`,
  },
  description: brand.shortDescription,
  applicationName: brand.name,
  openGraph: { siteName: brand.name, locale: "es_MX", type: "website" },
  appleWebApp: { capable: true, title: brand.name },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brand.colors.light.primary },
    { media: "(prefers-color-scheme: dark)", color: brand.colors.dark.background },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="focus:bg-card sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <BottomNav />
        <SwRegister />
        <CookieNotice />
      </body>
    </html>
  );
}
