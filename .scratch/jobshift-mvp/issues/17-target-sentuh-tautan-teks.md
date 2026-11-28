# 17: Tautan teks dan skip link lebih kecil dari target sentuh 44 px

**What to build:** Beberapa tautan di halaman cek punya area sentuh lebih kecil dari 44 × 44 px, padahal NFR-06 meminta "area sentuh minimal 44 × 44 px" dan DESIGN.md meminta target minimal 2.75rem "termasuk tautan sebaris". Ditemukan di audit tiket 14 (Tahap 1b, Nadine) di https://job-shift-navy.vercel.app. Hasilnya sama di Chrome 158 dan Firefox 145 desktop.

**Blocked by:** None

**Status:** needs-triage

**Ditemukan di:** Chrome 158.0.8127.37 dan Firefox 145.0.1 (Windows, headless), lebar 360, 768, dan 1366 px, `prefers-reduced-motion: reduce` dan `no-preference`. Ukuran diambil dari `getBoundingClientRect()` di URL publik pada 28 November 2026.

| Tautan | Tempat | 360 px | 768 px | 1366 px |
| --- | --- | --- | --- | --- |
| "Cara penilaian, akurasi, dan privasi" | kalimat disclaimer di bawah tombol Cek | terlipat dua baris, tiap baris 21 px | 241 × 21 | 272 × 24 |
| "Cara penilaian, akurasi, dan privasi" | di bawah legenda Label setelah hasil tampil | 241 × 21 | 241 × 21 | 272 × 24 |
| "Katadata" (2 kartu) dan "Kontan, 17 Nov 2026" | baris "Sumber:" di kartu fakta | 62 × 21 dan 147 × 21 | sama | 70 × 24 dan 166 × 24 |
| Skip link "Langsung ke kotak cek" | muncul saat Tab pertama | 193 × 41,6 | 193 × 41,6 | ≥ 44 (lulus karena akar 112,5%) |

Tinggi 21 px di HP berarti jari mudah meleset ke teks di sekitarnya, terutama tautan sumber yang berdiri sendiri di dasar kartu.

Screenshot (Chrome, 360 × 640, DPR 2; garis merah dan label ukuran ditambahkan oleh skrip audit, bukan bagian situs):

- [Tautan di bawah legenda hasil](../audit-m3/gambar/17-tautan-legenda-360.png)
- [Tautan sumber di kartu fakta](../audit-m3/gambar/17-tautan-sumber-fakta-360.png)
- [Skip link saat difokus](../audit-m3/gambar/17-skip-link-360.png)
- [Tautan di disclaimer (terlipat dua baris)](../audit-m3/gambar/17-tautan-disclaimer-360.png)

Yang lulus dan tidak perlu diubah: semua tombol (bilah, contoh, Cek, pilih screenshot), kotak teks, tautan Langkah di hasil (terlipat beberapa baris, tinggi total ≥ 44 px), tautan kaki halaman, dan semua tautan di halaman Cara kerja.

- [ ] Kelima tautan di tabel punya area sentuh ≥ 44 px tingginya di lebar 360 px sampai desktop, misalnya lewat padding vertikal atau `min-height` dengan `display: inline-block`, tanpa mengubah tata letak teks di sekitarnya
- [ ] Skip link "Langsung ke kotak cek" setinggi ≥ 44 px di semua lebar
- [ ] Diukur ulang di Chrome dan Firefox di 360 px, dan hasilnya dicatat di bawah
