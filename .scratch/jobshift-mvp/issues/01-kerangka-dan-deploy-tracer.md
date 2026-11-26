# 01: Kerangka aplikasi dan deploy tracer

**What to build:** Pengguna membuka URL publik JobShift, menempelkan Teks, lalu menekan Cek. Hasilnya datang lewat `POST /api/cek` dan tampil di halaman yang sama. Belum ada Aturan, jadi setiap Teks yang valid berlabel Risiko rendah dengan peringatan tetap. Ini jalur tipis yang menembus semua lapisan (UI → API → inti `cek()` → render) dan menjadi fondasi semua tiket lain. Lihat spec bagian Stack, Modul, Kontrak `HasilCek`, dan Panjang Teks.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Next.js App Router, TypeScript strict, ESLint tanpa error, dan Vitest sudah terpasang; `npm test` dan `npm run lint` lulus di CI lokal
- [x] Inti `cek(teks, { ai })` sudah ada dengan tipe `HasilCek` sesuai spec; adapter AI default mengembalikan `null` (belum ada AI)
- [x] Kotak teks dengan penghitung karakter; tombol Cek nonaktif saat kosong; disclaimer privasi tampil di bawah tombol
- [x] Teks < 50 atau > 3.000 karakter (setelah trim) tidak dicek: UI menampilkan pesan dari PRD FR-01 dan API menjawab 400 dengan `kode` yang sesuai; tes batas 49/50/3.000/3.001
- [x] `POST /api/cek` dengan body tidak valid menjawab 400 `format_tidak_valid`; isi Teks tidak pernah di-log
- [x] Teks valid menghasilkan Label Risiko rendah, Skor 0, dan peringatan tetap FR-06 yang terlihat tanpa scroll di 360 × 640
- [x] Tagline "JobShift — cek dulu sebelum transfer." tampil di halaman cek dan hasil
- [x] Teks pengguna dirender sebagai teks biasa, tanpa HTML
- [ ] Ter-deploy di Vercel dan bisa dibuka dari URL publik (milestone M1)
- [x] README memuat cara menjalankan aplikasi dan tes

## Comments

- 2026-11-26 (Claude, branch `tiket-01-kerangka-dan-deploy-tracer`): semua kriteria selesai di lokal kecuali deploy Vercel. `npm test` (26 tes), `npm run lint`, `npm run typecheck`, dan `npm run build` lulus. Peringatan FR-06 dicek di browser 360 × 640: terlihat tanpa scroll setelah Cek.
- Catatan untuk tiket 10/13: disclaimer privasi di `src/ui/salinan.ts` ("Teks hanya dipakai untuk satu kali cek ini.") perlu ditinjau ulang begitu Teks tersamar mulai dikirim ke Groq.
- Respons 500 `kesalahan_server` ditambahkan untuk kesalahan tak terduga; di luar kontrak 400 di spec.
