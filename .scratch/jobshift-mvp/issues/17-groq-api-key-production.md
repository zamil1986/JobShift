# 17: `GROQ_API_KEY` belum terpasang di production Vercel, lapisan AI tidak aktif di URL publik

**What to build:** Saat audit Tahap 1a (lihat [audit-m3/daniel.md](../audit-m3/daniel.md), bagian 4), `GROQ_API_KEY` tidak ada di server. Pemeriksaan ulang pada 28 Nov 2026 sekitar 21.15 WIB menunjukkan key belum dipasang kembali:

- Teks bebas di `https://job-shift-navy.vercel.app` dijawab `sumberPenilaian: "aturan"` dengan `catatanAI: "ai_tidak_tersedia"`. Hanya 4 contoh siap pakai yang tampil `aturan+AI` karena dijawab adapter Statis.
- Log runtime production (`dpl_2pJQqvRxc1uTZT5yCoJ1LiTTAnXZ`, branch `main`) mencetak `GROQ_API_KEY tidak diset: Cek dinilai Aturan saja dengan catatanAI.` Peringatan ini hanya dicetak sekali per instance server (`src/cek/groq.ts`), jadi kemunculannya membuktikan key tidak ada di instance itu.
- Daftar environment variable project Vercel `job-shift` yang dibaca lewat API Vercel kosong.

Akibatnya, angka p95 dari HP (tiket 14, Tahap 1c) dan demo teks bebas tidak mewakili produk dengan lapisan AI. Pemilik project Vercel memasang `GROQ_API_KEY` di Settings → Environment Variables (minimal Production), lalu redeploy production.

**Blocked by:** None

**Status:** needs-triage

- [ ] `GROQ_API_KEY` ada di environment Production project Vercel `job-shift` (tidak di-commit ke repo)
- [ ] Production di-redeploy setelah key dipasang
- [ ] Teks bebas di URL publik menjawab `sumberPenilaian: "aturan+AI"` tanpa `catatanAI`, dan log runtime tidak lagi mencetak `GROQ_API_KEY tidak diset`
- [ ] Uji p95 dari HP (Tahap 1c) dijalankan, atau diulang, setelah key aktif
