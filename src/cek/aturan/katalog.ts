// Katalog Aturan (spec, "Mesin Aturan", katalog awal). Privat untuk inti:
// dites lewat cek(), tidak langsung. Pola ditulis untuk Teks normal (huruf
// kecil, spasi tunggal) dan otomatis dibatasi kata utuh.
//
// Alasan tampil di UI: bahasa awam, tanpa ID aturan, dan tanpa kata "aman",
// "asli", "legit", atau "terpercaya".

import type { Aturan } from "./mesin";

/** Pemisah dalam daftar: "seragam, medical, atau pelatihan". */
const PEMISAH = String.raw`(?: ?[,/&] ?| (?:atau|dan|serta|or|and) | ?, (?:atau|dan|or|and) )`;

/** "a, b, atau c" sebagai satu kecocokan, supaya Penyangkal di depan daftar berlaku untuk seluruh daftar. */
const daftar = (kata: string) => `(?:${kata})(?:${PEMISAH}(?:${kata}))*`;

const JENIS_BIAYA = [
  "seragam",
  "medical(?: check ?up)?",
  "mcu",
  "pelatihan",
  "training",
  "pendaftaran",
  "registrasi",
  "administrasi",
  "admin",
  "jaminan",
  "id ?card",
  "tes kesehatan",
].join("|");

// "pin lokasi" atau "pin point" bukan PIN rahasia.
const DATA_RAHASIA = ["kode otp", "otp", "pin(?! lokasi| point| map)", "kata sandi", "password", "kode verifikasi"].join("|");
// Kata serapan (otp, pin, password) cukup di daftar Indonesia: "no" bukan Penyangkal di
// pola Indonesia, supaya "kirim no HP dan PIN" tetap tertangkap.
const DATA_RAHASIA_EN = ["otp code", "verification code", "security code"].join("|");

export const R01: Aturan = {
  id: "R01",
  alasan: "Meminta uang sebelum kamu resmi diterima kerja.",
  bobot: 60,
  kritis: true,
  modus: "lokal",
  pakaiPenyangkal: true,
  pola: [
    { cari: `(?:biaya|uang) ${daftar(JENIS_BIAYA)}`, bahasa: "id" },
    { cari: "(?:transfer|bayar|membayar) (?:dulu|terlebih dahulu|di awal|di muka)", bahasa: "id" },
    {
      cari: `${daftar("registration|training|uniform|administration|admin|processing|medical")} fees?`,
      bahasa: "en",
    },
    { cari: "pay first|pay upfront|upfront (?:payment|fee)", bahasa: "en" },
  ],
};

export const R02: Aturan = {
  id: "R02",
  alasan: "Meminta kode OTP, PIN, atau password, padahal data ini bisa dipakai untuk membobol akunmu.",
  bobot: 60,
  kritis: true,
  pakaiPenyangkal: true,
  pola: [
    { cari: daftar(DATA_RAHASIA), bahasa: "id" },
    { cari: daftar(DATA_RAHASIA_EN), bahasa: "en" },
  ],
};

export const KATALOG: readonly Aturan[] = [R01, R02];
