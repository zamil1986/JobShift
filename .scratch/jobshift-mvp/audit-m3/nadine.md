# Audit Rilis M3 — Tahap 1b (Nadine)

- **Tanggal uji:** 28 November 2026
- **Penguji:** Nadine (desktop diukur dengan bantuan Claude; HP diuji sendiri)
- **URL publik yang diuji:** https://job-shift-navy.vercel.app
- **Commit `main` saat audit:** `34a3826` (Vercel production dideploy dari `main`)
- **Kriteria tiket 14 yang diaudit:** "Tampilan benar di Chrome Android, Safari iOS, Chrome dan Firefox desktop, mulai lebar 360 px; kontras, huruf 16 px, target 44 px, `prefers-reduced-motion`" (PRD NFR-06, NFR-07)
- **Status kriteria:** **GAGAL** sampai tiket 18 selesai. Target sentuh gagal di Chrome dan Firefox desktop. Hasil HP tidak bisa membuatnya lulus. Chrome Android dan Safari iOS masih menunggu uji di HP sungguhan, untuk memastikan tidak ada temuan lain.
- **Tiket temuan baru:** [18-target-sentuh-tautan-teks.md](../issues/18-target-sentuh-tautan-teks.md) (`Status: needs-triage`). Nomor 17 sudah dipakai tiket GROQ_API_KEY dari Tahap 1a (PR #11).

---

## 1. Cara mengukur

### Desktop (Chrome dan Firefox)

Kedua browser dijalankan headless dengan profil sementara dan dikendalikan skrip. Chrome memakai DevTools Protocol dan Firefox memakai WebDriver BiDi. Skrip ukurnya ada di luar repo.

| | Chrome desktop | Firefox desktop |
| --- | --- | --- |
| Versi | Chrome 158.0.8127.37 (Windows) | Firefox 145.0.1 (Windows) |
| Lebar | 360 × 640 (DPR 2, mobile + sentuh), 768 × 1024 (DPR 2, mobile + sentuh), 1366 × 768 | 360 × 640 (DPR 2), 768 × 1024 (DPR 2), 1366 × 768 |
| Reduced motion | `Emulation.setEmulatedMedia` `prefers-reduced-motion: reduce` | preferensi `ui.prefersReducedMotion = 1` |
| Pembanding | putaran kedua dengan `no-preference` | putaran kedua dengan `ui.prefersReducedMotion = 0` |

Setiap keadaan dibuka langsung di URL publik:

- **`/` kosong:** halaman cek baru dimuat.
- **`/` Bahaya:** klik contoh "Kerja tugas online", klik Cek, lalu tunggu `#judul-hasil`. Hasil yang tampil: Label Bahaya, Skor 100 dari 100. Teks contoh dijawab adapter Statis (tiket 12), jadi kartu hasilnya lengkap walaupun `GROQ_API_KEY` belum terpasang di production saat audit (tiket 17). Kartu hasil untuk teks bebas tanpa AI, yang menampilkan catatan "AI tidak tersedia", tidak ikut diuji.
- **Cara kerja:** `/cara-kerja`.

Ukuran diambil dari computed style di halaman:

- **Tata letak:** gulir mendatar (`scrollWidth − clientWidth`), elemen yang menonjol keluar layar, dan teks yang terpotong. Screenshot diperiksa mata: 360 px per potongan 1.280 px sepanjang halaman, 768 px dan desktop per layar.
- **Huruf:** `font-size` setiap elemen yang memuat teks terlihat. Teks di dalam SVG ilustrasi dan teks `sr-only` (1 px) tidak dihitung.
- **Kontras:** warna teks dibandingkan dengan latar efektif (warna latar leluhur ditumpuk), dengan rumus WCAG 2.1. Batasnya 4,5:1, atau 3:1 untuk teks besar. Judul bergradien (`background-clip: text`) dihitung terpisah dari warna ujung gradiennya.
- **Target sentuh:** `getBoundingClientRect()` semua `a[href]`, `button`, `input`, `textarea`, `select`, `summary`, dan `[tabindex]` yang terlihat. Untuk tautan yang terlipat, tinggi diukur per baris dengan `getClientRects()`, karena kotak gabungannya bisa lebih dari 44 px walaupun tiap barisnya pendek. `#judul-hasil` (`tabindex="-1"`) tidak dihitung, karena hanya tujuan fokus dan bukan target sentuh.
- **Reduced motion:** `matchMedia('(prefers-reduced-motion: reduce)')`, jumlah `document.getAnimations()` yang berjalan, dan jumlah elemen yang computed `animation-name`-nya bukan `none` atau `transition-duration`-nya > 0.

### HP sungguhan

Lihat bagian 4. Hasilnya diisi dari laporan dan screenshot Nadine, tidak dikarang.

---

## 2. Matriks uji

Keterangan: ✅ lulus, ❌ gagal (lihat catatan), ⏳ belum diuji, — tidak berlaku.

### Chrome desktop

| Halaman | Lebar | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Tautan sumber fakta 62 × 21 dan 147 × 21, skip link 193 × 41,6, tautan disclaimer terlipat dua baris 21 px (tiket 18) |
| `/` kosong | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama, ditambah tautan disclaimer 241 × 21 |
| `/` kosong | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ❌ | ✅ 0 animasi | Tautan disclaimer 272 × 24, tautan sumber 70 × 24 dan 166 × 24; skip link lulus |
| `/` Bahaya | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Seperti `/` kosong, ditambah tautan di bawah legenda 241 × 21 |
| `/` Bahaya | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Seperti di atas |
| `/` Bahaya | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ❌ | ✅ 0 animasi | Seperti di atas, 24 px |
| Cara kerja | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ✅ | ✅ 0 animasi | — |

### Firefox desktop

| Halaman | Lebar | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Ukuran target sama dengan Chrome (selisih ≤ 0,1 px) |
| `/` kosong | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` kosong | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| Cara kerja | 360 | ✅ | ✅ min 5,40 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 768 | ✅ | ✅ min 5,40 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 1366 | ✅ | ✅ min 5,40 | ✅ min 18 | ✅ | ✅ 0 animasi | — |

### Chrome Android (HP sungguhan)

Lebar 360 dan 768 diganti dengan lebar asli HP saat tegak dan miring.

| Halaman | Posisi HP | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` kosong | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |

### Safari iOS (HP sungguhan)

| Halaman | Posisi HP | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` kosong | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |

---

## 3. Rincian hasil desktop

### Tata letak

- Tidak ada gulir mendatar di 18 kombinasi (2 browser × 3 halaman × 3 lebar). Tidak ada teks terpotong dan tidak ada elemen yang keluar layar.
- Di 360 px, bilah memuat logo, "Cara kerja", dan "Cek sekarang" dalam satu baris. Keempat tombol contoh terlipat jadi dua baris. Kartu hasil, daftar Tanda bahaya, Langkah, "Kalau sudah telanjur", Teks yang dicek dengan `<mark>`, legenda Label, kartu fakta, dan kaki halaman tersusun satu kolom tanpa tumpang-tindih.
- Di 768 px dan 1366 px, panel alat rata tengah dan kisi kartu berubah sesuai titik henti DESIGN.md.
- Tinggi halaman di Chrome dan Firefox hampir sama (selisih ≤ 23 px), jadi tata letaknya konsisten di kedua mesin render.

### Kontras

- Kontras terendah adalah **5,40:1** di kedua halaman: teks putih tombol berlatar gradien indigo ("Cek", "Cek sekarang", dan "Kembali ke kotak cek") di ujung gradien yang terang, `rgb(90, 84, 234)`. Di ujung gelap (`#4f46e5`) rasionya 6,29:1. Tidak ada teks di bawah 4,5:1.
- Koreksi reviewer: versi pertama laporan ini menulis minimum 6,29:1 di halaman cek dan 7,05:1 di Cara kerja. Skrip menumpuk `background-color` leluhur, padahal tombol utama, panel alat, dan kartu memakai `background-image` gradien. Akibatnya ujung terang tombol tidak terhitung, dan teks redup dibandingkan dengan latar halaman, bukan dengan panel. Angka 5,40 diverifikasi ulang di URL publik dan sama dengan tabel kontras tiket 15. Teks redup di atas panel 6,21:1 diambil dari tabel yang sama.
- Judul bergradien tidak bisa diukur per piksel, jadi dihitung dari ujung gradien `--gradien-judul`. Warna paling gelapnya `indigo-300` (`#a5b4fc`), dengan rasio 10,10:1 di atas latar `#030712`, 9,52:1 di atas kartu `#0b101e`, dan 8,90:1 di atas panel `#111827`.
- Skip link: teks `#030712` di atas `indigo-300`, rasio 10,10:1.
- Angka ini cocok dengan tabel kontras di catatan verifikasi tiket 15.

### Huruf

- Ukuran huruf terkecil yang terlihat adalah 16 px di 360 dan 768 px, dan 18 px di 1366 px (ukuran akar naik ke 112,5% mulai 64rem).
- Tidak ada teks terlihat yang di bawah 16 px.

### Target sentuh

Semua tombol, kotak teks, input screenshot, tautan kaki halaman, dan semua tautan di Cara kerja ≥ 44 px. Tautan Langkah juga lulus: setiap baris tautannya setinggi 47 px karena `.daftar-langkah a` memakai padding vertikal. Ada 6 target yang kurang, yaitu 5 tautan teks dan skip link. Ukurannya sama di Chrome dan Firefox (selisih ≤ 0,1 px):

| Target | 360 / 768 px | 1366 px |
| --- | --- | --- |
| "Cara penilaian, akurasi, dan privasi" di disclaimer bawah tombol Cek | 241 × 21 (di 360 terlipat dua baris, tiap baris 21 px) | 272 × 24 |
| "Cara penilaian, akurasi, dan privasi" di bawah legenda hasil | 241 × 21 | 272 × 24 |
| "Katadata" (dua kartu fakta, dihitung 2 target) | 62 × 21 | 70 × 24 |
| "Kontan, 17 Nov 2026" | 147 × 21 | 166 × 24 |
| Skip link "Langsung ke kotak cek" (saat difokus) | 193 × 41,6 | lulus |

Semuanya dicatat di [tiket 18](../issues/18-target-sentuh-tautan-teks.md) beserta screenshot. Pengecualian "tautan di dalam kalimat" dari WCAG tidak dipakai di sini, karena NFR-06 dan DESIGN.md meminta 44 px tanpa pengecualian.

### Reduced motion

| Browser | Mode | `matchMedia` reduce | Animasi berjalan | Elemen dengan animasi/transisi |
| --- | --- | --- | --- | --- |
| Chrome | `reduce` | `true` | 0 di semua halaman | 0 |
| Chrome | `no-preference` | `false` | 13 di halaman cek, 9 di Cara kerja | ada |
| Firefox | `reduce` | `true` | 0 di semua halaman | 0 |
| Firefox | `no-preference` | `false` | 7 di halaman cek, 5 di Cara kerja | 23 di `/` kosong, 55 di `/` Bahaya, 7 di Cara kerja |

Saat reduce menyala, kilau judul, transisi tombol, meter skor, dan munculnya baris hasil semuanya mati. Saat reduce mati, semuanya menyala. Ini sesuai aturan DESIGN.md: semua gerak berada di dalam `@media (prefers-reduced-motion: no-preference)`.

---

## 4. Langkah uji di HP

Satu HP Android dengan Chrome dan satu iPhone dengan Safari. Pakai versi terbaru yang terpasang, lalu catat model HP, versi OS, dan versi browser di atas tabel masing-masing. Nama menu bisa sedikit berbeda antarmerek HP.

### Persiapan

1. Matikan mode gelap paksa (Chrome Android: Setelan → Tema → Default sistem; jangan nyalakan flag "Auto Dark Mode"). Ukuran teks browser biarkan 100%.
2. Buka https://job-shift-navy.vercel.app.

### Per halaman, tegak lalu miring

| Halaman | Yang dibuka |
| --- | --- |
| `/` kosong | Halaman utama baru dimuat |
| `/` Bahaya | Ketuk contoh "Kerja tugas online", ketuk **Cek**, tunggu "Hasil cek" muncul (Label Bahaya, Skor 100 dari 100) |
| Cara kerja | Ketuk "Cara kerja" di bilah atas |

Yang diperiksa (isi ✅ atau ❌ di matriks):

- **Tata letak:** gulir dari atas sampai kaki halaman. Halaman tidak bisa digeser ke samping, tidak ada teks terpotong atau tumpang-tindih, dan bilah atas muat satu baris.
- **Kontras:** semua teks terbaca jelas di luar ruangan dengan kecerahan layar sedang. Catat bagian yang sulit dibaca.
- **Huruf:** teks isi tidak terasa lebih kecil dari teks pesan di WhatsApp. Saat mengetik di kotak teks, halaman **tidak** memperbesar sendiri. Di Safari, zoom otomatis menandakan huruf input di bawah 16 px.
- **Target sentuh:** ketuk setiap tombol dan tautan dengan ibu jari. Tautan di tiket 18 sudah diketahui kecil, jadi cukup catat apakah sering meleset. Temuan lain dicatat baru.
- **Reduced motion:** lihat bagian berikut.

### Menyalakan reduce motion

- **Android:** Setelan → Aksesibilitas → **Hapus animasi** (di beberapa HP: Aksesibilitas → Peningkatan visibilitas → Hapus animasi, atau Opsi pengembang → skala animasi "Animasi mati"). Tutup Chrome sepenuhnya, lalu buka lagi.
- **iOS:** Pengaturan → Aksesibilitas → Gerakan → **Kurangi Gerakan** nyala. Tutup Safari dari pengalih aplikasi, lalu buka lagi.

Dengan reduce motion **nyala**: judul "Cek dulu sebelum transfer." tidak berkilau, meter skor langsung penuh tanpa animasi, dan baris hasil langsung tampil tanpa efek muncul. Lalu **matikan** lagi dan pastikan efek-efek itu kembali bergerak.

### Yang dikirim

Per HP: model, versi OS, versi browser, lalu satu screenshot per halaman per posisi (6 screenshot), ditambah screenshot setiap temuan dengan keterangan singkat. Hasilnya diisi ke matriks bagian 2.

(Belum ada hasil.)

---

## 5. Kesimpulan

**GAGAL** untuk saat ini. Di Chrome dan Firefox desktop, tata letak, kontras, huruf, dan reduced motion lulus, tapi target sentuh gagal karena 5 tautan teks dan skip link (tiket 18). Kriteria ini baru bisa lulus setelah tiket 18 selesai dan diukur ulang. Hasil Chrome Android dan Safari iOS masih ditunggu untuk memastikan tidak ada temuan lain.

---

## 6. Verifikasi reviewer (Zamil, 28 November 2026)

Diukur ulang di URL publik dengan browser bawaan Claude desktop (Chromium, macOS):

- **Target sentuh:** di 360 × 640 dan 1366 × 768, keenam target di tiket 18 terkonfirmasi kurang dari 44 px, dan tidak ada target lain yang kurang. Tingginya 19 px dan 21,5 px, bukan 21 dan 24 px seperti di Windows, karena metrik font. Lebarnya juga sedikit berbeda. Skip link 41,6 px di 360 px dan 46,8 px di 1366 px. Akar 16 px dan 18 px. Tautan Langkah 47 px per baris. Tidak ada gulir mendatar.
- **Kontras:** minimum dikoreksi dari 6,29 dan 7,05 menjadi 5,40 (lihat bagian 3). Tetap lulus.
- **Reduced motion:** semua `transition`, `animation`, dan `@keyframes` di `src/app/globals.css` berada di dalam `@media (prefers-reduced-motion: no-preference)`. Dengan `no-preference`, Chrome menjalankan 13 animasi di halaman cek, sama dengan angka Nadine. Mode `reduce` dan semua angka Firefox tidak diukur ulang.
- **Tiket temuan:** dinomori ulang dari 17 menjadi 18, karena 17 sudah dipakai `17-groq-api-key-production.md` di PR #11.
