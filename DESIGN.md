---
name: JobShift
description: Cek dulu sebelum transfer. Alat cek lowongan kerja palsu di landing gelap-indigo.
colors:
  warna-latar: "#030712"
  warna-latar-dalam: "#0a0f1d"
  kartu-latar: "#0b101e"
  warna-permukaan: "#111827"
  warna-garis: "#1f2937"
  warna-garis-terang: "#374151"
  warna-garis-kontrol: "#6b7280"
  warna-teks: "#e5e7eb"
  warna-teks-kuat: "#f9fafb"
  warna-teks-redup: "#8f98b8"
  abu-300: "#d1d5db"
  indigo-200: "#c7d2fe"
  indigo-300: "#a5b4fc"
  indigo-400: "#818cf8"
  indigo-500: "#6366f1"
  indigo-600: "#4f46e5"
  indigo-tombol: "#5a54ea"
  warna-aksen-teks: "#ffffff"
  warna-mati-latar: "#1f2937"
  warna-mati-teks: "#9ca3af"
  warna-cap-rendah: "#93c5fd"
  warna-cap-waspada: "#fcd34d"
  warna-cap-bahaya: "#fca5a5"
  warna-sorotan-latar: "#fcd34d"
  warna-galat: "#fca5a5"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.375rem, 1.6rem + 3.6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  label-kata:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.625rem, 1.4rem + 1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  angka:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 1.8rem + 2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.15
  lead:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  radius-mini: "0.125rem"
  radius-kecil: "0.5rem"
  radius: "0.75rem"
  radius-besar: "1rem"
  radius-panel: "1.5rem"
  radius-bulat: "999px"
spacing:
  jarak-1: "0.25rem"
  jarak-2: "0.5rem"
  jarak-3: "0.75rem"
  jarak-4: "1rem"
  jarak-5: "1.5rem"
  jarak-6: "2rem"
  jarak-7: "3rem"
  jarak-8: "4rem"
  jarak-9: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.indigo-tombol}"
    textColor: "{colors.warna-aksen-teks}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-kecil}"
    padding: "0.5rem 1.5rem"
    height: "2.75rem"
  button-secondary:
    backgroundColor: "{colors.warna-garis}"
    textColor: "{colors.abu-300}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-kecil}"
    padding: "0.5rem 1.5rem"
    height: "2.75rem"
  button-secondary-hover:
    textColor: "{colors.warna-teks-kuat}"
  button-cek:
    backgroundColor: "{colors.indigo-tombol}"
    textColor: "{colors.warna-aksen-teks}"
    rounded: "{rounded.radius-kecil}"
    padding: "0.5rem 1rem"
    height: "3rem"
    width: "100%"
  button-cek-disabled:
    backgroundColor: "{colors.warna-mati-latar}"
    textColor: "{colors.warna-mati-teks}"
  input-teks:
    backgroundColor: "{colors.warna-latar-dalam}"
    textColor: "{colors.warna-teks-kuat}"
    typography: "{typography.body}"
    rounded: "{rounded.radius-kecil}"
    padding: "0.75rem"
    height: "6.5rem"
  kartu:
    backgroundColor: "{colors.kartu-latar}"
    textColor: "{colors.warna-teks-redup}"
    rounded: "{rounded.radius-besar}"
    padding: "1.5rem"
  panel-alat:
    backgroundColor: "{colors.warna-permukaan}"
    textColor: "{colors.warna-teks}"
    rounded: "{rounded.radius-panel}"
    padding: "1rem"
  cip:
    textColor: "{colors.indigo-200}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-bulat}"
    padding: "0.25rem 0.75rem 0.25rem 0.25rem"
  label-risiko-rendah:
    textColor: "{colors.warna-cap-rendah}"
    typography: "{typography.label-kata}"
    rounded: "{rounded.radius}"
    padding: "1rem"
  label-waspada:
    textColor: "{colors.warna-cap-waspada}"
  label-bahaya:
    textColor: "{colors.warna-cap-bahaya}"
  sorotan-teks:
    backgroundColor: "{colors.warna-sorotan-latar}"
    textColor: "{colors.warna-latar}"
    rounded: "{rounded.radius-mini}"
---

# Design System: JobShift

## Overview

**Creative North Star: "Lampu Meja di Ruang Gelap"**

