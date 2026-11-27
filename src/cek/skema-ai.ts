// Skema keluaran AI (spec, "Penyamaran dan lapisan AI"; ADR-0001): label versi
// AI, Tanda bahaya (kutipan + alasan), dan Penjelasan. Tanpa skor dan tanpa
// Modus. Satu skema Zod dipakai inti untuk validasi dan adapter Groq untuk
// strict `json_schema`, jadi keduanya tidak bisa berbeda.
//
// Hanya tipe, enum, required, dan additionalProperties: strict mode Groq hanya
// mendukung sebagian JSON Schema. Batas jumlah butir dan panjang dicek inti
// setelah validasi, bukan di skema.

import { z } from "zod";

export const KeluaranAI = z.strictObject({
  label: z.enum(["risiko_rendah", "waspada", "bahaya"]),
  tanda_bahaya: z.array(
    z.strictObject({
      kutipan: z.string(),
      alasan: z.string(),
    }),
  ),
  penjelasan: z.string(),
});

export type KeluaranAI = z.infer<typeof KeluaranAI>;

/** JSON Schema untuk `response_format.json_schema.schema` di Groq. */
export function skemaJsonKeluaranAI(): Record<string, unknown> {
  const { $schema, ...skema } = z.toJSONSchema(KeluaranAI) as Record<string, unknown>;
  void $schema;
  return skema;
}
