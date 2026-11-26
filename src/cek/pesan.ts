// Pesan error yang dipakai bersama oleh UI dan API, supaya pesan di UI persis
// sama dengan `pesan` di respons API. Aman dipakai di browser.

import type { KodeError } from "./tipe";

/** Pesan untuk setiap `kode` di respons 400. */
export const PESAN_ERROR: Record<KodeError, string> = {
  teks_kosong: "Tempel teks lowongannya dulu, lalu tekan Cek.",
  teks_terlalu_pendek:
    "Teksnya terlalu pendek untuk dinilai, tempel seluruh pesan lowongannya.",
  teks_terlalu_panjang:
    "Teksnya terlalu panjang. Maksimal 3.000 karakter, jadi hapus bagian yang tidak perlu lalu cek lagi.",
  format_tidak_valid:
    "Permintaan tidak bisa dibaca. Kirim teks lowongan dalam kolom teks.",
};

/**
 * Pesan respons 500, saat Cek gagal karena kesalahan tak terduga di server.
 * Di luar kontrak 400 di spec, jadi kodenya tidak masuk `KodeError`.
 */
export const PESAN_GAGAL_SERVER = "Cek sedang bermasalah. Coba lagi sebentar lagi.";
