import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
        fontSize: 40,
        fontWeight: 800,
        borderRadius: 14,
      }}
    >
      {brand.logoMark}
    </div>,
    size,
  );
}
