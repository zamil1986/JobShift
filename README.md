# JobShift

**JobShift — cek dulu sebelum transfer.**

Web app tanpa login untuk menilai risiko penipuan lowongan kerja yang diterima lewat WhatsApp, Telegram, atau media sosial, sebelum pencari kerja membayar atau mengirim data pribadi. Latar belakang produk ada di [PRD.md](PRD.md), istilahnya di [GLOSSARY.md](GLOSSARY.md), dan detail teknisnya di [spec MVP](.scratch/jobshift-mvp/spec.md).

## Menjalankan

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
```

```bash
npm run dev
```

Buka http://localhost:3000. Skrip `predev` dan `prebuild` otomatis menyalin aset OCR Tesseract (`ind` + `eng`) ke `public/tesseract/` supaya OCR di browser berjalan tanpa bergantung pada CDN pihak ketiga.

Untuk mengaktifkan lapisan AI (Groq) di lokal, buat `.env.local` berisi:

```bash
GROQ_API_KEY=gsk_...
```

Tanpa `GROQ_API_KEY`, aplikasi tetap berjalan penuh dengan mesin Aturan saja dan menyertakan `catatanAI: "ai_tidak_tersedia"` (kecuali untuk 4 tombol contoh siap pakai yang dijawab oleh adapter Statis).

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan (menyalin aset OCR lebih dulu) |
| `npm test` | Semua tes Vitest, sekali jalan |
| `npm run test:watch` | Tes dalam mode watch |
| `npm run lint` | ESLint (harus tanpa error) |
| `npm run typecheck` | TypeScript strict tanpa emit |
| `npm run build` | Build produksi (menyalin aset OCR lebih dulu) |
| `npm run eval` | Evaluasi akurasi pada dataset (`data/dev.jsonl` secara bawaan) |
| `npm run cek-dataset` | Validasi format dan penyamaran data pribadi pada file dataset JSONL |

Satu file tes saja: `npx vitest run src/cek/cek.test.ts`.

## Arsitektur

```
Browser (src/ui)                  Server                          Inti (src/cek)
FormCek / UnggahScreenshot ──► POST /api/cek (route.ts) ────► cek(teks, { ai }) → HasilCek
TampilanHasil ◄──── JSON ──────── parse JSON → cek() → JSON
```

- **Inti Cek** (`src/cek`): `cek(teks, { ai })` adalah satu-satunya pintu masuk penilaian dan mengembalikan `HasilCek` (`src/cek/tipe.ts`, disalin persis dari spec). Urutan di dalamnya:
  1. validasi panjang (`50`–`3.000` karakter setelah trim; di luar batas melempar `TeksTidakValid`);
  2. Penyamaran data pribadi (`[EMAIL]`, `[NIK]`, `[NOMOR]`, `[REKENING]`) di `src/cek/penyamaran.ts`, lalu panggilan AI atas Teks tersamar dimulai lebih dulu dengan batas waktu 3,5 detik (`AbortSignal`, `src/cek/panggil-ai.ts`);
  3. sementara AI berjalan, mesin Aturan menilai Teks asli (sinkron dan deterministik). AI yang timeout, gagal, atau keluarannya tidak lolos skema membuat hasil dinilai Aturan saja dengan `catatanAI: "ai_tidak_tersedia"`;
  4. validasi skema Zod (`src/cek/skema-ai.ts`) dan penyaringan Tanda bahaya AI (`src/cek/gabung-ai.ts`: kutipan wajib ada di Teks tersamar, minimal 2 kata, bebas penanda, bebas kata terlarang, dan tidak beririsan dengan Tanda bahaya Aturan);
  5. perhitungan Skor (`0`–`100`), Label (`risiko_rendah` 0–24, `waspada` 25–59, `bahaya` ≥ 60), dan Modus terkuat (`luar_negeri`, `lokal`, `tugas`) di `src/cek/skor.ts`;
  6. penyusunan Penjelasan (`src/cek/penjelasan.ts`, maksimal 3 kalimat dan difilter terhadap kata terlarang `aman`, `asli`, `legit`, `terpercaya` di `src/cek/kata-terlarang.ts`) serta Langkah aman dan Langkah darurat (`src/cek/langkah.ts`).
- **Mesin Aturan** (`src/cek/aturan`, privat untuk inti): Teks dinormalisasi (huruf kecil, spasi dipadatkan) dengan peta offset ke Teks asli, jadi `kutipan` selalu potongan persis dari Teks asli lewat `rentang`. Katalog (`katalog.ts`) memuat 18 Aturan (`R01`–`R17`, termasuk `R06a` dan `R06b`): empat Aturan kritis berbobot 60 (`R01`, `R02`, `R03`, `R07`) yang dibatalkan oleh Penyangkal ≤ 3 kata sebelum pemicu dalam klausa yang sama (ADR-0002), aturan per Modus (`tugas`, `lokal`, `luar_negeri`), aturan umum, serta aturan ketiadaan `R13` yang menghasilkan `tandaBahayaTersirat` bila nama badan usaha dan alamat sama-sama tidak ada.
- **Adapter AI** (`PenilaiAI`):
  - **Groq** (`src/cek/groq.ts`): memanggil `openai/gpt-oss-120b` (atau `openai/gpt-oss-20b` saat perbandingan eval) dengan `strict: true` `json_schema`.
  - **Statis** (`src/cek/statis.ts`): mengembalikan keluaran AI tersimpan untuk 4 contoh siap pakai (`src/cek/contoh.ts`) berdasarkan hash SHA-256 Teks tersamar yang dinormalisasi, tanpa memanggil jaringan, lalu meneruskan teks lain ke adapter Groq.
  - **Palsu & Perekam** (`src/cek/ai.ts`): dipakai di tes dan skrip evaluasi.
- **Route API** (`src/app/api/cek/route.ts`): tipis, tanpa logika penilaian (`parse JSON → cek() → JSON`). Isi Teks tidak pernah ditulis ke log.
- **UI & OCR** (`src/ui`, `src/app`):
  - Halaman utama (`/`) menampilkan `FormCek` (4 tombol contoh siap pakai, kotak teks dengan penghitung karakter, `UnggahScreenshot` dengan OCR Tesseract.js Web Worker berbahasa `ind+eng` di browser) dan `TampilanHasil` (di dalam region `aria-live="polite"`, fokus berpindah ke `#judul-hasil` setelah Cek, sorotan `<mark>` di `TeksBersorotan` sebagai node teks tanpa `dangerouslySetInnerHTML`).
  - Halaman Cara kerja (`/cara-kerja`) menampilkan ringkasan aturan tanpa ID teknis (`src/cek/ringkasan-aturan.ts`), angka evaluasi Set test dari `src/data/hasil-eval.json` (dibaca saat build oleh `src/eval/hasil-tersimpan.ts`), batasan, dan kebijakan privasi.

