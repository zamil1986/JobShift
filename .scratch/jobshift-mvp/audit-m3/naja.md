# Audit Rilis M3 — Tahap 1c: Waktu Respons Cek dari HP (Data Seluler)

- **Auditor:** Ayudhya Naja
- **Tiket rujukan:** [`.scratch/jobshift-mvp/issues/14-audit-rilis-m3.md`](../issues/14-audit-rilis-m3.md) (kriteria: _20 percobaan dari HP lewat data seluler: p95 < 5 detik_)
- **Acuan metrik:** `PRD.md` (p95 < 5 detik), `.scratch/jobshift-mvp/spec.md` (batas waktu AI 3,5 detik lewat `AbortSignal` agar p95 total tetap < 5 detik)
- **URL yang diuji:** https://job-shift-navy.vercel.app (production, deploy dari `main`). **Jangan** memakai URL preview PR (`job-shift-git-...vercel.app`), karena isinya bukan `main`.
- **Status:** Menunggu 20 hasil pengukuran dari HP. Pengukuran baru bisa dimulai setelah `GROQ_API_KEY` terpasang lagi di production (lihat bagian 1, langkah 4).

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
   - Aktifkan **USB Debugging** di _Developer options_ HP, lalu sambungkan HP ke laptop dengan kabel USB (izinkan _Allow USB debugging_ di layar HP).
   - Buka Chrome di HP dan buka https://job-shift-navy.vercel.app.
   - Supaya teks uji mudah disalin di HP, buka juga file ini di GitHub lewat Chrome HP (tab kedua). Setiap blok teks di bagian 5 punya tombol salin di pojok kanan atas.
2. **Buka DevTools Remote di laptop:**
   - Buka Chrome di laptop, masuk ke `chrome://inspect/#devices`.
   - Pada perangkat HP yang muncul, klik **inspect** pada tab halaman JobShift.
   - Di tab **Network** DevTools, pastikan throttling **No throttling** dan _Disable cache_ tidak dicentang. Jaringan yang diukur harus jaringan seluler HP apa adanya.
3. **Pasang pengukur di tab Console (sekali per pemuatan halaman):**
   - Tempel snippet berikut di tab **Console** DevTools Remote, lalu tekan Enter. Kalau halaman dimuat ulang, snippet hilang dan harus ditempel lagi. Kalau tidak sengaja ditempel dua kali, muncul peringatan dan pengukur tidak terpasang dobel.

```js
(() => {
  if (window.__auditM3)
    return console.warn("[AUDIT-M3] Pengukur sudah terpasang.");
  const catatan = (window.__auditM3 = []);
  let t0 = 0,
    sedangCek = false,
    respons = null;

  // Baca sumberPenilaian dan catatanAI dari respons POST /api/cek.
  const fetchAsli = window.fetch;
  window.fetch = async (...args) => {
    const res = await fetchAsli(...args);
    if (String(args[0]).includes("/api/cek")) {
      respons = res
        .clone()
        .json()
        .then(
          (b) => ({
            http: res.status,
            sumber: b?.sumberPenilaian ?? "-",
            catatanAI: b?.catatanAI ?? "-",
          }),
          () => ({ http: res.status, sumber: "-", catatanAI: "-" }),
        );
    }
    return res;
  };

  // Mulai: form dikirim (tombol Cek diketuk).
  document.addEventListener(
    "submit",
    () => {
      t0 = performance.now();
      respons = null;
    },
    true,
  );

  // Selesai: tombol Cek aktif lagi. Hasil baru di-render pada saat yang sama.
  new MutationObserver(async () => {
    const tombol = document.querySelector("button.tombol-cek");
    if (!tombol) return;
    if (tombol.disabled) {
      sedangCek = true;
      return;
    }
    if (!sedangCek) return;
    sedangCek = false;
    const ms = Math.round(performance.now() - t0);
    const adaHasil = !!document.getElementById("judul-hasil");
    const r = (await respons) ?? { http: "-", sumber: "-", catatanAI: "-" };
    catatan.push({ no: catatan.length + 1, ms: adaHasil ? ms : null, ...r });
    console.log(
      "[AUDIT-M3] #" +
        catatan.length +
        ": " +
        (adaHasil ? ms + " ms" : "tanpa hasil (galat)") +
        " | HTTP " +
        r.http +
        " | " +
        r.sumber +
        " | catatanAI: " +
        r.catatanAI,
    );
  }).observe(document.body, {
    attributes: true,
    attributeFilter: ["disabled"],
    subtree: true,
  });
})();
```