JobShift memakai bahasa landing SaaS gelap yang dipatok pengguna (rujukan Open React Template): latar hampir hitam kebiruan, cahaya indigo kabur yang menggenang di atas pembuka dan di bawah kaki halaman, judul bergradien abu-indigo yang berkilau pelan, dan kartu gelap berbingkai gradien tipis. Di tengah kegelapan itu satu benda paling terang dan paling dekat: panel alat cek yang benar-benar berfungsi, bukan video atau foto produk. Seluruh halaman diatur supaya mata jatuh ke panel itu lebih dulu.

Kepadatannya lapang. Bagian halaman berjarak jauh (4rem di HP, 7rem di layar lebar), kepala bagian rata tengah, dan isi tiap bagian berupa kisi kartu, kisi butir tanpa kartu, atau satu daftar bersekat. Warna terang dipakai hemat: indigo untuk aksi dan aksen, tiga warna Label pastel hanya untuk hasil cek, dan kuning sorotan hanya untuk kalimat pemicu di teks pengguna.

Nadanya tenang dan jelas, bukan menakut-nakuti. Bahaya tidak diteriakkan dengan merah menyala; Label Bahaya memakai merah pastel di atas tint gelap, dibedakan juga oleh bentuk ikon dan kata. Aksesibilitas adalah bagian dari dunia ini, bukan tambahan: kontras teks di atas 4,5:1, bingkai kontrol dan cincin fokus di atas 3:1, huruf isi minimal 16 px, target sentuh minimal 44 px, dan gerak hanya kalau pengguna mengizinkannya.

