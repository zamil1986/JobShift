// File hasil eval Set test (spec, "Dataset dan eval"): ditulis `npm run eval
// --set test`, dibaca halaman Cara kerja saat build. Modul ini sengaja tidak
// mengimpor cli.ts supaya halaman tidak ikut menarik klien Groq.

import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const PATH_HASIL_TEST_DEFAULT = "src/data/hasil-eval.json";

const SkemaRasio = z.object({
  pembilang: z.number().int().nonnegative(),
  penyebut: z.number().int().nonnegative(),
  persen: z.number().nullable(),
});

const SkemaBaris = z.object({
  risiko_rendah: z.number().int().nonnegative(),
  waspada: z.number().int().nonnegative(),
  bahaya: z.number().int().nonnegative(),
});

const SkemaMode = z.object({
  recall: SkemaRasio,
  presisi: SkemaRasio,
  falsePositive: SkemaRasio,
  asliWaspada: SkemaRasio,
  confusion: z.object({ palsu: SkemaBaris, asli: SkemaBaris }),
});

const SkemaHasilEvalTest = z.object({
  dataset: z.literal("test"),
  model: z.string(),
  dibuatPada: z.iso.datetime(),
  jumlahContoh: z.number().int().nonnegative(),
  jumlahPalsu: z.number().int().nonnegative(),
  jumlahAsli: z.number().int().nonnegative(),
  jumlahSintetis: z.number().int().nonnegative(),
  jumlahAiGagal: z.number().int().nonnegative(),
  p95LatensiAiMs: z.number().nullable(),
  mode: z.object({ aturan: SkemaMode, aiSaja: SkemaMode, gabungan: SkemaMode }),
});

export type HasilEvalTest = z.infer<typeof SkemaHasilEvalTest>;

/**
 * Mem-parse isi file hasil eval. `null` (file belum ada) berarti belum
 * dievaluasi. File yang rusak atau berasal dari Set dev melempar error, supaya
 * build gagal alih-alih diam-diam menyembunyikan angka.
 */
export function bacaHasilEval(isi: string | null): HasilEvalTest | null {
  if (isi === null) return null;

  let mentah: unknown;
  try {
    mentah = JSON.parse(isi);
  } catch {
    throw new Error(`${PATH_HASIL_TEST_DEFAULT} bukan JSON yang valid.`);
  }

  const dataset = (mentah as { dataset?: unknown } | null)?.dataset;
  if (dataset !== undefined && dataset !== "test") {
    throw new Error(
      `${PATH_HASIL_TEST_DEFAULT} berisi hasil Set ${String(dataset)}; angka akurasi hanya boleh dari Set test.`,
    );
  }

  const hasil = SkemaHasilEvalTest.safeParse(mentah);
  if (!hasil.success) {
    const bidang = hasil.error.issues.map((i) => i.path.join(".") || "(akar)").join(", ");
    throw new Error(`${PATH_HASIL_TEST_DEFAULT} tidak sesuai format hasil eval (${bidang}).`);
  }
  return hasil.data;
}

/** Membaca file hasil eval dari disk. Dipanggil sekali saat build oleh halaman Cara kerja. */
export function bacaFileHasilEval(): HasilEvalTest | null {
  let isi: string | null;
  try {
    // Path ditulis statis supaya Turbopack tidak melacak seluruh folder.
    isi = readFileSync(path.join(process.cwd(), "src", "data", "hasil-eval.json"), "utf8");
  } catch (galat) {
    if (galat && typeof galat === "object" && "code" in galat && galat.code === "ENOENT") {
      isi = null;
    } else {
      throw galat;
    }
  }
  return bacaHasilEval(isi);
}
