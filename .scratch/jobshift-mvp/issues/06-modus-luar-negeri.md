# 06: Aturan Modus Luar negeri

**What to build:** Pengguna yang menempel lowongan dengan pola Modus Luar negeri mendapat Tanda bahaya yang tepat, dengan Kutipan pemicu dan Modus yang disebut di hasil. Tiket ini menambah aturan R03 (kritis), R05, R12, R16 sesuai katalog awal di spec (bagian Mesin Aturan). Bobot non-kritis boleh disetel hanya dengan Set dev.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Aturan R03 (kritis), R05, R12, R16 ada di katalog dengan alasan bahasa awam, bobot, status kritis, dan Modus sesuai spec
- [ ] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [ ] Teks tawaran ke Kamboja dengan visa wisata berlabel Bahaya dengan Modus terkuat Luar negeri
- [ ] Seri bobot antara Luar negeri dan modus lain memilih Luar negeri
- [ ] Tidak ada tes dari tiket sebelumnya yang rusak
