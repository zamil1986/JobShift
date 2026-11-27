// Penyamaran (spec, "Penyamaran dan lapisan AI"): data pribadi di Teks diganti
// penanda sebelum Teks dikirim ke AI. Aturan selalu menilai Teks asli.
//
// Urutannya penting: email dulu (bisa memuat angka), lalu NIK 16 digit, nomor
// HP, dan terakhir deret 10–15 digit lain sebagai rekening. Angka dengan
// pemisah ribuan ("8.000.000") tidak pernah jadi deret digit, dan angka yang
// didahului "Rp" dilewati, supaya informasi gaji tetap terbaca AI.

/**
 * Tidak didahului digit, dan tidak didahului kata utuh "Rp" atau "Rp." di
 * baris yang sama (boleh dengan spasi). "Corp" dan "Sharp" bukan "Rp".
 */
const BUKAN_NOMINAL = String.raw`(?<!\d)(?<!(?<![\p{L}\p{N}])rp\.?[ \t]*)`;

/**
 * Pola data pribadi, dalam urutan penerapannya. Dipakai juga oleh validator
 * dataset untuk menemukan angka yang belum disamarkan.
 */
export const POLA_DATA_PRIBADI = [
  {
    jenis: "email",
    pola: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/giu,
    penanda: "[EMAIL]",
  },
  { jenis: "NIK", pola: new RegExp(String.raw`${BUKAN_NOMINAL}\d{16}(?!\d)`, "giu"), penanda: "[NIK]" },
  {
    jenis: "nomor HP",
    pola: new RegExp(String.raw`${BUKAN_NOMINAL}(?<!\+)(?:\+62|62|0)[ -]?8(?:[ -]?\d){7,11}(?!\d)`, "giu"),
    penanda: "[NOMOR]",
  },
  {
    jenis: "rekening",
    pola: new RegExp(String.raw`${BUKAN_NOMINAL}\d{10,15}(?!\d)`, "giu"),
    penanda: "[REKENING]",
  },
] as const;

/** Semua penanda Penyamaran. Kutipan AI yang memuat salah satunya dibuang. */
export const PENANDA = /\[(?:EMAIL|NIK|NOMOR|REKENING)\]/iu;

/** Teks dengan email, NIK, nomor HP, dan rekening diganti penanda. */
export function samarkan(teks: string): string {
  return POLA_DATA_PRIBADI.reduce((hasil, { pola, penanda }) => hasil.replace(pola, penanda), teks);
}