**Key Characteristics:**
- Latar hampir hitam kebiruan (#030712) dengan cahaya indigo radial yang kabur.
- Judul bergradien abu-indigo yang dipotong ke bentuk huruf dan berkilau pelan.
- Permukaan gelap berbingkai gradien 1 px, bukan bayangan, sebagai pemisah utama.
- Satu panel alat bercahaya indigo sebagai pusat halaman; hasil cek muncul di panel yang sama.
- Label hasil dibedakan tiga kali: warna pastel, bentuk ikon, dan kata.
- Huruf sans sistem yang rapat (spasi huruf judul -0,025em).

## Colors

Palet gelap satu aksen: abu kebiruan untuk ruang dan teks, indigo untuk aksi, dan tiga pastel yang hanya milik hasil cek.

### Primary
- **Indigo Malam** (`indigo-500`): aksen dasar. Cahaya kabur latar (campuran 38% dan 16%), tengah bingkai gradien panel alat dan panel ajakan, tanda logo, tombol di ilustrasi, dan tint nomor Tanda bahaya.
- **Indigo Tombol** (`indigo-tombol` ke `indigo-600`): gradien tombol utama dan tombol Cek, dari bawah (`indigo-600`) ke atas (`indigo-tombol`). Teks putih di atasnya 5,4:1.
- **Indigo Pucat** (`indigo-300`): warna tautan, cincin fokus, kursor ketik, butir Langkah, nomor Tanda bahaya, dan warna seleksi teks.
- **Indigo Embun** (`indigo-200`): teks cip langkah dan kutipan pemicu di daftar Tanda bahaya.
- **Indigo Garis** (`indigo-400`): ikon fitur dan garis aktif ilustrasi.

### Tertiary (warna Label, khusus hasil cek)
- **Biru Pastel** (`warna-cap-rendah`): Label Risiko rendah.
- **Kuning Pastel** (`warna-cap-waspada`): Label Waspada.
- **Merah Pastel** (`warna-cap-bahaya`): Label Bahaya, juga judul bagian "Kalau sudah telanjur" di hasil.
- **Kuning Sorotan** (`warna-sorotan-latar`): latar `<mark>` untuk kalimat pemicu di Teks yang dicek, dengan teks hampir hitam (13,9:1) dan garis bawah 2 px.
- **Merah Galat** (`warna-galat`): pesan galat formulir dan bingkai kotak teks yang tidak valid. Nilainya sama dengan Merah Pastel.

### Neutral
- **Langit Tengah Malam** (`warna-latar`): latar halaman dan warna bilah browser (`themeColor`).
- **Sumur** (`warna-latar-dalam`): latar cekung untuk kotak tempel, peringatan Risiko rendah, dan Teks yang dicek.
- **Kartu Arang** (`kartu-latar`, campuran 55% `abu-900` dengan `abu-950`): isi kartu dan panel ajakan.
- **Permukaan Panel** (`warna-permukaan`): isi panel alat cek dan dasar tint Label.
- **Garis Senyap** (`warna-garis`): sekat antarbagian hasil, antarmodus, kaki halaman, dan kisi garis ilustrasi.
- **Garis Terang** (`warna-garis-terang`): sekat di atas hasil dan bingkai Teks yang dicek; puncak bingkai gradien abu.
- **Garis Kontrol** (`warna-garis-kontrol`): bingkai kotak tempel (3,95:1 di atas Sumur) dan garis putus-putus bagian tersirat.
- **Teks** (`warna-teks`), **Teks Kuat** (`warna-teks-kuat`), **Teks Redup** (`warna-teks-redup`, 6,2–7,0:1 di semua permukaan gelap): isi, judul, dan teks pendukung.

### Named Rules
**The Pastel Hanya untuk Label Rule.** Biru, kuning, dan merah pastel hanya muncul untuk Label, legendanya, dan sorotan pemicu di hasil cek. Di luar hasil, satu-satunya aksen adalah indigo.

**The Tiga Penanda Rule.** Setiap Label dibedakan oleh warna, bentuk ikon (lingkaran, segitiga, segi delapan), dan kata. Warna tidak pernah menjadi satu-satunya pembeda.

**The Tint Bukan Isi Rule.** Warna Label tampil sebagai teks pastel di atas tint 11% warna itu di atas Permukaan Panel, bukan sebagai blok warna penuh. Isi penuh hanya untuk sel meter yang terisi dan chip legenda yang aktif.

## Typography

**Display Font:** sans sistem (`system-ui`, `-apple-system`, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial, sans-serif)
**Body Font:** sama

**Character:** Satu keluarga sans sistem dipakai untuk semuanya, jadi tampil sebagai Roboto di Android dan SF di iOS. Karakter datang dari ukuran, ketebalan 600–700, spasi huruf judul yang dirapatkan, dan gradien di judul.

### Hierarchy
- **Display** (600, `clamp(2.375rem, 1.6rem + 3.6vw, 4rem)`, 1.15): judul pembuka, bergradien dan berkilau.
- **Headline** (600, `clamp(1.75rem, 1.3rem + 2vw, 2.75rem)`, 1.15): judul bagian (bergradien).
- **Label-kata** (700, `clamp(1.625rem, 1.4rem + 1vw, 2rem)`, 1.15): kata Label di kotak hasil.
- **Angka** (600, `clamp(2.25rem, 1.8rem + 2vw, 3rem)`, 1, angka tabular): angka fakta, sebaris di awal kalimatnya sendiri.
- **Title** (600, 1.25rem): judul hasil cek dan judul kartu darurat. Judul kecil di hasil memakai 1.125rem dan 1rem.
- **Lead** (400, `clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)`, 1.6): subjudul pembuka dan pengantar bagian, dengan lebar 38ch dan 46ch.
- **Body** (400, 1rem, 1.6): semua isi. Penghitung karakter, Skor, dan angka legenda memakai angka tabular.
- **Label** (600, 1rem, 1.2): tombol dan cip.

### Named Rules
**The Kalimat Utuh Rule.** Judul dua kalimat dipecah per kalimat, satu kalimat per baris (`display: block` per kalimat), dan semua judul memakai `text-wrap: balance`. Baris tidak pernah patah di tengah kalimat pada layar sempit.

**The Enam Belas Piksel Rule.** Tidak ada teks isi, termasuk teks kotak tempel, yang lebih kecil dari 1rem.

## Layout

Satu kolom rata tengah dengan lebar maksimum 72rem (`.sekat`) dan sisi 1rem di HP, 2rem mulai 48rem. Pembuka rata tengah: judul, subjudul, lalu panel alat selebar 40rem. Bagian halaman berjarak `jarak-8` (4rem) dan `jarak-9` (7rem) mulai 60rem, dengan kepala bagian rata tengah selebar 44rem.

Isi bagian disusun dengan beberapa kisi tetap. Kisi tiga kolom mulai 60rem dipakai untuk Cara kerja dan fakta. Kisi dua kolom mulai 48rem dipakai untuk kartu darurat. Kisi fitur 1, 2, lalu 3 kolom tanpa kartu. Daftar modus selebar 60rem berubah dari tumpuk menjadi dua kolom 1fr dan 2fr mulai 48rem; baris pertama ciri sejajar tengah dengan nama modus. Kaki halaman berkisi 2fr 1fr 1fr mulai 48rem.

Titik henti: 24.99rem (bilah dirapatkan supaya logo dan dua tombol muat sebaris di 360 px), 40rem, 48rem, 60rem, dan 64rem. Mulai 64rem, ukuran akar naik ke 112,5% sehingga semua ukuran rem membesar untuk proyektor kelas.

Jarak memakai skala 4 px dari `jarak-1` sampai `jarak-9`. Celah kisi 1rem di HP dan 1.5rem di layar lebar.

## Elevation & Depth

Kedalaman datang dari cahaya dan bingkai, bukan dari tumpukan bayangan. Permukaan gelap dibedakan dari latar dengan bingkai gradien 1 px (`padding-box` di atas `border-box`). Cahaya indigo radial yang kabur menggenang di belakang pembuka dan kaki halaman. Hanya panel alat cek yang memakai bayangan.

### Shadow Vocabulary
- **Cahaya panel** (`box-shadow: 0 24px 80px -24px <indigo-500 38%>, 0 2px 8px <abu-950 70%>`): hanya panel alat cek, supaya panel tampak melayang dan bercahaya.
- **Kilap dalam** (`box-shadow: inset 0 1px 0 <abu-50 16%>`): garis terang di tepi atas tombol utama dan tombol Cek.

### Named Rules
**The Satu Benda Melayang Rule.** Panel alat cek adalah satu-satunya permukaan berbayangan. Kartu, bilah, dan panel ajakan hanya memakai bingkai gradien. Panel ajakan juga mendapat cahaya radial di dalamnya.

**The Cahaya Selebar Layar Rule.** Elemen cahaya latar selalu selebar layar (`inset-inline: 0`), dan hanya gradiennya yang berukuran tetap (64rem × 36rem). Cahaya tidak boleh membuat halaman lebih lebar dari layar HP.

## Shapes

Sudut membulat lembut dan bertingkat menurut ukuran benda: 0.125rem untuk sel meter dan `<mark>`, 0.5rem untuk tombol, kotak tempel, dan kotak kecil, 0.75rem untuk kotak Label dan bagian tersirat, 1rem untuk kartu dan bilah navigasi, serta 1.5rem untuk panel alat dan panel ajakan. Bentuk pil (`radius-bulat`) dipakai untuk cip, nomor cip, butir Langkah, dan chip legenda.

Garis tipis (1 px) adalah bahasa pemisah. Garis padat berarti struktur. Garis putus-putus berarti "tidak ada di teks" (bagian Tanda bahaya tersirat) atau "Label yang tidak aktif" (chip legenda).

## Components

### Buttons
Tegas dan bercahaya dari dalam.
- **Shape:** sudut lembut (`radius-kecil`, 0.5rem), tinggi minimal 2.75rem.
- **Primary:** gradien indigo dari `indigo-600` di bawah ke `indigo-tombol` di atas, teks putih 600, padding 0.5rem 1.5rem, kilap dalam 1 px di tepi atas. Dipakai untuk "Cek sekarang" di bilah dan panel ajakan.
- **Hover / Focus:** saat hover, gradien diregangkan (`background-size: 100% 150%`) sehingga tombol sedikit menggelap. Fokus memakai cincin global 3 px `indigo-300` dengan offset 3px. Transisi 150ms hanya kalau gerak diizinkan.
- **Secondary:** isi gradien `abu-800` yang memudar, bingkai gradien abu 1 px, dan teks `abu-300` yang menjadi Teks Kuat saat hover. Dipakai untuk "Cara kerja".
- **Kecil:** padding samping 0.75rem dan tidak terlipat. Dipakai di bilah navigasi.
- **Tombol Cek:** selebar panel, tinggi 3rem, huruf 1.125rem, dan gradien yang sama dengan Primary. Tombol ini aktif saat diam, termasuk saat kotak kosong. Kalau teks kurang, pesan galat muncul di bawah kotak dan fokus kembali ke kotak. Tombol hanya nonaktif selama cek berjalan, dengan latar `abu-800`, teks `abu-400`, dan kursor progress.

### Chips
- **Cip langkah:** pil dengan tint indigo 14%, teks `indigo-200` 600, dan nomor bulat 1.5rem berlatar `indigo-600`. Cip ini adalah judul kartu Cara kerja, bukan label di atas judul.
- **Chip legenda:** pil berbingkai putus-putus `currentColor` dengan warna Label masing-masing. Label yang aktif terisi penuh dengan teks Langit Tengah Malam dan bingkai padat.

### Cards / Containers
- **Corner Style:** 1rem (`radius-besar`).
- **Background:** Kartu Arang di dalam bingkai gradien abu (`abu-800`, `abu-700`, `abu-800`).
- **Shadow Strategy:** tanpa bayangan (lihat Elevation & Depth).
- **Internal Padding:** 1.5rem. Teks paragraf di dalam kartu memakai Teks Redup.
- **Sorotan kursor (opt-in, `.kartu-sorot`):** lingkaran indigo lemah berjari-jari 16rem yang mengikuti tetikus dan memudar masuk dalam 360ms. Hanya kartu Cara kerja dan daftar modus yang memakainya. Di perangkat sentuh tidak ada yang berubah.
- **Kartu Cara kerja:** ilustrasi SVG di atas kisi garis 1.25rem yang memudar ke tepi (mask radial), lalu cip dan teks.
- **Daftar modus:** satu kartu berisi daftar bersekat garis senyap. Nama modus di kiri, satu langkah di bawah judul bagian (`ukuran-besar` di HP, `ukuran-label` mulai 48rem), cirinya di kanan.
- **Kartu fakta:** angka besar sebaris di awal kalimat, lalu sumber bertautan di dasar kartu di atas sekat tipis. Tidak ada label kecil di atas angka.
- **Panel ajakan:** radius 1.5rem, bingkai gradien beraksen indigo, cahaya radial indigo dari tepi atas, isi rata tengah.

### Inputs / Fields
- **Style:** kotak tempel cekung berlatar Sumur, bingkai 1 px Garis Kontrol, radius 0.5rem, padding 0.75rem, huruf 1rem, dan teks Teks Kuat. Tinggi 6.5rem, atau 11rem mulai 60rem, dan bisa diubah ke bawah.
- **Focus:** bingkai berganti `indigo-300` dan cincin fokus global 3 px.
- **Error:** bingkai Merah Galat, lalu pesan galat di kotak bertint merah 8% dengan bingkai merah 45%. Penghitung berubah merah dan 600 kalau lewat batas.

### Navigation
- **Bilah melayang:** pil membulat 1rem selebar 72rem, setinggi 3.5rem, berlatar `abu-900` 90% dengan blur latar 8px dan bingkai gradien abu. Logo di kiri (tanda 1.75rem dan nama 700), tombol Secondary kecil dan Primary kecil di kanan. Di bawah 25rem, padding dan celah dirapatkan.
- **Kaki halaman:** tautan Teks Redup tanpa garis bawah dengan tinggi sentuh 2.75rem, yang berubah `indigo-300` dan bergaris bawah saat hover.

### Kotak Label (signature)
Kotak bertint warna Label tanpa bingkai, radius 0.75rem, padding 1rem. Kisinya menempatkan ikon 2.5rem di kiri, merentang dua baris, lalu kata Label (Label-kata) dan "Skor N dari 100" berangka tabular. Di bawahnya ada meter 20 sel setinggi 0.625rem dengan celah 2px. Sel terisi memakai warna Label penuh, sel kosong memakai tint 18%. Kalau gerak diizinkan, sel terisi satu per satu (jeda 24ms per sel).

### Hasil cek
Hasil muncul di panel alat yang sama, di bawah sekat Garis Terang, dan barisnya muncul berurutan (jeda 60ms) kalau gerak diizinkan. Bagian-bagiannya dipisah garis senyap di atasnya, bukan kotak bersarang. Bagian "Kalau sudah telanjur" juga bagian bersekat dengan judul Merah Pastel. Tanda bahaya bernomor dalam petak indigo bertint, dengan kutipan `indigo-200`. Teks yang dicek tampil di kotak Sumur bergulir (maks. 16rem) dengan `<mark>` kuning bergaris bawah.

## Do's and Don'ts

### Do:
- **Do** pakai bingkai gradien 1 px (`bingkai-gradien`, atau `bingkai-gradien-aksen` untuk permukaan utama) untuk memisahkan permukaan gelap dari latar.
- **Do** beri setiap Label tiga penanda: warna pastel, bentuk ikon SVG, dan kata.
- **Do** taruh semua gerak (kilau judul, transisi, muncul saat digulir, meter) di dalam `@media (prefers-reduced-motion: no-preference)`.
- **Do** jaga target sentuh minimal 2.75rem (`target-min`), termasuk tautan sebaris di daftar Langkah lewat padding vertikal.
- **Do** tampilkan domain resmi sebagai teks biasa di samping setiap tautan Langkah.
- **Do** definisikan nilai baru sebagai token di `:root`, lalu pakai lewat `var(--…)` di aturan.

### Don't:
- **Don't** pakai warna Label pastel di luar hasil cek dan legendanya.
- **Don't** beri kartu atau bilah bayangan; bayangan hanya milik panel alat cek.
- **Don't** biarkan elemen cahaya lebih lebar dari layar; hanya gradiennya yang berukuran tetap.
- **Don't** pakai emoji sebagai ikon Label; ikon digambar sebagai SVG `currentColor`.
- **Don't** taruh label kecil berhuruf kapital di atas judul atau angka.
