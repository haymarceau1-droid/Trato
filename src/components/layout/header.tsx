import Link from "next/link";
import { Heart, Plus, User } from "@phosphor-icons/react/dist/ssr";
import { getUser } from "@/lib/listings/queries";
import { t } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { Logo } from "./logo";

export async function Header() {
  const user = await getUser();
  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 py-3 md:px-4">
      <div className="theme-dark bg-background/90 text-foreground border-border pointer-events-auto mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-md border px-3 shadow-xl shadow-black/25 backdrop-blur-md md:px-4">
        <Logo />
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
          {[
            ["/autos", t("nav.autos")],
            ["/motos", t("nav.motos")],
            ["/consejos", t("nav.tips")],
            ["/como-vender", t("nav.sell")],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href!}
              className="hover:bg-muted rounded-sm px-3 py-2 text-sm font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/favoritos"
                aria-label={t("nav.favorites")}
                className="hover:bg-muted hidden size-11 place-items-center rounded-sm md:grid"
              >
                <Heart className="size-5" />
              </Link>
              <Link
                href="/mis-anuncios"
                aria-label={t("nav.account")}
                className="hover:bg-muted hidden size-11 place-items-center rounded-sm md:grid"
              >
                <User className="size-5" />
              </Link>
            </>
          ) : (
            <Link
              href="/acceder"
              className="hover:bg-muted hidden min-h-11 items-center rounded-sm px-3 text-sm font-semibold md:inline-flex"
            >
              {t("nav.login")}
            </Link>
          )}
          <LinkButton href="/publicar" size="md">
            <Plus className="size-4" aria-hidden /> {t("nav.publish")}
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
