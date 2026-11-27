// Copy antarmuka yang tetap. Teks hasil yang dihasilkan (Label, Penjelasan,
// alasan, Langkah aman) tidak boleh memakai "aman", "asli", "legit", atau
// "terpercaya" (spec, "Penjelasan dan kata terlarang"). Tagline dikecualikan.

import type { Label, Modus } from "@/cek/tipe";

export const TAGLINE = "JobShift — cek dulu sebelum transfer.";

/** Teks persis dari PRD FR-06. Selalu tampil bersama Label Risiko rendah. */
export const PERINGATAN_RISIKO_RENDAH =
  "Tidak ditemukan tanda bahaya, tapi ini bukan jaminan. Jangan transfer uang apa pun sebelum resmi diterima kerja.";

export const DISCLAIMER_PRIVASI =
  "JobShift tidak menyimpan teks yang kamu tempel. Teks hanya dipakai untuk satu kali cek ini.";

/** Tampil kalau `catatanAI` ada: AI timeout, gagal, atau jawabannya tidak bisa dipakai. */
export const CATATAN_AI_TIDAK_TERSEDIA =
  "Penilaian AI sedang tidak tersedia, jadi hasil ini hanya dari pemeriksaan aturan JobShift.";

export const PESAN_GAGAL_KONEKSI =
  "Cek gagal karena koneksi terputus. Periksa internet kamu, lalu coba lagi.";

export const TAMPILAN_LABEL: Record<Label, { kata: string; ikon: string }> = {
  risiko_rendah: { kata: "Risiko rendah", ikon: "ℹ" },
  waspada: { kata: "Waspada", ikon: "⚠" },
  bahaya: { kata: "Bahaya", ikon: "⛔" },
};

/** Nama Modus seperti di glosarium, tanpa kata "Modus" (sudah ada di judulnya). */
export const TAMPILAN_MODUS: Record<Modus, string> = {
  tugas: "Tugas",
  lokal: "Lokal",
  luar_negeri: "Luar negeri",
};

/** Judul bagian Langkah. "Langkah aman" sengaja tidak dipakai di UI karena memuat kata "aman". */
export const JUDUL_LANGKAH = "Langkah berikutnya";
export const JUDUL_LANGKAH_DARURAT = "Kalau sudah telanjur";
export const JUDUL_SUDAH_TRANSFER = "Sudah telanjur transfer?";
export const JUDUL_SUDAH_KIRIM_DATA = "Sudah telanjur kirim data?";
