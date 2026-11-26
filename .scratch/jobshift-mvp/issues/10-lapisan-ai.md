# 10: Lapisan AI dengan Penyamaran

**What to build:** Setiap Cek juga dinilai Groq secara paralel dengan Aturan. Teks yang dikirim ke AI sudah disamarkan. AI hanya boleh menambah Tanda bahaya yang punya Kutipan pemicu sah (bobot 10, total maks +25), dan Penjelasan AI boleh menggantikan templat dalam kondisi tertentu. Kalau AI lambat atau gagal, hasil Aturan tetap tampil dengan catatan kecil. Lihat spec bagian Penyamaran dan lapisan AI, serta ADR-0001.

**Blocked by:** 03, 08

**Status:** ready-for-agent

- [ ] Penyamaran mengganti email, NIK (16 digit), nomor HP Indonesia, dan rekening (10–15 digit) dengan penanda; "Rp 8.000.000" tidak tersentuh; dites dengan adapter perekam
- [ ] Adapter Groq `openai/gpt-oss-120b` memakai strict `json_schema`, `maxRetries: 0`, dan log level tidak di bawah `warn`; API key hanya di env server
- [ ] Timeout 3,5 detik lewat `AbortSignal` dari inti; adapter lambat → hasil Aturan saja dengan `catatanAI` (dites dengan fake timers)
- [ ] Keluaran AI divalidasi Zod; skema rusak, 429, atau 5xx → `catatanAI`
- [ ] Butir AI dibuang kalau kutipannya tidak ada di Teks tersamar, memuat penanda `[…]`, atau beririsan dengan rentang Tanda bahaya Aturan
- [ ] Skor gabungan ≥ Skor Aturan saja (tes properti); sumbangan AI maksimal +25; AI sendirian tidak pernah membuat Bahaya
- [ ] `sumberPenilaian` bernilai "aturan+AI" kalau AI menjawab valid; Tanda bahaya AI tampil dan di-highlight seperti Tanda bahaya Aturan
- [ ] Penjelasan AI hanya dipakai kalau label versi AI = Label akhir, ≤ 3 kalimat, dan lolos filter kata terlarang; ada tes untuk Penjelasan AI yang memuat "aman"
- [ ] UI menampilkan catatan kecil kalau `catatanAI` ada
