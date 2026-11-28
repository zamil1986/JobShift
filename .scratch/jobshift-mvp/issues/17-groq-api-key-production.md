# 17: `GROQ_API_KEY` belum terpasang di production Vercel, lapisan AI tidak aktif di URL publik

**What to build:** Saat audit Tahap 1a (lihat [audit-m3/daniel.md](../audit-m3/daniel.md), bagian 4), `GROQ_API_KEY` tidak ada di server. Pemeriksaan ulang pada 28 Nov 2026 sekitar 21.15 WIB menunjukkan key belum dipasang kembali:

- Teks bebas di `https://job-shift-navy.vercel.app` dijawab `sumberPenilaian: "aturan"` dengan `catatanAI: "ai_tidak_tersedia"`. Hanya 4 contoh siap pakai yang tampil `aturan+AI` karena dijawab adapter Statis.
- Log runtime production (`dpl_2pJQqvRxc1uTZT5yCoJ1LiTTAnXZ`, branch `main`) mencetak `GROQ_API_KEY tidak diset: Cek dinilai Aturan saja dengan catatanAI.` Peringatan ini hanya dicetak sekali per instance server (`src/cek/groq.ts`), jadi kemunculannya membuktikan key tidak ada di instance itu.
- Daftar environment variable project Vercel `job-shift` yang dibaca lewat API Vercel kosong.

Akibatnya, angka p95 dari HP (tiket 14, Tahap 1c) dan demo teks bebas tidak mewakili produk dengan lapisan AI. Pemilik project Vercel memasang `GROQ_API_KEY` di Settings → Environment Variables (minimal Production), lalu redeploy production.

**Blocked by:** None

**Status:** ready-for-human

- [x] `GROQ_API_KEY` ada di environment Production project Vercel `job-shift` (tidak di-commit ke repo)
- [x] Production di-redeploy setelah key dipasang
- [x] Teks bebas di URL publik menjawab `sumberPenilaian: "aturan+AI"` tanpa `catatanAI`, dan log runtime tidak lagi mencetak `GROQ_API_KEY tidak diset`
- [ ] Uji p95 dari HP (Tahap 1c) dijalankan, atau diulang, setelah key aktif

## Comments

**Verifikasi (Zamil, 28 November 2026, sekitar 22.10 WIB):** `GROQ_API_KEY` dipasang di environment Production project Vercel `job-shift`, lalu production di-redeploy (`dpl_NopAwCHNDbEQfyPg4T4AdyboVHKC`, commit `main` `33dc20a`).

- Teks bebas `dev-004` dikirim ke `POST https://job-shift-navy.vercel.app/api/cek` dan dijawab HTTP 200, `sumberPenilaian: "aturan+AI"`, tanpa `catatanAI` (2,6 detik dari laptop).
- Log runtime deployment itu (45 menit terakhir, batas retensi paket Hobby) tidak memuat `GROQ_API_KEY tidak diset`.

Kriteria terakhir (uji p95 dari HP) dikerjakan Naja di Tahap 1c, lihat [audit-m3/naja.md](../audit-m3/naja.md) setelah PR #12 di-merge. Status diubah ke `ready-for-human` karena sisanya pengukuran manual di HP.
