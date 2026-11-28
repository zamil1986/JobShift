# Audit Rilis M3 — Tahap 1b (Nadine)

- **Tanggal uji:** 28 November 2026
- **Penguji:** Nadine (desktop diukur dengan bantuan Claude; HP diuji sendiri)
- **URL publik yang diuji:** https://job-shift-navy.vercel.app
- **Commit `main` saat audit:** `34a3826` (Vercel production dideploy dari `main`)
- **Kriteria tiket 14 yang diaudit:** "Tampilan benar di Chrome Android, Safari iOS, Chrome dan Firefox desktop, mulai lebar 360 px; kontras, huruf 16 px, target 44 px, `prefers-reduced-motion`" (PRD NFR-06, NFR-07)
- **Status kriteria:** **BELUM DIPUTUSKAN.** Desktop selesai diuji. Chrome Android dan Safari iOS menunggu hasil dari HP sungguhan.
- **Tiket temuan baru:** [17-target-sentuh-tautan-teks.md](../issues/17-target-sentuh-tautan-teks.md) (`Status: needs-triage`)

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
- **`/` Bahaya:** klik contoh "Kerja tugas online", klik Cek, lalu tunggu `#judul-hasil`. Hasil yang tampil: Label Bahaya, Skor 100 dari 100.
- **Cara kerja:** `/cara-kerja`.

Ukuran diambil dari computed style di halaman:

- **Tata letak:** gulir mendatar (`scrollWidth − clientWidth`), elemen yang menonjol keluar layar, dan teks yang terpotong. Screenshot diperiksa mata: 360 px per potongan 1.280 px sepanjang halaman, 768 px dan desktop per layar.
- **Huruf:** `font-size` setiap elemen yang memuat teks terlihat. Teks di dalam SVG ilustrasi dan teks `sr-only` (1 px) tidak dihitung.
- **Kontras:** warna teks dibandingkan dengan latar efektif (warna latar leluhur ditumpuk), dengan rumus WCAG 2.1. Batasnya 4,5:1, atau 3:1 untuk teks besar. Judul bergradien (`background-clip: text`) dihitung terpisah dari warna ujung gradiennya.
- **Target sentuh:** `getBoundingClientRect()` semua `a[href]`, `button`, `input`, `textarea`, `select`, `summary`, dan `[tabindex]` yang terlihat.
- **Reduced motion:** `matchMedia('(prefers-reduced-motion: reduce)')`, jumlah `document.getAnimations()` yang berjalan, dan jumlah elemen yang computed `animation-name`-nya bukan `none` atau `transition-duration`-nya > 0.

### HP sungguhan

Lihat bagian 4. Hasilnya diisi dari laporan dan screenshot Nadine, tidak dikarang.

---

## 2. Matriks uji

Keterangan: ✅ lulus, ❌ gagal (lihat catatan), ⏳ belum diuji, — tidak berlaku.

### Chrome desktop

| Halaman | Lebar | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | 360 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Tautan sumber fakta 62 × 21 dan 147 × 21, skip link 193 × 41,6, tautan disclaimer terlipat dua baris 21 px (tiket 17) |
| `/` kosong | 768 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama, ditambah tautan disclaimer 241 × 21 |
| `/` kosong | 1366 | ✅ | ✅ min 6,29 | ✅ min 18 | ❌ | ✅ 0 animasi | Tautan disclaimer 272 × 24, tautan sumber 70 × 24 dan 166 × 24; skip link lulus |
| `/` Bahaya | 360 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Seperti `/` kosong, ditambah tautan di bawah legenda 241 × 21 |
| `/` Bahaya | 768 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Seperti di atas |
| `/` Bahaya | 1366 | ✅ | ✅ min 6,29 | ✅ min 18 | ❌ | ✅ 0 animasi | Seperti di atas, 24 px |
| Cara kerja | 360 | ✅ | ✅ min 7,05 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 768 | ✅ | ✅ min 7,05 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 1366 | ✅ | ✅ min 7,05 | ✅ min 18 | ✅ | ✅ 0 animasi | — |

### Firefox desktop

