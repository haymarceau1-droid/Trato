"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const KEY = "trato:tema";
type Choice = "system" | "light" | "dark";
const OPTIONS: { value: Choice; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
};
const current = (): Choice => {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
};

function applyTheme(next: Choice) {
  const root = document.documentElement;
  if (next === "system") delete root.dataset.theme;
  else root.dataset.theme = next;
  try {
    if (next === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* sin almacenamiento: vale solo en esta visita */
  }
}

/** Apariencia del sitio: sigue el dispositivo (Sistema) o fuerza claro u oscuro. Se guarda en este navegador. */
export function ThemePicker() {
  const choice = useSyncExternalStore(subscribe, current, () => "system" as Choice);

  return (
    <div
      role="radiogroup"
      aria-label="Apariencia"
      className="bg-muted grid grid-cols-3 gap-1 rounded-sm p-1"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={choice === o.value}
          onClick={() => applyTheme(o.value)}
          className={cn(
            "min-h-11 rounded-sm text-sm font-semibold",
            choice === o.value
              ? "bg-card shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
