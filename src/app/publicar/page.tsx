import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhoneForm } from "@/components/account/profile-form";
import { PublishWizard } from "@/components/publish/wizard";
import { getCatalog, getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Publicar anuncio", robots: { index: false } };

export default async function PublishPage() {
  const user = await getUser();
  if (!user) redirect("/acceder?next=/publicar");
  if (user.profile?.is_blocked)
    return (
      <div className="container-page py-12 text-center">
        Tu cuenta está bloqueada. Escríbenos desde la página de contacto.
      </div>
    );

  const [auto, moto] = await Promise.all([getCatalog("auto"), getCatalog("moto")]);
  return (
    <div className="container-page py-6">
      {user.profile?.phone ? (
        <PublishWizard userId={user.id} catalog={{ auto, moto }} />
      ) : (
        <div className="border-border bg-card mx-auto max-w-md space-y-4 rounded-2xl border p-6">
          <h1 className="text-2xl font-extrabold">Antes de publicar</h1>
          <p className="text-muted-foreground text-sm">
            Necesitamos tu WhatsApp para que los compradores te contacten.
          </p>
          <PhoneForm />
        </div>
      )}
    </div>
  );
}
