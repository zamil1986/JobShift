# Spec — JobShift MVP (P0)

Status: ready-for-agent

Sumber: [PRD.md](../../PRD.md), [GLOSSARY.md](../../GLOSSARY.md), [ADR-0001](../../docs/adr/0001-ai-hanya-menambah.md), [ADR-0002](../../docs/adr/0002-penyangkal-membatalkan-aturan-kritis.md), [riset AI/IASC](../../docs/research/ai-api-and-iasc.md). Spec ini menggantikan "tab Spesifikasi MVP" yang dirujuk PRD. Kalau spec ini dan PRD bertentangan, spec yang berlaku.

## Problem Statement

Pencari kerja usia 17–30 tahun menerima tawaran kerja lewat WhatsApp, Telegram, dan media sosial, di luar job portal yang memverifikasi lowongan. Mereka tidak punya cara cepat menilai apakah tawaran itu penipuan. Kebanyakan baru sadar setelah mentransfer "biaya seragam", deposit "naik level", atau mengirim KTP dan OTP. Kanal resmi seperti IASC dan aduankonten.id baru bekerja setelah kejadian. Mereka butuh penilaian risiko dalam hitungan detik, dengan alasan yang menunjuk kalimat di pesan itu sendiri dan arahan ke kanal resmi, sebelum mereka bertindak.

## Solution

Sebuah web app tanpa login. Pengguna menempelkan Teks lowongan atau mengunggah screenshot yang dibaca OCR di browser, lalu menekan Cek. Dalam kurang dari 5 detik JobShift menampilkan:

- Label (Risiko rendah, Waspada, atau Bahaya) beserta Skor 0–100.
- Daftar Tanda bahaya, dengan Kutipan pemicu yang di-highlight di Teks asli.
- Tanda bahaya tersirat (informasi yang tidak ada), ditampilkan terpisah.
- Modus yang cocok dan Penjelasan singkat dalam bahasa awam.
- Langkah aman sesuai Label dan Modus terkuat, serta Langkah darurat untuk yang sudah telanjur bertindak.

Penilaian utamanya berasal dari mesin Aturan yang deterministik. AI (Groq) hanya boleh menambah Tanda bahaya, dan Cek tetap berjalan tanpa AI. Halaman Cara kerja menjelaskan cara penilaian, angka akurasi asli dari Set test, dan kebijakan privasi.

## User Stories

**Input**

1. Sebagai pencari kerja, saya ingin menempelkan Teks lowongan ke satu kotak teks, supaya saya tidak perlu mengisi formulir apa pun.
2. Sebagai pencari kerja, saya ingin melihat penghitung karakter, supaya saya tahu Teks saya masih dalam batas.
3. Sebagai pencari kerja, saya ingin tombol Cek nonaktif saat kotak kosong, supaya saya tidak menekan tombol yang tidak berbuat apa-apa.
4. Sebagai pencari kerja yang menempel Teks kurang dari 50 karakter, saya ingin diberi tahu bahwa teksnya terlalu pendek dan diminta menempel seluruh pesan, supaya saya tidak mendapat Label yang menyesatkan.
5. Sebagai pencari kerja yang menempel Teks lebih dari 3.000 karakter, saya ingin pesan yang jelas bahwa teksnya terlalu panjang, supaya saya bisa memangkasnya.
6. Sebagai pencari kerja, saya ingin melihat disclaimer privasi singkat di bawah tombol Cek, supaya saya tahu Teks saya tidak disimpan.
7. Sebagai pencari kerja, saya ingin mengunggah screenshot PNG, JPG, atau WebP sampai 5 MB, supaya saya tidak perlu mengetik ulang.
8. Sebagai pencari kerja, saya ingin melihat progres OCR, supaya saya tahu aplikasinya sedang bekerja.
9. Sebagai pencari kerja, saya ingin mengedit hasil bacaan OCR sebelum Cek, supaya salah baca bisa saya perbaiki.
10. Sebagai pencari kerja yang screenshot-nya gagal dibaca, saya ingin diarahkan untuk menempel teks, supaya saya tetap bisa mengecek.
11. Sebagai pencari kerja, saya ingin screenshot saya tidak pernah diunggah ke server, supaya data di gambar tetap di HP saya.

