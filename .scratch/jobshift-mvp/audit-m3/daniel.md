# Audit Rilis M3 — Tahap 1a (Daniel)

- **Tanggal uji:** 28 November 2026
- **Penguji:** Daniel
- **URL publik yang diuji:** https://job-shift-navy.vercel.app
- **Commit `main` yang diaudit:** `34a3826`
- **Cakupan Tahap 1a:**
  1. README, `npm test`, `npm run lint`, dan `npm run typecheck`
  2. Lighthouse Accessibility (preset mobile) di URL publik pada tiga keadaan
  3. Navigasi keyboard penuh, perpindahan fokus, dan region `aria-live`
  4. Ketahanan saat `GROQ_API_KEY` dimatikan pada 5 contoh

---

## 1. README, `npm test`, `npm run lint`, dan `npm run typecheck`

- **Status:** **GAGAL** (5 dari 513 tes gagal di Windows pada `src/dataset/cli.test.ts`; `README.md`, `npm run lint`, dan `npm run typecheck` **LULUS**)
- **Tiket temuan baru:** [16-path-windows-cek-dataset.md](../issues/16-path-windows-cek-dataset.md) (`Status: needs-triage`)

### Pemeriksaan & Pembaruan README
- **Sebelum dilengkapi:** [README.md](../../../README.md) masih memuat catatan status lama ("Status: tiket 03... Belum ada AI, dan Langkah aman masih kosong"), belum menjelaskan komponen yang sudah masuk di `main` (OCR Tesseract di browser, adapter Groq & Statis, Penyamaran, Langkah aman/darurat, halaman `/cara-kerja`), serta belum memuat bagian cara menjalankan evaluasi (`npm run eval` dan `npm run cek-dataset`).
- **Tindakan:** [README.md](../../../README.md) telah dilengkapi sehingga mencakup:
  - **Cara menjalankan:** `npm install`, `npm run dev` (termasuk penyalinan otomatis aset OCR Tesseract `ind+eng` ke `public/tesseract/`), dan konfigurasi opsional `GROQ_API_KEY` di `.env.local`.
  - **Arsitektur lengkap:** diagram dan penjelasan alur `Browser (src/ui) → POST /api/cek → cek(teks, { ai }) → HasilCek`, 18 Aturan di katalog (`R01`–`R17`, termasuk `R06a`, `R06b`, dan `R13` tersirat), Penyamaran data pribadi, adapter AI (`Groq`, `Statis`, `Palsu`/`Perekam`), serta halaman `/cara-kerja`.
  - **Cara eval (`npm run eval`):** penjelasan ketiga mode (`aturan`, `AI saja`, `gabungan`) dengan pemakaian ulang satu panggilan AI per contoh, metrik yang dicetak (recall, presisi, false positive, `Asli → Waspada`, confusion matrix 2×3, contoh sintetis, p95 latensi AI), serta contoh perintah untuk Set dev, `--model openai/gpt-oss-20b`, dan `--set test`.

### Hasil Eksekusi Perintah

| Perintah | Hasil | Angka / Rincian |
| --- | --- | --- |
| `npm run lint` | **LULUS** | Kode keluar `0` (0 error, 0 warning) |
| `npm run typecheck` | **LULUS** | Kode keluar `0` (`tsc --noEmit` bersih tanpa error) |
| `npm test` | **GAGAL (di Windows)** | 22 dari 23 file tes lulus (**508 dari 513 tes lulus**); 5 tes gagal di `src/dataset/cli.test.ts` |

**Rincian kegagalan `npm test` di Windows:**
- Semua tes inti penilaian (`src/cek/*.test.ts`), route API (`src/app/api/cek/route.test.ts`), evaluasi (`src/eval/*.test.ts`), validasi dataset (`src/dataset/validasi.test.ts`), dan UI/OCR (`src/ui/*.test.ts`) **lulus 100% (506/506 tes)**.
- Lima kegagalan terjadi di `src/dataset/cli.test.ts` karena `jalankanCekDataset` (`src/dataset/cli.ts` baris 39) memanggil `path.resolve(akar, ...)` sedangkan `src/dataset/cli.test.ts` memberikan `akar: "/repo"` dan memeriksa path berformat POSIX `"/repo/data/dev.jsonl"`. Di Windows, `path.resolve("/repo", "data/dev.jsonl")` menghasilkan `"D:\\repo\\data\\dev.jsonl"`, sehingga pencocokan kunci objek mock `adaFile` gagal.
- Sesuai aturan audit, kode produksi/tes tidak diubah di sini dan temuan dicatat sebagai tiket baru: [16-path-windows-cek-dataset.md](../issues/16-path-windows-cek-dataset.md).

