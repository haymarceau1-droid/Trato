import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublishWizard } from "@/components/publish/wizard";
import { photoUrl } from "@/lib/listings/photos";
import { getCatalog } from "@/lib/catalog";
import { getListing, getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Editar anuncio", robots: { index: false } };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/acceder?next=/mis-anuncios/${id}/editar`);
  const l = await getListing(id);
  if (!l || l.user_id !== user.id) notFound();

  const auto = getCatalog("auto");
  const moto = getCatalog("moto");
  const photos = [...l.listing_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ path: p.storage_path, url: photoUrl(p.storage_path) }));
  return (
    <div className="container-page py-6">
      <PublishWizard
        userId={user.id}
        catalog={{ auto, moto }}
        edit={{
          id: l.id,
          photos,
          values: {
            vehicle_type: l.vehicle_type,
            brand: l.brand,
            model: l.model,
            version: l.version ?? undefined,
            year: l.year,
            color: l.color ?? undefined,
            transmission: l.transmission,
            fuel: l.fuel,
            mileage_km: l.mileage_km,
            owners_count: l.owners_count ?? undefined,
            invoice_type: l.invoice_type,
            plates_state: l.plates_state ?? undefined,
            tenencia_al_corriente: l.tenencia_al_corriente,
            body_type: (l.body_type ?? undefined) as never,
            doors: l.doors ?? undefined,
            engine_liters: l.engine_liters ? Number(l.engine_liters) : undefined,
            traction: (l.traction ?? undefined) as never,
            moto_type: (l.moto_type ?? undefined) as never,
            engine_cc: l.engine_cc ?? undefined,
            body_condition: l.body_condition ?? undefined,
            mechanical_condition: l.mechanical_condition ?? undefined,
            price_mxn: l.price_mxn,
            negotiable: l.negotiable,
            state: l.state,
            city: l.city,
            description: l.description,
          },
        }}
      />
    </div>
  );
}