**Hasil**

12. Sebagai pencari kerja, saya ingin melihat Label dengan warna, ikon, dan kata, supaya saya paham walaupun buta warna.
13. Sebagai pencari kerja, saya ingin melihat Skor, supaya saya tahu seberapa kuat Tanda bahayanya.
14. Sebagai pencari kerja, saya ingin daftar Tanda bahaya diurutkan dari yang paling berat, supaya yang paling penting saya baca duluan.
15. Sebagai pencari kerja, saya ingin kalimat pemicu di-highlight di Teks saya, supaya saya bisa mengenali pola serupa nanti.
16. Sebagai pencari kerja, saya ingin melihat informasi penting yang tidak ada (misalnya nama perusahaan) di daftar terpisah, supaya saya tahu apa yang perlu ditanyakan.
17. Sebagai pencari kerja, saya ingin tahu Modus penipuan mana yang cocok, supaya saya paham polanya.
18. Sebagai pencari kerja, saya ingin Penjelasan paling banyak 3 kalimat dalam bahasa awam, supaya cepat dipahami.
19. Sebagai pencari kerja yang mendapat Risiko rendah, saya ingin peringatan tetap yang terlihat tanpa scroll bahwa ini bukan jaminan, supaya saya tidak merasa aman lalu mentransfer uang.
20. Sebagai pencari kerja, saya ingin hasil tidak pernah memakai kata "aman", "asli", "legit", atau "terpercaya", supaya saya tidak salah mengira lowongannya dijamin.
21. Sebagai pencari kerja yang AI-nya sedang gagal, saya ingin tetap mendapat hasil dari Aturan dengan catatan kecil, supaya Cek tidak pernah gagal total.
22. Sebagai pencari kerja, saya ingin input yang sama selalu memberi Label yang sama, supaya hasilnya bisa dipercaya.

**Langkah aman**

23. Sebagai pencari kerja, saya ingin langkah umum sesuai Label, supaya saya tahu harus berbuat apa.
24. Sebagai pencari kerja, saya ingin langkah spesifik untuk Modus terkuat, supaya sarannya relevan.
25. Sebagai calon pekerja migran (Andi), saya ingin tautan cek legalitas P3MI dan nomor pengaduan KP2MI setiap kali Modus Luar negeri terdeteksi, supaya saya bisa mengecek jalur resmi.
26. Sebagai korban yang sudah telanjur transfer, saya ingin bagian "Sudah telanjur transfer?" (IASC, bank atau e-wallet, Kontak OJK 157), supaya saya cepat bertindak dalam hitungan jam.
27. Sebagai korban yang sudah telanjur kirim data, saya ingin bagian "Sudah telanjur kirim data?", supaya saya tahu cara mengamankan akun.
28. Sebagai pencari kerja, saya ingin setiap tautan menampilkan domainnya dan membuka situs resmi, supaya saya tidak tertipu tautan palsu.
29. Sebagai pencari kerja, saya ingin tautan ke Karirhub Kemnaker dan aduankonten.id, supaya saya bisa mencari loker resmi dan melapor.

**Contoh, aksesibilitas, kepercayaan**

