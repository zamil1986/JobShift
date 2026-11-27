# 11: Skrip evaluasi `npm run eval`

**What to build:** Tim menjalankan satu perintah untuk mendapatkan angka akurasi yang jujur dari mode aturan, AI saja, dan gabungan, lalu hasilnya ditulis ke file yang dibaca halaman Cara kerja. Lihat spec bagian Dataset dan eval, serta PRD FR-12.

**Blocked by:** 02, 10

**Status:** ready-for-agent

- [x] `npm run eval` (default Set dev) dan `--set test` membaca JSONL dan memanggil `cek()`
- [x] Satu panggilan AI per contoh, direkam, lalu dipakai ulang untuk mode AI saja dan gabungan
- [x] Mencetak recall (Palsu → Waspada/Bahaya), presisi, false positive (Asli → Bahaya), Asli → Waspada, tabel confusion 2×3 per mode, jumlah contoh sintetis, dan p95 latensi AI, masing-masing dengan pembilang/penyebut
- [x] Mode AI saja menghitung Skor dari Tanda bahaya AI saja (tidak pernah Bahaya)
- [x] Hasil Set test ditulis ke file JSON untuk halaman Cara kerja
- [x] Bisa juga dijalankan dengan `gpt-oss-20b` untuk perbandingan model

## Comments

**2026-11-27, implementasi:**
- Skrip evaluasi di `src/eval/eval.ts`, CLI runner di `src/eval/cli.ts`, dan entrypoint `scripts/eval.mjs` (`npm run eval`).
- `buatPenilaiGroq` dan `penilaiGroqDariEnv` di `src/cek/groq.ts` menerima opsi `model` (termasuk alias `gpt-oss-20b` → `openai/gpt-oss-20b`).
- `npm run eval` default membaca `data/dev.jsonl`; `--set test` membaca `data/test.jsonl` dan menulis hasil ke `src/data/hasil-eval.json`.
- **Belum diverifikasi pada dataset nyata / Groq live:** `data/dev.jsonl` dan `data/test.jsonl` belum ada di repo. Pengujian memakai dataset kecil buatan dan `penilaiPalsu` tanpa memanggil Groq.
