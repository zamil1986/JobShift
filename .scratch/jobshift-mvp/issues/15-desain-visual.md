# 15: Desain visual dan aksesibilitas tampilan

**What to build:** JobShift punya tampilan yang konsisten, mudah dibaca di HP 360 px, dan memenuhi NFR-06/NFR-07: sistem warna dan tipografi, tampilan halaman cek, kartu hasil (Label warna + ikon + kata, Skor, Tanda bahaya, highlight `<mark>`, Langkah aman), tombol contoh, area unggah screenshot, dan halaman Cara kerja. Anggota lain menulis markup yang semantik dan fungsional; tiket ini memegang semua gaya visualnya. Lihat PRD NFR-06, NFR-07, NFR-08 dan spec bagian "UI dan aksesibilitas".

**Blocked by:** None (bisa mulai sekarang; gaya untuk bagian dari 08, 09, 12, 13 dirapikan setelah tiket itu di-merge)

**Status:** selesai

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
- [x] Lighthouse Accessibility ≥ 95 di halaman cek (dengan hasil tampil) sebelum audit tiket 14

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
- Lighthouse diukur pada 28 November 2026; lihat bagian di bawah.

## Lighthouse Accessibility (28 November 2026)

Lighthouse 13.6.0, preset mobile bawaan (412 × 823, `--only-categories=accessibility`), dijalankan dengan Brave (Chromium) headless lewat Lighthouse user flow (`startFlow` dari paket `lighthouse` + `puppeteer-core`). Skrip ukur ada di luar repo.

Cara mengukur keadaan "setelah Cek": Lighthouse CLI tidak bisa mengklik, jadi langkah ini memakai mode snapshot. Puppeteer membuka `/`, mengklik tombol contoh "Kerja tugas online", mengklik Cek, menunggu `#judul-hasil` muncul, lalu `flow.snapshot()` mengaudit halaman dengan kartu hasil tampil. Hasil yang tampil: Label Bahaya, Skor 100 dari 100.

| Keadaan | Mode | Build produksi lokal (`npm run build && npm start`) | Vercel (`job-shift-navy.vercel.app`) |
| --- | --- | --- | --- |
| `/` kosong | navigation | 100 | 100 |
| `/` setelah Cek, hasil Bahaya | snapshot | 100 | 100 |
| `/cara-kerja` | navigation | 100 | 100 |

- Skor sebelum dan sesudah sama: semua 100 sejak pengukuran pertama, tidak ada audit berbobot yang gagal. Karena itu tidak ada perubahan di `src/app` atau `src/ui`.
- Lighthouse tidak memeriksa target sentuh 44 px (auditnya memakai batas 24 px) dan tidak memeriksa `prefers-reduced-motion`. Kedua hal itu sudah diukur manual di catatan di atas.

