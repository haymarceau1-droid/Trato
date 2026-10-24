"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteAccount } from "@/actions/account";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

/** Derechos sobre tus datos: descargar una copia y borrar la cuenta. */
export function DataControls() {
  const [confirming, setConfirming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Son tus datos. Puedes llevártelos o borrarlos cuando quieras. Más detalles en el{" "}
        <Link href="/privacidad#arco" className="underline">
          Aviso de privacidad
        </Link>
        .
      </p>

      <a href="/api/mis-datos" download className={buttonClass({ variant: "outline" })}>
        Descargar mis datos (JSON)
      </a>

      {!confirming ? (
        <div>
          <Button variant="ghost" className="text-danger" onClick={() => setConfirming(true)}>
            Borrar mi cuenta
          </Button>
        </div>
      ) : (
        <form
          className="border-danger space-y-3 rounded-md border-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await deleteAccount(text);
              if (res && !res.ok) setError(res.error);
            });
          }}
        >
          <p className="font-semibold">
            Esto borra tu perfil, tus anuncios, tus fotos y tus favoritos. No se puede deshacer.
          </p>
          <Field label="Escribe BORRAR para confirmar" error={error ?? undefined}>
            <Input value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
          </Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="danger"
              disabled={pending || text.trim().toUpperCase() !== "BORRAR"}
            >
              {pending ? "Borrando…" : "Borrar definitivamente"}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
