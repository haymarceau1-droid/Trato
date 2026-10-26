"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeNext } from "@/lib/safe-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Field, Input } from "@/components/ui/field";

// El cliente de Supabase pesa ~100 KB: se descarga al usarlo, no al abrir la página.
const supabase = async () => (await import("@/lib/supabase/client")).createClient();

type Mode = "phone" | "email";

// Solo para demos: si NEXT_PUBLIC_DEMO_PASSWORD existe, aparece el botón de la cuenta demo (supabase/demo.sql).
const DEMO_EMAIL = "demo@trato.mx";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

export function AuthForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [e164, setE164] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se guardó nada raro: solo falló el intento. Vuelve a probar.",
      );
    } finally {
      setBusy(false);
    }
  };

  const sendPhone = () =>
    run(async () => {
      // libphonenumber pesa mucho: se carga al enviar el código, no al abrir la página.
      const { toMxE164 } = await import("@/lib/validation/phone");
      const number = toMxE164(phone);
      if (!number) throw new Error("Revisa tu número: debe ser un celular mexicano de 10 dígitos.");
      const { error } = await (await supabase()).auth.signInWithOtp({ phone: number });
      if (error)
        throw new Error(
          "No pudimos enviar el código todavía. Espera un momento e intenta de nuevo, o entra con tu correo.",
        );
      setE164(number);
    });

  const verify = () =>
    run(async () => {
      if (!e164) return;
      const { error } = await (
        await supabase()
      ).auth.verifyOtp({
        phone: e164,
        token: code.trim(),
        type: "sms",
      });
      if (error)
        throw new Error("Ese código no coincide o ya venció. Pide uno nuevo, tarda unos segundos.");
      router.replace(safeNext(next));
      router.refresh();
    });

  const withDemo = () =>
    run(async () => {
      const { error } = await (
        await supabase()
      ).auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD!,
      });
      if (error) throw new Error("La cuenta demo no está disponible en este entorno.");
      router.replace(safeNext(next));
      router.refresh();
    });

  const withGoogle = () =>
    run(async () => {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
      const { error } = await (
        await supabase()
      ).auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error)
        throw new Error(
          "No pudimos abrir Google. Intenta de nuevo o entra con tu celular o correo.",
        );
    });

  const sendEmail = () =>
    run(async () => {
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Escribe un correo válido.");
      const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
      const { error } = await (
        await supabase()
      ).auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error)
        throw new Error(
          "No pudimos enviar el enlace todavía. Espera un momento e intenta de nuevo.",
        );
      setSentEmail(true);
    });

  return (
    <div className="space-y-5">
      <Button variant="outline" size="lg" className="w-full" disabled={busy} onClick={withGoogle}>
        <GoogleIcon className="size-5" /> Continuar con Google
      </Button>
      {DEMO_PASSWORD && (
        <Button variant="outline" size="lg" className="w-full" disabled={busy} onClick={withDemo}>
          Entrar con la cuenta demo
        </Button>
      )}
      <p aria-hidden className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />o con tu celular o correo
        <span className="bg-border h-px flex-1" />
      </p>
      <div
        role="tablist"
        aria-label="Método de acceso"
        className="bg-muted grid grid-cols-2 rounded-sm p-1"
      >
        {(["phone", "email"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "min-h-10 rounded-sm text-sm font-semibold",
              mode === m ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            {m === "phone" ? "Celular" : "Correo"}
          </button>
        ))}
      </div>

      {mode === "phone" && !e164 && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendPhone();
          }}
        >
          <Field
            label="Tu celular"
            hint="Te enviamos un código por SMS, sin costo para ti. Así los compradores saben que eres una persona real."
          >
            <div className="flex gap-2">
              <span className="border-border bg-muted grid min-h-11 place-items-center rounded-sm border px-3 text-sm font-semibold">
                +52
              </span>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            Enviar código
          </Button>
        </form>
      )}

      {mode === "phone" && e164 && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <Field label={`Código enviado a ${e164}`}>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy || code.length < 6}>
            Entrar
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setE164(null);
              setCode("");
            }}
          >
            Cambiar número
          </Button>
        </form>
      )}

      {mode === "email" && !sentEmail && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendEmail();
          }}
        >
          <Field label="Tu correo" hint="Te enviamos un enlace para entrar sin contraseña.">
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            Enviar enlace
          </Button>
        </form>
      )}

      {mode === "email" && sentEmail && (
        <p role="status" className="bg-primary-soft text-primary rounded-sm p-4 text-sm">
          Listo. Revisa tu correo ({email}) y toca el enlace para entrar. Si no lo ves, busca en
          spam.
        </p>
      )}

      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