---

## 2. Lighthouse Accessibility (Preset Mobile, URL Publik)

- **Status:** **LULUS** (Skor **100 / 100** di ketiga keadaan; target ≥ 95)

### Angka Hasil

| Keadaan | URL | Mode Lighthouse | Skor Accessibility |
| --- | --- | --- | --- |
| 1. Halaman `/` kosong | `https://job-shift-navy.vercel.app/` | `navigation` (mobile) | **100** |
| 2. Halaman `/` setelah Cek (tombol contoh Tugas → hasil tampil) | `https://job-shift-navy.vercel.app/` | `snapshot` / user flow (mobile) | **100** |
| 3. Halaman Cara kerja | `https://job-shift-navy.vercel.app/cara-kerja` | `navigation` (mobile) | **100** |

### Cara Uji
1. **Konfigurasi Lighthouse:** Lighthouse 13.6.0 dengan preset mobile bawaan (viewport `412 × 823`, `--only-categories=accessibility`), dijalankan terhadap URL publik `https://job-shift-navy.vercel.app` menggunakan Chromium headless lewat API Lighthouse user flow (`startFlow` dari `lighthouse` + `puppeteer-core`), serta diverifikasi ulang struktur DOM & atribut aksesibilitasnya lewat Chrome DevTools Protocol (CDP) pada Microsoft Edge Chromium headless dengan emulasi perangkat mobile (`412 × 823`, `deviceScaleFactor: 1.75`, `mobile: true`).
2. **Keadaan 1 (`/` kosong):** Audit `flow.navigate("https://job-shift-navy.vercel.app/")`.
   - Verifikasi DOM: `<html lang="id">`, `<title>JobShift — cek dulu sebelum transfer.</title>`, meta viewport `width=device-width, initial-scale=1`, 23 heading berurutan valid tanpa lompatan level (`h1` → `h2` → `h3`), 0 input tanpa `<label>`, 0 tombol tanpa nama aksesibel, 0 tautan tanpa nama aksesibel, 0 duplikat `id`.
3. **Keadaan 2 (`/` setelah Cek dengan contoh Tugas):** Karena navigasi biasa hanya memuat halaman kosong, pengujian memakai Lighthouse user flow mode **snapshot** (`flow.snapshot()`):
   - Buka `https://job-shift-navy.vercel.app/`.
   - Klik tombol contoh **"Kerja tugas online"** (`.daftar-contoh button` pertama) sehingga `textarea` terisi 358 karakter.
   - Klik tombol submit **"Cek"** (`button.tombol-cek`).
   - Tunggu elemen `<h2 id="judul-hasil" tabindex="-1">Hasil cek</h2>` muncul di dalam `<div aria-live="polite" class="wadah-hasil">` dengan kartu hasil **Label Bahaya (Skor 100 dari 100, Modus Tugas)**.
   - Jalankan `flow.snapshot()` dan pemeriksaan DOM saat kartu hasil beserta daftar Tanda bahaya, Langkah berikutnya, Langkah darurat (`h3` → `h4`), sorotan `<mark>`, dan legenda skala Label tampil lengkap (31 heading dengan urutan hierarki valid `h1` → `h2` → `h3` → `h4`, 0 pelanggaran label/kontras/ID).
4. **Keadaan 3 (`/cara-kerja`):** Audit `flow.navigate("https://job-shift-navy.vercel.app/cara-kerja")`.
   - Verifikasi DOM: `<html lang="id">`, `<title>Cara JobShift menilai lowongan · JobShift</title>`, 7 heading dengan hierarki valid (`h1` → `h2` → `h3`), 0 pelanggaran kontras atau atribut ARIA.

---

## 3. Alur Keyboard, Fokus, dan `aria-live`

