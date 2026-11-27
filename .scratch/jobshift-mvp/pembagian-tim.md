# Pembagian kerja tim JobShift MVP (4 orang)

Status: draf, dibuat 26 November 2026. Tim: Muhammad Zamil, Daniel, Ayudhya Naja, Nadine.

Dasar pembagian: [spec.md](spec.md), tiket di [issues/](issues/), dan milestone di [PRD.md](../../PRD.md) (M1 26 Nov, M2 27 Nov, M3 28 Nov 21.00, M4 29 Nov 21.00).

## Jalur kritis

```
01 Kerangka ──► 03 Mesin Aturan ──► 08 Langkah aman ──► 10 Lapisan AI ──► 11 Eval ──► 13 Cara kerja ──► 14 Audit M3
                     │                                        │                ▲              ▲
                     └──► 04/05/06/07 Aturan ─────────────────┴──► 12 Contoh ──┼──────────────┤
02 Dataset ────────────────────────────────────────────────────────────────────┘              │
09 OCR (setelah 01, paralel) ─────────────────────────────────────────────────────────────────┘
```

Semua tiket bergantung pada 01 dan 03. Tiket 10 menunggu 03 **dan 08** (milik Nadine), jadi 08 ada di jalur kritis. Tiket 10 adalah satu-satunya yang menggabungkan Aturan, AI, dan copy. Siapa pun yang memegang 01 → 03 → 10 menentukan apakah tim tepat waktu. Bagian itu dipegang Muhammad Zamil.

## Ringkasan peran

| Orang | Peran | Tiket | Pegang Set test? |
| --- | --- | --- | --- |
| **Muhammad Zamil** | Inti, arsitektur, dan desain web (lead teknis) | **01, 03, 10, 15** + integrasi & review semua PR | Tidak (menyetel Aturan) |
| Daniel | Katalog Aturan & Set dev | 04, 05, 06, 07 + Set dev (bagian dari 02) | Tidak (menyetel Aturan) |
| Ayudhya Naja | Data, evaluasi, kepercayaan | Set test (bagian dari 02), 11, 13, 14 | **Ya** |
| Nadine | Fitur UI dan copy (tanpa desain visual) | 08, 09, 12 | Tidak wajib; boleh jadi cadangan |

## Muhammad Zamil — Inti Cek, mesin Aturan, lapisan AI, desain web

Bagian paling krusial: fondasi yang dipakai semua orang, kontrak `HasilCek`, dan satu-satunya bagian yang menyentuh API key dan data pengguna ke AI.

1. **01 Kerangka dan deploy tracer** (hari ini, M1). Next.js + TS strict + ESLint + Vitest, `cek(teks, { ai })` dengan tipe `HasilCek` final, `POST /api/cek`, validasi panjang, deploy Vercel. Prioritas: kontrak `HasilCek` dan tipe `Aturan` di-commit sepagi mungkin agar Daniel dan Nadine bisa mulai.
2. **03 Mesin Aturan, R01/R02, Penyangkal, highlight.** Normalisasi dengan peta offset, Penyangkal (ADR-0002), Skor, ambang Label, Modus terkuat. Ini infrastruktur yang dipakai tiket 04–07.
3. **10 Lapisan AI dengan Penyamaran.** Groq `gpt-oss-120b` strict `json_schema`, timeout 3,5 detik lewat `AbortSignal`, validasi Zod, penyaringan butir AI, batas +25, Penjelasan AI (ADR-0001). API key hanya di env Vercel.
4. **15 Desain visual dan aksesibilitas tampilan.** Token warna dan tipografi di `globals.css`, tampilan halaman cek, kartu hasil, tombol contoh, unggah screenshot, dan Cara kerja; NFR-06/07 (kontras 4,5:1, 16 px, 44 px, 360 px, `prefers-reduced-motion`). Pemilik tunggal semua gaya visual.
5. **Integrasi.** Pemilik branch `main`, review dan merge PR anggota lain, menjaga `npm test` dan lint tetap hijau, dan pemilik deploy Vercel.

Yang diserahkan ke anggota lain lebih awal:
- Hari ini: tipe `HasilCek`, tipe `Aturan`, dan contoh satu Aturan → Daniel.
- Hari ini: halaman yang me-render `HasilCek` palsu → Nadine.
- Setelah 10: adapter perekam dan adapter Statis → Ayudhya Naja (eval) dan Nadine (contoh).