30. Sebagai juri atau pengguna baru, saya ingin 4 tombol contoh (tugas, lokal, luar negeri, asli), supaya saya paham cara kerjanya dengan satu klik.
31. Sebagai juri, saya ingin contoh selalu memberi hasil yang sama dan cepat, supaya demo tidak bergantung pada kuota AI.
32. Sebagai pengguna keyboard, saya ingin menjalankan seluruh alur tanpa mouse, supaya saya tidak tertinggal.
33. Sebagai pengguna screen reader, saya ingin hasil dibacakan otomatis setelah Cek, supaya saya tahu Labelnya tanpa mencari.
34. Sebagai pengguna dengan penglihatan lemah (Bu Sari), saya ingin huruf minimal 16 px, kontras cukup, dan area sentuh besar, supaya mudah dipakai di HP.
35. Sebagai pengguna yang peka gerakan, saya ingin animasi mengikuti `prefers-reduced-motion`, supaya saya nyaman.
36. Sebagai pengguna yang ragu, saya ingin halaman Cara kerja berisi ringkasan aturan, angka akurasi dengan pembilang dan penyebut, jumlah contoh sintetis, dan batasan, supaya saya tahu seberapa jauh hasilnya bisa dipercaya.
37. Sebagai pengguna yang peduli privasi, saya ingin tahu bahwa data pribadi disamarkan sebelum dikirim ke AI dan bahwa Groq mungkin menyimpan log sampai 30 hari, supaya saya bisa memutuskan sendiri.
38. Sebagai guru BK (Pak Hendra), saya ingin membuka aplikasi di proyektor dan HP siswa mulai lebar 360 px, supaya bisa didemokan di kelas.

**API dan tim**

39. Sebagai pengembang, saya ingin `POST /api/cek` dengan `{teks}` yang mengembalikan hasil lengkap, supaya UI dan pengujian memakai satu kontrak.
40. Sebagai pengembang, saya ingin input tidak valid dijawab 400 dengan pesan yang jelas, supaya error mudah dipahami.
41. Sebagai anggota tim, saya ingin `npm run eval` mencetak recall, presisi, false positive, asli → Waspada, dan tabel confusion untuk mode aturan, AI saja, dan gabungan, supaya angka di proposal jujur.
42. Sebagai pemegang Set test, saya ingin Set test tidak pernah dipakai untuk menyetel Aturan, supaya angka akurasinya sah.
43. Sebagai pengembang, saya ingin API key hanya ada di environment variable server, supaya tidak bocor lewat repo publik.
44. Sebagai juri, saya ingin README menjelaskan cara menjalankan dan arsitekturnya, supaya kode mudah dinilai.

## Implementation Decisions

### Stack

- Next.js App Router dengan TypeScript strict, di-deploy ke Vercel. Satu halaman cek+hasil (`/`) dan satu halaman Cara kerja (`/cara-kerja`).
- Zod untuk validasi input API dan keluaran AI. Skema Zod yang sama diubah menjadi JSON Schema untuk `response_format` Groq.
- Vitest untuk tes, ESLint tanpa error.
- Tesseract.js dengan data bahasa `ind`+`eng`, berjalan sepenuhnya di browser (Web Worker). Data bahasa di-host sendiri di folder publik, supaya tidak bergantung pada CDN pihak ketiga saat penjurian.
- `groq-sdk`, model `openai/gpt-oss-120b`, `strict: true` `json_schema`, `maxRetries: 0`, `logLevel` `warn`. `gpt-oss-20b` juga diukur di eval, lalu dipilih yang lebih baik.

### Modul

Satu modul inti yang dalam dengan antarmuka kecil, ditambah pembungkus tipis:

- **Inti Cek**: `cek(teks, { ai }) → Promise<HasilCek>`. Ini satu-satunya pintu masuk penilaian. Di dalamnya, secara berurutan:
  1. validasi panjang;
  2. mesin Aturan atas Teks asli (sinkron);
  3. Penyamaran, lalu panggilan AI yang berjalan bersamaan;
  4. validasi dan penyaringan Tanda bahaya AI;
  5. Skor, Label, dan Modus terkuat;
  6. Penjelasan, lalu Langkah aman.

  Modul dalamnya (katalog Aturan, Penyamaran, penggabung AI, penyusun copy) bersifat privat untuk inti dan tidak dites langsung.
