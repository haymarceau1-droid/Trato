/** Solo permite redirecciones internas (evita open redirect). */
export const safeNext = (next?: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
