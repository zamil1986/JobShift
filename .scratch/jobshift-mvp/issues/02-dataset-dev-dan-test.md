# 02: Kumpulkan dataset Set dev dan Set test

**What to build:** Tim mengumpulkan 100 contoh lowongan dari sumber publik: Set dev 60 dan Set test 40, dengan jumlah Palsu dan Asli seimbang dan ketiga Modus terwakili. Set test dikumpulkan dan dipegang oleh anggota yang tidak menyetel Aturan. Ini pekerjaan manusia karena butuh penilaian sumber dan penyamaran manual. Lihat spec bagian Dataset dan eval.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [ ] Pemegang Set test sudah ditetapkan dan dicatat (bukan orang yang menyetel Aturan)
- [ ] Set dev 60 contoh dalam format JSONL sesuai spec (`id, teks, kebenaran, modus?, sumber, sintetis`) sudah di-commit
- [ ] Set test 40 contoh tersimpan di luar repo sampai bobot dibekukan di M3, lalu di-commit
- [ ] Setiap contoh sudah disamarkan dari nomor HP, nama orang, dan rekening sebelum di-commit
- [ ] Contoh sintetis ditandai `sintetis: true` dan jumlahnya dicatat
- [ ] Palsu/Asli kira-kira seimbang di tiap set; Modus Tugas, Lokal, dan Luar negeri masing-masing punya minimal 5 contoh Palsu di Set dev
