import Link from "next/link";
import { Heart, MagnifyingGlass, Plus } from "@phosphor-icons/react/dist/ssr";
import { getUser } from "@/lib/listings/queries";
import { t } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { HeaderNav } from "./header-nav";
import { Logo } from "./logo";

const iconLink =
  "hover:bg-muted text-muted-foreground hover:text-foreground grid size-11 place-items-center rounded-sm";

export async function Header() {
  const user = await getUser();
  const initial = user?.profile?.display_name?.charAt(0).toUpperCase();
  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 py-3 md:px-4">
      <div className="theme-dark bg-background/95 text-foreground pointer-events-auto mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-md border border-white/10 py-1 pr-1.5 pl-4 shadow-2xl ring-1 shadow-black/30 ring-black/40 backdrop-blur-xl md:h-16 md:pr-2 md:pl-5">
        <Logo />
        <HeaderNav />
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/autos" aria-label="Buscar autos y motos" className={iconLink}>
            <MagnifyingGlass className="size-5" aria-hidden />
          </Link>
          {user ? (
            <>
              <Link
                href="/favoritos"
                aria-label={t("nav.favorites")}
                className={`${iconLink} hidden md:grid`}
              >
                <Heart className="size-5" aria-hidden />
              </Link>
              <Link
                href="/mis-anuncios"
                aria-label={t("nav.account")}
                className="bg-primary-soft text-primary font-display hidden size-10 place-items-center rounded-sm text-lg md:grid"
              >
                {initial}
              </Link>
            </>
          ) : (
            <Link
              href="/acceder"
              className="hover:bg-muted hidden min-h-11 items-center rounded-sm px-4 text-sm font-semibold md:inline-flex"
            >
              {t("nav.login")}
            </Link>
          )}
          <LinkButton href="/publicar">
            <Plus className="size-4" aria-hidden /> {t("nav.publish")}
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
