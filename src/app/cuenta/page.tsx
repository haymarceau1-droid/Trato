import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhoneForm, ProfileForm } from "@/components/account/profile-form";
import { VerifiedBadge } from "@/components/trust/verified-badge";
import { getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Mi perfil", robots: { index: false } };

export default async function AccountPage() {
  const user = await getUser();
  if (!user || !user.profile) redirect("/acceder?next=/cuenta");
  const p = user.profile;
  return (
    <div className="container-page max-w-xl space-y-8 py-6">
      <h1 className="text-2xl font-extrabold">Mi perfil</h1>
      <section
        className="border-border bg-card space-y-4 rounded-2xl border p-5"
        aria-labelledby="datos"
      >
        <h2 id="datos" className="font-bold">
          Datos públicos
        </h2>
        <ProfileForm initial={{ display_name: p.display_name, state: p.state, city: p.city }} />
      </section>
      <section
        className="border-border bg-card space-y-4 rounded-2xl border p-5"
        aria-labelledby="contacto"
      >
        <h2 id="contacto" className="flex items-center gap-2 font-bold">
          Contacto {p.phone_verified && <VerifiedBadge />}
        </h2>
        {!p.phone_verified && p.phone && (
          <p className="text-muted-foreground text-sm">
            Para obtener el distintivo “Teléfono verificado”, entra con tu celular (código por SMS)
            desde{" "}
            <a href="/acceder" className="underline">
              Entrar
            </a>
            .
          </p>
        )}
        <PhoneForm initial={p.phone} />
        {user.email && (
          <p className="text-muted-foreground text-xs">Correo de acceso: {user.email}</p>
        )}
      </section>
    </div>
  );
}
