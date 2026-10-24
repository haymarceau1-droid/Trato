import { z } from "zod";
import { REPORT_REASONS } from "@/lib/constants";

export const reportSchema = z.object({
  listing_id: z.uuid(),
  reason: z.enum(REPORT_REASONS.map((r) => r.value) as [string, ...string[]], {
    error: "Elige un motivo",
  }),
  comment: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});
