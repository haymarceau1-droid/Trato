import type { Metadata } from "next";
import { ListingView } from "@/components/listings/listing-view";
import { sampleListing, sampleSimilar } from "@/lib/sample";

export const metadata: Metadata = {
  title: "Ejemplo de anuncio",
  robots: { index: false, follow: false },
};

/** Página testigo: un anuncio ficticio para revisar el diseño sin depender de la base de datos. */
export default function ExamplePage() {
  const l = sampleListing();
  return (
    <ListingView
      demo
      l={l}
      isOwner={false}
      favorites={new Set()}
      similar={sampleSimilar()}
      seller={{
        id: l.user_id,
        display_name: "Vendedor Demo",
        city: "Monterrey",
        state: "nuevo-leon",
        avatar_url: null,
        phone_verified: true,
        created_at: "2026-04-01T12:00:00Z",
        active_listings: 3,
      }}
    />
  );
}
