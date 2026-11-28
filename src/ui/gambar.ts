// Validasi screenshot sebelum dibaca OCR (PRD FR-02). Hanya melihat tipe,
// nama, dan ukuran berkas: isi gambar tidak dibuka di sini. Pesannya ada di
// salinan.ts (PESAN_GAMBAR).

export const UKURAN_GAMBAR_MAKS = 5 * 1024 * 1024;

/** Nilai `accept` untuk `<input type="file">`, sama dengan tipe yang diterima. */
export const TIPE_GAMBAR_DITERIMA = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

const TIPE_DITERIMA = new Set(["image/png", "image/jpeg", "image/webp"]);
const EKSTENSI_DITERIMA = /\.(png|jpe?g|webp)$/i;

export type KodeGalatGambar = "tipe_tidak_didukung" | "terlalu_besar" | "kosong";

/** Bagian `File` yang dibutuhkan validasi, supaya bisa dites tanpa `File` sungguhan. */
export type InfoBerkas = { name: string; type: string; size: number };

/** Kode penolakan, atau null kalau gambar boleh dibaca OCR. */
export function periksaGambar(berkas: InfoBerkas): KodeGalatGambar | null {
  // Beberapa browser HP tidak mengisi `type`; hanya saat itu ekstensi dipakai.
  const tipeCocok = berkas.type
    ? TIPE_DITERIMA.has(berkas.type)
    : EKSTENSI_DITERIMA.test(berkas.name);
  if (!tipeCocok) return "tipe_tidak_didukung";
  if (berkas.size === 0) return "kosong";
  if (berkas.size > UKURAN_GAMBAR_MAKS) return "terlalu_besar";
  return null;
}
