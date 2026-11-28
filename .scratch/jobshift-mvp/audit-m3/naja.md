# Audit Rilis M3 — Tahap 1c: Waktu Respons Cek dari HP (Data Seluler)

- **Auditor:** Ayudhya Naja
- **Tiket rujukan:** [`.scratch/jobshift-mvp/issues/14-audit-rilis-m3.md`](../issues/14-audit-rilis-m3.md) (kriteria: *20 percobaan dari HP lewat data seluler: p95 < 5 detik*)
- **Acuan metrik:** `PRD.md` (p95 < 5 detik), `.scratch/jobshift-mvp/spec.md` (batas waktu AI 3,5 detik lewat `AbortSignal` agar p95 total tetap < 5 detik)
- **Status:** Menunggu 20 hasil pengukuran dari HP

---

## 1. Metode Pengukuran yang Dipilih

**Pilihan utama:** **Chrome DevTools Remote (`chrome://inspect`) dari laptop ke HP Android**.
**Cadangan:** Stopwatch (hanya jika tidak memungkinkan menyambungkan HP ke laptop dengan kabel USB).

Alasan memilih `chrome://inspect`:
- Kriteria mengukur **dari menekan tombol Cek sampai judul hasil (`#judul-hasil`, "Hasil cek") muncul di layar**, bukan hanya waktu respons API di tab Network.
- Dengan DevTools Remote, kita bisa menjalankan snippet pengukur presisi milidetik (`performance.now()`) langsung di browser HP sambil tetap memantau tab **Network** (`POST /api/cek`) untuk membaca `sumberPenilaian` dan `catatanAI`.

### Langkah Pengukuran dengan `chrome://inspect`

1. **Siapkan HP Android & laptop:**
   - Matikan Wi-Fi di HP, pastikan hanya memakai **data seluler** (4G/5G).
   - Aktifkan **USB Debugging** di *Developer options* HP, lalu sambungkan HP ke laptop dengan kabel USB (izinkan *Allow USB debugging* di layar HP).
   - Buka Chrome di HP dan buka **URL publik Vercel** aplikasi JobShift.
2. **Buka DevTools Remote di laptop:**
   - Buka Chrome di laptop, masuk ke `chrome://inspect/#devices`.
   - Pada perangkat HP yang muncul, klik **inspect** pada tab halaman JobShift.
3. **Siapkan pengukur otomatis di tab Console (sekali per sesi halaman):**
   - Tempel dan tekan Enter pada snippet berikut di tab **Console** DevTools Remote:

```js
(() => {
  let t0 = 0;
  let aktif = false;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('button[type="submit"]');
    if (!btn) return;
    t0 = performance.now();
    aktif = true;
  }, true);

  const obs = new MutationObserver(() => {
    if (!aktif) return;
    const h2 = document.getElementById("judul-hasil");
    if (h2 && h2.textContent.includes("Hasil cek")) {
      const ms = Math.round(performance.now() - t0);
      aktif = false;
      console.log("[AUDIT-M3] Waktu sampai judul hasil muncul:", ms, "ms");
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
```

   *(Catatan: Jika melakukan cek ulang untuk teks berikutnya, tombol **Cek** tetap memicu pengukuran baru selama `#judul-hasil` di-render ulang atau diperbarui; untuk hasil paling bersih antar percobaan, muat ulang halaman atau pantau juga durasi `POST /api/cek` di tab **Network** -> klik request `cek` -> tab **Response** untuk melihat `sumberPenilaian` dan `catatanAI`.)*
4. **Jalankan 20 percobaan berurutan di layar HP:**
   - Untuk nomor **1–4**: ketuk masing-masing **4 tombol contoh**, lalu ketuk **Cek**. *(Catatan: sesuai `spec.md`, tombol contoh memakai keluaran AI statis di server sehingga mengukur latensi penuh endpoint tanpa menunggu Groq.)*
   - Untuk nomor **5–20**: salin teks uji dari bagian **Daftar 20 Teks Uji** di bawah, tempel ke kotak teks di HP, lalu ketuk **Cek**.
   - Catat angka `ms` dari Console serta nilai `sumberPenilaian` (`"aturan"` atau `"aturan+AI"`) dan ada/tidaknya `catatanAI: "ai_tidak_tersedia"` (di UI juga muncul catatan kecil di bawah penjelasan bila AI gagal/timeout).

