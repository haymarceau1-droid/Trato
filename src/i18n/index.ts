import { esMX } from "./es-MX";

const messages = esMX;

/** t("nav.home") → "Inicio". Devuelve la clave si no existe. */
export function t(key: string): string {
  let cur: unknown = messages;
  for (const part of key.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[part];
  return typeof cur === "string" ? cur : key;
}

export const tList = (key: string): readonly string[] => {
  let cur: unknown = messages;
  for (const part of key.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[part];
  return Array.isArray(cur) ? (cur as string[]) : [];
};
