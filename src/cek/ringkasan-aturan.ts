// Ringkasan Aturan untuk halaman Cara kerja (PRD FR-10). Katalog tetap privat
// untuk inti; yang keluar hanya alasan dalam bahasa awam, tanpa ID aturan
// (NFR-08), dipisah menurut apakah Aturan itu kritis.

import { KATALOG } from "./aturan/katalog";

export { SUMBANGAN_AI_MAKS } from "./skor";

const unik = (daftar: string[]) => [...new Set(daftar)];

export const RINGKASAN_ATURAN = {
  /** Satu saja cukup untuk Label Bahaya. */
  kritis: unik(KATALOG.filter((a) => a.kritis).map((a) => a.alasan)),
  /** Menambah Skor sesuai Bobot. */
  lain: unik(KATALOG.filter((a) => !a.kritis).map((a) => a.alasan)),
} as const;
