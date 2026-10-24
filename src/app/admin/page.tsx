import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const msAgo = (days: number) => Date.now() - days * 86_400_000;
const mxDay = (ms: number | string) =>
  new Date(ms).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

export default async function AdminHome() {
  const supabase = await createClient();
  const since = new Date(msAgo(14)).toISOString();
  const head = { count: "exact", head: true } as const;
  const [active, users, newReports, review, recent] = await Promise.all([
    supabase
      .from("listings")
      .select("id", head)
      .eq("status", "active")
      .gt("expires_at", new Date(msAgo(0)).toISOString()),
    supabase.from("profiles").select("id", head),
    supabase.from("reports").select("id", head).eq("status", "nuevo"),
    supabase.from("listings").select("id", head).eq("needs_review", true).neq("status", "removed"),
    supabase.from("listings").select("created_at").gte("created_at", since).limit(2000),
  ]);

  const perDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--) perDay.set(mxDay(msAgo(i)), 0);
  for (const r of recent.data ?? []) {
    const d = mxDay(r.created_at);
    if (perDay.has(d)) perDay.set(d, (perDay.get(d) ?? 0) + 1);
  }
  const max = Math.max(1, ...perDay.values());

  const stats = [
    ["Anuncios activos", active.count ?? 0],
    ["Usuarios", users.count ?? 0],
    ["Reportes nuevos", newReports.count ?? 0],
    ["En revisión", review.count ?? 0],
  ] as const;

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="border-border bg-card rounded-md border p-4">
            <dt className="text-muted-foreground text-sm">{k}</dt>
            <dd className="font-display text-3xl">{v}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="por-dia" className="border-border bg-card rounded-md border p-4">
        <h2 id="por-dia" className="mb-4 font-bold">
          Anuncios nuevos por día (14 días)
        </h2>
        <ul className="flex h-40 items-end gap-1">
          {[...perDay].map(([day, n]) => (
            <li
              key={day}
              className="flex flex-1 flex-col items-center justify-end gap-1"
              title={`${day}: ${n}`}
            >
              <span className="text-muted-foreground text-[10px]">{n}</span>
              <div
                className="bg-primary w-full rounded-t-sm"
                style={{ height: `${(n / max) * 100}%`, minHeight: n ? 4 : 1 }}
              />
              <span className="text-muted-foreground text-[10px]">{day.slice(8)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
