# 01: Kerangka aplikasi dan deploy tracer

**What to build:** Pengguna membuka URL publik JobShift, menempelkan Teks, lalu menekan Cek. Hasilnya datang lewat `POST /api/cek` dan tampil di halaman yang sama. Belum ada Aturan, jadi setiap Teks yang valid berlabel Risiko rendah dengan peringatan tetap. Ini jalur tipis yang menembus semua lapisan (UI → API → inti `cek()` → render) dan menjadi fondasi semua tiket lain. Lihat spec bagian Stack, Modul, Kontrak `HasilCek`, dan Panjang Teks.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Next.js App Router, TypeScript strict, ESLint tanpa error, dan Vitest sudah terpasang; `npm test` dan `npm run lint` lulus di CI lokal
- [ ] Inti `cek(teks, { ai })` sudah ada dengan tipe `HasilCek` sesuai spec; adapter AI default mengembalikan `null` (belum ada AI)
- [ ] Kotak teks dengan penghitung karakter; tombol Cek nonaktif saat kosong; disclaimer privasi tampil di bawah tombol
- [ ] Teks < 50 atau > 3.000 karakter (setelah trim) tidak dicek: UI menampilkan pesan dari PRD FR-01 dan API menjawab 400 dengan `kode` yang sesuai; tes batas 49/50/3.000/3.001
- [ ] `POST /api/cek` dengan body tidak valid menjawab 400 `format_tidak_valid`; isi Teks tidak pernah di-log
- [ ] Teks valid menghasilkan Label Risiko rendah, Skor 0, dan peringatan tetap FR-06 yang terlihat tanpa scroll di 360 × 640
- [ ] Tagline "JobShift — cek dulu sebelum transfer." tampil di halaman cek dan hasil
- [ ] Teks pengguna dirender sebagai teks biasa, tanpa HTML
- [ ] Ter-deploy di Vercel dan bisa dibuka dari URL publik (milestone M1)
- [ ] README memuat cara menjalankan aplikasi dan tes
