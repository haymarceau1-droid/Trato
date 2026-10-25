import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginWithPassword } from "./helpers";

/**
 * Requiere un Supabase de pruebas con migraciones y seed, y un usuario con correo confirmado y WhatsApp guardado:
 *   E2E_EMAIL / E2E_PASSWORD  (usuario creado con contraseña en el dashboard de Supabase)
 * Sin esas variables las pruebas se omiten. También requiere NEXT_PUBLIC_SUPABASE_URL / ANON_KEY.
 */
const { E2E_EMAIL, E2E_PASSWORD } = process.env;
test.skip(!E2E_EMAIL || !E2E_PASSWORD, "Faltan E2E_EMAIL / E2E_PASSWORD");

test("publicar un anuncio de auto", async ({ page, context }) => {
  await loginWithPassword(context, E2E_EMAIL!, E2E_PASSWORD!);
  await page.goto("/publicar");
  await page.getByRole("button", { name: /Auto/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Marca").fill("Nissan");
  await page.getByLabel("Modelo").fill("Versa");
  await page.getByLabel("Año").fill("2019");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Transmisión").selectOption("manual");
  await page.getByLabel("Combustible").selectOption("gasolina");
  await page.getByLabel("Kilometraje").fill("80000");
  await page.getByLabel("Carrocería", { exact: true }).selectOption("sedan");
  await page.getByLabel("Factura").selectOption("original");
  await page.getByLabel("Estado de la carrocería").fill("80");
  await page.getByLabel("Estado de la mecánica").fill("70");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Precio (MXN)").fill("215000");
  await page.getByLabel("Estado").selectOption("nuevo-leon");
  await page.getByLabel("Ciudad o municipio").fill("Monterrey");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Elegir fotos").setInputFiles(path.join(__dirname, "fixtures/car.jpg"));
  await expect(page.getByAltText("Foto 1")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Usar texto de ejemplo" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Publicar anuncio" }).click();
  await expect(page.getByRole("heading", { name: /ya está publicado/ })).toBeVisible();
});
