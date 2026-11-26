# 03: Aturan kritis R01/R02, Penyangkal, dan highlight

**What to build:** Pengguna yang menempel lowongan yang meminta biaya seragam atau kode OTP langsung mendapat Label Bahaya. Hasilnya memuat Skor ≥ 60, Tanda bahaya beralasan, dan Kutipan pemicu yang di-highlight di Teks aslinya. Lowongan yang menulis "tidak dipungut biaya" tidak terkena. Tiket ini juga membangun infrastruktur mesin Aturan yang dipakai tiket 04–07: pencocokan ternormalisasi dengan peta offset, Skor, ambang Label, dan perhitungan Modus/Modus terkuat. Lihat spec bagian Mesin Aturan, Skor, Label, Modus, serta ADR-0002.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] R01 (Minta uang di awal, Modus Lokal) dan R02 (Minta OTP/PIN/password) sudah ada, keduanya kritis berbobot 60, dengan kata kunci Indonesia dan Inggris
- [ ] Pencocokan tidak membedakan huruf besar/kecil dan spasi berlebih; `kutipan` diambil dari Teks asli lewat `rentang`
- [ ] Penyangkal ≤ 3 kata sebelum pemicu membatalkan R01/R02; kecocokan berikutnya yang tidak didahului Penyangkal tetap tertangkap
- [ ] Skor = min(100, Σ bobot); ambang Label 0–24 / 25–59 / ≥60 dites di batas 24/25/59/60; Skor tidak pernah melebihi 100
- [ ] `modus` dan `modusTerkuat` dihitung dari jumlah bobot per modus; seri diurutkan Luar negeri, Lokal, Tugas
- [ ] Halaman hasil menampilkan Label (warna + ikon + kata), Skor, daftar Tanda bahaya urut bobot, Modus, dan highlight `<mark>` di Teks asli
- [ ] Tes lewat `cek()`: positif, negatif, negatif-penyangkal, dan penyangkal-lalu-kecocokan-kedua untuk R01 dan R02; dua kali Cek menghasilkan hasil identik
- [ ] UI tidak menampilkan ID aturan (NFR-08)
