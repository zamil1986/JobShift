# 05: Aturan Modus Lokal

**What to build:** Pengguna yang menempel lowongan dengan pola Modus Lokal mendapat Tanda bahaya yang tepat, dengan Kutipan pemicu dan Modus yang disebut di hasil. Tiket ini menambah aturan R04, R11 sesuai katalog awal di spec (bagian Mesin Aturan). Bobot non-kritis boleh disetel hanya dengan Set dev.

**Blocked by:** 03

**Status:** selesai

- [x] Aturan R04, R11 ada di katalog dengan alasan bahasa awam, bobot, status kritis, dan Modus sesuai spec
- [x] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [x] R04 tidak cocok kalau Teks memuat penanda luar negeri (nama negara/kota tujuan, "luar negeri", "overseas"); ada tes untuk ini
- [x] R04 mengenali nominal "Rp15 juta", "15.000.000", dan "Rp500 ribu per hari", termasuk "high salary"
- [x] Teks loker pabrik palsu yang mengatasnamakan PT besar dengan email @gmail memberi Modus Lokal
- [x] Tidak ada tes dari tiket sebelumnya yang rusak