- **Adapter AI**: `PenilaiAI = (teksTersamar: string, signal: AbortSignal) => Promise<unknown>`. Ada tiga implementasi:
  - **Groq**, untuk produksi.
  - **Statis**, yang mengembalikan keluaran tersimpan untuk Teks contoh FR-08 (dikunci dengan hash Teks yang sudah dinormalisasi). Tidak ada perubahan kontrak API: kalau Teks persis sama dengan sebuah contoh, server memakai keluaran statis.
  - **Palsu**, untuk tes.

  Inti memvalidasi keluaran AI dengan Zod. Adapter tidak dipercaya.
- **Route API** `POST /api/cek`: parse JSON → `cek()` → JSON. Tidak ada logika penilaian di sini. Isi Teks tidak pernah di-log.
- **Skrip eval** `npm run eval`: membaca dataset dan memanggil inti dengan adapter perekam. Satu panggilan AI per contoh dipakai ulang untuk mode "AI saja" dan "gabungan", lalu tabelnya dicetak.
- **UI**: komponen client untuk input, OCR, dan render hasil. UI hanya me-render `HasilCek` dan tidak menghitung apa pun.

### Kontrak `HasilCek` (respons API 200)

```ts
type Label = "risiko_rendah" | "waspada" | "bahaya";
type Modus = "tugas" | "lokal" | "luar_negeri";

type HasilCek = {
  label: Label;
  skor: number;                      // 0–100, bilangan bulat
  tandaBahaya: {                     // urut bobot menurun, lalu posisi kutipan
    sumber: "aturan" | "ai";
    aturanId?: string;               // hanya untuk sumber "aturan"; tidak ditampilkan di UI
    alasan: string;
    kutipan: string;                 // potongan persis dari Teks asli
    rentang: [number, number];       // offset karakter di Teks asli, untuk highlight
    bobot: number;
    modus?: Modus;
  }[];
  tandaBahayaTersirat: { alasan: string; bobot: number }[];
  modus: Modus[];                    // semua yang cocok, urut jumlah bobot
  modusTerkuat: Modus | null;
  penjelasan: string;                // ≤ 3 kalimat
  langkahAman: { umum: Langkah[]; spesifik: Langkah[] };
  langkahDarurat: { sudahTransfer: Langkah[]; sudahKirimData: Langkah[] } | null; // null untuk Risiko rendah
  sumberPenilaian: "aturan" | "aturan+AI";
  catatanAI?: "ai_tidak_tersedia";   // AI timeout, gagal, atau keluaran tidak valid
};
type Langkah = { teks: string; tautan?: { url: string; domain: string } };
```

Error 400: `{ error: { kode: "teks_kosong" | "teks_terlalu_pendek" | "teks_terlalu_panjang" | "format_tidak_valid", pesan: string } }`. Pesannya dalam bahasa awam dan sama dengan pesan di UI.

### Panjang Teks

- Panjang dihitung setelah trim. Di bawah 50 karakter atau di atas 3.000 karakter, Cek tidak dijalankan: tombol di UI tidak menjalankan Cek dan API menjawab 400.
- Teks tidak pernah dipotong otomatis. Hasil OCR yang lebih dari 3.000 karakter tetap tampil di kotak yang bisa diedit, dengan penghitung, supaya pengguna bisa memangkasnya.

### Mesin Aturan

- Setiap Aturan berisi ID, alasan (bahasa awam), daftar pola, bobot, status kritis, dan modus (0 atau 1). Aturan kritis selalu berbobot 60.
- Pencocokan:
  - Teks dinormalisasi untuk pencocokan saja: huruf kecil, spasi berlebih dipadatkan, dengan peta offset kembali ke Teks asli.
  - `kutipan` selalu diambil dari Teks asli lewat `rentang`.
  - Satu Aturan menghasilkan paling banyak satu Tanda bahaya, yaitu kecocokan pertama yang sah.
