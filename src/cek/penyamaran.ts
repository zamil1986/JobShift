// Penyamaran (spec, "Penyamaran dan lapisan AI"): data pribadi di Teks diganti
// penanda sebelum Teks dikirim ke AI. Aturan selalu menilai Teks asli.
//
// Urutannya penting: email dulu (bisa memuat angka), lalu NIK 16 digit, nomor
// HP, dan terakhir deret 10–15 digit lain sebagai rekening. Angka dengan
// pemisah ribuan ("8.000.000") tidak pernah jadi deret digit, dan angka yang
// didahului "Rp" dilewati, supaya informasi gaji tetap terbaca AI.

/** Tidak didahului digit, dan tidak didahului "Rp" (boleh dengan spasi). */
const BUKAN_NOMINAL = String.raw`(?<!\d)(?<!rp\s*)`;

const LANGKAH: readonly [RegExp, string][] = [
  [/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/giu, "[EMAIL]"],
  [new RegExp(String.raw`${BUKAN_NOMINAL}\d{16}(?!\d)`, "giu"), "[NIK]"],
  [
    new RegExp(String.raw`${BUKAN_NOMINAL}(?<!\+)(?:\+62|62|0)[ -]?8(?:[ -]?\d){7,11}(?!\d)`, "giu"),
    "[NOMOR]",
  ],
  [new RegExp(String.raw`${BUKAN_NOMINAL}\d{10,15}(?!\d)`, "giu"), "[REKENING]"],
];

/** Semua penanda Penyamaran. Kutipan AI yang memuat salah satunya dibuang. */
export const PENANDA = /\[(?:EMAIL|NIK|NOMOR|REKENING)\]/u;

/** Teks dengan email, NIK, nomor HP, dan rekening diganti penanda. */
export function samarkan(teks: string): string {
  return LANGKAH.reduce((hasil, [pola, penanda]) => hasil.replace(pola, penanda), teks);
}
