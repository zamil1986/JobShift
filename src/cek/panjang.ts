// Aturan panjang Teks dan pesannya. Modul ini aman dipakai di browser: UI dan
// API memakai fungsi dan pesan yang sama, supaya pesan di UI persis sama
// dengan `pesan` di respons 400.

import type { KodeError } from "./tipe";

export const PANJANG_MIN = 50;
export const PANJANG_MAKS = 3000;

export const PESAN_ERROR: Record<KodeError, string> = {
  teks_kosong: "Tempel teks lowongannya dulu, lalu tekan Cek.",
  teks_terlalu_pendek:
    "Teksnya terlalu pendek untuk dinilai, tempel seluruh pesan lowongannya.",
  teks_terlalu_panjang:
    "Teksnya terlalu panjang. Maksimal 3.000 karakter, jadi hapus bagian yang tidak perlu lalu cek lagi.",
  format_tidak_valid:
    "Permintaan tidak bisa dibaca. Kirim teks lowongan dalam kolom teks.",
};

/** Panjang Teks seperti yang dinilai: dihitung setelah trim. */
export function panjangTeks(teks: string): number {
  return teks.trim().length;
}

/** Kode error panjang Teks, atau null kalau Teks boleh dicek. */
export function periksaPanjang(teks: string): KodeError | null {
  const panjang = panjangTeks(teks);
  if (panjang === 0) return "teks_kosong";
  if (panjang < PANJANG_MIN) return "teks_terlalu_pendek";
  if (panjang > PANJANG_MAKS) return "teks_terlalu_panjang";
  return null;
}

/**
 * Teks ditolak sebelum dicek. `message` sengaja tidak memuat isi Teks,
 * supaya aman kalau error ini sampai ke log.
 */
export class TeksTidakValid extends Error {
  readonly kode: KodeError;
  readonly pesan: string;

  constructor(kode: KodeError) {
    super(`Teks tidak valid: ${kode}`);
    this.name = "TeksTidakValid";
    this.kode = kode;
    this.pesan = PESAN_ERROR[kode];
  }
}
