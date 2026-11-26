# JobShift

**JobShift — cek dulu sebelum transfer.**

Web app tanpa login untuk menilai risiko penipuan lowongan kerja yang diterima lewat WhatsApp, Telegram, atau media sosial, sebelum pencari kerja membayar atau mengirim data pribadi. Latar belakang produk ada di [PRD.md](PRD.md), istilahnya di [GLOSSARY.md](GLOSSARY.md), dan detail teknisnya di [spec MVP](.scratch/jobshift-mvp/spec.md).

> Status: tiket 03. Mesin Aturan dengan Aturan kritis R01 (minta uang di awal) dan R02 (minta OTP/PIN/password), Penyangkal (ADR-0002), Skor, Label, Modus, dan sorotan Kutipan pemicu di Teks asli. Belum ada AI, dan Langkah aman masih kosong (tiket 08).

## Menjalankan

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
```

```bash
npm run dev
```

Buka http://localhost:3000.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm test` | Semua tes Vitest, sekali jalan |
| `npm run test:watch` | Tes dalam mode watch |
| `npm run lint` | ESLint (harus tanpa error) |
| `npm run typecheck` | TypeScript strict tanpa emit |
| `npm run build` | Build produksi |

Satu file tes saja: `npx vitest run src/cek/cek.test.ts`.

## Arsitektur

```
Browser (src/ui)            Server                          Inti (src/cek)
FormCek ── POST /api/cek ──► src/app/api/cek/route.ts ────► cek(teks, { ai }) → HasilCek
TampilanHasil ◄── JSON ─────  parse JSON → cek() → JSON
```

- **Inti Cek** (`src/cek`): `cek(teks, { ai })` adalah satu-satunya pintu masuk penilaian dan mengembalikan `HasilCek` (`src/cek/tipe.ts`, disalin persis dari spec). Teks di luar batas melempar `TeksTidakValid` yang membawa `kode` dan `pesan`.
- **Mesin Aturan** (`src/cek/aturan`, privat untuk inti): Teks dinormalisasi (huruf kecil, spasi dipadatkan) dengan peta offset ke Teks asli, jadi `kutipan` selalu potongan persis dari Teks asli lewat `rentang`. Katalog ada di `katalog.ts`; setiap Aturan punya ID, alasan, pola (kata utuh), bobot, status kritis, Modus, dan apakah Penyangkal berlaku. Skor, Label, dan Modus terkuat dihitung di `src/cek/skor.ts`.
- **Adapter AI** (`PenilaiAI`): `aiNonaktif` selalu mengembalikan `null`. Adapter Groq, Statis, dan Palsu menyusul di tiket 10.
- **Route API** (`src/app/api/cek/route.ts`): tipis, tanpa logika penilaian. Isi Teks tidak pernah ditulis ke log.
- **UI** (`src/ui`): hanya me-render `HasilCek`. Teks pengguna selalu di-render sebagai teks biasa, bukan HTML. Kode browser hanya mengimpor `@/cek/panjang`, `@/cek/pesan`, dan `@/cek/tipe`, bukan `@/cek`, supaya kode server (misalnya SDK AI) tidak ikut terkirim ke browser.
- **Panjang Teks dan pesan** (`src/cek/panjang.ts`, `src/cek/pesan.ts`): batas 50–3.000 karakter setelah trim dan pesan error dipakai bersama oleh UI dan API, jadi pesannya selalu sama.

## API

`POST /api/cek` dengan body `{ "teks": "..." }`.

- `200`: `HasilCek`.
- `400`: `{ "error": { "kode", "pesan" } }` dengan `kode` salah satu dari `teks_kosong`, `teks_terlalu_pendek`, `teks_terlalu_panjang`, atau `format_tidak_valid`.
- `500`: `{ "error": { "kode": "kesalahan_server", "pesan" } }` kalau Cek gagal karena kesalahan tak terduga. Kode ini di luar kontrak 400 di spec.

```bash
curl -s -X POST http://localhost:3000/api/cek -H 'content-type: application/json' -d '{"teks":"Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD."}'
```

## Tes

Tes perilaku masuk lewat dua seam saja (spec, "Testing Decisions"):

- `cek(teks, { ai })`, di `src/cek/*.test.ts`. Opsi `{ aturan }` mengganti katalog dengan Aturan sintetis, khusus untuk tes yang butuh bobot di luar katalog (batas Label 24/25/59/60 dan seri Modus terkuat). Route API tidak pernah mengisinya.
- Handler `POST` yang dipanggil langsung, di `src/app/api/cek/route.test.ts`.

Fungsi internal (regex, normalisasi, penggabung) tidak dites langsung.

## Deploy

Target deploy: Vercel, dari branch `main` (milestone M1). API key (mulai tiket 10) hanya disimpan sebagai environment variable di Vercel, tidak pernah di repo.
