# 15: Desain visual dan aksesibilitas tampilan

**What to build:** JobShift punya tampilan yang konsisten, mudah dibaca di HP 360 px, dan memenuhi NFR-06/NFR-07: sistem warna dan tipografi, tampilan halaman cek, kartu hasil (Label warna + ikon + kata, Skor, Tanda bahaya, highlight `<mark>`, Langkah aman), tombol contoh, area unggah screenshot, dan halaman Cara kerja. Anggota lain menulis markup yang semantik dan fungsional; tiket ini memegang semua gaya visualnya. Lihat PRD NFR-06, NFR-07, NFR-08 dan spec bagian "UI dan aksesibilitas".

**Blocked by:** None (bisa mulai sekarang; gaya untuk bagian dari 08, 09, 12, 13 dirapikan setelah tiket itu di-merge)

**Status:** ready-for-agent

**Assignee:** Muhammad Zamil

- [ ] Token desain (warna, jarak, tipografi, radius) didefinisikan sekali sebagai CSS custom properties di `src/app/globals.css`; komponen tidak memakai warna hardcode
- [ ] Label Risiko rendah / Waspada / Bahaya dibedakan dengan warna, ikon, dan kata sekaligus (bisa dibaca buta warna)
- [ ] Kontras teks ≥ 4,5:1 di semua warna Label, huruf isi ≥ 16 px, target sentuh ≥ 44 × 44 px
- [ ] Peringatan tetap Risiko rendah terlihat tanpa scroll di 360 × 640
- [ ] Tata letak benar mulai lebar 360 px sampai desktop dan proyektor
- [ ] Animasi hanya di dalam `@media (prefers-reduced-motion: no-preference)`
- [ ] Fokus keyboard terlihat jelas di semua elemen interaktif; fokus pindah ke judul hasil setelah Cek
- [ ] Tagline "JobShift — cek dulu sebelum transfer." tampil di halaman cek dan hasil
- [ ] Tidak mengubah `src/cek`, route API, atau kontrak `HasilCek`
- [ ] Lighthouse Accessibility ≥ 95 di halaman cek (dengan hasil tampil) sebelum audit tiket 14
