# 07: Aturan umum dan Tanda bahaya tersirat

**What to build:** Pengguna mendapat Tanda bahaya untuk pola yang tidak terkait Modus: kontak hanya lewat nomor pribadi, langsung diterima tanpa seleksi, desakan waktu, permintaan data sensitif, dan tautan pendaftaran tidak resmi. Kalau Teks tidak menyebut nama perusahaan maupun alamat, hasil memuat satu Tanda bahaya tersirat di daftar terpisah tanpa highlight. Lihat spec bagian Mesin Aturan (R13).

**Blocked by:** 03

**Status:** ready-for-agent

- [x] R06a, R09, R10, R13, R14, R15 ada di katalog sesuai spec; R06a dan R10 memuat kata kunci Inggris
- [x] R13 menghasilkan paling banyak satu Tanda bahaya tersirat (bobot 10, tidak kritis, tanpa kutipan), dan hanya kalau nama badan usaha **dan** alamat sama-sama tidak ada
- [x] Tanda bahaya tersirat masuk `tandaBahayaTersirat`, ikut dihitung di Skor, dan tampil sebagai daftar terpisah tanpa highlight
- [x] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [x] Katalog berisi minimal 15 aturan setelah tiket 04–07 selesai (FR-03)
