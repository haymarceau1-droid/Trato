import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext", () => {
  it.each(["/", "/publicar", "/autos?q=versa", "/anuncio/nissan-versa-2019#fotos"])(
    "acepta %s",
    (p) => expect(safeNext(p)).toBe(p),
  );
  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/ok\nSet-Cookie: x=1",
    "/ok\r",
    "",
    null,
    undefined,
  ])("rechaza %j", (p) => expect(safeNext(p as string | null | undefined)).toBe("/"));
});
