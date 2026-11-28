# 10: Lapisan AI dengan Penyamaran

**What to build:** Setiap Cek juga dinilai Groq secara paralel dengan Aturan. Teks yang dikirim ke AI sudah disamarkan. AI hanya boleh menambah Tanda bahaya yang punya Kutipan pemicu sah (bobot 10, total maks +25), dan Penjelasan AI boleh menggantikan templat dalam kondisi tertentu. Kalau AI lambat atau gagal, hasil Aturan tetap tampil dengan catatan kecil. Lihat spec bagian Penyamaran dan lapisan AI, serta ADR-0001.

**Blocked by:** 03, 08

**Status:** selesai

- [x] Penyamaran mengganti email, NIK (16 digit), nomor HP Indonesia, dan rekening (10–15 digit) dengan penanda; "Rp 8.000.000" tidak tersentuh; dites dengan adapter perekam
- [x] Adapter Groq `openai/gpt-oss-120b` memakai strict `json_schema`, `maxRetries: 0`, dan log level tidak di bawah `warn`; API key hanya di env server
- [x] Timeout 3,5 detik lewat `AbortSignal` dari inti; adapter lambat → hasil Aturan saja dengan `catatanAI` (dites dengan fake timers)
- [x] Keluaran AI divalidasi Zod; skema rusak, 429, atau 5xx → `catatanAI`
- [x] Butir AI dibuang kalau kutipannya tidak ada di Teks tersamar, memuat penanda `[…]`, atau beririsan dengan rentang Tanda bahaya Aturan
- [x] Skor gabungan ≥ Skor Aturan saja (tes properti); sumbangan AI maksimal +25; AI sendirian tidak pernah membuat Bahaya
- [x] `sumberPenilaian` bernilai "aturan+AI" kalau AI menjawab valid; Tanda bahaya AI tampil dan di-highlight seperti Tanda bahaya Aturan
- [x] Penjelasan AI hanya dipakai kalau label versi AI = Label akhir, ≤ 3 kalimat, dan lolos filter kata terlarang; ada tes untuk Penjelasan AI yang memuat "aman"
- [x] UI menampilkan catatan kecil kalau `catatanAI` ada

## Comments

**2026-11-27, implementasi:**
- Inti: `panggil-ai.ts` (batas waktu 3,5 detik lewat `AbortController` + `setTimeout`, berlomba dengan adapter yang mungkin mengabaikan signal), `skema-ai.ts` (satu skema Zod untuk validasi dan strict `json_schema`), `gabung-ai.ts` (penyaringan butir), `penyamaran.ts`. Adapter Palsu dan perekam di `ai.ts`, adapter Groq di `groq.ts` (khusus server, tidak diekspor dari `@/cek`).
- `cek(teks)` tanpa `{ ai }` dinilai Aturan saja **tanpa** `catatanAI` (untuk mode "aturan" di eval); `catatanAI` muncul kalau adapter dipasang lalu timeout, gagal, atau keluarannya tidak cocok skema. Route selalu memasang adapter: tanpa `GROQ_API_KEY`, adapternya langsung gagal (tanpa jaringan), jadi hasilnya Aturan saja **dengan** `catatanAI`, plus satu peringatan di log server. `aiNonaktif` dihapus.
- Penyaringan tambahan di luar tiga syarat spec: kutipan kosong, alasan kosong, alasan yang memuat kata terlarang (cakupan spec mencakup alasan Tanda bahaya), dan butir yang beririsan dengan butir AI sebelumnya (supaya satu kutipan tidak dihitung dua kali). Kalau kemunculan pertama kutipan beririsan, kemunculan berikutnya yang tidak beririsan dipakai.
- Penjelasan AI juga ditolak kalau memuat penanda Penyamaran (tidak bermakna bagi pengguna), dan tidak dipakai untuk Risiko rendah yang tetap memuat Tanda bahaya (supaya tidak menyangkal daftar, sejalan dengan tiket 08).
- Kutipan AI minimal 2 kata; satu huruf, tanda baca, atau satu kata dibuang.
- Butir AI yang kemunculan pertama kutipannya beririsan dibuang (tidak mencari kemunculan berikutnya), jadi frasa yang berulang tidak dihitung berkali-kali.
- Rekening: deret 10–15 digit yang didahului "Rp" tidak disamarkan, sesuai "angka yang didahului Rp tidak tersentuh".
- Tes properti memakai PRNG ber-seed (300 kasus), tanpa dependensi baru.
- `reasoning_effort: "low"` dan `max_completion_tokens: 800` diambil dari contoh di docs/research; token reasoning ikut dihitung, jadi cek batasnya saat uji dengan key asli.
- **Belum diverifikasi:** panggilan Groq sungguhan (tidak ada `GROQ_API_KEY` di mesin ini). Adapter dites lewat `fetch` palsu, dan UI dicek di dev server dengan server Groq palsu lokal (jawaban valid → 3 Tanda bahaya AI tersorot, Skor 25 Waspada; 500 → catatan kecil). Perlu satu uji manual dengan key asli, termasuk apakah strict mode menerima skemanya, serta langkah ZDR di Groq Console.
