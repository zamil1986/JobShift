---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/ui/FormCek.tsx","src/ui/TampilanHasil.tsx","src/app/globals.css"]
---

# Beranda JobShift (landing + alat cek)

Scope: route `/`, mode Persuade. Audience: pencari kerja 17–30 di HP 360 px dan data seluler; aksi = tempel lowongan lalu Cek, di layar pertama. Bukti: statistik bersumber di PRD (IASC 26.910, 80% lapor setelah 12 jam, 7.908 iklan diblokir) dan kanal resmi. Tidak ada testimoni, angka pengguna, logo mitra, video produk, atau angka akurasi sebelum M3. Gaya ini berlaku untuk seluruh situs (halaman cek dan kartu hasil ikut). Arah "Struk Cek" yang sempat dibangun (commit a8e9b51) digantikan atas permintaan pengguna.

Unresolved: halaman Cara kerja (tiket 13), tombol contoh (12), unggah screenshot (09) belum ada; beranda menautkan ke bagian #cara-kerja di halaman yang sama.

## Direction contract

THESIS: Standar kategori, dikerjakan setara Open React Template: landing SaaS gelap. Satu perbedaan yang tidak bisa ditawar: produk di hero bukan video atau foto, melainkan alat cek yang benar-benar berfungsi.

OWN-WORLD: Latar hampir hitam kebiruan dengan cahaya indigo kabur di atas dan di bawah. Judul bergradien abu-indigo yang berkilau pelan. Kartu gelap berbingkai gradien halus dengan sorotan yang mengikuti kursor. Tombol indigo bergradien dengan kilap dalam, tombol kedua abu gelap berbingkai. Huruf sans sistem rapat. Warna Label: biru, kuning, dan merah pastel di atas tint gelap.

STORY: Pengunjung paham dalam satu layar bahwa JobShift memeriksa pesan lowongan sebelum mereka membayar. Mereka percaya karena alasan ditunjuk di kalimat mereka sendiri, statistik diberi sumber, dan kanal resmi disebut. Lalu mereka menempel teks dan menekan Cek.

FIRST VIEWPORT: Bilah navigasi melayang dan membulat: logo JobShift di kiri; "Cara kerja" dan "Cek sekarang" di kanan. Di tengah ada judul gradien "Cek dulu sebelum transfer." dan subjudul satu kalimat. Di bawahnya panel alat cek bercahaya indigo berisi kotak tempel, penghitung, dan tombol Cek, yang terlihat di atas lipatan di 360 × 640.

FORM: Standar kategori yang dipin pengguna. seed: none (pinned). Kata-kata pengguna: "seperti ini lohh", dikirim bersama screenshot beranda Open React Template. Dikonfirmasi pengguna (28 Nov 2026), menjawab "Ya, benar begitu" untuk: "tampilan gelap-indigo Open React Template untuk seluruh situs, dengan susunan hero-nya (bilah melayang, judul gradien di tengah), tapi videonya diganti alat cek yang berfungsi". Tanda tangan interaksi:
- kartu Cara kerja dengan sorotan yang mengikuti kursor;
- judul berkilau;
- bagian muncul naik saat digulir (hanya kalau gerak diizinkan);
- hasil cek muncul di panel yang sama.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
