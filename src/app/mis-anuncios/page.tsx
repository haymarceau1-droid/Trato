import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/account";
import { site } from "@/config/site";
import { EmptyState } from "@/components/ui/empty-state";
import { Button, LinkButton } from "@/components/ui/button";
import { MyListingRow } from "@/components/listings/my-listing-row";
import { VerifiedBadge } from "@/components/trust/verified-badge";
import { getMyListings, getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Mis anuncios", robots: { index: false } };

export default async function MyListingsPage() {
  const user = await getUser();
  if (!user) redirect("/acceder?next=/mis-anuncios");
  const items = await getMyListings(user.id);
  const active = items.filter((i) => i.status === "active").length;

  return (
    <div className="container-page max-w-3xl py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Mis anuncios</h1>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
            Hola, {user.profile?.display_name} {user.profile?.phone_verified && <VerifiedBadge />}·{" "}
            {active}/{site.maxActivePerUser} activos
          </p>
        </div>
        <LinkButton href="/publicar">Publicar anuncio</LinkButton>
      </div>

      {items.length ? (
        <ul className="space-y-3">
          {items.map((l) => (
            <MyListingRow key={l.id} listing={l} />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Aún no tienes autos ni motos publicados"
          hint="Publicar es gratis, sin comisión y toma unos 3 minutos. Puedes pausarlo o borrarlo cuando quieras."
        >
          <LinkButton href="/publicar">Publicar mi primer anuncio</LinkButton>
        </EmptyState>
      )}

      <div className="border-border mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
        <Link href="/cuenta" className="text-sm font-semibold underline">
          Mi perfil y contacto
        </Link>
        {user.profile?.role === "admin" && (
          <Link href="/admin" className="text-sm font-semibold underline">
            Administración
          </Link>
        )}
        <form action={signOut} className="ml-auto">
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
