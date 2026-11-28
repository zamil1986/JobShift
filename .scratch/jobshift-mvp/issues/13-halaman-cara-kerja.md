# 13: Halaman Cara kerja

**What to build:** Pengguna yang ragu membuka halaman Cara kerja dan membaca ringkasan cara penilaian, angka akurasi Set test lengkap dengan pembilang dan penyebut, jumlah contoh sintetis, batasan, dan kebijakan privasi. Lihat PRD FR-10 dan spec bagian Dataset dan eval.

**Blocked by:** 04, 05, 06, 07, 11

**Status:** ready-for-agent

- [x] Ringkasan Aturan dalam bahasa awam, tanpa ID aturan
- [x] Angka akurasi dibaca dari file hasil eval saat build, tidak diketik tangan, dengan pembilang/penyebut (misalnya 17/20)
- [x] Memuat jumlah contoh sintetis dan batasan, termasuk "dioptimalkan untuk bahasa Indonesia" dan "bukan vonis hukum"
- [x] Kebijakan privasi: Teks dan gambar tidak disimpan, Penyamaran sebelum ke AI, dan kalimat log Groq 30 hari kalau ZDR tidak tersedia
- [x] Ditautkan dari halaman cek dan hasil; lolos filter kata terlarang untuk teks hasil

## Comments

**2026-11-28, implementasi:**
- Halaman `/cara-kerja` di `src/app/cara-kerja/page.tsx`, isinya `src/ui/IsiCaraKerja.tsx`, copy di `src/ui/salinan-cara-kerja.ts`.
- `src/eval/hasil-tersimpan.ts` membaca `src/data/hasil-eval.json` dengan `readFileSync` di module scope, jadi halaman di-prerender statis saat build. File belum ada = "Belum dievaluasi". File rusak atau dari Set dev menggagalkan build.
- Angka yang tampil dari mode gabungan (yang dipakai pengguna), plus satu kalimat untuk mode aturan saja; semua dengan pembilang/penyebut.
- Ringkasan Aturan diambil dari `alasan` di katalog (tanpa ID), dipisah kritis dan bukan kritis.
- Tautan "Cara penilaian, akurasi, dan privasi" di disclaimer privasi kotak cek, di bawah tagline hasil, dan di kaki beranda. Teksnya sengaja beda dari "Cara kerja" (bagian tiga langkah di beranda, `#cara-kerja`).
- Tidak ada CSS baru; hanya class yang sudah ada.
- **Belum dievaluasi:** `data/test.jsonl` dan `src/data/hasil-eval.json` belum ada. Setelah pemegang Set test menjalankan `npm run eval --set test` dan meng-commit `src/data/hasil-eval.json`, build berikutnya menampilkan angkanya.
- Status ZDR Groq Free plan belum dicek, jadi kalimat log 30 hari dipasang (bersyarat).