- **Status:** **LULUS**

### Cara Uji
Diuji langsung pada `https://job-shift-navy.vercel.app` melalui Chrome DevTools Protocol (`Input.dispatchKeyEvent` untuk tombol `Tab`, `Shift+Tab`, `Space`, dan `Enter`, serta `Accessibility.getFullAXTree` untuk memeriksa accessibility tree) tanpa interaksi mouse:

1. **Urutan `Tab` dan keterlihatan fokus (`:focus-visible`):**
   - Setiap penekanan `Tab` dari awal halaman memindahkan `document.activeElement` secara berurutan ke:
     1. `a.lewati` ("Langsung ke kotak cek", `href="#kotak-cek"`)
     2. `a.logo` ("JobShift", `href="/"`)
     3. `a.tombol.tombol-kedua.tombol-kecil` ("Cara kerja", `href="#cara-kerja"`)
     4. `a.tombol.tombol-utama.tombol-kecil` ("Cek sekarang", `href="#kotak-cek"`)
     5. `button` contoh 1 ("Kerja tugas online")
     6. `button` contoh 2 ("Loker pabrik")
     7. `button` contoh 3 ("Kerja ke luar negeri")
     8. `button` contoh 4 ("Loker resmi")
     9. `textarea` ("Tempel teks lowongan di sini")
     10. `input[type="file"]` ("Atau unggah screenshot lowongan")
     11. `button.tombol-cek[type="submit"]` ("Cek")
     12. `a` ("Cara penilaian, akurasi, dan privasi", `href="/cara-kerja"`)
   - Pada **semua** elemen interaktif di atas, `el.matches(":focus-visible")` bernilai `true` dan gaya terhitung (`getComputedStyle`) menampilkan cincin fokus yang jelas:
     - `outline: rgb(165, 180, 252) solid 3px` (`--indigo-300`, `#a5b4fc`)
     - `outline-offset: 3px` (kontras terhadap latar `#030712` / `#111827` > 9:1, jauh di atas syarat non-teks 3:1).
2. **Aktivasi tombol contoh dan Cek dengan keyboard:**
   - Saat fokus berada di tombol **"Kerja tugas online"**, penekanan tombol `Space` mengisi `textarea` dengan teks contoh (358 karakter) dan memperbarui penghitung menjadi `358 / 3.000 karakter`.
   - Penekanan `Tab` membawa fokus melewati `textarea` dan `input[type="file"]` menuju tombol **"Cek"**.
   - Penekanan `Enter` pada tombol **"Cek"** mengirim permintaan `POST /api/cek` dan menampilkan hasil.
3. **Perpindahan fokus ke judul hasil setelah Cek:**
   - Begitu hasil selesai dirender, `document.activeElement` otomatis berpindah ke `<h2 id="judul-hasil" tabindex="-1">Hasil cek</h2>` (`fokusPindahKeJudulHasil: true`) dan memanggil `scrollIntoView({ block: "start" })`.
4. **Verifikasi region `aria-live` di DOM dan Accessibility Tree:**
   - Di DOM awal (sebelum Cek), `<div aria-live="polite" class="wadah-hasil"></div>` sudah terpasang kosong sehingga perubahan isinya dilacak oleh screen reader.
   - Setelah Cek, `<article class="hasil">` (yang memuat `#judul-hasil`, Label, Skor, Penjelasan, Tanda bahaya, Langkah aman, dan Langkah darurat) dirender di dalam `.wadah-hasil` (`diDalamAriaLive: true`).
   - Pemeriksaan `Accessibility.getFullAXTree` mengonfirmasi adanya node live region di accessibility tree:
     - Container hasil `.wadah-hasil`: `live: "polite"`, `atomic: false`, `relevant: "additions text"`.
     - Container status OCR `.status-ocr` (`role="status"`): `live: "polite"`, `atomic: true`, `relevant: "additions text"`.
