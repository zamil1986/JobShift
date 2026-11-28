// Copy antarmuka yang tetap. Teks hasil yang dihasilkan (Label, Penjelasan,
// alasan, Langkah aman) tidak boleh memakai "aman", "asli", "legit", atau
// "terpercaya" (spec, "Penjelasan dan kata terlarang"). Tagline dikecualikan.

import type { Label, Modus } from "@/cek/tipe";
import type { KodeGalatGambar } from "./gambar";

export const TAGLINE = "JobShift — cek dulu sebelum transfer.";

/** Teks persis dari PRD FR-06. Selalu tampil bersama Label Risiko rendah. */
export const PERINGATAN_RISIKO_RENDAH =
  "Tidak ditemukan tanda bahaya, tapi ini bukan jaminan. Jangan transfer uang apa pun sebelum resmi diterima kerja.";

export const DISCLAIMER_PRIVASI =
  "JobShift tidak menyimpan teks yang kamu tempel. Teks hanya dipakai untuk satu kali cek ini.";

/** Tampil kalau `catatanAI` ada: AI timeout, gagal, atau jawabannya tidak bisa dipakai. */
export const CATATAN_AI_TIDAK_TERSEDIA =
  "Penilaian AI sedang tidak tersedia, jadi hasil ini hanya dari pemeriksaan aturan JobShift.";

/** Judul tombol contoh siap pakai (FR-08). */
export const JUDUL_CONTOH = "Belum punya teks? Coba salah satu contoh:";

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

/** Petunjuk di bawah tombol unggah screenshot (FR-02). */
export const PETUNJUK_SCREENSHOT =
  "PNG, JPG, atau WebP, maksimal 5 MB. Gambar dibaca di perangkat kamu dan tidak dikirim ke mana pun.";

/** Pesan penolakan screenshot sebelum OCR. Batas 5 MB sama dengan UKURAN_GAMBAR_MAKS. */
export const PESAN_GAMBAR: Record<KodeGalatGambar, string> = {
  tipe_tidak_didukung:
    "File ini tidak bisa dibaca. Pilih screenshot berformat PNG, JPG, atau WebP, atau tempel teks lowongannya di kotak teks.",
  terlalu_besar:
    "Ukuran gambar lebih dari 5 MB. Pilih screenshot yang lebih kecil, atau tempel teks lowongannya di kotak teks.",
  kosong: "File gambar ini kosong. Pilih screenshot lain, atau tempel teks lowongannya di kotak teks.",
};

export const PESAN_OCR_BERHASIL =
  "Teks dari screenshot sudah masuk ke kotak teks. Periksa dan perbaiki kalau ada salah baca, lalu tekan Cek.";

export const PESAN_OCR_TERLALU_PANJANG =
  "Teksnya lebih dari 3.000 karakter, jadi pangkas dulu bagian yang tidak perlu sebelum dicek.";

export const PESAN_OCR_KOSONG =
  "Tidak ada teks yang terbaca dari screenshot ini. Tempel teks lowongannya langsung di kotak teks.";

export const PESAN_OCR_GAGAL =
  "Screenshot ini gagal dibaca. Tempel teks lowongannya langsung di kotak teks, atau coba screenshot lain.";