_Cara kerjanya:_ waktu dihitung dari form dikirim sampai tombol **Cek** aktif lagi. `FormCek` mematikan tombol selama menunggu `/api/cek`, lalu menyalakannya kembali di render yang sama dengan hasil baru, jadi saat itu judul **"Hasil cek"** (`#judul-hasil`) sudah ada di layar. Setiap baris Console sudah memuat waktu (ms), `sumberPenilaian`, dan `catatanAI`, jadi tab Network tidak perlu dibuka satu per satu. Setelah 20 percobaan, jalankan `console.table(window.__auditM3)` dan salin tabelnya ke bagian 3.

_Kenapa tidak memakai snippet versi pertama:_ versi pertama menunggu perubahan `childList` di DOM. `FormCek` tidak menghapus hasil lama saat Cek berikutnya berjalan, jadi kalau teks yang sama dicek ulang (misalnya saat mengulang percobaan), DOM hanya berubah isi teksnya dan snippet tidak mencatat apa pun. Ini terbukti saat snippet diuji di `npm run dev` lokal. Saran "muat ulang halaman" juga tidak bisa dipakai, karena snippet Console ikut hilang saat halaman dimuat ulang. Snippet di atas sudah diuji di lokal untuk lima keadaan: tombol contoh, dua teks berbeda, teks yang sama dicek ulang, teks terlalu pendek (tidak dicatat karena tidak dikirim ke server), dan tempel dua kali. Angka dari laptop **tidak** dipakai di tabel.

4. **Pemeriksaan awal sebelum percobaan 1 (wajib):**
   - Di Tahap 1a, `GROQ_API_KEY` sempat dihapus dari production untuk uji "API key dimatikan" ([daniel.md bagian 4](daniel.md)). Per 28 Nov 2026 sekitar 21.15 WIB key **belum** dipasang lagi, dan saat review PR #12 production masih menjawab teks bebas dengan `ai_tidak_tersedia` (tiket [17-groq-api-key-production.md](../issues/17-groq-api-key-production.md)). Uji ini baru dijalankan setelah tiket itu selesai. Kalau dijalankan sebelumnya, p95 yang diukur hanya p95 Aturan saja dan kriteria ini belum teruji.
   - Tempel satu teks bebas yang **bukan** tombol contoh dan **bukan** salah satu dari 20 teks uji (misalnya `dev-004` dari `data/dev.jsonl`), lalu ketuk **Cek**. Hasil yang benar: `aturan+AI` dan `catatanAI: -`. Kalau muncul `aturan | catatanAI: ai_tidak_tersedia`, berhenti dan minta Zamil memeriksa `GROQ_API_KEY` di Vercel.
   - Percobaan pemeriksaan ini **tidak** dihitung di 20 percobaan. Jalankan `window.__auditM3.length = 0` sesudahnya supaya nomor percobaan mulai dari 1.
5. **Jalankan 20 percobaan berurutan di layar HP:**
   - Untuk nomor **1–4**: ketuk masing-masing **4 tombol contoh**, lalu ketuk **Cek**. _(Catatan: tombol contoh dijawab adapter Statis di server (`src/cek/statis.ts`) tanpa memanggil Groq. Percobaan 1–4 mengukur jaringan HP dan server, tapi bukan waktu tunggu Groq.)_
   - Untuk nomor **5–20**: salin teks uji dari bagian **Daftar 20 Teks Uji** di bawah, tempel ke kotak teks di HP, lalu ketuk **Cek**. Pastikan penghitung karakter di bawah kotak cocok dengan kolom "Panjang" di tabel.
   - Beri jeda beberapa detik antarpercobaan, terutama untuk teks panjang, supaya tidak terkena batas laju Groq.
   - Percobaan yang gagal (`tanpa hasil (galat)`, HTTP 429/5xx, atau `ai_tidak_tersedia`) **tetap dicatat apa adanya** dan tidak diulang diam-diam. Kalau perlu diulang, catat keduanya dan tandai di kolom catatan.
   - Percobaan pertama setelah aplikasi lama tidak dibuka bisa lebih lambat karena _cold start_ fungsi Vercel. Ini tetap dihitung, karena pengguna sungguhan juga mengalaminya.

### Prosedur Cadangan (Stopwatch)

