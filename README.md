# JobShift

**JobShift — cek dulu sebelum transfer.**

Web app tanpa login untuk menilai risiko penipuan lowongan kerja yang diterima lewat WhatsApp, Telegram, atau media sosial, sebelum pencari kerja membayar atau mengirim data pribadi. Latar belakang produk ada di [PRD.md](PRD.md), istilahnya di [GLOSSARY.md](GLOSSARY.md), dan detail teknisnya di [spec MVP](.scratch/jobshift-mvp/spec.md).

> Status: kerangka (tiket 01). Belum ada Aturan maupun AI, jadi setiap Teks yang valid berlabel Risiko rendah dengan peringatan tetap.

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
- **Adapter AI** (`PenilaiAI`): `aiNonaktif` selalu mengembalikan `null`. Adapter Groq, Statis, dan Palsu menyusul di tiket 10.
- **Route API** (`src/app/api/cek/route.ts`): tipis, tanpa logika penilaian. Isi Teks tidak pernah ditulis ke log.
- **UI** (`src/ui`): hanya me-render `HasilCek`. Teks pengguna selalu di-render sebagai teks biasa, bukan HTML. Kode browser hanya mengimpor `@/cek/panjang` dan `@/cek/tipe`, bukan `@/cek`, supaya kode server (misalnya SDK AI) tidak ikut terkirim ke browser.
- **Panjang Teks** (`src/cek/panjang.ts`): batas 50–3.000 karakter setelah trim beserta pesannya dipakai bersama oleh UI dan API, jadi pesannya selalu sama.

## API

`POST /api/cek` dengan body `{ "teks": "..." }`.

- `200`: `HasilCek`.
- `400`: `{ "error": { "kode", "pesan" } }` dengan `kode` salah satu dari `teks_kosong`, `teks_terlalu_pendek`, `teks_terlalu_panjang`, atau `format_tidak_valid`.

```bash
curl -s -X POST http://localhost:3000/api/cek -H 'content-type: application/json' -d '{"teks":"Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD."}'
```

## Tes

Tes perilaku masuk lewat dua seam saja (spec, "Testing Decisions"):

- `cek(teks, { ai })`, di `src/cek/cek.test.ts`.
- Handler `POST` yang dipanggil langsung, di `src/app/api/cek/route.test.ts`.

Fungsi internal (regex, normalisasi, penggabung) tidak dites langsung.

## Deploy

Di-deploy ke Vercel dari branch `main`. API key (mulai tiket 10) hanya disimpan sebagai environment variable di Vercel, tidak pernah di repo.
