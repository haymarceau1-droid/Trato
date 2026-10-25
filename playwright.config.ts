import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 390, height: 844 },
    // Los avisos de bienvenida (beta y cookies) no deben tapar la página en las pruebas.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3000",
          localStorage: [
            { name: "trato:aviso-beta", value: "1" },
            { name: "trato:aviso-cookies", value: "1" },
          ],
        },
      ],
    },
  },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
