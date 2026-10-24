import Link from "next/link";
import { REPORT_REASONS, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AdminButton } from "@/components/admin/admin-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  reason: string;
  comment: string | null;
  created_at: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    status: string;
    reports_count: number;
  } | null;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      "id, reason, comment, created_at, listing:listings(id, title, slug, status, reports_count)",
    )
    .eq("status", "nuevo")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as unknown as Row[];

  if (!rows.length)
    return (
      <EmptyState
        title="Sin reportes pendientes"
        hint="Buen trabajo. Aquí aparecerán los nuevos reportes."
      />
    );
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="border-border bg-card space-y-2 rounded-md border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="red">{labelOf(REPORT_REASONS, r.reason)}</Badge>
            {r.listing && (
              <Badge tone={r.listing.status === "active" ? "green" : "amber"}>
                {r.listing.status}
              </Badge>
            )}
            {r.listing && <Badge>{r.listing.reports_count} reportes</Badge>}
            <span className="text-muted-foreground text-xs">{formatDate(r.created_at)}</span>
          </div>
          {r.listing && (
            <Link
              href={`/anuncio/${r.listing.slug}-${r.listing.id}`}
              className="font-semibold underline"
              target="_blank"
            >
              {r.listing.title}
            </Link>
          )}
          {r.comment && <p className="text-muted-foreground text-sm">“{r.comment}”</p>}
          <div className="flex flex-wrap gap-2">
            {r.listing && (
              <AdminButton
                op={{ kind: "removeListing", id: r.listing.id }}
                label="Retirar anuncio"
                variant="danger"
                confirmText="¿Retirar este anuncio?"
              />
            )}
            {r.listing && (
              <AdminButton
                op={{ kind: "restoreListing", id: r.listing.id }}
                label="Restablecer anuncio"
                variant="soft"
              />
            )}
            <AdminButton
              op={{ kind: "report", id: r.id, status: "revisado" }}
              label="Marcar revisado"
            />
            <AdminButton
              op={{ kind: "report", id: r.id, status: "descartado" }}
              label="Descartar"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
