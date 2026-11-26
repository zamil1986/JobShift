# 13: Halaman Cara kerja

**What to build:** Pengguna yang ragu membuka halaman Cara kerja dan membaca ringkasan cara penilaian, angka akurasi Set test lengkap dengan pembilang dan penyebut, jumlah contoh sintetis, batasan, dan kebijakan privasi. Lihat PRD FR-10 dan spec bagian Dataset dan eval.

**Blocked by:** 04, 05, 06, 07, 11

**Status:** ready-for-agent

- [ ] Ringkasan Aturan dalam bahasa awam, tanpa ID aturan
- [ ] Angka akurasi dibaca dari file hasil eval saat build, tidak diketik tangan, dengan pembilang/penyebut (misalnya 17/20)
- [ ] Memuat jumlah contoh sintetis dan batasan, termasuk "dioptimalkan untuk bahasa Indonesia" dan "bukan vonis hukum"
- [ ] Kebijakan privasi: Teks dan gambar tidak disimpan, Penyamaran sebelum ke AI, dan kalimat log Groq 30 hari kalau ZDR tidak tersedia
- [ ] Ditautkan dari halaman cek dan hasil; lolos filter kata terlarang untuk teks hasil