### Prosedur Cadangan (Stopwatch)
Jika tidak memakai laptop: buka aplikasi stopwatch di perangkat kedua (atau split-screen), tekan **Start** bersamaan dengan mengetuk tombol **Cek** di HP, tekan **Stop** begitu judul **"Hasil cek"** muncul dan layar menggulir ke hasil, lalu konversi ke milidetik (`detik × 1000`). Catat di kolom catatan jika ada pesan AI tidak tersedia di bawah penjelasan.

---

## 2. Identitas Perangkat, Jaringan, dan Lingkungan Uji

*(Isi sebelum/saat pengujian)*

- **URL publik Vercel:** `...`
- **Model HP:** `...`
- **Browser & versi (HP):** `...`
- **Operator seluler:** `...`
- **Jenis jaringan & kekuatan sinyal:** `...` *(mis. 4G LTE, 3/4 bar)*
- **Tanggal & jam uji (WIB):** `...`

---

## 3. Tabel Hasil 20 Percobaan

> Semua teks berasal dari 4 tombol contoh (`src/cek/contoh.ts`) dan `data/dev.jsonl` (tidak memakai Set test). Teks sedang (~1.150–1.450 karakter) dan panjang (~2.650–2.900 karakter) diperpanjang dari entri `data/dev.jsonl` dengan rincian deskripsi pekerjaan yang sejalan untuk menguji variasi panjang hingga mendekati batas 3.000 karakter.

