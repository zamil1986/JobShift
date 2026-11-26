// Templat Penjelasan: satu kalimat per Label. Tiket 08 menambah satu kalimat
// untuk Modus terkuat (total ≤ 3 kalimat). Tanpa kata "aman", "asli",
// "legit", atau "terpercaya" (spec, "Penjelasan dan kata terlarang").

import type { Label } from "./tipe";

const PENJELASAN_LABEL: Record<Label, string> = {
  risiko_rendah: "Tidak ditemukan tanda bahaya di teks ini.",
  waspada: "Ada tanda bahaya yang perlu kamu perhatikan sebelum menanggapi lowongan ini.",
  bahaya: "Teks ini memuat tanda bahaya kuat yang sering dipakai penipu lowongan kerja.",
};

/** Penjelasan templat untuk Label akhir. */
export function penjelasanTemplat(label: Label): string {
  return PENJELASAN_LABEL[label];
}