| Halaman | Lebar | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | 360 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Ukuran target sama dengan Chrome (selisih ≤ 0,1 px) |
| `/` kosong | 768 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` kosong | 1366 | ✅ | ✅ min 6,29 | ✅ min 18 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 360 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 768 | ✅ | ✅ min 6,29 | ✅ min 16 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| `/` Bahaya | 1366 | ✅ | ✅ min 6,29 | ✅ min 18 | ❌ | ✅ 0 animasi | Sama dengan Chrome |
| Cara kerja | 360 | ✅ | ✅ min 7,05 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 768 | ✅ | ✅ min 7,05 | ✅ min 16 | ✅ | ✅ 0 animasi | — |
| Cara kerja | 1366 | ✅ | ✅ min 7,05 | ✅ min 18 | ✅ | ✅ 0 animasi | — |

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
| (desktop) | — | — | — | — | — | — | Tidak berlaku untuk HP |

### Safari iOS (HP sungguhan)

| Halaman | Posisi HP | Tata letak | Kontras | Huruf ≥ 16 px | Target ≥ 44 px | Reduced motion | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` kosong | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` kosong | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| `/` Bahaya | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | tegak | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Cara kerja | miring | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| (desktop) | — | — | — | — | — | — | Tidak berlaku untuk HP |

---

## 3. Rincian hasil desktop

### Tata letak

- Tidak ada gulir mendatar di 18 kombinasi (2 browser × 3 halaman × 3 lebar). Tidak ada teks terpotong dan tidak ada elemen yang keluar layar.
- Di 360 px, bilah memuat logo, "Cara kerja", dan "Cek sekarang" dalam satu baris. Keempat tombol contoh terlipat jadi dua baris. Kartu hasil, daftar Tanda bahaya, Langkah, "Kalau sudah telanjur", Teks yang dicek dengan `<mark>`, legenda Label, kartu fakta, dan kaki halaman tersusun satu kolom tanpa tumpang-tindih.
- Di 768 px dan 1366 px, panel alat rata tengah dan kisi kartu berubah sesuai titik henti DESIGN.md.
- Tinggi halaman di Chrome dan Firefox hampir sama (selisih ≤ 23 px), jadi tata letaknya konsisten di kedua mesin render.

### Kontras

- Kontras terendah dari pengukuran otomatis adalah 6,29:1 di halaman cek dan 7,05:1 di Cara kerja. Tidak ada teks di bawah 4,5:1, dan angkanya sama di Chrome dan Firefox.
- Judul bergradien tidak bisa diukur per piksel, jadi dihitung dari ujung gradien `--gradien-judul`. Warna paling gelapnya `indigo-300` (`#a5b4fc`), dengan rasio 10,10:1 di atas latar `#030712`, 9,52:1 di atas kartu `#0b101e`, dan 8,90:1 di atas panel `#111827`.
- Skip link: teks `#030712` di atas `indigo-300`, rasio 10,10:1.
- Angka ini cocok dengan tabel kontras di catatan verifikasi tiket 15.

### Huruf

- Ukuran huruf terkecil yang terlihat adalah 16 px di 360 dan 768 px, dan 18 px di 1366 px (ukuran akar naik ke 112,5% mulai 64rem).
- Tidak ada teks terlihat yang di bawah 16 px.

### Target sentuh

Semua tombol, kotak teks, input screenshot, tautan Langkah, tautan kaki halaman, dan semua tautan di Cara kerja ≥ 44 px. Ada 5 target yang kurang, dan ukurannya sama persis di Chrome dan Firefox:

| Target | 360 / 768 px | 1366 px |
| --- | --- | --- |
| "Cara penilaian, akurasi, dan privasi" di disclaimer bawah tombol Cek | 241 × 21 (di 360 terlipat dua baris, tiap baris 21 px) | 272 × 24 |
| "Cara penilaian, akurasi, dan privasi" di bawah legenda hasil | 241 × 21 | 272 × 24 |
| "Katadata" (dua kartu fakta) | 62 × 21 | 70 × 24 |
| "Kontan, 17 Nov 2026" | 147 × 21 | 166 × 24 |
| Skip link "Langsung ke kotak cek" (saat difokus) | 193 × 41,6 | lulus |

Semuanya dicatat di [tiket 17](../issues/17-target-sentuh-tautan-teks.md) beserta screenshot. Pengecualian "tautan di dalam kalimat" dari WCAG tidak dipakai di sini, karena NFR-06 dan DESIGN.md meminta 44 px tanpa pengecualian.

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

Hasilnya diisi ke matriks bagian 2 setelah Nadine mengirim laporan dan screenshot.

(Belum ada hasil.)

---

## 5. Kesimpulan

Menunggu hasil Chrome Android dan Safari iOS. Untuk desktop, Chrome dan Firefox lulus untuk tata letak, kontras, huruf, dan reduced motion, tapi gagal di target sentuh karena 5 tautan (tiket 17).
