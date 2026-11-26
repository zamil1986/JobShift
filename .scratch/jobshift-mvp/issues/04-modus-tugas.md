# 04: Aturan Modus Tugas

**What to build:** Pengguna yang menempel lowongan dengan pola Modus Tugas mendapat Tanda bahaya yang tepat, dengan Kutipan pemicu dan Modus yang disebut di hasil. Tiket ini menambah aturan R06b, R07 (kritis), R08 sesuai katalog awal di spec (bagian Mesin Aturan). Bobot non-kritis boleh disetel hanya dengan Set dev.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Aturan R06b, R07 (kritis), R08 ada di katalog dengan alasan bahasa awam, bobot, status kritis, dan Modus sesuai spec
- [ ] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [ ] Teks kerja "tugas" like/rating dengan deposit naik level berlabel Bahaya dengan Modus terkuat Tugas
- [ ] R06b memuat kata kunci Inggris ("move to Telegram")
- [ ] Tidak ada tes dari tiket sebelumnya yang rusak