- Penyangkal ("tidak", "tanpa", "bebas", "jangan", "gratis", plus "no"/"free" untuk pola Inggris) yang muncul ≤ 3 kata sebelum kata pemicu, dalam klausa yang sama (tidak melewati ".", "!", "?", atau "," yang diikuti spasi), membatalkan kecocokan itu. Ini hanya berlaku untuk Aturan kritis R01, R02, R03, dan R07 (ADR-0002). Kecocokan berikutnya di Teks yang sama tetap diperiksa.
- R04 (gaji tidak wajar) tidak berlaku kalau Teks memuat penanda luar negeri, yaitu nama negara atau kota tujuan umum atau kata "luar negeri"/"overseas".
- Deterministik: tidak ada waktu, acak, atau jaringan di mesin Aturan.

**Katalog awal.** Bobot non-kritis di bawah ini adalah titik awal. Bobot disetel pada Set dev, lalu dibekukan di M3, dan jarak Penyangkal 3 kata tidak diubah.

| ID | Aturan (alasan ringkas) | Contoh pola (ID + EN) | Bobot | Kritis | Modus |
| --- | --- | --- | --- | --- | --- |
| R01 | Meminta uang sebelum diterima kerja | biaya seragam/medical/pelatihan/pendaftaran/administrasi, transfer dulu, registration fee, pay first | 60 | ya | Lokal |
| R02 | Meminta OTP, PIN, atau password | kode OTP, PIN, kata sandi, password, verification code | 60 | ya | — |
| R03 | Kerja luar negeri dengan visa kunjungan atau wisata | visa turis/wisata/kunjungan/on arrival, visa free untuk kerja | 60 | ya | Luar negeri |
| R04 | Gaji tidak wajar untuk kerja dalam negeri | gaji ≥ Rp15 juta/bulan untuk posisi tanpa syarat, Rp500 ribu–Rp2 juta per hari, high salary (khusus dalam negeri) | 25 | tidak | Lokal |
| R05 | Gaji luar negeri tinggi tanpa syarat keahlian | gaji 2-digit juta + "tanpa pengalaman"/"tanpa skill" + negara tujuan | 25 | tidak | Luar negeri |
| R06a | Kontak hanya lewat nomor pribadi | hubungi WA 08xx, chat admin, contact via WhatsApp | 15 | tidak | — |
| R06b | Diminta pindah ke Telegram atau aplikasi lain | lanjut di Telegram, join grup Telegram, move to Telegram | 20 | tidak | Tugas |
| R07 | Deposit atau top-up untuk naik level atau mencairkan komisi | deposit, top up, naik level, VIP, cairkan komisi | 60 | ya | Tugas |
| R08 | Bayaran per like, rating, ulasan, atau follow | like/subscribe/rating/ulasan dibayar, per tugas Rp | 25 | tidak | Tugas |
| R09 | Langsung diterima tanpa seleksi | langsung kerja, tanpa interview, pasti diterima | 15 | tidak | — |
| R10 | Mendesak dan membatasi waktu | kuota terbatas, hari ini juga, segera, urgent, limited slots | 10 | tidak | — |
| R11 | Mengatasnamakan perusahaan besar dengan kontak tidak resmi | nama PT/BUMN besar + email @gmail/@yahoo atau nomor pribadi | 20 | tidak | Lokal |
| R12 | Proses berangkat ke luar negeri cepat di luar jalur resmi | berangkat cepat, tanpa PT/P3MI, paspor diurus, tiket ditanggung | 25 | tidak | Luar negeri |
| R13 | Tanda bahaya tersirat: tidak ada nama perusahaan atau alamat kantor | ketiadaan nama badan usaha (PT/CV/Tbk/nama toko) **dan** ketiadaan alamat | 10 | tidak | — |
| R14 | Meminta data pribadi sensitif di awal | kirim foto KTP, selfie dengan KTP, nomor rekening, KK, ibu kandung | 20 | tidak | — |
| R15 | Tautan pendaftaran tidak resmi | bit.ly, s.id, tinyurl, form Google untuk perusahaan besar | 15 | tidak | — |
| R16 | Negara tujuan rawan TPPO untuk kerja online | Kamboja, Myanmar, Laos, Thailand perbatasan + admin/operator/customer service online | 25 | tidak | Luar negeri |