## Evaluasi (`npm run eval`)

Skrip evaluasi (`scripts/eval.mjs` → `src/eval/cli.ts` & `src/eval/eval.ts`) membaca dataset JSONL (`{ id, teks, kebenaran: "palsu" | "asli", modus?, sumber, sintetis }`) dan menilai setiap contoh dalam tiga mode sekaligus:

1. **Mode `aturan`**: hanya mesin Aturan (tanpa AI).
2. **Mode `AI saja`**: hanya Tanda bahaya AI yang sah (sumbangan Skor maksimal +25, sehingga tidak pernah mencapai Label Bahaya sesuai ADR-0001).
3. **Mode `gabungan`**: mesin Aturan + AI (`cek(teks, { ai })`).

AI dipanggil sekali per contoh (lewat mode `gabungan`), keluarannya direkam, lalu dipakai ulang untuk mode `AI saja`, sehingga hemat kuota dan kedua mode menilai jawaban AI yang sama.

Skrip membaca `GROQ_API_KEY` dari `.env.local` atau `.env`. Tanpa key, mode `AI saja` dan `gabungan` tidak mendapat jawaban AI (laporan mencetak `AI gagal/timeout: N/N`), jadi angkanya tidak bisa dipakai sebagai angka AI.

Untuk setiap mode, skrip mencetak:
- Recall (`Palsu → Waspada atau Bahaya`) lengkap dengan pembilang/penyebut dan persentase
- Presisi
- False positive (`Asli → Bahaya`)
- `Asli → Waspada`
- Tabel confusion 2×3 (`Palsu`/`Asli` terhadap `Risiko rendah`/`Waspada`/`Bahaya`)
- Jumlah contoh sintetis dan persentil ke-95 (`p95`) latensi AI

