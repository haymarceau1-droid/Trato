import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/account";
import { ThemePicker } from "@/components/account/theme-picker";
import { DataControls } from "@/components/account/data-controls";
import { FacebookForm, PhoneForm, ProfileForm } from "@/components/account/profile-form";
import { VerifiedBadge } from "@/components/trust/verified-badge";
import { Button, buttonClass } from "@/components/ui/button";
import { stateName } from "@/lib/constants";
import { getUser } from "@/lib/listings/queries";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi perfil", robots: { index: false } };

const since = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(iso));

function Card({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-border bg-card scroll-mt-28 rounded-md border p-5"
      aria-labelledby={`${id}-t`}
    >
      <h2 id={`${id}-t`} className="text-xl">
        {title}
      </h2>
      {hint && <p className="text-muted-foreground mt-1 text-sm">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default async function AccountPage() {
  const user = await getUser();
  if (!user || !user.profile) redirect("/acceder?next=/cuenta");
  const p = user.profile;

  const supabase = await createClient();
  const [{ data: mine }, { count: favs }] = await Promise.all([
    supabase.from("listings").select("status, views_count").eq("user_id", user.id),
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const listings = mine ?? [];
  const active = listings.filter((l) => l.status === "active").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  const views = listings.reduce((n, l) => n + (l.views_count ?? 0), 0);

  const checklist = [
    { done: p.display_name.trim().length >= 2, text: "Nombre para mostrar", href: "#datos" },
    { done: Boolean(p.state && p.city), text: "Estado y ciudad", href: "#datos" },
    { done: Boolean(p.phone), text: "WhatsApp de contacto", href: "#contacto" },
    { done: p.phone_verified, text: "Teléfono verificado por SMS", href: "#contacto" },
    { done: Boolean(p.facebook), text: "Facebook (opcional)", href: "#contacto" },
  ];
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="container-page py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="border-border bg-card rounded-md border p-5">
            <div className="flex items-center gap-4">
              <span className="bg-foreground text-background font-display grid size-16 shrink-0 place-items-center overflow-hidden rounded-full text-3xl">
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  p.display_name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-2xl leading-tight">{p.display_name}</h1>
                <p className="text-muted-foreground text-sm">
                  En Trato desde {since(p.created_at)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {p.phone_verified && <VerifiedBadge />}
              {(p.city || p.state) && (
                <span className="text-muted-foreground">
                  {[p.city, p.state ? stateName(p.state) : null].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/vendedor/${user.id}`} className={buttonClass({ variant: "outline" })}>
                Ver mi perfil público
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Anuncios activos", active],
              ["Vendidos", sold],
              ["Visitas totales", views],
              ["Favoritos guardados", favs ?? 0],
            ].map(([k, n]) => (
              <div key={String(k)} className="border-border bg-card rounded-md border p-4">
                <dd className="font-display text-3xl">{Number(n).toLocaleString("es-MX")}</dd>
                <dt className="text-muted-foreground text-xs">{k}</dt>
              </div>
            ))}
          </dl>

          <div className="border-border bg-card rounded-md border p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg">Tu perfil</h2>
              <p className="text-sm font-semibold">{pct}%</p>
            </div>
            <div
              role="meter"
              aria-label="Perfil completo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="bg-muted mt-2 h-2 overflow-hidden rounded-full"
            >
              <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {checklist.map((c) => (
                <li key={c.text}>
                  <a
                    href={c.href}
                    className="hover:bg-muted flex min-h-9 items-center gap-2 rounded-sm px-1"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-5 place-items-center rounded-full border text-xs",
                        c.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {c.done ? "✓" : ""}
                    </span>
                    <span className={c.done ? "text-muted-foreground" : "font-medium"}>
                      {c.text}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-xs">
              Un perfil completo y verificado genera más confianza y más mensajes.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <nav aria-label="Accesos rápidos" className="flex flex-wrap gap-2">
            <Link href="/mis-anuncios" className={buttonClass({ variant: "outline" })}>
              Mis anuncios
            </Link>
            <Link href="/favoritos" className={buttonClass({ variant: "outline" })}>
              Favoritos
            </Link>
            <Link href="/publicar" className={buttonClass({})}>
              Publicar un vehículo
            </Link>
          </nav>

          <Card
            id="datos"
            title="Datos públicos"
            hint="Es lo que ven los compradores en tu perfil y tus anuncios."
          >
            <ProfileForm initial={{ display_name: p.display_name, state: p.state, city: p.city }} />
          </Card>

          <Card
            id="contacto"
            title="Contacto"
            hint="Solo lo ve quien inicia sesión y quiere contactarte desde tu anuncio; nunca se publica."
          >
            {p.phone_verified && <VerifiedBadge />}
            {!p.phone_verified && p.phone && (
              <p className="text-muted-foreground text-sm">
                Para obtener el distintivo “Teléfono verificado”, entra con tu celular (código por
                SMS) desde{" "}
                <a href="/acceder" className="underline">
                  Entrar
                </a>
                .
              </p>
            )}
            <PhoneForm initial={p.phone} />
            <hr className="border-border" />
            <FacebookForm initial={p.facebook} />
          </Card>

          <Card
            id="apariencia"
            title="Apariencia"
            hint="Elige cómo se ve el sitio. “Sistema” sigue el modo claro u oscuro de tu dispositivo."
          >
            <ThemePicker />
          </Card>

          <Card id="acceso" title="Acceso a tu cuenta">
            {user.email && (
              <p className="text-sm">
                Correo de acceso: <strong>{user.email}</strong>
              </p>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Cerrar sesión
              </Button>
            </form>
          </Card>

          <Card id="tus-datos" title="Tus datos y privacidad">
            <DataControls />
          </Card>
        </div>
      </div>
    </div>
  );
}
