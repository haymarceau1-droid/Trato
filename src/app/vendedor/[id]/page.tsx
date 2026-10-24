import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { formatMonthYear } from "@/lib/format";
import {
  getFavoriteIds,
  getPublicProfile,
  getSellerListings,
  getUser,
} from "@/lib/listings/queries";
import { stateName } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingGrid } from "@/components/listings/listing-card";
import { VerifiedBadge } from "@/components/trust/verified-badge";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublicProfile((await params).id);
  return p
    ? {
        title: `Anuncios de ${p.display_name}`,
        description: `Autos y motos publicados por ${p.display_name} en ${brand.name}.`,
      }
    : { title: "Vendedor" };
}

export default async function SellerPage({ params }: Props) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();
  const user = await getUser();
  const [items, favorites] = await Promise.all([getSellerListings(id), getFavoriteIds(user?.id)]);

  return (
    <div className="container-page py-6">
      <header className="mb-8 flex items-center gap-4">
        <div
          aria-hidden
          className="bg-primary-soft text-primary font-display grid size-16 place-items-center rounded-full text-2xl"
        >
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold">{profile.display_name}</h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {profile.phone_verified && <VerifiedBadge />}
            {profile.city && (
              <span>
                {profile.city}
                {profile.state ? `, ${stateName(profile.state)}` : ""}
              </span>
            )}
            <span>
              En {brand.name} desde {formatMonthYear(profile.created_at)}
            </span>
          </div>
        </div>
      </header>
      <h2 className="mb-4 text-lg font-bold">{items.length} anuncios activos</h2>
      {items.length ? (
        <ListingGrid items={items} favorites={favorites} />
      ) : (
        <EmptyState title="Este vendedor no tiene anuncios activos" />
      )}
    </div>
  );
}