Contoh perintah:

```bash
# Evaluasi pada Set dev (data/dev.jsonl, bawaan)
npm run eval

# Evaluasi dengan model pembanding gpt-oss-20b pada Set dev
npm run eval -- --model openai/gpt-oss-20b

# Evaluasi pada Set test (data/test.jsonl) — hanya dijalankan pemegang Set test
# setelah bobot Aturan dibekukan; otomatis menulis src/data/hasil-eval.json
npm run eval -- --set test

# Validasi skema dan penyamaran dataset JSONL (bawaan: data/dev.jsonl)
npm run cek-dataset

# Validasi Set test yang masih disimpan di luar repo, sekaligus cek kebocoran ke Set dev
npm run cek-dataset -- --set test ~/jobshift-set-test/test.jsonl
```

## API

`POST /api/cek` dengan body `{ "teks": "..." }`.

- `200`: `HasilCek`.
- `400`: `{ "error": { "kode", "pesan" } }` dengan `kode` salah satu dari `teks_kosong`, `teks_terlalu_pendek`, `teks_terlalu_panjang`, atau `format_tidak_valid`.
- `500`: `{ "error": { "kode": "kesalahan_server", "pesan" } }` kalau Cek gagal karena kesalahan tak terduga. Kode ini di luar kontrak 400 di spec.

```bash
curl -s -X POST http://localhost:3000/api/cek -H 'content-type: application/json' -d '{"teks":"Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD."}'
```

## Tes

Tes perilaku masuk lewat seam publik (spec, "Testing Decisions"):

- `cek(teks, { ai })`, di `src/cek/*.test.ts`. Tes yang butuh bobot di luar katalog (batas Label 24/25/59/60 dan seri Modus terkuat) memakai `buatCek(katalog)` dengan Aturan sintetis, di `src/cek/skor.test.ts`. `cek` sendiri adalah `buatCek(KATALOG)`; `buatCek` tidak diekspor dari `@/cek`.
- Handler `POST` yang dipanggil langsung, di `src/app/api/cek/route.test.ts`.
- Modul evaluasi, validasi dataset, OCR/gambar, dan halaman Cara kerja di `src/eval/*.test.ts`, `src/dataset/*.test.ts`, serta `src/ui/*.test.ts`.

Fungsi internal mesin Aturan (regex, normalisasi, penggabung) tidak dites langsung.

## Deploy

URL publik: **https://job-shift-navy.vercel.app** (milestone M1).

Project Vercel `job-shift` terhubung ke repo GitHub dan otomatis deploy production dari branch `main`; branch lain mendapat preview deployment. Vercel menjalankan `npm run build`, jadi `prebuild` ikut jalan dan menyalin aset OCR ke `public/tesseract/` di server build. Folder itu tetap di-gitignore.

`GROQ_API_KEY` hanya disimpan sebagai environment variable di dashboard Vercel (Settings → Environment Variables), tidak pernah di repo. Tanpa key, Cek tetap jalan dan dinilai Aturan saja (`catatanAI: "ai_tidak_tersedia"`). Perubahan env baru berlaku setelah redeploy.
