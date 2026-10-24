import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-card";
import { getFavoriteListings, getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

export default async function FavoritesPage() {
  const user = await getUser();
  if (!user) redirect("/acceder?next=/favoritos");
  const items = (await getFavoriteListings(user.id)).filter((l) => l.status === "active");
  return (
    <div className="container-page py-6">
      <h1 className="mb-6 text-2xl font-extrabold">Favoritos</h1>
      {items.length ? (
        <ListingGrid items={items} favorites={new Set(items.map((i) => i.id))} />
      ) : (
        <EmptyState
          title="Aún no guardas ningún vehículo"
          hint="Toca el corazón en un auto o moto que te guste y compáralos aquí con calma. Nadie más ve tus favoritos."
        >
          <div className="flex gap-2">
            <LinkButton href="/autos">Ver autos</LinkButton>
            <LinkButton href="/motos" variant="outline">
              Ver motos
            </LinkButton>
          </div>
        </EmptyState>
      )}
    </div>
  );
}
