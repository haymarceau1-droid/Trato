import { expect, test } from "@playwright/test";

/** Requiere datos de demo: npm run seed:demo. Sin Supabase configurado la prueba se omite. */
test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Falta NEXT_PUBLIC_SUPABASE_URL");

test("buscar un auto, abrir la ficha y pedir contacto (redirige a login)", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Buscar", { exact: true }).fill("Nissan Versa");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/\/autos\?q=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Autos usados");

  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/anuncio\//);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // El teléfono nunca está en el HTML público.
  expect(await page.content()).not.toMatch(/525512345678|wa\.me/);

  await page.getByRole("button", { name: "WhatsApp" }).click();
  await expect(page).toHaveURL(/\/acceder\?next=/);
});
