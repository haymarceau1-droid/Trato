import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand";
import { AuthForm } from "@/components/auth/auth-form";
import { safeNext } from "@/lib/safe-next";
import { getUser } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Entrar o crear cuenta", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  if (await getUser()) redirect(safeNext(next));
  return (
    <div className="container-page grid min-h-[70dvh] place-items-center py-10">
      <div className="border-border bg-card w-full max-w-md space-y-6 rounded-md border p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold">Entra a {brand.name}</h1>
          <p className="text-muted-foreground text-sm">
            Si no tienes cuenta, se crea sola. Es gratis.
          </p>
        </div>
        {error && (
          <p role="alert" className="bg-danger/10 text-danger rounded-sm p-3 text-sm">
            El enlace venció o ya se usó. Pide uno nuevo.
          </p>
        )}
        <AuthForm next={safeNext(next)} />
        <p className="text-muted-foreground flex items-start gap-2 text-xs">
          <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
          Tu número solo se muestra a usuarios con sesión y nunca aparece en Google. Al continuar
          aceptas los{" "}
          <a href="/terminos" className="underline">
            términos
          </a>{" "}
          y el{" "}
          <a href="/privacidad" className="underline">
            aviso de privacidad
          </a>
          .
        </p>
      </div>
    </div>
  );
}
