# 06: Aturan Modus Luar negeri

**What to build:** Pengguna yang menempel lowongan dengan pola Modus Luar negeri mendapat Tanda bahaya yang tepat, dengan Kutipan pemicu dan Modus yang disebut di hasil. Tiket ini menambah aturan R03 (kritis), R05, R12, R16 sesuai katalog awal di spec (bagian Mesin Aturan). Bobot non-kritis boleh disetel hanya dengan Set dev.

**Blocked by:** 03

**Status:** ready-for-agent

- [x] Aturan R03 (kritis), R05, R12, R16 ada di katalog dengan alasan bahasa awam, bobot, status kritis, dan Modus sesuai spec
- [x] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [x] Teks tawaran ke Kamboja dengan visa wisata berlabel Bahaya dengan Modus terkuat Luar negeri
- [x] Seri bobot antara Luar negeri dan modus lain memilih Luar negeri
- [x] Tidak ada tes dari tiket sebelumnya yang rusak

## Comments

- 2026-11-27 (Claude): semua kriteria selesai. `npm test` (288 tes), `npm run lint`, dan `npm run typecheck` lulus. Tes baru di `src/cek/modus-luar-negeri.test.ts`, semuanya lewat `cek()`. Bobot sesuai spec (R03 60 kritis, R05 25, R12 25, R16 25, semuanya Modus Luar negeri). Seri bobot diuji dengan R01 (Lokal, 60) + R03 (Luar negeri, 60): R01 lebih dulu di Teks dan di katalog, jadi urutan kemunculan, katalog, atau abjad akan salah memilih Lokal.
- **`PENANDA_LUAR_NEGERI`** diekspor dari `katalog.ts` untuk R04 (tiket 05): sumber regex untuk Teks normal, tanpa batas kata. Di file yang sama ada `diTeks()` (kata utuh di mana pun dalam Teks) dan `diLuarNegeri()` (pola hanya cocok kalau Teks memuat penanda); R04 bisa memakai lookahead negatif dengan pola yang sama. Nama negara sebagai kata sifat ("restoran Jepang", "skincare Korea", "wisatawan mancanegara", "bahasa Inggris") tidak dihitung; "Inggris" tidak ada di daftar.
- **Keputusan pemilik spec (2026-11-27):**
  - R03 memakai Penyangkal (semula diminta `false`), karena peringatan "jangan berangkat pakai visa turis" sebagai Aturan kritis langsung memberi Bahaya. ADR-0002 diberi bagian Revisi; spec, PRD FR-03, dan glossary diselaraskan (R01, R02, R03, R07).
  - `mesin.ts` diubah (dengan izin): Penyangkal tidak lagi melewati akhir kalimat (".", "!", "?" diikuti spasi). Semula "gaji 20 juta tanpa pengalaman. Berangkat pakai visa wisata" membatalkan R03, dan "langsung kerja tanpa tes. Biaya seragam" membatalkan R01. Tes baru di `aturan-kritis.test.ts`. Efek samping: "Pendaftaran gratis. Biaya seragam ditanggung perusahaan" sempat menjadi Bahaya (semula batal karena "gratis" di kalimat sebelumnya), jadi pola "biaya …" R01 sekarang tidak cocok kalau diikuti "ditanggung/disediakan/gratis/dibayar perusahaan".
- **Pola dipersempit dari "Contoh pola" spec:**
  - **R03** butuh visa kunjungan sebagai cara berangkat/bekerja ("berangkat pakai visa wisata", "visa kunjungan untuk kerja", "bebas visa untuk kerja", "on a tourist visa"). "Mengurus visa turis" (biro perjalanan), "membantu pelanggan berangkat dengan visa turis", "melayani tamu yang berangkat dengan visa turis", dan "turis yang masuk dengan visa on arrival" tidak kena. "Holiday visa" tidak dipakai karena Working Holiday Visa mengizinkan kerja.
  - **R05**: Kutipan pemicu adalah nominal gaji (dua digit juta, "20-30 juta", "Rp18.000.000"); "tanpa pengalaman/skill" dan penanda luar negeri cukup ada di mana pun di Teks, karena iklan sering memisahkannya per baris.
  - **R12** hanya cocok kalau Teks memuat penanda luar negeri. "Paspor disiapkan sendiri" dan "tiket dibayar sendiri" tidak kena.
  - **R16** butuh admin/operator/CS/marketing + kata online ("online", "chat", "judi", "investasi", …) dan negara rawan (Kamboja, Myanmar, Laos, kota perbatasan Thailand; Thailand saja tidak). Sekalimat → Kutipan memuat keduanya; beda kalimat → Kutipan adalah pekerjaannya.
- **Keputusan terbuka untuk penyetel Aturan (Set dev):**
  - Penyangkal masih berlaku melewati koma: "Tanpa biaya, berangkat pakai visa wisata" membatalkan R03 (juga R01/R02/R07 dengan bentuk serupa). Membatasi di koma berarti mengubah `mesin.ts` lagi.
  - R05, R12, R16 punya tes negatif berisi kalimat penyangkalan (ADR-0002) dan tes yang menunjukkan peringatan berbentuk pemicu tetap Waspada (konsekuensi ADR untuk Aturan non-kritis).
  - Pola Inggris ditambahkan untuk keempat aturan walau spec hanya mewajibkannya di R01, R02, R04, R06a/b, R10.
