import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-card";
import { getFavoriteIds, getLatest, getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Anuncio no disponible", robots: { index: false } };

export default async function ListingGone() {
  const [items, user] = await Promise.all([getLatest(4), getUser()]);
  const favorites = await getFavoriteIds(user?.id);
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-extrabold">Este anuncio ya no está disponible</h1>
        <p className="text-muted-foreground mt-2">
          Puede que ya se vendió, venció o fue retirado. Mira otras opciones:
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <LinkButton href="/autos">Ver autos</LinkButton>
          <LinkButton href="/motos" variant="outline">
            Ver motos
          </LinkButton>
        </div>
      </div>
      {items.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Anuncios recientes</h2>
          <ListingGrid items={items} favorites={favorites} />
        </section>
      )}
    </div>
  );
}
