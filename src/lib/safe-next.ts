/**
 * Solo permite redirecciones internas (evita open redirect). Rechaza "//host", "/\\host" (el navegador
 * trata "\\" como "/") y saltos de línea o caracteres de control.
 */
export const safeNext = (next?: string | null) =>
  next && /^\/(?![/\\])[^\\\u0000-\u001f]*$/.test(next) ? next : "/";
