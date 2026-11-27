# PRD — JobShift

Nov 26, 2026 · @Jamal

**Tagline:** *JobShift — cek dulu sebelum transfer.* Nama "JobShift" tidak menjelaskan fungsi produk, jadi tagline ini wajib tampil bersama nama di halaman cek dan hasil. Tagline inilah yang memberi tahu pengguna bahwa JobShift memeriksa risiko sebelum mereka membayar.

Dokumen ini menjelaskan apa yang harus dibangun dan kapan MVP JobShift dianggap berhasil. Detail teknisnya (daftar aturan, kontrak API, arsitektur) ada di [spec MVP](.scratch/jobshift-mvp/spec.md).

## Latar belakang dan masalah

Pencari kerja muda tidak punya cara cepat untuk mengecek lowongan yang mereka terima di luar job portal. Banyak yang baru sadar tertipu setelah uang atau data pribadinya terkirim.

- IASC mencatat 26.910 laporan penipuan lowongan kerja sampai sekitar 31 Mei 2026 ([Katadata](https://katadata.co.id/finansial/keuangan/6a4324b291318/korban-scam-tak-tahu-harus-lapor-ke-mana-kenali-layanan-iasc)).
- 80% korban scam baru melapor 12 jam setelah kejadian, padahal dana sudah berpindah dalam hitungan jam ([Kontan, 17 Nov 2026](https://keuangan.kontan.co.id/news/iasc-terima-741545-laporan-scam-80-korban-lapor-setelah-12-jam)).
- Komdigi dan BP2MI memblokir 7.908 konten iklan lowongan luar negeri fiktif pada Januari–Agustus 2026 ([Katadata](https://katadata.co.id/digital/teknologi/6a9ec5336a97b/komdigi-blokir-7908-loker-luar-negeri-palsu-waspada-modus-perdagangan-orang)).

Job portal seperti Jobstreet dan Glints hanya memverifikasi lowongan di dalam platform mereka. Kanal pelaporan seperti IASC dan aduankonten.id bekerja **setelah** kejadian. Celah yang diisi JobShift ada **sebelum** korban mentransfer uang atau mengirim data.

**Pernyataan masalah:** Pencari kerja usia 17–30 tahun yang menerima tawaran lewat pesan pribadi dan media sosial perlu cara menilai risiko penipuan dalam hitungan detik, dengan alasan yang mereka pahami, sebelum mereka membayar atau menyerahkan data.

**Kaitan SDG 8:** target 8.5 (akses ke pekerjaan layak), 8.7 (rekrutmen palsu sebagai pintu masuk perdagangan orang), dan 8.8 (lingkungan kerja yang aman).

## Tujuan, non-tujuan, dan metrik

**Tujuan**

1. Pengguna bisa menilai risiko satu lowongan dalam kurang dari 5 detik, tanpa daftar akun.
2. Setiap hasil menjelaskan **alasannya** dengan menunjuk kalimat pemicu di teks lowongan, atau menyebut informasi penting yang tidak ada.
3. Setiap hasil mengarahkan pengguna ke tindakan aman dan kanal resmi.
4. Akurasi diukur dengan jujur pada dataset yang tidak dipakai saat menyetel aturan.

**Non-tujuan (MVP)**

- Memverifikasi legalitas perusahaan secara resmi.
- Menyimpan atau membagikan laporan nomor dan nama pelaku.
- Menggantikan kanal pelaporan resmi.

**Anti-tujuan** (gagal walaupun aplikasinya jalan): pengguna merasa "aman" padahal lowongannya palsu; perusahaan asli dicap penipu tanpa penjelasan; data pribadi pengguna tersimpan di server.

**Metrik keberhasilan MVP**

| Metrik | Cara ukur | Target awal |
| --- | --- | --- |
| Recall loker palsu (label Waspada atau Bahaya) | `npm run eval` pada set `test` | ≥ 85% |
| False positive (loker asli diberi label Bahaya) | `npm run eval` pada set `test` | ≤ 10% |
| Waktu respons cek teks | 20 percobaan dari HP lewat data seluler, persentil ke-95 | < 5 detik |
| Aksesibilitas | Lighthouse Accessibility di halaman cek dan hasil | ≥ 95 |
| Tetap jalan tanpa AI | matikan API key, lalu cek 5 contoh | 5 dari 5 tetap berlabel |
| Ketersediaan URL | cek URL harian sampai final 10 Desember | selalu aktif |

Target recall dan false positive masih tebakan awal dan ditinjau Jumat setelah uji pada set `dev`. Apa pun hasil akhirnya, angka aslinya yang dilaporkan di proposal.

## Persona

Ketiga persona utama mewakili tiga pola penipuan yang ditangani JobShift. Persona ini fiktif dan disusun dari pola modus yang terdokumentasi. Sebelum proposal ditulis, tim sebaiknya mengonfirmasinya lewat wawancara singkat dengan 3–5 orang sungguhan.

| Persona | Situasi | Pola yang mengancam | Yang dibutuhkan dari JobShift |
| --- | --- | --- | --- |
| **Rina**, 19, lulusan SMK | melamar kerja pabrik dan admin lewat grup WhatsApp loker | loker lokal palsu: biaya seragam/medical, mengatasnamakan PT besar | jawaban cepat "asli atau tidak" sebelum transfer biaya |
| **Bu Sari**, 38, ibu rumah tangga | mencari penghasilan tambahan dari HP | kerja "tugas" like/rating dengan deposit naik level | penjelasan sederhana, huruf besar, bisa dibacakan |
| **Andi**, 24, calon pekerja migran | tergiur tawaran kerja luar negeri bergaji tinggi di TikTok | loker luar negeri fiktif, visa kunjungan wisata, risiko TPPO | tahu tanda bahaya dan ke mana mengecek jalur resmi |
| **Pak Hendra**, guru BK SMK (sekunder) | mengingatkan siswa kelas XII yang akan lulus | semua pola | alat yang bisa didemokan di kelas dan dibagikan ke siswa |

## User stories

Ada 7 story wajib (P0). Kebutuhan fungsional di bagian berikutnya merujuk ke ID story ini.

| ID | Sebagai | Saya ingin | Supaya | Prioritas |
| --- | --- | --- | --- | --- |
| US-01 | pencari kerja | menempelkan teks lowongan dan langsung tahu tingkat risikonya | saya tidak telanjur transfer ke penipu | P0 wajib |
| US-02 | pencari kerja | mengunggah screenshot lowongan | saya tidak perlu mengetik ulang | P0 wajib |
| US-03 | pencari kerja | melihat alasan dan kalimat mana yang mencurigakan | saya paham dan bisa mengenali modus serupa | P0 wajib |
| US-04 | pencari kerja | tahu langkah berikutnya dan kanal resmi | saya bertindak benar, baik sebelum maupun sesudah tertipu | P0 wajib |
| US-05 | pengguna baru atau juri | mencoba contoh lowongan dengan satu klik | saya langsung paham cara kerjanya | P0 wajib |
| US-06 | pengguna screen reader atau keyboard | memakai semua fitur tanpa mouse | saya tidak tertinggal | P0 wajib |
| US-07 | pengguna yang ragu | membaca cara penilaian, akurasi, dan kebijakan privasi | saya tahu seberapa jauh hasilnya bisa dipercaya | P0 wajib |
| US-08 | pengguna yang kurang lancar membaca | mendengar hasil dibacakan | saya tetap paham hasilnya | P1 kalau sempat |
| US-09 | pencari kerja | membagikan peringatan ke grup WhatsApp | teman saya tidak ikut tertipu | P1 kalau sempat |
| US-10 | guru BK | membuka halaman ringkasan modus penipuan | saya bisa mengajarkannya di kelas | P1 kalau sempat |

## Kebutuhan fungsional

Sebuah kebutuhan baru dianggap selesai kalau semua kriteria penerimaannya bisa didemokan dari URL publik, bukan cuma jalan di laptop.

| ID | Kebutuhan | Kriteria penerimaan | Story | Prioritas |
| --- | --- | --- | --- | --- |
| FR-01 | Input teks | Kotak teks 50–3.000 karakter dengan penghitung; tombol Cek nonaktif saat kosong; di bawah 50 karakter Cek tidak dijalankan dan muncul pesan "Teksnya terlalu pendek untuk dinilai, tempel seluruh pesan lowongannya."; lebih dari 3.000 karakter memunculkan pesan yang jelas; disclaimer singkat privasi tampil di bawah tombol Cek | US-01 | P0 wajib |
| FR-02 | Input screenshot | Menerima PNG/JPG/WebP maksimal 5 MB; OCR berjalan di browser dengan indikator progres; teks hasil bacaan tampil dan bisa diedit sebelum dicek; kalau gagal, pengguna diarahkan untuk menempel teks | US-02 | P0 wajib |
| FR-03 | Mesin aturan | Minimal 15 aturan (daftar di [spec MVP](.scratch/jobshift-mvp/spec.md)); setiap aturan yang cocok mengembalikan ID, alasan, dan kutipan pemicu, kecuali Tanda bahaya tersirat (R13) yang tanpa kutipan, berbobot 10, dan tidak pernah kritis; Penyangkal dalam 3 kata sebelum pemicu membatalkan kecocokan R01/R02 ([ADR-0002](docs/adr/0002-penyangkal-membatalkan-aturan-kritis.md)); kata kunci bahasa Inggris inti ada di R01, R02, R04, R06a/b, dan R10; R04 (gaji tidak wajar) hanya untuk kerja dalam negeri; kutipan dicocokkan tanpa membedakan huruf besar/kecil dan spasi berlebih; input yang sama selalu menghasilkan output yang sama; setiap aturan punya minimal 1 tes positif dan 1 tes negatif, dan R01/R02 punya tes negatif berisi penyangkalan | US-01, US-03 | P0 wajib |
| FR-04 | Skor dan label | Skor 0–100 (jumlah bobot, maks 100); label Risiko rendah (0–24), Waspada (25–59), Bahaya (≥60); satu aturan kritis (perilaku yang praktis tidak pernah dilakukan lowongan asli) yang cocok langsung membuat label Bahaya dan skor minimal 60; aturan kritis berbobot 60 untuk urutan dan perhitungan Modus terkuat; setiap aturan ditandai 0 atau 1 modus; Modus terkuat = modus dengan jumlah bobot terbesar, seri diurutkan Luar negeri, Lokal, Tugas | US-01 | P0 wajib |
| FR-05 | Lapisan AI | Groq `openai/gpt-oss-120b`; berjalan paralel dengan aturan; batas waktu 3,5 detik agar p95 total tetap < 5 detik; Teks melalui Penyamaran (nomor HP, rekening, NIK, email diganti penanda) sebelum dikirim; keluaran divalidasi skema `{label, tanda_bahaya:[{kutipan, alasan}], penjelasan}` tanpa skor dan tanpa modus; kalau gagal, hasil aturan tetap tampil dengan catatan; AI hanya menambah tanda bahaya (bobot tetap 10, total maks +25) dan tidak pernah menurunkan skor; tanda bahaya AI tanpa kutipan yang ada di teks tersamar, yang kutipannya memuat penanda, atau yang tumpang-tindih dengan tanda bahaya aturan, dibuang; lihat [ADR-0001](docs/adr/0001-ai-hanya-menambah.md) | US-03 | P0 wajib |
| FR-06 | Halaman hasil | Label tampil sebagai warna + ikon + kata; skor; daftar tanda bahaya diurutkan dari bobot terbesar; kutipan pemicu di-highlight di teks asli; Tanda bahaya tersirat tampil di daftar terpisah tanpa highlight; semua modus yang cocok disebut, urut bobot; penjelasan maksimal 3 kalimat (templat per label ditambah satu kalimat untuk Modus terkuat; boleh diganti Penjelasan AI hanya kalau label versi AI sama dengan Label akhir dan tidak memakai kata terlarang); teks hasil yang dihasilkan (Label, Penjelasan, alasan tanda bahaya, copy Langkah aman) tidak pernah memakai kata "aman", "asli", "legit", atau "terpercaya", kecuali nama merek, tagline, dan domain resmi; label Risiko rendah selalu disertai peringatan tetap yang terlihat tanpa scroll: "Tidak ditemukan tanda bahaya, tapi ini bukan jaminan. Jangan transfer uang apa pun sebelum resmi diterima kerja." | US-01, US-03 | P0 wajib |
| FR-07 | Langkah aman | Langkah umum per label ditambah langkah spesifik untuk Modus terkuat saja; berisi tautan ke Karirhub Kemnaker dan aduankonten.id; Modus Luar negeri selalu menautkan pengecekan legalitas P3MI di KP2MI (https://migran-aman.kp2mi.go.id/cek-legalitas) dan pengaduan KP2MI (0800-1000, WA 0811-8080-141); hasil Waspada dan Bahaya selalu memuat Langkah darurat dua bagian: "Sudah telanjur transfer?" (IASC https://iasc.ojk.go.id/, hubungi bank atau e-wallet, Kontak OJK 157) dan "Sudah telanjur kirim data?" (hubungi bank atau e-wallet, Kontak OJK 157, laporkan akun pelaku di platformnya); semua tautan membuka situs resmi dan menampilkan domainnya | US-04 | P0 wajib |
| FR-08 | Contoh siap pakai | Minimal 4 tombol contoh: 3 loker palsu (tugas, lokal, luar negeri) dan 1 loker asli; satu klik mengisi kotak teks; hasil AI untuk contoh disimpan statis sehingga tidak memakai kuota AI | US-05 | P0 wajib |
| FR-09 | Aksesibilitas | Seluruh alur bisa dijalankan dengan keyboard; hasil dibacakan screen reader lewat `aria-live`; Lighthouse Accessibility ≥ 95 | US-06 | P0 wajib |
| FR-10 | Halaman Cara kerja | Menampilkan ringkasan aturan, angka evaluasi dari set `test` beserta pembilang dan penyebutnya (misalnya 17/20), jumlah contoh sintetis, batasan (termasuk "dioptimalkan untuk bahasa Indonesia"), dan kebijakan privasi yang menjelaskan Penyamaran sebelum ke AI serta bahwa Groq mungkin menyimpan log penyalahgunaan sampai 30 hari kalau ZDR tidak tersedia | US-07 | P0 wajib |
| FR-11 | API cek | `POST /api/cek` dengan isi `{teks}` mengembalikan label, skor, tanda bahaya (termasuk Tanda bahaya tersirat), modus, penjelasan, dan sumber penilaian ("aturan" atau "aturan+AI"); input tidak valid, termasuk teks kurang dari 50 karakter, dijawab 400 dengan pesan yang jelas | US-01 | P0 wajib |
| FR-12 | Skrip evaluasi | `npm run eval` mencetak recall, presisi, false positive, angka asli → Waspada (dilaporkan, bukan target), dan tabel confusion untuk versi aturan saja, AI saja, dan gabungan; satu panggilan AI per contoh dipakai ulang untuk versi AI saja dan gabungan | US-07 | P0 wajib |
| FR-13 | Bacakan hasil | Tombol memakai text-to-speech bawaan browser berbahasa Indonesia; tombol disembunyikan kalau browser tidak mendukung | US-08 | P1 kalau sempat |
| FR-14 | Bagikan ke WhatsApp | Menyiapkan ringkasan peringatan tanpa menyertakan teks lowongan asli maupun data pribadi | US-09 | P1 kalau sempat |
| FR-15 | Halaman Kenali modus | Tiga pola penipuan, masing-masing dengan ciri dan contoh | US-10 | P1 kalau sempat |
| FR-16 | Batas pemakaian | Maksimal sekitar 10 Cek per menit per IP, dihitung di Upstash Redis dengan hash IP bergaram yang kedaluwarsa dalam 60 detik; lewat batas, Cek tetap dinilai dengan aturan saja (bukan ditolak); kalau Redis mati, Cek tetap jalan. Dikerjakan pertama di antara P1 | US-01 | P1 kalau sempat |
| FR-17 | Statistik pemakaian | Hanya hitungan Cek per Label, per hari, dan per sumber penilaian di Redis yang sama, tanpa teks, IP, atau ID; ditampilkan di halaman Cara kerja | US-07 | P1 kalau sempat |

## Kebutuhan non-fungsional

Privasi dan ketersediaan paling diprioritaskan, karena URL wajib aktif selama penjurian dan pengguna menempelkan pesan pribadi.

| ID | Aspek | Kebutuhan |
| --- | --- | --- |
| NFR-01 | Privasi | JobShift tidak menyimpan Teks maupun gambar, dan isi teks tidak masuk log. Gambar diproses di browser dan tidak pernah diunggah ke server. Data pribadi disamarkan sebelum Teks dikirim ke AI. Yang tersimpan hanya angka agregat dan hash IP sementara (paling lama 60 detik) untuk batas pemakaian. Dataset di repo publik sudah disamarkan dari nomor, nama orang, dan rekening. |
| NFR-02 | Ketersediaan | URL publik aktif terus sampai final 10 Desember 2026, di hosting gratis yang tidak "tidur". |
| NFR-03 | Kinerja | Cek teks: persentil ke-95 di bawah 5 detik. OCR: target di bawah 15 detik untuk screenshot di HP kelas menengah (ukur sendiri hari Jumat). |
| NFR-04 | Keamanan | API key hanya ada di environment variable server, tidak pernah di repo atau browser. Teks pengguna ditampilkan sebagai teks biasa, tidak di-render sebagai HTML. |
| NFR-05 | Ketahanan | Kalau AI mati atau kuotanya habis, cek tetap jalan dengan aturan saja. |
| NFR-06 | Aksesibilitas | Memenuhi WCAG 2.1 AA: kontras minimal 4,5:1, huruf isi minimal 16 px, area sentuh minimal 44 × 44 px, menghormati `prefers-reduced-motion`. |
| NFR-07 | Kompatibilitas | Berjalan di Chrome Android, Safari iOS, serta Chrome dan Firefox desktop, mulai dari lebar layar 360 px. |
| NFR-08 | Bahasa | Semua teks antarmuka dalam bahasa Indonesia awam, tanpa istilah teknis seperti "skor model" atau "R01". |
| NFR-09 | Kualitas kode | TypeScript mode strict, ESLint tanpa error, semua tes lulus, dan README menjelaskan cara menjalankan dan arsitekturnya. Bagian ini masuk penilaian Fungsionalitas (30%). |

## Asumsi, ketergantungan, dan batasan

Risiko terbesar ada di ketergantungan pada layanan pihak ketiga yang gratis. Karena itu, inti produk (mesin aturan) tidak bergantung pada layanan tersebut.

**Asumsi** (perlu dicek; kalau salah, rencana berubah)

- Kuota gratis API AI cukup untuk pengembangan, evaluasi, dan penjurian.
- Tesseract.js bisa membaca screenshot berbahasa Indonesia dengan cukup baik dan cukup cepat di HP.
- Contoh loker palsu dan asli dari sumber publik bisa terkumpul 100 dalam 2 hari (set dev 60, set test 40, palsu dan asli seimbang). Set test dikumpulkan dan dipegang oleh anggota yang tidak menyetel aturan.
- Pola penipuan yang terdokumentasi saat ini masih mewakili modus yang beredar.

**Ketergantungan**

- Vercel (hosting gratis), Groq Free plan, Tesseract.js beserta data bahasanya, dan Upstash Redis gratis (P1, untuk angka saja).
- Situs resmi yang ditautkan: Karirhub Kemnaker, aduankonten.id, kanal pelaporan IASC, dan KP2MI (Migran Aman). Lihat `docs/research/ai-api-and-iasc.md`.

**Di luar lingkup:** input berupa URL lowongan (masuk roadmap), dan cadangan AI kedua seperti Cloudflare Workers AI (P1 setelah finalis).

**Batasan**

- Waktu: submit paling lambat 30 November 2026 (target internal 29 November 21.00 WIB).
- Lomba hanya mengizinkan satu karya per tim, karya harus orisinal, dan repo wajib publik.
- Tidak ada akses ke data atau API pemerintah, sehingga tidak bisa memverifikasi legalitas perusahaan.
- Hasil JobShift adalah indikasi risiko, bukan vonis hukum.

## Milestone

Fitur dikunci Sabtu malam, dan karya dikumpulkan Minggu, sehari sebelum batas resmi. Rincian per orang mengikuti tiket di `.scratch/jobshift-mvp/issues/`.

1. Nov 26, 2026 — **M1:** tim terdaftar dan sudah bayar; versi kosong ter-deploy di Vercel.
2. Nov 27, 2026 — **M2:** semua FR P0 jalan end-to-end di lokal; dataset `dev` dan `test` lengkap.
3. Nov 28, 2026 21.00 — **M3:** fitur dikunci; versi publik lolos semua kriteria penerimaan P0.
4. Nov 29, 2026 21.00 — **M4:** proposal, surat orisinalitas, video, URL, dan repo sudah terkirim.
5. Dec 5, 2026 — **M5:** pengumuman finalis. Kalau lolos, kerjakan FR P1 dan latih demo serta Q&A.
6. Dec 10, 2026 — **M6:** final: presentasi, simulasi langsung, dan Q&A.

## Pertanyaan terbuka

Dua pertanyaan pertama harus dijawab hari ini, karena menentukan siapa mengerjakan apa.

- [x] Siapa saja anggota tim, dan siapa memegang peran A–E? **Jawaban:** 4 orang: Muhammad Zamil (inti, mesin Aturan, AI, integrasi), Daniel (katalog Aturan dan Set dev), Ayudhya Naja (Set test, eval, Cara kerja, audit), Nadine (UI, copy, OCR, aksesibilitas). Set test dipegang Ayudhya Naja. Rincian di `.scratch/jobshift-mvp/pembagian-tim.md`.
- [x] API AI mana yang dipakai? Cek kuota gratisnya di dokumentasi resmi. **Jawaban:** Groq Free plan, `openai/gpt-oss-120b`, tanpa cadangan di MVP (lihat `docs/research/ai-api-and-iasc.md`).
- [x] Apa URL resmi kanal pelaporan IASC yang akan ditautkan? Ambil dari situs OJK, jangan dari artikel berita. **Jawaban:** https://iasc.ojk.go.id/ (lihat `docs/research/ai-api-and-iasc.md`).
- [x] Apakah nama "JobShift" sudah dipakai produk lain? Cek di Google, Play Store, dan GitHub. **Temuan (26 Nov 2026):** sudah dipakai Jobshift Ltd (tryjobshift.com, berdiri 2023), aplikasi web pencarian kerja berbasis AI yang menyusun CV dan melamar otomatis, jadi kategorinya sama dengan JobShift. Ada juga JOBSHIFT di Calgary, organisasi pendukung pekerja terdampak COVID-19. Tidak ditemukan aplikasi bernama JobShift di Play Store maupun repo GitHub. **Keputusan:** nama JobShift tetap dipakai.
- [ ] Apakah persona sesuai kenyataan? Wawancara singkat 3–5 pencari kerja di sekitar kampus untuk mengonfirmasinya.
