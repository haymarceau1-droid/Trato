"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { toMxE164 } from "@/lib/validation/profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type Mode = "phone" | "email";

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
      const number = toMxE164(phone);
      if (!number) throw new Error("Revisa tu número: debe ser un celular mexicano de 10 dígitos.");
      const { error } = await createClient().auth.signInWithOtp({ phone: number });
      if (error)
        throw new Error(
          "No pudimos enviar el código todavía. Espera un momento e intenta de nuevo, o entra con tu correo.",
        );
      setE164(number);
    });

  const verify = () =>
    run(async () => {
      if (!e164) return;
      const { error } = await createClient().auth.verifyOtp({
        phone: e164,
        token: code.trim(),
        type: "sms",
      });
      if (error)
        throw new Error("Ese código no coincide o ya venció. Pide uno nuevo, tarda unos segundos.");
      router.replace(safeNext(next));
      router.refresh();
    });

  const sendEmail = () =>
    run(async () => {
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Escribe un correo válido.");
      const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
      const { error } = await createClient().auth.signInWithOtp({
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
