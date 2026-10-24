import type { BrowserContext } from "@playwright/test";

/**
 * Inicia sesión sin pasar por OTP: pide una sesión por contraseña a la API de Supabase
 * y la guarda en la cookie que espera @supabase/ssr (`sb-<ref>-auth-token`).
 * Crea el usuario de pruebas con contraseña desde el dashboard de Supabase.
 */
export async function loginWithPassword(context: BrowserContext, email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login de pruebas falló: ${res.status}`);
  const session = await res.json();
  const ref = new URL(url).hostname.split(".")[0];
  await context.addCookies([
    {
      name: `sb-${ref}-auth-token`,
      value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
      domain: "localhost",
      path: "/",
    },
  ]);
}