## Daniel — Katalog Aturan dan Set dev

1. **Set dev 60 contoh** (bagian dari 02), JSONL sesuai spec, sudah disamarkan. Target selesai 27 Nov pagi.
2. **04 Modus Tugas** (R06b, R07, R08).
3. **06 Modus Luar negeri** (R03, R05, R12, R16). Duluan dari 05 karena R04 memakai penanda luar negeri dari tiket ini.
4. **05 Modus Lokal** (R04, R11).
5. **07 Aturan umum dan tersirat** (R06a, R09, R10, R13, R14, R15). Katalog total ≥ 15 Aturan.
6. Menyetel bobot non-kritis hanya dengan Set dev, lalu membekukan bobot di M3.

Bisa mulai hari ini: mengumpulkan Set dev dan menulis daftar kata kunci per Aturan selagi tiket 03 dikerjakan.

## Ayudhya Naja — Dataset Set test, eval, Cara kerja, audit

Wajib orang yang **tidak** menyetel Aturan, supaya angka akurasi sah.

1. **Set test 40 contoh** (bagian dari 02), disimpan di luar repo sampai bobot dibekukan di M3. Dicatat sebagai pemegang Set test.
2. **11 Skrip eval** `npm run eval` (mode aturan, AI saja, gabungan; juga `gpt-oss-20b`).
3. **13 Halaman Cara kerja**, angka dibaca dari file hasil eval.
4. **14 Audit rilis M3** di URL publik: Lighthouse, HP sungguhan, 20 percobaan p95, uji API key mati.
5. README bagian eval dan arsitektur (bersama Zamil).

Bisa mulai hari ini: Set test, dan kerangka skrip eval dengan `cek()` dari tiket 01.

## Nadine — Fitur UI dan copy

Desain visual dipegang Zamil (tiket 15). Nadine menulis markup yang semantik dan fungsional (label, `aria-*`, urutan fokus) tanpa menambah warna, font, atau tata letak baru; pakai kelas yang sudah ada atau biarkan polos, nanti Zamil yang merapikan.

1. **08 Penjelasan, Langkah aman, Langkah darurat** — kerjakan begitu 03 di-merge, karena tiket 10 milik Zamil menunggu tiket ini. Copy statis per Label dan per Modus, cek manual semua URL resmi, tes kata terlarang.
2. **09 Input screenshot dengan OCR** di browser. Boleh dimulai selagi menunggu 03, tapi dijeda begitu 03 di-merge supaya 08 selesai duluan (Tesseract.js, Web Worker, data bahasa di-host sendiri).
3. **12 Contoh siap pakai** (4 tombol + adapter Statis dari Zamil).
4. Perilaku aksesibilitas di fitur sendiri: `aria-live` untuk progres OCR, tombol contoh bisa dipakai dengan keyboard. Gaya visualnya di tiket 15.

Bisa mulai hari ini: menulis copy 08 sebagai data statis, dan 09 (cukup butuh 01) sambil menunggu 03. Prioritas setelah 03 di-merge: 08, lalu 09, lalu 12.

## Jadwal

| Waktu | Zamil | Daniel | Ayudhya Naja | Nadine |
| --- | --- | --- | --- | --- |
| Kam 26 Nov | 01 + deploy (M1), mulai 03 | Set dev, draf kata kunci | Set test | Copy 08, mulai 09 |
| Jum 27 Nov | Selesai 03, kerjakan 10 setelah 08 masuk | 04 → 06 → 05 → 07, satu per satu | Set test | 08 begitu 03 masuk, lalu 09 |
| Sab 28 Nov | Selesai 10, desain 15, integrasi | Setel bobot di Set dev, bekukan | 11, 13, lalu 14 sebelum 21.00 | 12, bantu cek di HP |
| Min 29 Nov | README, perbaikan hasil audit | Proposal | Proposal, angka akurasi | Video demo |

## Aturan kerja bersama

Langkah demi langkah beserta perintahnya: [panduan-kerja-tim.md](panduan-kerja-tim.md).


- Satu branch per tiket, PR ke `main`, di-review dan di-merge oleh Zamil.
- Tes perilaku hanya lewat `cek(teks, { ai })` (spec, Testing Decisions).
- Jangan ubah kontrak `HasilCek` tanpa persetujuan Zamil.
- Set test tidak dibuka oleh Zamil atau Daniel sebelum bobot dibekukan.
- Jangan commit API key atau data pribadi sungguhan.