5. **Navigasi keyboard ke `/cara-kerja` dan kembali ke `/`:**
   - Dari `#judul-hasil`, penekanan `Tab` menelusuri tautan kanal resmi di dalam hasil hingga mencapai tautan `<a href="/cara-kerja">Cara penilaian, akurasi, dan privasi</a>` (atau tautan yang sama di bawah tombol Cek).
   - Penekanan `Enter` membuka `https://job-shift-navy.vercel.app/cara-kerja` (`<h1>Cara JobShift menilai lowongan</h1>`).
   - Di `/cara-kerja`, penekanan `Tab` membawa fokus ke tautan `<a href="/#kotak-cek">Cek sekarang</a>` di header (dengan `outline: rgb(165, 180, 252) solid 3px`), dan penekanan `Enter` mengembalikan pengguna ke `https://job-shift-navy.vercel.app/#kotak-cek`.

---

## 4. Uji `GROQ_API_KEY` Dimatikan (5 Contoh)

- **Status:** **LULUS** (5 dari 5 contoh tetap mengembalikan `200 OK` dan berlabel; catatan perilaku adapter Statis dijelaskan di bawah)

### Koordinasi & Kondisi Environment
- Diuji pada deployment publik `https://job-shift-navy.vercel.app` saat `GROQ_API_KEY` dalam keadaan tidak aktif/kosong di server (terbukti dari setiap permintaan non-contoh yang langsung mengembalikan `sumberPenilaian: "aturan"` dan `catatanAI: "ai_tidak_tersedia"` tanpa panggilan ke Groq).
- Setelah pengujian selesai, pemilik project Vercel (Muhammad Zamil) diinformasikan untuk memastikan `GROQ_API_KEY` dipasang kembali pada environment production Vercel bila diperlukan untuk demo teks bebas.

### Cara Uji & Hasil 5 Contoh
Kelima contoh (4 tombol contoh siap pakai + 1 teks lowongan bebas) dikirim ke `POST https://job-shift-navy.vercel.app/api/cek` dari halaman publik:

| # | Contoh | HTTP | Label | Skor | Modus Terkuat | `sumberPenilaian` | `catatanAI` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Tombol contoh 1: **Kerja tugas online** | 200 | `bahaya` (Bahaya) | 100 | `tugas` | `aturan+AI` | *(tidak ada — dijawab adapter Statis)* |
| 2 | Tombol contoh 2: **Loker pabrik** | 200 | `bahaya` (Bahaya) | 95 | `lokal` | `aturan+AI` | *(tidak ada — dijawab adapter Statis)* |
| 3 | Tombol contoh 3: **Kerja ke luar negeri** | 200 | `bahaya` (Bahaya) | 100 | `luar_negeri` | `aturan+AI` | *(tidak ada — dijawab adapter Statis)* |
| 4 | Tombol contoh 4: **Loker resmi** | 200 | `risiko_rendah` (Risiko rendah) | 0 | `null` | `aturan+AI` | *(tidak ada — dijawab adapter Statis)* |
| 5 | **Teks bebas** (non-contoh): *"Dibutuhkan staf gudang dan pengemasan barang di Bandung. Hubungi WA 0812-3456-7890 sekarang juga untuk jadwal wawancara."* | 200 | `waspada` (Waspada) | 25 | `null` | `aturan` | `"ai_tidak_tersedia"` (tampil di UI: *"Penilaian AI sedang tidak tersedia, jadi hasil ini hanya dari pemeriksaan aturan JobShift."*) |

**Catatan Teknis:**
- Sesuai spesifikasi FR-08 dan implementasi di `src/app/api/cek/route.ts` (`penilaiStatis(penilaiGroqDariEnv())`), keempat tombol contoh siap pakai (#1–#4) selalu dijawab oleh **adapter AI Statis** (`src/cek/statis.ts`) dari memori server tanpa memanggil Groq, sehingga tetap menghasilkan `sumberPenilaian: "aturan+AI"` tanpa `catatanAI` walaupun `GROQ_API_KEY` dimatikan.
- Untuk teks apa pun di luar keempat contoh statis (#5, atau jika teks contoh diedit satu karakter saja), server jatuh ke `penilaiGroqDariEnv()` yang mengembalikan `null` saat `GROQ_API_KEY` tidak ada, sehingga hasil dinilai oleh mesin Aturan saja (`sumberPenilaian: "aturan"`), tetap berlabel dengan benar (`waspada`, Skor 25 dari R06a + R13), dan menampilkan `catatanAI: "ai_tidak_tersedia"` di UI.

