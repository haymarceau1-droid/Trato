"use client";

import { useEffect } from "react";

/** Cuenta una visita por sesión de navegador. */
export function ViewBeacon({ listingId }: { listingId: string }) {
  useEffect(() => {
    try {
      const key = `viewed:${listingId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sin sessionStorage: contamos igual */
    }
    fetch(`/api/views/${listingId}`, { method: "POST", keepalive: true }).catch(() => {});
  }, [listingId]);
  return null;
}