- R13 adalah satu Aturan yang menghasilkan paling banyak satu Tanda bahaya tersirat (bobot 10). Alasannya menyebut apa yang tidak ada, misalnya "Tidak disebutkan nama perusahaan maupun alamat kantor." R13 hanya cocok kalau keduanya tidak ada.

### Skor, Label, Modus

- Skor = min(100, Σ bobot Tanda bahaya Aturan + Tanda bahaya tersirat + min(25, 10 × jumlah Tanda bahaya AI yang sah)).
- Label: 0–24 Risiko rendah, 25–59 Waspada, ≥ 60 Bahaya. Satu Aturan kritis berbobot 60, jadi otomatis Bahaya. AI sendirian paling banyak +25, jadi tidak pernah sampai Bahaya.
- Modus: jumlahkan bobot per modus dari Tanda bahaya Aturan. `modus` berisi semua modus yang berbobot > 0. Modus terkuat adalah yang terbesar; kalau seri, urutannya Luar negeri, Lokal, Tugas. Kalau tidak ada yang cocok, nilainya `null`.

### Penyamaran dan lapisan AI

- Penyamaran diterapkan berurutan:
  1. email → `[EMAIL]`;
  2. 16 digit berurutan (NIK) → `[NIK]`;
  3. nomor HP Indonesia `(+62|62|0)8` + 7–11 digit, boleh dipisah spasi atau tanda hubung → `[NOMOR]`;
  4. 10–15 digit berurutan lain (rekening) → `[REKENING]`.

  Angka dengan pemisah ribuan atau yang didahului "Rp" tidak tersentuh, supaya informasi gaji tetap terbaca AI. Aturan selalu menilai Teks asli.
- **Timeout AI 3,5 detik** lewat `AbortSignal` yang dikendalikan inti (menggantikan 6 detik di PRD). Dengan begitu p95 total < 5 detik masih menyisakan ruang untuk jaringan HP. Timeout, 429, 5xx, JSON tidak valid, atau skema tidak cocok → hasil Aturan saja dengan `catatanAI`.
- Skema keluaran AI: `{ label, tanda_bahaya: [{ kutipan, alasan }], penjelasan }`, tanpa skor dan tanpa modus (ADR-0001). Maksimal 5 butir `tanda_bahaya` dibaca.
- Penyaringan Tanda bahaya AI. Butir AI dibuang kalau:
  - kutipannya tidak ditemukan (pencocokan ternormalisasi) di Teks tersamar;
  - kutipannya memuat penanda `[…]`;
  - rentangnya beririsan dengan rentang Tanda bahaya Aturan mana pun (irisan karakter ≥ 1).

  Karena kutipan yang sah tidak memuat penanda, kutipan itu juga substring Teks asli, jadi `rentang` dicari langsung di Teks asli.
- `sumberPenilaian` bernilai `"aturan+AI"` kalau AI menjawab dengan keluaran yang valid secara skema, walaupun semua butirnya terbuang.
- System prompt disimpan sebagai konstanta yang byte-identik antar panggilan, supaya prefix cache Groq bisa kena.

### Penjelasan dan kata terlarang

- Penjelasan templat = satu kalimat per Label + satu kalimat untuk Modus terkuat (kalau ada). Totalnya ≤ 3 kalimat.
- Penjelasan AI menggantikan templat hanya kalau label versi AI sama dengan Label akhir, Penjelasan itu ≤ 3 kalimat, dan lolos filter kata terlarang.
- **Cakupan kata terlarang** ("aman", "asli", "legit", "terpercaya", sebagai kata utuh): berlaku untuk semua teks hasil yang dihasilkan, yaitu Label, Penjelasan, alasan Tanda bahaya, dan copy Langkah aman. Tagline dan URL/domain resmi (misalnya `migran-aman.kp2mi.go.id`) dikecualikan. Tes memeriksa seluruh copy statis dan Penjelasan AI yang lolos.
- Peringatan tetap Risiko rendah (teks persis dari FR-06) selalu tampil di atas daftar, terlihat tanpa scroll di layar 360 × 640.

