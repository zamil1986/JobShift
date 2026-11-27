// Langkah aman dan Langkah darurat (spec, "Langkah aman dan Langkah darurat").
// Data statis, bukan hasil AI: satu tabel per Label dan satu per Modus.
//
// URL hanya dari spec dan docs/research/ai-api-and-iasc.md. Nomor telepon dan
// WhatsApp ditulis di teks, bukan sebagai tautan `tel:`/`wa.me`, supaya tidak
// ada URL yang tidak tercantum di sumber resmi. Copy tidak memakai "aman",
// "asli", "legit", atau "terpercaya" (dicek tes kata terlarang); domain resmi
// seperti migran-aman.kp2mi.go.id dikecualikan.

import type { HasilCek, Label, Langkah, Modus } from "./tipe";

const KARIRHUB = { url: "https://karirhub.kemnaker.go.id/", domain: "karirhub.kemnaker.go.id" };
const ADUAN_KONTEN = { url: "https://aduankonten.id/", domain: "aduankonten.id" };
const IASC = { url: "https://iasc.ojk.go.id/", domain: "iasc.ojk.go.id" };
const KP2MI_CEK_LEGALITAS = {
  url: "https://migran-aman.kp2mi.go.id/cek-legalitas",
  domain: "migran-aman.kp2mi.go.id",
};

const CARI_DI_KARIRHUB: Langkah = {
  teks: "Cari lowongan resmi di Karirhub Kemnaker dan cocokkan dengan tawaran ini.",
  tautan: KARIRHUB,
};

const LAPOR_ADUAN_KONTEN: Langkah = {
  teks: "Laporkan pesan atau akun yang mencurigakan ke situs aduan konten pemerintah.",
  tautan: ADUAN_KONTEN,
};

export const LANGKAH_UMUM: Record<Label, Langkah[]> = {
  risiko_rendah: [
    { teks: "Tetap jangan transfer uang apa pun sebelum kamu resmi diterima kerja." },
    {
      teks: "Hubungi perusahaannya lewat situs atau nomor kantor yang kamu cari sendiri, bukan hanya dari nomor di pesan.",
    },
    CARI_DI_KARIRHUB,
    LAPOR_ADUAN_KONTEN,
  ],
  waspada: [
    { teks: "Jangan transfer uang dan jangan kirim KTP, kode OTP, PIN, atau password dulu." },
    {
      teks: "Tanyakan langsung ke perusahaannya lewat kontak resmi yang kamu cari sendiri, bukan nomor di pesan ini.",
    },
    CARI_DI_KARIRHUB,
    LAPOR_ADUAN_KONTEN,
  ],
  bahaya: [
    { teks: "Jangan transfer uang dan jangan kirim KTP, kode OTP, PIN, atau password." },
    { teks: "Berhenti membalas pesan ini, lalu blokir nomor atau akun pengirimnya." },
    LAPOR_ADUAN_KONTEN,
    CARI_DI_KARIRHUB,
  ],
};

export const LANGKAH_MODUS: Record<Modus, Langkah[]> = {
  tugas: [
    {
      teks: "Jangan isi deposit apa pun untuk naik level atau mencairkan komisi, karena uangnya hampir pasti tidak kembali.",
    },
    { teks: "Komisi kecil di awal biasanya hanya umpan supaya kamu mau transfer lebih besar." },
  ],
  lokal: [
    {
      teks: "Perusahaan sungguhan tidak meminta biaya seragam, medical, atau pelatihan sebelum kamu diterima kerja.",
    },
    {
      teks: "Kalau lowongan memakai nama perusahaan besar, cek di situs resmi perusahaan itu apakah lowongannya benar ada.",
    },
  ],
  luar_negeri: [
    {
      teks: "Cek izin perusahaan perekrut (P3MI) di situs KP2MI sebelum mendaftar atau menyerahkan paspor.",
      tautan: KP2MI_CEK_LEGALITAS,
    },
    { teks: "Tanyakan atau adukan tawaran ini ke call center KP2MI di 0800-1000." },
    { teks: "Bisa juga lewat WhatsApp pengaduan KP2MI di 0811-8080-141." },
  ],
};

const LANGKAH_DARURAT: NonNullable<HasilCek["langkahDarurat"]> = {
  sudahTransfer: [
    {
      teks: "Laporkan secepatnya ke IASC (Indonesia Anti-Scam Centre) supaya dana bisa dicoba diblokir. Siapkan bukti transfer.",
      tautan: IASC,
    },
    { teks: "Hubungi bank atau e-wallet yang kamu pakai untuk transfer dan minta rekening tujuan diblokir." },
    { teks: "Kalau butuh bantuan melapor, telepon Kontak OJK di 157." },
  ],
  sudahKirimData: [
    {
      teks: "Hubungi bank atau e-wallet kamu sekarang, minta akun diblokir sementara, lalu ganti PIN dan password.",
    },
    { teks: "Telepon Kontak OJK di 157 untuk minta arahan." },
    {
      teks: "Laporkan akun pelaku lewat fitur lapor di WhatsApp, Telegram, atau media sosial tempat kamu dihubungi, juga ke situs aduan konten pemerintah.",
      tautan: ADUAN_KONTEN,
    },
  ],
};

/**
 * Langkah aman untuk Label akhir. Langkah spesifik mengikuti Modus terkuat,
 * dan kanal KP2MI selalu ditambahkan setiap kali Modus Luar negeri terdeteksi
 * walaupun bukan yang terkuat (spec, user story 25).
 *
 * @param modus Semua Modus yang cocok, urut jumlah bobot (elemen pertama = Modus terkuat).
 */
export function langkahAman(label: Label, modus: readonly Modus[]): HasilCek["langkahAman"] {
  const modusTerkuat = modus[0];
  const spesifik = modusTerkuat ? [...LANGKAH_MODUS[modusTerkuat]] : [];
  if (modusTerkuat !== "luar_negeri" && modus.includes("luar_negeri")) {
    spesifik.push(...LANGKAH_MODUS.luar_negeri);
  }
  // Array baru per hasil, supaya hasil yang berbeda tidak berbagi array.
  return { umum: [...LANGKAH_UMUM[label]], spesifik };
}

/** Langkah darurat untuk Waspada dan Bahaya; null untuk Risiko rendah. */
export function langkahDarurat(label: Label): HasilCek["langkahDarurat"] {
  if (label === "risiko_rendah") return null;
  return {
    sudahTransfer: [...LANGKAH_DARURAT.sudahTransfer],
    sudahKirimData: [...LANGKAH_DARURAT.sudahKirimData],
  };
}

/** Semua Langkah statis, untuk tes kata terlarang. */
export const SEMUA_LANGKAH: readonly Langkah[] = [
  ...Object.values(LANGKAH_UMUM).flat(),
  ...Object.values(LANGKAH_MODUS).flat(),
  ...LANGKAH_DARURAT.sudahTransfer,
  ...LANGKAH_DARURAT.sudahKirimData,
];