| No | Teks uji | Panjang (kar) | Waktu (ms) | sumberPenilaian / catatan AI |
| --- | --- | --- | --- | --- |
| 1 | `contoh-tugas` — Palsu (tugas) (Tombol contoh) | 358 | | |
| 2 | `contoh-lokal` — Palsu (lokal) (Tombol contoh) | 312 | | |
| 3 | `contoh-luar_negeri` — Palsu (luar_negeri) (Tombol contoh) | 294 | | |
| 4 | `contoh-resmi` — Asli (Tombol contoh) | 347 | | |
| 5 | `dev-001` — Palsu (tugas) (dev.jsonl — pendek) | 243 | | |
| 6 | `dev-003` — Palsu (lokal) (dev.jsonl — pendek) | 298 | | |
| 7 | `dev-006` — Palsu (luar_negeri) (dev.jsonl — pendek) | 256 | | |
| 8 | `dev-008` — Asli (dev.jsonl — pendek) | 260 | | |
| 9 | `dev-010` — Asli (dev.jsonl — pendek) | 287 | | |
| 10 | `dev-059` — Asli (dev.jsonl — pendek) | 247 | | |
| 11 | `dev-002` — Palsu (tugas) (dev.jsonl — sedang (diperpanjang)) | 1179 | | |
| 12 | `dev-005` — Palsu (luar_negeri) (dev.jsonl — sedang (diperpanjang)) | 1156 | | |
| 13 | `dev-014` — Palsu (lokal) (dev.jsonl — sedang (diperpanjang)) | 1189 | | |
| 14 | `dev-007` — Asli (dev.jsonl — sedang (diperpanjang)) | 1227 | | |
| 15 | `dev-009` — Asli (dev.jsonl — sedang (diperpanjang)) | 1228 | | |
| 16 | `dev-011` — Palsu (tugas) (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2840 | | |
| 17 | `dev-013` — Palsu (tugas) (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2797 | | |
| 18 | `dev-019` — Palsu (luar_negeri) (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2708 | | |
| 19 | `dev-020` — Asli (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2894 | | |
| 20 | `dev-026` — Asli (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2900 | | |

---

## 4. Ringkasan Statistik & Kesimpulan

*(Akan dihitung setelah 20 angka pengukuran dikirimkan)*

- **Rumus p50 (median):** Untuk $n = 20$ data terurut $x_1 \le x_2 \le \dots \le x_{20}$,
  $$p_{50} = \frac{x_{10} + x_{11}}{2}$$
- **Rumus p95 (persentil ke-95):** Menggunakan metode *nearest-rank*, indeks $k = \lceil 0{,}95 \times n \rceil = \lceil 0{,}95 \times 20 \rceil = 19$, sehingga:
  $$p_{95} = x_{19}$$
  *(Jika memakai interpolasi linear tipe R-7: posisi $h = 1 + 0{,}95 \times (20 - 1) = 19{,}05$, yakni $x_{19} + 0{,}05(x_{20} - x_{19})$; kedua angka akan dicantumkan jika ada perbedaan signifikan di sekitar ambang 5.000 ms.)*
- **p50:** `... ms`
- **p95:** `... ms`
- **Maksimum:** `... ms`
- **Jumlah percobaan dengan AI timeout / `ai_tidak_tersedia`:** `...`
- **Kesimpulan (Target p95 < 5.000 ms):** `MENUNGGU DATA`

---

## 5. Daftar 20 Teks Uji (Siap Salin)

### 1. `contoh-tugas` — Palsu (tugas) (358 karakter)

```text
Halo kak, kami dari tim marketing online sedang mencari 20 orang untuk kerja paruh waktu dari HP. Tugasnya hanya like dan follow akun toko online, komisi Rp 10.000 per tugas, bisa dicairkan setiap hari. Untuk naik level VIP dan membuka tugas berkomisi besar, kamu wajib deposit Rp 200.000 dulu. Kuota terbatas, daftar sekarang juga lewat Telegram admin kami.
```

### 2. `contoh-lokal` — Palsu (lokal) (312 karakter)

```text
LOWONGAN KERJA PT GARUDA PANGAN NUSANTARA Tbk. Dibutuhkan operator produksi, lulusan SMA/SMK, gaji Rp 15.000.000 per bulan plus mess. Pelamar yang lolos wajib membayar biaya seragam dan medical check up Rp 750.000 sebelum interview. Kirim lamaran ke rekrutmen.garudapangan.pusat@gmail.com paling lambat hari ini.
```

### 3. `contoh-luar_negeri` — Palsu (luar_negeri) (294 karakter)

```text
Dibuka lowongan customer service di Kamboja, gaji 1.500 USD per bulan, tidak perlu pengalaman. Tiket pesawat dan tempat tinggal ditanggung perusahaan. Berangkat pakai visa wisata dulu, nanti visa kerja diurus setelah sampai. Tidak perlu lewat agen resmi, proses cepat 1 minggu langsung terbang.
```

### 4. `contoh-resmi` — Asli (347 karakter)

```text
PT Sinar Pangan Nusantara membuka lowongan Staf Administrasi Gudang untuk kantor cabang di Jl. Industri Raya No. 12, Cikarang, Bekasi. Syarat: lulusan D3 atau S1, terbiasa memakai spreadsheet, dan teliti. Lamaran dikirim melalui portal karier di situs resmi perusahaan atau Karirhub Kemnaker. Seluruh proses rekrutmen tidak dipungut biaya apa pun.
```

### 5. `dev-001` — Palsu (tugas) (243 karakter)

```text
Lowongan kerja online paruh waktu! Tugasmu cuma like dan follow akun toko, dibayar Rp 15.000 per tugas. Untuk naik level VIP dan mencairkan komisi wajib top-up deposit Rp 200.000 dulu. Gabung grup Telegram admin di t.me/kerjaonline_vip ya kak.
```

### 6. `dev-003` — Palsu (lokal) (298 karakter)

```text
DIBUTUHKAN SEGERA staf gudang PT Sinar Abadi Logistik, lulusan SMA, tanpa pengalaman. Gaji Rp 12.000.000 per bulan plus mess. Peserta wajib transfer biaya seragam dan medical check up Rp 450.000 ke rekening 0000111122 a.n. Budi Santoso sebelum interview. Kirim CV ke rekrutmen.sinarabadi@gmail.com.
```

### 7. `dev-006` — Palsu (luar_negeri) (256 karakter)

```text
Peluang kerja ke Jepang tanpa LPK dan tanpa tes bahasa. Gaji Rp 30.000.000 per bulan untuk operator pabrik. Cukup bayar uang proses visa Rp 15.000.000, berangkat 2 minggu lagi pakai visa kunjungan dulu nanti diubah di sana. Hubungi Pak Joko 0813-0000-3333.
```

### 8. `dev-008` — Asli (260 karakter)

```text
Dicari barista untuk kedai kopi kami di Yogyakarta. Shift pagi atau sore, 8 jam per hari. Gaji sesuai UMK ditambah uang makan dan tip. Pelatihan diberikan gratis. Datang langsung bawa CV ke Jalan Kaliurang km 5 setiap Senin sampai Jumat jam 10.00 sampai 15.00.
```

### 9. `dev-010` — Asli (287 karakter)

```text
Program penempatan Pekerja Migran Indonesia ke Korea Selatan skema G to G. Pendaftaran hanya melalui situs resmi BP2MI dan wajib lulus ujian EPS-TOPIK. Waspadai calo yang menjanjikan kelulusan atau meminta uang. Informasi lengkap tersedia di kanal resmi pemerintah dan Disnaker setempat.
```

### 10. `dev-059` — Asli (247 karakter)

```text
Lowongan Barista dan Kasir untuk gerai baru kami di Makassar. Info ini kami bagikan juga di akun TikTok resmi, tapi lamaran hanya diterima lewat halaman karier di situs perusahaan. Tidak ada formulir lewat Telegram dan tidak ada biaya pendaftaran.
```

### 11. `dev-002` — Palsu (tugas) (1179 karakter)

```text
Halo kak, kami dari agensi pemasaran sedang cari freelancer kasih rating bintang 5 dan ulasan di marketplace. Komisi Rp 50.000 per ulasan, cair tiap hari. Setelah tugas ke-3 kakak perlu isi saldo Rp 300.000 supaya komisi bisa ditarik. Chat admin Nadia di WhatsApp 0812-0000-1111.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.

Apabila terdapat kendala saat verifikasi tugas atau pencairan saldo, peserta diarahkan menghubungi mentor masing-masing agar slot tugas berbayar pada sesi berikutnya tidak dialihkan ke pendaftar lain yang sedang menunggu giliran.
```

### 12. `dev-005` — Palsu (luar_negeri) (1156 karakter)

```text
Kerja di Kamboja sebagai customer service online, gaji Rp 25.000.000 per bulan, tidak perlu pengalaman dan tidak perlu bahasa Inggris. Berangkat pakai visa turis, semua diurus agensi, proses cepat 1 minggu langsung terbang. Tiket dan hotel ditanggung. Daftar via Telegram @agen_kamboja.

Kandidat akan bekerja di area perkantoran terpadu dengan fasilitas asrama bersama, makan tiga kali sehari, serta akses internet penuh selama masa kontrak awal dua belas bulan yang dapat diperpanjang sesuai evaluasi.

Selama masa orientasi dua minggu pertama, peserta mendapatkan pendampingan penggunaan perangkat lunak operasional kantor dan skrip layanan pelanggan berbahasa Indonesia untuk menangani pertanyaan pengguna harian.

Pihak penyelenggara menyebut seluruh pengurusan dokumen perjalanan, penjemputan di bandara tujuan, dan penempatan kamar disiapkan oleh tim lapangan sehingga peserta tidak perlu mengurus berkas tambahan di instansi daerah.

Karena kuota keberangkatan kelompok bulan ini terbatas untuk beberapa gelombang saja, pendaftar yang berminat diminta segera mengirimkan konfirmasi kesediaan berangkat agar kursi penerbangan dapat langsung dicatat.
```

### 13. `dev-014` — Palsu (lokal) (1189 karakter)

```text
LOWONGAN KERJA PT INDOMARCO PRISMATAMA. Dibutuhkan Kru Toko dan Kasir untuk penempatan di seluruh Indonesia. Gaji Rp4.500.000 sampai Rp7.000.000. Pendaftaran GRATIS, tidak dipungut biaya. Klik link berikut lalu isi nama lengkap dan nomor Telegram aktif: bit.ly/loker-indomaret0000. Kuota terbatas, segera daftar!

Kandidat terpilih akan ditempatkan sesuai kebutuhan operasional cabang dan diharapkan mampu bekerja dalam sistem pembagian waktu pagi maupun malam, mengikuti standar kerapian area kerja, serta mematuhi arahan koordinator lapangan.

Dokumen yang perlu disiapkan meliputi fotokopi ijazah terakhir, daftar riwayat hidup terbaru, kartu identitas yang masih berlaku, serta pas foto ukuran empat kali enam latar belakang merah untuk kelengkapan administrasi awal.

Panitia seleksi menjadwalkan pemanggilan peserta secara bertahap berdasarkan urutan konfirmasi yang masuk paling cepat, sehingga pelamar diimbau segera melengkapi persyaratan yang diminta sebelum batas waktu penutupan harian.

Seluruh informasi pemanggilan tahap lanjutan hanya disampaikan kepada pelamar yang sudah melakukan konfirmasi kehadiran dan menyelesaikan kelengkapan berkas sesuai arahan petugas rekrutmen.
```

### 14. `dev-007` — Asli (1227 karakter)

```text
PT Maju Jaya Retailindo membuka lowongan Staff Administrasi Gudang di Cikarang. Kualifikasi: minimal D3, pengalaman 1 tahun, menguasai Excel. Gaji Rp 5.200.000 per bulan plus BPJS. Lamaran dikirim melalui portal karier resmi di majujaya.co.id/karier. Seluruh proses rekrutmen tidak dipungut biaya.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.
```

### 15. `dev-009` — Asli (1228 karakter)

```text
Rumah Sakit Sehat Sentosa membutuhkan Perawat Pelaksana. Syarat: lulusan D3 atau S1 Keperawatan, memiliki STR aktif, bersedia kerja shift. Kirim berkas lamaran ke rekrutmen@rssehatsentosa.co.id paling lambat 15 Desember. Hanya kandidat terpilih yang akan dihubungi untuk tes tertulis dan wawancara.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.
```

### 16. `dev-011` — Palsu (tugas) (2840 karakter)

```text
Halo kak, kami dari platform yang bekerja sama dengan merchant dan sedang buka kerja sampingan tanpa modal. Tugasnya cuma follow dan like akun Instagram seorang blogger, bisa dikerjakan dari HP. Komisi dibayar setiap hari, antara Rp40 ribu sampai Rp288 ribu tergantung jumlah tugas. Kalau berminat, balas pesan ini nanti saya masukkan ke grup Telegram untuk arahan tugas.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.

Apabila terdapat kendala saat verifikasi tugas atau pencairan saldo, peserta diarahkan menghubungi mentor masing-masing agar slot tugas berbayar pada sesi berikutnya tidak dialihkan ke pendaftar lain yang sedang menunggu giliran.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.

Apabila terdapat kendala saat verifikasi tugas atau pencairan saldo, peserta diarahkan menghubungi mentor masing-masing agar slot tugas berbayar pada sesi berikutnya tidak dialihkan ke pendaftar lain yang sedang menunggu giliran.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.
```

### 17. `dev-013` — Palsu (tugas) (2797 karakter)

```text
Info untuk member grup VIP: tugas hari ini adalah tugas transaksi. Silakan deposit Rp996.000 dulu untuk membuka reward, dana plus keuntungan 20% kembali setelah tugas selesai. Bagi yang sudah sampai tahap akhir, wajib deposit Rp14.700.000 agar saldo bisa ditarik. Kalau tidak menyelesaikan tugas, saldo sebelumnya hangus ya kak.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.

Apabila terdapat kendala saat verifikasi tugas atau pencairan saldo, peserta diarahkan menghubungi mentor masing-masing agar slot tugas berbayar pada sesi berikutnya tidak dialihkan ke pendaftar lain yang sedang menunggu giliran.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.

Apabila terdapat kendala saat verifikasi tugas atau pencairan saldo, peserta diarahkan menghubungi mentor masing-masing agar slot tugas berbayar pada sesi berikutnya tidak dialihkan ke pendaftar lain yang sedang menunggu giliran.

Rincian pekerjaan harian meliputi pengecekan tautan produk, pemberian ulasan singkat sesuai panduan admin grup, serta pengiriman tangkapan layar bukti pengerjaan ke koordinator tim setiap pukul 19.00 WIB.

Peserta yang konsisten menyelesaikan seluruh misi harian selama tiga hari berturut-turut dijanjikan kenaikan tingkat keanggotaan sehingga nilai komisi per tugas meningkat dua kali lipat dan bonus mingguan langsung masuk ke saldo akun.

Setiap anggota baru diminta menyiapkan ponsel Android atau iOS dengan koneksi internet stabil, aplikasi pesan instan aktif, serta catatan rekening pribadi atau dompet digital untuk pencairan dana setelah target misi tercapai.
```

### 18. `dev-019` — Palsu (luar_negeri) (2708 karakter)

```text
Lowongan customer service perusahaan fintech di Laos. Syarat mudah: bisa mengetik di komputer, tidak perlu ijazah, tidak perlu pengalaman. Gaji fantastis dalam dolar, makan dan mess ditanggung. Berangkat pakai visa turis dulu, nanti diurus di sana oleh perusahaan. Info lanjut kirim pesan ke halaman Facebook kami.

Kandidat akan bekerja di area perkantoran terpadu dengan fasilitas asrama bersama, makan tiga kali sehari, serta akses internet penuh selama masa kontrak awal dua belas bulan yang dapat diperpanjang sesuai evaluasi.

Selama masa orientasi dua minggu pertama, peserta mendapatkan pendampingan penggunaan perangkat lunak operasional kantor dan skrip layanan pelanggan berbahasa Indonesia untuk menangani pertanyaan pengguna harian.

Pihak penyelenggara menyebut seluruh pengurusan dokumen perjalanan, penjemputan di bandara tujuan, dan penempatan kamar disiapkan oleh tim lapangan sehingga peserta tidak perlu mengurus berkas tambahan di instansi daerah.

Karena kuota keberangkatan kelompok bulan ini terbatas untuk beberapa gelombang saja, pendaftar yang berminat diminta segera mengirimkan konfirmasi kesediaan berangkat agar kursi penerbangan dapat langsung dicatat.

Kandidat akan bekerja di area perkantoran terpadu dengan fasilitas asrama bersama, makan tiga kali sehari, serta akses internet penuh selama masa kontrak awal dua belas bulan yang dapat diperpanjang sesuai evaluasi.

Selama masa orientasi dua minggu pertama, peserta mendapatkan pendampingan penggunaan perangkat lunak operasional kantor dan skrip layanan pelanggan berbahasa Indonesia untuk menangani pertanyaan pengguna harian.

Pihak penyelenggara menyebut seluruh pengurusan dokumen perjalanan, penjemputan di bandara tujuan, dan penempatan kamar disiapkan oleh tim lapangan sehingga peserta tidak perlu mengurus berkas tambahan di instansi daerah.

Karena kuota keberangkatan kelompok bulan ini terbatas untuk beberapa gelombang saja, pendaftar yang berminat diminta segera mengirimkan konfirmasi kesediaan berangkat agar kursi penerbangan dapat langsung dicatat.

Kandidat akan bekerja di area perkantoran terpadu dengan fasilitas asrama bersama, makan tiga kali sehari, serta akses internet penuh selama masa kontrak awal dua belas bulan yang dapat diperpanjang sesuai evaluasi.

Selama masa orientasi dua minggu pertama, peserta mendapatkan pendampingan penggunaan perangkat lunak operasional kantor dan skrip layanan pelanggan berbahasa Indonesia untuk menangani pertanyaan pengguna harian.

Pihak penyelenggara menyebut seluruh pengurusan dokumen perjalanan, penjemputan di bandara tujuan, dan penempatan kamar disiapkan oleh tim lapangan sehingga peserta tidak perlu mengurus berkas tambahan di instansi daerah.
```

### 19. `dev-020` — Asli (2894 karakter)

```text
Lowongan Operator Produksi di PT Sumber Plastik Nusantara, Karawang, tayang di Karirhub Kemnaker. Syarat: lulusan SMK, sehat jasmani, bersedia kerja shift. Gaji sesuai UMK Karawang, BPJS Kesehatan dan Ketenagakerjaan. Lamar lewat akun Karirhub masing-masing. Pertanyaan seputar platform dapat disampaikan ke hotline Kemnaker 1500630.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.

Pelamar diimbau memastikan seluruh data pada riwayat hidup sesuai dengan pengalaman sebenarnya dan hanya mengikuti pengumuman yang berasal dari kanal komunikasi resmi perusahaan yang tercantum pada pengumuman lowongan ini.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.

Pelamar diimbau memastikan seluruh data pada riwayat hidup sesuai dengan pengalaman sebenarnya dan hanya mengikuti pengumuman yang berasal dari kanal komunikasi resmi perusahaan yang tercantum pada pengumuman lowongan ini.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.
```

### 20. `dev-026` — Asli (2900 karakter)

```text
Dicari Senior Backend Engineer untuk perusahaan teknologi logistik di Jakarta. Minimal 5 tahun pengalaman dengan Go atau Java dan sistem terdistribusi. Gaji Rp25.000.000 sampai Rp35.000.000 per bulan, saham karyawan, dan asuransi keluarga. Proses: tes teknis, dua kali wawancara, dan reference check. Lamar lewat halaman karier perusahaan.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.

Pelamar diimbau memastikan seluruh data pada riwayat hidup sesuai dengan pengalaman sebenarnya dan hanya mengikuti pengumuman yang berasal dari kanal komunikasi resmi perusahaan yang tercantum pada pengumuman lowongan ini.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.

Kandidat yang diharapkan memiliki kemampuan komunikasi yang baik, terbiasa bekerja sama dalam tim maupun mandiri, teliti dalam memeriksa detail dokumen, serta bersedia mengikuti pelatihan awal yang diselenggarakan oleh unit kerja.

Fasilitas dan hak karyawan mengikuti ketentuan ketenagakerjaan yang berlaku, termasuk kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, cuti tahunan, tunjangan sesuai kebijakan perusahaan, serta lingkungan kerja yang terstruktur.

Tahapan seleksi terdiri dari peninjauan berkas lamaran, wawancara dengan tim rekrutmen dan pengguna, serta verifikasi dokumen sebelum penandatanganan perjanjian kerja resmi di kantor perusahaan pada jam kerja.

Pelamar diimbau memastikan seluruh data pada riwayat hidup sesuai dengan pengalaman sebenarnya dan hanya mengikuti pengumuman yang berasal dari kanal komunikasi resmi perusahaan yang tercantum pada pengumuman lowongan ini.

Tanggung jawab utama posisi ini mencakup pencatatan aktivitas harian secara rapi, koordinasi rutin dengan tim operasional terkait, pemantauan kualitas layanan sesuai standar prosedur perusahaan, serta penyusunan laporan berkala kepada atasan langsung.
```
