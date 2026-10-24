"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flag } from "@phosphor-icons/react/dist/ssr";
import { createReport } from "@/actions/reports";
import { REPORT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";

export function ReportDialog({ listingId }: { listingId: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const path = usePathname();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = ref.current;
    const close = () => setMessage(null);
    d?.addEventListener("close", close);
    return () => d?.removeEventListener("close", close);
  }, []);

  return (
    <>
      <Button variant="ghost" onClick={() => ref.current?.showModal()}>
        <Flag className="size-4" aria-hidden /> Reportar
      </Button>
      <dialog
        ref={ref}
        aria-label="Reportar anuncio"
        className="bg-card text-foreground m-auto w-[min(92vw,26rem)] rounded-md p-5 backdrop:bg-black/50"
      >
        <h2 className="mb-1 text-lg font-bold">Reportar anuncio</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Cuéntanos qué viste. Revisamos cada reporte y el vendedor no sabrá quién lo envió.
        </p>
        {message?.ok ? (
          <div className="space-y-4">
            <p role="status" className="text-sm">
              {message.text}
            </p>
            <Button className="w-full" onClick={() => ref.current?.close()}>
              Cerrar
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await createReport({
                  listing_id: listingId,
                  reason,
                  comment: comment || undefined,
                });
                if (res.ok)
                  return setMessage({
                    ok: true,
                    text: "Gracias por avisarnos. Revisaremos este vehículo y tu reporte es confidencial.",
                  });
                if (res.error.startsWith("Inicia sesión"))
                  return router.push(`/acceder?next=${encodeURIComponent(path)}`);
                setMessage({ ok: false, text: res.error });
              });
            }}
          >
            <Field label="Motivo">
              <Select value={reason} required onChange={(e) => setReason(e.target.value)}>
                <option value="" disabled>
                  Elige un motivo
                </option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Comentario (opcional)">
              <Textarea
                value={comment}
                maxLength={500}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-24"
              />
            </Field>
            {message && !message.ok && (
              <p role="alert" className="text-danger text-sm">
                {message.text}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={pending || !reason}>
                Enviar reporte
              </Button>
              <Button variant="outline" onClick={() => ref.current?.close()}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
