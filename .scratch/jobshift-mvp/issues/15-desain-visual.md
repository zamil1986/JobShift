# 15: Desain visual dan aksesibilitas tampilan

**What to build:** JobShift punya tampilan yang konsisten, mudah dibaca di HP 360 px, dan memenuhi NFR-06/NFR-07: sistem warna dan tipografi, tampilan halaman cek, kartu hasil (Label warna + ikon + kata, Skor, Tanda bahaya, highlight `<mark>`, Langkah aman), tombol contoh, area unggah screenshot, dan halaman Cara kerja. Anggota lain menulis markup yang semantik dan fungsional; tiket ini memegang semua gaya visualnya. Lihat PRD NFR-06, NFR-07, NFR-08 dan spec bagian "UI dan aksesibilitas".

**Blocked by:** None (bisa mulai sekarang; gaya untuk bagian dari 08, 09, 12, 13 dirapikan setelah tiket itu di-merge)

**Status:** ready-for-agent

**Assignee:** Muhammad Zamil

- [x] Token desain (warna, jarak, tipografi, radius) didefinisikan sekali sebagai CSS custom properties di `src/app/globals.css`; komponen tidak memakai warna hardcode
- [x] Label Risiko rendah / Waspada / Bahaya dibedakan dengan warna, ikon, dan kata sekaligus (bisa dibaca buta warna)
- [x] Kontras teks ≥ 4,5:1 di semua warna Label, huruf isi ≥ 16 px, target sentuh ≥ 44 × 44 px
- [x] Peringatan tetap Risiko rendah terlihat tanpa scroll di 360 × 640
- [x] Tata letak benar mulai lebar 360 px sampai desktop dan proyektor
- [x] Animasi hanya di dalam `@media (prefers-reduced-motion: no-preference)`
- [x] Fokus keyboard terlihat jelas di semua elemen interaktif; fokus pindah ke judul hasil setelah Cek
- [x] Tagline "JobShift — cek dulu sebelum transfer." tampil di halaman cek dan hasil
- [x] Tidak mengubah `src/cek`, route API, atau kontrak `HasilCek`
- [ ] Lighthouse Accessibility ≥ 95 di halaman cek (dengan hasil tampil) sebelum audit tiket 14

## Catatan verifikasi (28 November 2026)

Diukur di Chrome, viewport 360 × 640 dan desktop 1024 px, setelah rebase ke `main` yang berisi tiket 07 dan 09.

Kontras (WCAG, teks ≥ 4,5:1):

| Pasangan | Rasio |
| --- | --- |
| Teks isi / panel | 14,33 |
| Teks redup / panel | 6,21 |
| Kata Label Risiko rendah / kotak Label | 7,89 |
| Kata Label Waspada / kotak Label | 9,67 |
| Kata Label Bahaya / kotak Label | 7,63 |
| Skor / kotak Label (ketiga Label) | ≥ 11,26 |
| Galat / latar galat | 8,14 |
| Tautan / panel | 8,90 |
| Sorotan `<mark>` | 13,96 |
| Tombol Cek (putih / indigo) | 5,40 |
| Tombol Cek nonaktif | 5,78 |
| Tombol pilih screenshot | 9,96 |
| Garis kontrol / panel (non-teks, ≥ 3:1) | 3,67 |

- Peringatan Risiko rendah berakhir di 329 px dari 640 px setelah Cek.
- Fokus pindah ke `#judul-hasil` setelah Cek.
- Input screenshot: tinggi 44 px, huruf 16 px.
- Lighthouse belum diukur; dilakukan sebelum audit tiket 14.