Jika tidak memakai laptop: buka aplikasi stopwatch di perangkat kedua (atau split-screen), tekan **Start** bersamaan dengan mengetuk tombol **Cek** di HP, tekan **Stop** begitu judul **"Hasil cek"** muncul dan layar menggulir ke hasil, lalu konversi ke milidetik (`detik × 1000`). Catat di kolom catatan jika ada pesan "Penilaian AI sedang tidak tersedia…" di bawah penjelasan (artinya `catatanAI: ai_tidak_tersedia`). Pemeriksaan awal di langkah 4 tetap wajib: tanpa laptop, lihat ada tidaknya pesan itu pada teks bebas tadi.

Stopwatch tangan punya galat reaksi kira-kira ±0,3 detik per percobaan. Kalau p95 hasil stopwatch jatuh di antara 4.700 dan 5.300 ms, kesimpulannya ditulis "belum pasti" dan pengukuran diulang dengan `chrome://inspect`.

---

## 2. Identitas Perangkat, Jaringan, dan Lingkungan Uji

_(Isi sebelum/saat pengujian)_

- **URL publik Vercel:** https://job-shift-navy.vercel.app
- **Commit `main` yang ter-deploy saat uji:** `...` _(lihat deployment production terbaru di dashboard Vercel, atau `git log -1 origin/main`)_
- **`GROQ_API_KEY` aktif di production (pemeriksaan awal langkah 4):** `ya / tidak`
- **Metode:** `chrome://inspect` / stopwatch
- **Model HP:** `...`
- **Browser & versi (HP):** `...`
- **Operator seluler:** `...`
- **Jenis jaringan & kekuatan sinyal:** `...` _(mis. 4G LTE, 3/4 bar)_
- **Tanggal & jam uji (WIB):** `...`

---

## 3. Tabel Hasil 20 Percobaan

> Semua teks berasal dari 4 tombol contoh (`src/cek/contoh.ts`) dan `data/dev.jsonl` (tidak memakai Set test). Contoh terpanjang di `data/dev.jsonl` hanya 371 karakter, jadi teks sedang (1.156–1.228 karakter) dan panjang (2.708–2.900 karakter) dibuat dari entri `data/dev.jsonl` yang diberi paragraf rincian pekerjaan tambahan. Kalimat pembukanya tetap persis sama dengan entri aslinya. Teks yang diperpanjang dipakai untuk uji waktu saja, bukan untuk eval, dan Palsu/Asli di tabel adalah `kebenaran` entri aslinya. Panjang dihitung setelah _trim_, sama seperti penghitung di bawah kotak teks.

| No  | Teks uji                                                                     | Panjang (kar) | Waktu (ms) | sumberPenilaian / catatanAI | Catatan |
| --- | ---------------------------------------------------------------------------- | ------------- | ---------- | --------------------------- | ------- |
| 1   | `contoh-tugas` — Palsu (tugas) (Tombol contoh)                               | 358           |            |                             |         |
| 2   | `contoh-lokal` — Palsu (lokal) (Tombol contoh)                               | 312           |            |                             |         |
| 3   | `contoh-luar_negeri` — Palsu (luar_negeri) (Tombol contoh)                   | 294           |            |                             |         |
| 4   | `contoh-resmi` — Asli (Tombol contoh)                                        | 347           |            |                             |         |
| 5   | `dev-001` — Palsu (tugas) (dev.jsonl — pendek)                               | 243           |            |                             |         |
| 6   | `dev-003` — Palsu (lokal) (dev.jsonl — pendek)                               | 298           |            |                             |         |
| 7   | `dev-006` — Palsu (luar_negeri) (dev.jsonl — pendek)                         | 256           |            |                             |         |
| 8   | `dev-008` — Asli (dev.jsonl — pendek)                                        | 260           |            |                             |         |
| 9   | `dev-010` — Asli (dev.jsonl — pendek)                                        | 287           |            |                             |         |
| 10  | `dev-059` — Asli (dev.jsonl — pendek)                                        | 247           |            |                             |         |
| 11  | `dev-002` — Palsu (tugas) (dev.jsonl — sedang (diperpanjang))                | 1179          |            |                             |         |
| 12  | `dev-005` — Palsu (luar_negeri) (dev.jsonl — sedang (diperpanjang))          | 1156          |            |                             |         |
| 13  | `dev-014` — Palsu (lokal) (dev.jsonl — sedang (diperpanjang))                | 1189          |            |                             |         |
| 14  | `dev-007` — Asli (dev.jsonl — sedang (diperpanjang))                         | 1227          |            |                             |         |
| 15  | `dev-009` — Asli (dev.jsonl — sedang (diperpanjang))                         | 1228          |            |                             |         |
| 16  | `dev-011` — Palsu (tugas) (dev.jsonl — mendekati 3.000 (diperpanjang))       | 2840          |            |                             |         |
| 17  | `dev-013` — Palsu (tugas) (dev.jsonl — mendekati 3.000 (diperpanjang))       | 2797          |            |                             |         |
| 18  | `dev-019` — Palsu (luar_negeri) (dev.jsonl — mendekati 3.000 (diperpanjang)) | 2708          |            |                             |         |
| 19  | `dev-020` — Asli (dev.jsonl — mendekati 3.000 (diperpanjang))                | 2894          |            |                             |         |
| 20  | `dev-026` — Asli (dev.jsonl — mendekati 3.000 (diperpanjang))                | 2900          |            |                             |         |

