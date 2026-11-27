---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/ui/FormCek.tsx","src/ui/TampilanHasil.tsx","src/app/globals.css"]
---

# Beranda JobShift (landing + alat cek)

Scope: route `/`, mode Persuade. Audience: pencari kerja 17–30 di HP 360 px dan data seluler; aksi = tempel lowongan lalu Cek, di layar pertama. Bukti: statistik bersumber di PRD (IASC 26.910, 80% lapor setelah 12 jam, 7.908 iklan diblokir) dan kanal resmi. Tidak ada testimoni, angka pengguna, logo mitra, atau angka akurasi sebelum M3. Dunia ini menggantikan gaya tiket 15 untuk seluruh situs (halaman cek dan kartu hasil ikut).

Unresolved: halaman Cara kerja (tiket 13), tombol contoh (12), unggah screenshot (09) belum ada; beranda menautkan ke bagian #cara-kerja di halaman yang sama.

## Direction contract

THESIS: Setiap cek adalah struk yang dicetak sebelum transfer. Menolak landing SaaS gelap bergradien dan grid kartu fitur; alat cek sendiri adalah hero.

OWN-WORLD: Bidang ultramarine datar sebagai meja kasir, kertas thermal putih bertepi sobekan bergerigi, satu tinta hitam, huruf dot-matrix untuk judul dan cap, mono untuk baris struk, sans sistem untuk paragraf. Warna lain hanya tinta cap Label (biru, cokelat-amber, merah). Bagian bergantian bidang ultramarine dan tinta hitam.

STORY: Pengunjung paham dalam satu layar bahwa JobShift memeriksa pesan lowongan sebelum mereka membayar, percaya karena alasan ditunjuk di kalimat mereka sendiri dan kanal resmi disebut, lalu menempel dan menekan CEK.

FIRST VIEWPORT: Di 360 px: baris merek kecil, tagline dot-matrix besar di bidang ultramarine, lalu struk keluar dari celah printer hitam berisi kepala struk, kotak tempel, penghitung, dan tombol CEK selebar kertas yang sudah terlihat di atas lipatan. Di desktop: tagline kiri, struk kanan.

FORM: Struk Cek, kandidat 5 dari daftar berurut, seed:6202fd8cde46b7e2. Tanda tangan interaksi: hasil dicetak menyambung di struk yang sama, baris demi baris, dengan meter Skor dari sel-sel karakter yang terisi; legenda tiga Label di kaki struk dengan Label aktif bertinta penuh.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
