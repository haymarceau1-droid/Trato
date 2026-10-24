"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch {
            /* cancelado por el usuario */
          }
          return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      {copied ? "Enlace copiado" : "Compartir"}
    </Button>
  );
}