---

## 4. Ringkasan Statistik & Kesimpulan

_(Akan dihitung setelah 20 angka pengukuran dikirimkan)_

- **Rumus p50 (median):** Untuk $n = 20$ data terurut $x_1 \le x_2 \le \dots \le x_{20}$,
  $$p_{50} = \frac{x_{10} + x_{11}}{2}$$
- **Rumus p95 (persentil ke-95):** Menggunakan metode _nearest-rank_, indeks $k = \lceil 0{,}95 \times n \rceil = \lceil 0{,}95 \times 20 \rceil = 19$, sehingga:
  $$p_{95} = x_{19}$$
  _(Jika memakai interpolasi linear tipe R-7: posisi $h = 1 + 0{,}95 \times (20 - 1) = 19{,}05$, yakni $x\_{19} + 0{,}05(x\_{20} - x\_{19})$; kedua angka akan dicantumkan jika ada perbedaan signifikan di sekitar ambang 5.000 ms.)_<br>
  _Metode nearest-rank ini sama dengan `hitungP95` di `src/eval/eval.ts` (p95 latensi AI di `npm run eval`), jadi kedua angka p95 di proyek memakai cara yang sama. Dengan $n = 20$, p95 adalah nilai terbesar kedua: satu percobaan paling lambat boleh melewati 5 detik, dua tidak._
- **p50:** `... ms`
- **p95 (20 percobaan, angka resmi kriteria):** `... ms`
- **Maksimum:** `... ms`
- **p95 16 percobaan teks bebas saja (no. 5–20, tanpa tombol contoh; informasi tambahan):** `... ms` _(nearest-rank, $\lceil 0{,}95 \times 16 \rceil = 16$, jadi nilai maksimum dari 16 percobaan itu)_
- **Jumlah percobaan dengan `catatanAI: ai_tidak_tersedia`:** `...` dari 16 percobaan teks bebas
- **Dugaan AI timeout:** `...` _(percobaan dengan `ai_tidak_tersedia` dan waktu ≥ 3.500 ms. Klien tidak bisa membedakan timeout dari 429, 5xx, atau keluaran tidak valid, karena semuanya menjadi `ai_tidak_tersedia`. Percobaan yang cepat tapi tetap `ai_tidak_tersedia` dicatat sebagai "AI gagal, bukan timeout".)_
- **Kesimpulan (Target p95 < 5.000 ms):** `MENUNGGU DATA`

**Syarat hasil sah.** Kesimpulan LULUS hanya sah kalau pemeriksaan awal (bagian 1, langkah 4) menunjukkan `aturan+AI` dan sebagian besar percobaan 5–20 juga `aturan+AI`. Kalau lebih dari separuh percobaan 5–20 berakhir `ai_tidak_tersedia`, yang terukur hanyalah jalur Aturan saja. Kesimpulannya ditulis "belum teruji", lalu pengukuran diulang setelah penyebabnya diperbaiki.

**Kalau GAGAL.** Buat tiket baru di `.scratch/jobshift-mvp/issues/` dengan `Status: needs-triage`, berisi p95, percobaan yang melewati 5 detik, dan dugaan penyebab (jaringan, cold start, atau Groq). Nomor 16, 17, dan 18 sudah dipakai di `main` (`16-path-windows-cek-dataset.md`, `17-groq-api-key-production.md`, `18-target-sentuh-tautan-teks.md`), jadi tiket baru dari tahap ini memakai nomor **19**, atau nomor kosong berikutnya kalau 19 sudah terpakai saat itu.

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
