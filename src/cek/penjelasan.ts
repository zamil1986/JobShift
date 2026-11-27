// Templat Penjelasan: satu kalimat per Label, ditambah satu kalimat untuk
// Modus terkuat kalau ada (total ≤ 3 kalimat). Tanpa kata "aman", "asli",
// "legit", atau "terpercaya" (spec, "Penjelasan dan kata terlarang"). Setiap
// bagian tepat satu kalimat: jangan pakai titik di tengah (misalnya "Rp250.000").

import type { Label, Modus } from "./tipe";

export const PENJELASAN_LABEL: Record<Label, string> = {
  risiko_rendah: "Tidak ditemukan tanda bahaya di teks ini.",
  waspada: "Ada tanda bahaya yang perlu kamu perhatikan sebelum menanggapi lowongan ini.",
  bahaya: "Teks ini memuat tanda bahaya kuat yang sering dipakai penipu lowongan kerja.",
};

/**
 * Pengganti kalimat Risiko rendah kalau ada Tanda bahaya (Skor < 25), supaya
 * Penjelasan tidak mengatakan "tidak ditemukan" padahal daftarnya berisi, dan
 * tetap tidak menyiratkan risiko yang lebih tinggi dari Label.
 */
export const PENJELASAN_RISIKO_RENDAH_ADA_TANDA =
  "Ada tanda bahaya kecil di teks ini, tapi belum cukup kuat untuk dinilai Waspada.";

/** Ditulis netral supaya bisa berdiri di bawah Label apa pun. */
export const PENJELASAN_MODUS: Record<Modus, string> = {
  tugas:
    "Ada ciri yang mirip Modus Tugas, yaitu kerja tugas daring yang ujungnya meminta deposit untuk naik level atau mencairkan komisi.",
  lokal:
    "Ada ciri yang mirip Modus Lokal, yaitu lowongan dalam negeri yang meminta biaya seperti seragam, medical, atau pelatihan sebelum kamu diterima.",
  luar_negeri:
    "Ada ciri yang mirip Modus Luar negeri, yaitu tawaran kerja ke luar negeri di luar jalur penempatan resmi.",
};

/**
 * Penjelasan templat untuk Label akhir dan Modus terkuat.
 *
 * @param adaTandaBahaya true kalau hasil memuat Tanda bahaya atau Tanda bahaya
 *   tersirat; hanya mengubah kalimat Risiko rendah.
 */
export function penjelasanTemplat(
  label: Label,
  modusTerkuat: Modus | null,
  adaTandaBahaya: boolean,
): string {
  const kalimatLabel =
    label === "risiko_rendah" && adaTandaBahaya
      ? PENJELASAN_RISIKO_RENDAH_ADA_TANDA
      : PENJELASAN_LABEL[label];
  return modusTerkuat ? `${kalimatLabel} ${PENJELASAN_MODUS[modusTerkuat]}` : kalimatLabel;
}