### Langkah aman dan Langkah darurat

- Copy disimpan sebagai data statis (satu tabel per Label dan per Modus), bukan dihasilkan AI. Setiap tautan menyimpan `domain` yang ditampilkan di samping teks tautan.
- Kanal yang wajib ada: Karirhub Kemnaker, aduankonten.id, IASC `https://iasc.ojk.go.id/`, Kontak OJK 157. Untuk Modus Luar negeri: `https://migran-aman.kp2mi.go.id/cek-legalitas`, KP2MI 0800-1000, WA 0811-8080-141.
- `langkahDarurat` diisi untuk Waspada dan Bahaya. Untuk Risiko rendah nilainya `null`.

### UI dan aksesibilitas

- Teks pengguna dan kutipan di-render sebagai node teks, tidak pernah lewat `dangerouslySetInnerHTML`. Highlight dibuat dengan memecah Teks asli berdasarkan `rentang` (`<mark>`).
- Region hasil memakai `aria-live="polite"`. Setelah Cek, fokus dipindah ke judul hasil.
- Mengikuti NFR-06 dan NFR-07: kontras 4,5:1, huruf ≥ 16 px, target sentuh 44 px, `prefers-reduced-motion`, lebar mulai 360 px.
- Tagline "JobShift — cek dulu sebelum transfer." tampil di halaman cek dan di halaman hasil.

### Dataset dan eval

- Format JSONL, satu objek per baris: `{ id, teks, kebenaran: "palsu" | "asli", modus?: Modus, sumber: string, sintetis: boolean }`. Sudah disamarkan dari nomor, nama orang, dan rekening sebelum di-commit.
- Set dev (60) di-commit sejak awal. Set test (40) dipegang anggota yang tidak menyetel Aturan dan baru di-commit setelah bobot dibekukan di M3. Sebelum itu, `npm run eval --set test` hanya dijalankan oleh pemegangnya.
- `npm run eval` mencetak, per mode (aturan / AI saja / gabungan):
  - recall palsu → Waspada atau Bahaya;
  - presisi;
  - false positive asli → Bahaya;
  - asli → Waspada;
  - tabel confusion 2×3;
  - jumlah contoh sintetis;
  - p95 latensi AI.

  Mode "AI saja" menghitung Skor dari Tanda bahaya AI yang sah saja, jadi tidak pernah Bahaya (ini disengaja, ADR-0001).
- Hasil eval Set test ditulis ke file JSON yang dibaca halaman Cara kerja saat build. Angka di halaman itu tidak diketik tangan.

## Testing Decisions

- **Satu seam: `cek(teks, { ai })`.** Semua tes perilaku masuk lewat fungsi ini dan memeriksa `HasilCek`. Tes tidak memeriksa fungsi internal (regex, normalisasi, penggabung), supaya katalog dan implementasi bisa disetel tanpa memecahkan tes.
- **Pengecualian: `buatCek(katalog)`.** `cek` dibuat sebagai `buatCek(KATALOG)`. Tes yang butuh bobot di luar katalog asli (batas Label 24/25/59/60, batas Skor 100, seri Modus terkuat) memakai `buatCek` dengan katalog sintetis, jadi tetap melewati jalur `cek()` yang lengkap. `buatCek` tidak diekspor dari `@/cek` dan tidak pernah dipakai route, UI, atau eval. Alasannya, semua bobot katalog kelipatan 5 dan AI paling banyak +25, jadi Skor 24 dan 59 tidak pernah bisa dihasilkan katalog asli.
- Tes yang baik menyatakan perilaku yang terlihat pengguna: "Teks ini memberi Label Bahaya dengan Tanda bahaya R01 berkutipan 'biaya seragam'". Bukan "fungsi X dipanggil".
- Setiap Aturan punya minimal satu tes positif dan satu tes negatif. R01, R02, R03, dan R07 juga punya tes negatif berisi penyangkalan dan tes "penyangkal lalu kecocokan kedua tetap tertangkap" (ADR-0002).
- Yang dites lewat seam:
  - batas panjang 49/50/3.000/3.001;
  - batas Label 24/25/59/60;
  - batas Skor 100;
  - urutan seri Modus terkuat;
  - R04 tidak cocok di Teks luar negeri;
  - kutipan yang tidak peka huruf besar/kecil dan spasi;
  - determinisme (dua kali Cek → hasil identik).
