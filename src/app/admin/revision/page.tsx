import Link from "next/link";
import { formatMXN } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AdminButton } from "@/components/admin/admin-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

const REASON: Record<string, string> = {
  precio_bajo: "Precio muy bajo",
  anticipo: "Pide anticipo/apartado",
  telefono: "Teléfono en descripción",
  enlace: "Enlace en descripción",
  reportes: "3 o más reportes",
};

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, slug, title, price_mxn, status, review_reasons, description")
    .eq("needs_review", true)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (!data?.length) return <EmptyState title="Nada por revisar" />;
  return (
    <ul className="space-y-3">
      {data.map((l) => (
        <li key={l.id} className="border-border bg-card space-y-2 rounded-md border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber">{l.status}</Badge>
            {(l.review_reasons as string[]).map((r) => (
              <Badge key={r} tone="red">
                {REASON[r] ?? r}
              </Badge>
            ))}
          </div>
          <Link
            href={`/anuncio/${l.slug}-${l.id}`}
            target="_blank"
            className="font-semibold underline"
          >
            {l.title}
          </Link>
          <p className="font-bold">{formatMXN(l.price_mxn)}</p>
          <p className="text-muted-foreground line-clamp-3 text-sm">{l.description}</p>
          <div className="flex flex-wrap gap-2">
            <AdminButton op={{ kind: "restoreListing", id: l.id }} label="Aprobar" variant="soft" />
            <AdminButton
              op={{ kind: "removeListing", id: l.id }}
              label="Retirar"
              variant="danger"
              confirmText="¿Retirar este anuncio?"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
