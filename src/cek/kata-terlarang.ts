// Filter kata terlarang (spec, "Penjelasan dan kata terlarang"). Teks hasil
// tidak boleh memakai "aman", "asli", "legit", atau "terpercaya" sebagai kata
// utuh, karena JobShift tidak pernah menjamin sebuah lowongan. Dipakai tes copy
// statis dan, di tiket 10, untuk menolak Penjelasan AI.

/**
 * Pengecualian, dibuang dari teks sebelum dicocokkan:
 * - URL atau domain resmi pemerintah (`*.go.id`) dan aduankonten.id, misalnya
 *   `https://migran-aman.kp2mi.go.id/cek-legalitas`. Domain lain tidak
 *   dikecualikan, supaya domain penipu seperti "kerja-aman.com" tetap tertangkap.
 * - Nama layanan resmi "Migran Aman" milik KP2MI.
 *
 * Tagline juga dikecualikan menurut spec, tetapi tidak memuat kata terlarang
 * sehingga tidak perlu dibuang (dijaga tes).
 */
const PENGECUALIAN = [
  /(?:https?:\/\/)?(?:(?:[\p{L}\p{N}-]+\.)+go\.id|aduankonten\.id)(?:\/\S*)?/giu,
  /\bmigran aman\b/giu,
];

const KATA_TERLARANG = /(?<![\p{L}\p{N}])(?:aman|asli|legit|terpercaya)(?![\p{L}\p{N}])/iu;

/** true kalau teks memuat kata utuh "aman", "asli", "legit", atau "terpercaya" di luar pengecualian. */
export function memuatKataTerlarang(teks: string): boolean {
  let sisa = teks;
  for (const pola of PENGECUALIAN) sisa = sisa.replace(pola, " ");
  return KATA_TERLARANG.test(sisa);
}
