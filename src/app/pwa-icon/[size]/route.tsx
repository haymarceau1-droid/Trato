import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const size = Number((await ctx.params).size) === 192 ? 192 : 512;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brand.colors.light.primary,
        color: "#fff",
        fontSize: size * 0.6,
        fontWeight: 800,
      }}
    >
      {brand.logoMark}
    </div>,
    { width: size, height: size },
  );
}
