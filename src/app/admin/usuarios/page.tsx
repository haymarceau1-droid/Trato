import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AdminButton } from "@/components/admin/admin-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, display_name, phone_verified, role, is_blocked, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (q) query = query.ilike("display_name", `%${q.replace(/[%,]/g, "")}%`);
  const { data } = await query;

  return (
    <div className="space-y-4">
      <form role="search" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre"
          aria-label="Buscar usuario"
          className="border-border bg-card min-h-11 flex-1 rounded-xl border px-3"
        />
        <button className="bg-primary text-primary-foreground min-h-11 rounded-xl px-4 text-sm font-semibold">
          Buscar
        </button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((u) => (
          <li
            key={u.id}
            className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3"
          >
            <div className="space-y-1">
              <p className="font-semibold">{u.display_name}</p>
              <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                {u.phone_verified && <Badge tone="green">Verificado</Badge>}
                {u.role === "admin" && <Badge tone="amber">Admin</Badge>}
                {u.is_blocked && <Badge tone="red">Bloqueado</Badge>}
                <span>Desde {formatDate(u.created_at)}</span>
              </div>
            </div>
            {u.role !== "admin" && (
              <AdminButton
                op={{ kind: "block", id: u.id, blocked: !u.is_blocked }}
                label={u.is_blocked ? "Desbloquear" : "Bloquear"}
                variant={u.is_blocked ? "soft" : "danger"}
                confirmText={
                  u.is_blocked ? undefined : "¿Bloquear a este usuario y retirar sus anuncios?"
                }
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
