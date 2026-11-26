# 11: Skrip evaluasi `npm run eval`

**What to build:** Tim menjalankan satu perintah untuk mendapatkan angka akurasi yang jujur dari mode aturan, AI saja, dan gabungan, lalu hasilnya ditulis ke file yang dibaca halaman Cara kerja. Lihat spec bagian Dataset dan eval, serta PRD FR-12.

**Blocked by:** 02, 10

**Status:** ready-for-agent

- [ ] `npm run eval` (default Set dev) dan `--set test` membaca JSONL dan memanggil `cek()`
- [ ] Satu panggilan AI per contoh, direkam, lalu dipakai ulang untuk mode AI saja dan gabungan
- [ ] Mencetak recall (Palsu → Waspada/Bahaya), presisi, false positive (Asli → Bahaya), Asli → Waspada, tabel confusion 2×3 per mode, jumlah contoh sintetis, dan p95 latensi AI, masing-masing dengan pembilang/penyebut
- [ ] Mode AI saja menghitung Skor dari Tanda bahaya AI saja (tidak pernah Bahaya)
- [ ] Hasil Set test ditulis ke file JSON untuk halaman Cara kerja
- [ ] Bisa juga dijalankan dengan `gpt-oss-20b` untuk perbandingan model
