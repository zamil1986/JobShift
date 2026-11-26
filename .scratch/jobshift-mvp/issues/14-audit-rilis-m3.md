# 14: Audit rilis M3

**What to build:** Sebelum fitur dikunci Sabtu 21.00, tim memverifikasi semua metrik dan kriteria P0 di URL publik, bukan di laptop. Ini pekerjaan manusia karena butuh HP sungguhan, jaringan seluler, dan Lighthouse. Temuan yang butuh perbaikan dijadikan tiket baru.

**Blocked by:** 09, 12, 13

**Status:** ready-for-human

- [ ] Lighthouse Accessibility ≥ 95 di halaman cek dan Cara kerja (dengan hasil tampil)
- [ ] Seluruh alur bisa dijalankan dengan keyboard; hasil dibacakan lewat `aria-live`; fokus pindah ke judul hasil
- [ ] Tampilan benar di Chrome Android, Safari iOS, Chrome dan Firefox desktop, mulai lebar 360 px; kontras, huruf 16 px, target 44 px, `prefers-reduced-motion`
- [ ] 20 percobaan dari HP lewat data seluler: p95 < 5 detik
- [ ] API key dimatikan, lalu 5 contoh tetap berlabel
- [ ] Bobot Aturan dibekukan, Set test di-commit, dan `npm run eval --set test` dijalankan sekali; angkanya tampil di Cara kerja
- [ ] README menjelaskan cara menjalankan, arsitektur, dan cara eval; `npm test` dan lint lulus
