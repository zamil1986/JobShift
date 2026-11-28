# 18: Tautan teks dan skip link lebih kecil dari target sentuh 44 px

**What to build:** Lima tautan teks dan skip link di halaman cek punya area sentuh lebih rendah dari 44 px. NFR-06 meminta "area sentuh minimal 44 × 44 px", dan DESIGN.md meminta target minimal 2.75rem "termasuk tautan sebaris di daftar Langkah lewat padding vertikal". Pola itu baru dipasang di daftar Langkah, belum di tautan sebaris lain. Ditemukan di audit tiket 14 (Tahap 1b, Nadine) di https://job-shift-navy.vercel.app. Hasilnya sama di Chrome 158 dan Firefox 145 desktop.

**Blocked by:** None

**Status:** needs-triage

**Ditemukan di:** Chrome 158.0.8127.37 dan Firefox 145.0.1 (Windows, headless), lebar 360, 768, dan 1366 px, `prefers-reduced-motion: reduce` dan `no-preference`. Ukuran diambil dari `getBoundingClientRect()` di URL publik pada 28 November 2026, dan untuk tautan yang terlipat dari `getClientRects()` per baris. Kotak gabungan `getBoundingClientRect()` saja tidak cukup: tautan disclaimer yang terlipat dua baris di 360 px punya kotak gabungan setinggi 44,6 px, padahal tiap barisnya hanya 21 px.

| No | Tautan | Tempat | 360 px | 768 px | 1366 px |
| --- | --- | --- | --- | --- | --- |
| 1 | "Cara penilaian, akurasi, dan privasi" | kalimat disclaimer di bawah tombol Cek | terlipat dua baris, tiap baris 21 px | 241 × 21 | 272 × 24 |
| 2 | "Cara penilaian, akurasi, dan privasi" | di bawah legenda Label setelah hasil tampil | 241 × 21 | 241 × 21 | 272 × 24 |
| 3–4 | "Katadata" (dua kartu) | baris "Sumber:" di kartu fakta | 62 × 21 | 62 × 21 | 70 × 24 |
| 5 | "Kontan, 17 Nov 2026" | baris "Sumber:" di kartu fakta | 147 × 21 | 147 × 21 | 166 × 24 |
| 6 | Skip link "Langsung ke kotak cek" | muncul saat Tab pertama | 193 × 41,6 | 193 × 41,6 | lulus (≥ 44, karena akar 112,5%) |

Tinggi 21 px di HP berarti jari mudah meleset ke teks di sekitarnya, terutama tautan sumber yang berdiri sendiri di dasar kartu.

Screenshot (Chrome, 360 × 640, DPR 2). Garis merah dan label ukuran ditambahkan oleh skrip audit, bukan bagian situs. Screenshot disclaimer tidak diberi tanda.

- [Tautan di bawah legenda hasil](../audit-m3/gambar/18-tautan-legenda-360.png)
- [Tautan sumber di kartu fakta](../audit-m3/gambar/18-tautan-sumber-fakta-360.png)
- [Skip link saat difokus](../audit-m3/gambar/18-skip-link-360.png)
- [Tautan di disclaimer (terlipat dua baris, tanpa tanda)](../audit-m3/gambar/18-tautan-disclaimer-360.png)

Yang lulus dan tidak perlu diubah:

- semua tombol (bilah, contoh, Cek, pilih screenshot) dan kotak teks;
- tautan Langkah di hasil dan di "Kalau sudah telanjur": setiap baris tautan setinggi 47 px karena `.daftar-langkah a` memakai `padding-block: calc((var(--target-min) - 1em) / 2)`;
- tautan kaki halaman dan semua tautan di halaman Cara kerja.

`#judul-hasil` (`tabindex="-1"`, setinggi 23 px) tidak dihitung. Elemen itu hanya tujuan fokus setelah Cek, bukan target sentuh.

Arah perbaikan: pakai pola yang sudah ada di `.daftar-langkah a`, yaitu padding vertikal pada tautan inline. Jangan pakai `display: inline-block`, karena tautan disclaimer akan pindah utuh ke baris baru dan tata letak kalimatnya berubah. Untuk skip link, cukup `min-height: var(--target-min)`. Gaya visual dipegang tiket 15 (Zamil).

- [ ] Kelima tautan teks di tabel (no 1–5) punya area sentuh ≥ 44 px per baris tautan, dari lebar 360 px sampai desktop, tanpa mengubah lipatan teks di sekitarnya
- [ ] Skip link "Langsung ke kotak cek" setinggi ≥ 44 px di semua lebar
- [ ] Diukur ulang dengan `getClientRects()` di Chrome dan Firefox di 360 px, dan hasilnya dicatat di bawah

## Comments

**Verifikasi reviewer (Zamil, 28 November 2026):** diukur ulang di URL publik dengan browser bawaan Claude desktop (Chromium, macOS), di 360 × 640 dan 1366 × 768. Keenam target di tabel terkonfirmasi kurang dari 44 px, dan tidak ada target lain yang kurang. Tingginya 19 px di 360 px dan 21,5 px di 1366 px, sedikit berbeda dari 21 dan 24 px di Windows karena metrik font. Lebarnya juga sedikit berbeda. Skip link 41,6 px di 360 px dan 46,8 px di 1366 px (akar 18 px). Tautan Langkah 47 px per baris.