- AI dites dengan adapter palsu:
  - jawaban valid menambah +10 per butir sampai maksimal +25;
  - kutipan tidak ada di Teks → dibuang;
  - kutipan memuat `[NOMOR]` → dibuang;
  - butir yang beririsan dengan Aturan → dibuang;
  - skema rusak → `catatanAI`;
  - adapter lambat → hasil Aturan saja setelah 3,5 detik (fake timers Vitest);
  - AI tidak pernah menurunkan Skor (properti: Skor gabungan ≥ Skor Aturan saja).
- Penyamaran dites lewat seam dengan adapter perekam: Teks yang sampai ke AI tidak memuat nomor HP, NIK, rekening, atau email dari input, tetapi masih memuat "Rp 8.000.000".
- Kata terlarang: satu tes memindai seluruh copy statis (templat Penjelasan, alasan Aturan, Langkah aman) dan satu tes memastikan Penjelasan AI yang memuat "aman" tidak dipakai.
- Route API: beberapa tes tipis yang memanggil handler langsung, untuk 200 dengan bentuk `HasilCek` dan 400 untuk setiap `kode` error.
- Di luar Vitest: Lighthouse Accessibility ≥ 95 dan uji keyboard manual di URL publik, 20 percobaan latensi dari HP lewat data seluler, serta uji "matikan API key, 5 contoh tetap berlabel".
- Prior art: repo belum punya kode atau tes. Pola di atas menjadi prior art pertama.

## Out of Scope

- Semua FR P1: bacakan hasil (FR-13), bagikan ke WhatsApp (FR-14), halaman Kenali modus (FR-15), batas pemakaian Upstash (FR-16), statistik agregat (FR-17). FR-16 menjadi spec pertama setelah finalis.
- Cadangan AI kedua (Cloudflare Workers AI).
- Input berupa URL lowongan.
- Verifikasi legalitas perusahaan, penyimpanan laporan pelaku, akun pengguna.
- Hasil AI yang tampil bertahap. Satu respons utuh dipilih supaya sederhana.

## Further Notes

- **Keputusan baru yang menyimpang dari PRD:** timeout AI 3,5 detik (bukan 6 detik); cakupan kata terlarang hanya untuk teks hasil yang dihasilkan; Penyangkal hanya untuk Aturan kritis R01/R02/R03/R07 (glossary diselaraskan; R07 ditambahkan di tiket 04, R03 di tiket 06). PRD, glossary, dan ADR-0001 diperbarui agar sesuai.
- Pertanyaan terbuka yang memblokir pekerjaan manusia, bukan agen: siapa memegang Set test, pembagian peran A–E, dan apakah Free plan Groq mendukung ZDR. Kalau ZDR tidak tersedia, halaman Cara kerja memuat kalimat log 30 hari.
- Milestone: M2 (27 November) butuh seluruh FR P0 jalan di lokal. Urutan yang disarankan untuk `/to-tickets`: kerangka Next.js + deploy kosong (M1) → inti Cek dengan Aturan saja → UI teks → Langkah aman → AI → OCR → contoh → Cara kerja + eval.
