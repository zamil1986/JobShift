# Prompt `/implement` per orang

Status per 27 November 2026: tiket 01 dan 03 sudah di `main`. Urutan dan alasannya ada di [pembagian-tim.md](pembagian-tim.md), dan langkah git di [panduan-kerja-tim.md](panduan-kerja-tim.md).

## Cara pakai

1. `git switch main && git pull origin main`
2. Klaim tiket: tambah baris `**Assignee:** Nama` di file tiket, commit, push.
3. `git switch -c tiket-NN-slug`, lalu `npm install`
4. Salin **satu** blok prompt di bawah ke panel agent Antigravity, apa adanya.
5. Setelah agent selesai: `npm run typecheck && npm test && npm run lint`, rebase ke `origin/main`, push, buka PR.

Satu prompt = satu tiket = satu branch. Jangan gabungkan dua tiket dalam satu prompt.

## Aturan bersama (sudah tertanam di setiap prompt)

Setiap prompt di bawah memuat aturan ini supaya agent tidak perlu menebak:

- Baca dulu `AGENTS.md`, `.scratch/jobshift-mvp/spec.md`, `GLOSSARY.md`, dan `docs/adr/`.
- Next.js di repo ini versi baru: baca `node_modules/next/dist/docs/` sebelum menulis kode Next.
- Tes perilaku hanya lewat `cek()` dari `src/cek`, bukan fungsi internal.
- Jangan ubah `src/cek/tipe.ts` (kontrak `HasilCek`). Kalau perlu, berhenti dan tanya.
- Kerja di branch aktif, jangan pindah ke `main`.

---

## Zamil

### Tiket 10 — mulai sekarang, selesaikan setelah 08 di-merge

```
/implement .scratch/jobshift-mvp/issues/10-lapisan-ai.md

Konteks repo: inti ada di src/cek (cek.ts, buatCek di cek.ts, adapter aiNonaktif di ai.ts, tipe PenilaiAI di tipe.ts). Baca AGENTS.md, spec.md bagian "Penyamaran dan lapisan AI", ADR-0001, dan docs/research/ai-api-and-iasc.md. Baca node_modules/next/dist/docs sebelum menyentuh route API.

Urutan kerja:
1. Penyamaran (email, NIK, nomor HP, rekening; "Rp 8.000.000" tidak tersentuh), dites lewat cek() dengan adapter perekam.
2. Timeout 3,5 detik lewat AbortSignal dari inti, dites dengan fake timers Vitest.
3. Validasi keluaran AI dengan Zod, penyaringan butir AI (kutipan tidak ada, memuat penanda [...], beririsan dengan Aturan), batas +25, sumberPenilaian, catatanAI.
4. Adapter Groq openai/gpt-oss-120b: strict json_schema dari skema Zod yang sama, maxRetries 0, logLevel warn, API key hanya dari process.env.GROQ_API_KEY. Pasang di route /api/cek.
5. Terakhir: Penjelasan AI menggantikan templat. Bagian ini bergantung pada tiket 08 (templat Penjelasan per Modus dan filter kata terlarang). Kalau 08 belum ada di main, berhenti setelah langkah 4 dan beri tahu saya.

Larangan: jangan mengubah kontrak HasilCek di tipe.ts, jangan log isi Teks, jangan commit .env.local. AI tidak boleh pernah menurunkan Skor dan tidak boleh sendirian membuat Bahaya; tulis tes properti untuk ini.
```

Setelah 08 di-merge: `git fetch origin && git rebase origin/main`, lalu ketik di agent: `Lanjutkan tiket 10 langkah 5 (Penjelasan AI), 08 sudah ada di main.`

### Tiket 15 — Desain visual (di sela tiket 10; rapikan lagi setelah 08, 09, 12, 13 masuk)

```
/implement .scratch/jobshift-mvp/issues/15-desain-visual.md

Konteks repo: gaya global di src/app/globals.css, layout di src/app/layout.tsx, komponen di src/ui (FormCek.tsx, TampilanHasil.tsx, TeksBersorotan.tsx). Baca AGENTS.md, node_modules/next/dist/docs untuk styling dan font di App Router, PRD.md NFR-06/07/08, persona di PRD.md (Bu Sari: penglihatan lemah, HP murah; Pak Hendra: proyektor kelas), dan spec.md bagian "UI dan aksesibilitas".

Arah desain: alat bantu cek yang tenang dan jelas, bukan aplikasi yang menakut-nakuti. Pembaca usia 17–30 tahun di HP Android 360 px, sering di data seluler. Hasil harus terbaca dalam 3 detik: Label besar dengan warna + ikon + kata, lalu Tanda bahaya, lalu langkah yang harus dilakukan.

Yang dikerjakan:
1. Token desain sebagai CSS custom properties di globals.css (warna untuk tiga Label, teks, permukaan, garis, jarak, radius, tipografi). Komponen hanya memakai token.
2. Halaman cek: kotak teks, penghitung, tombol Cek, disclaimer privasi, tagline.
3. Kartu hasil: Label, Skor, peringatan tetap Risiko rendah (terlihat tanpa scroll di 360 × 640), daftar Tanda bahaya, highlight <mark>, Tanda bahaya tersirat terpisah, Penjelasan, Langkah aman, Langkah darurat.
4. Fokus keyboard terlihat jelas; animasi hanya di dalam prefers-reduced-motion: no-preference.
5. Cek kontras setiap pasangan warna (≥ 4,5:1) dan catat angkanya di ringkasan akhir.

Larangan: jangan ubah src/cek, route API, atau tipe HasilCek; jangan ubah teks copy yang ada (itu milik tiket 08); tanpa font atau aset dari CDN pihak ketiga. Tes perilaku yang ada harus tetap lulus.
```

Kalau pakai Claude Code, skill `impeccable` bisa dipakai untuk kritik dan polish setelah tiket ini: `/impeccable critique` lalu `/impeccable polish` pada halaman `/`.

---

## Daniel

Kerjakan **satu per satu, berurutan**: 04 → 06 → 05 → 07. Keempat tiket menulis ke `src/cek/aturan/katalog.ts`, jadi kalau dikerjakan paralel PR-nya akan saling konflik. Mulai tiket berikutnya setelah PR sebelumnya di-merge.

Tiket 05 (R04) dan 07 (R13) butuh kemampuan baru di mesin Aturan, yang saat ini belum ada: pengecualian "tidak berlaku kalau ada penanda luar negeri" dan tanda bahaya tersirat. Prompt-nya sudah memberi tahu agent.

### Tiket 04 — Modus Tugas

```
/implement .scratch/jobshift-mvp/issues/04-modus-tugas.md

Konteks repo: katalog Aturan ada di src/cek/aturan/katalog.ts, tipe Aturan dan Pola di src/cek/aturan/mesin.ts. Ikuti pola R01 dan R02 yang sudah ada (bobot, kritis, modus, pakaiPenyangkal, daftar pola dengan bahasa "id"/"en"). Baca AGENTS.md, spec.md bagian "Mesin Aturan" (tabel katalog awal), dan ADR-0002.

Yang dikerjakan: tambah R06b, R07, R08 sesuai tabel spec dan daftarkan di KATALOG. R07 kritis berbobot 60. pakaiPenyangkal false untuk ketiganya (Penyangkal hanya untuk R01/R02). R06b memuat pola Inggris "move to Telegram". Alasan dalam bahasa awam, tanpa kata "aman", "asli", "legit", "terpercaya".

Tes: buat src/cek/modus-tugas.test.ts, semua lewat cek(). Minimal 1 tes positif dan 1 negatif per aturan, ditambah satu Teks kerja like/rating dengan deposit naik level yang harus berlabel bahaya dengan modusTerkuat "tugas".

Larangan: jangan ubah mesin.ts, skor.ts, atau tipe.ts. Kalau mesin tidak cukup, berhenti dan tanya. Pakai bobot dari spec apa adanya. Semua tes lama harus tetap lulus.
```

### Tiket 06 — Modus Luar negeri

```
/implement .scratch/jobshift-mvp/issues/06-modus-luar-negeri.md

Konteks repo: katalog Aturan di src/cek/aturan/katalog.ts, tipe di src/cek/aturan/mesin.ts. Ikuti pola R01/R02 dan aturan Modus Tugas yang sudah ada. Baca AGENTS.md dan spec.md bagian "Mesin Aturan" serta "Skor, Label, Modus".

Yang dikerjakan: tambah R03 (kritis, 60), R05, R12, R16 sesuai tabel spec, modus "luar_negeri", pakaiPenyangkal false. Daftarkan di KATALOG. Simpan daftar negara/kota tujuan sebagai konstanta yang diekspor dari katalog.ts (misalnya PENANDA_LUAR_NEGERI), karena tiket 05 akan memakainya untuk R04.

Tes: buat src/cek/modus-luar-negeri.test.ts lewat cek(). Minimal 1 positif dan 1 negatif per aturan; Teks tawaran ke Kamboja dengan visa wisata berlabel bahaya dengan modusTerkuat "luar_negeri"; satu tes seri bobot antara luar negeri dan modus lain yang memilih "luar_negeri".

Larangan: jangan ubah mesin.ts, skor.ts, atau tipe.ts tanpa bertanya. Semua tes lama harus tetap lulus.
```

### Tiket 05 — Modus Lokal

```
/implement .scratch/jobshift-mvp/issues/05-modus-lokal.md

Konteks repo: katalog Aturan di src/cek/aturan/katalog.ts, mesin di src/cek/aturan/mesin.ts. Aturan Tugas dan Luar negeri sudah ada; konstanta penanda luar negeri dari tiket 06 sudah ada di katalog.ts, pakai itu. Baca AGENTS.md dan spec.md bagian "Mesin Aturan".

Yang dikerjakan: tambah R04 dan R11 sesuai tabel spec, modus "lokal", pakaiPenyangkal false. R04 mengenali "Rp15 juta", "15.000.000", "Rp500 ribu per hari", dan "high salary".

R04 tidak boleh cocok kalau Teks memuat penanda luar negeri. Mesin saat ini belum punya pengecualian seperti itu. Tambahkan satu field opsional di tipe Aturan (misalnya kecualiJika: pola yang, kalau ada di Teks, membatalkan aturan) dan dukung di jalankanAturan dengan perubahan sekecil mungkin. Jelaskan perubahan mesin ini di ringkasan akhir supaya bisa direview.

Tes: buat src/cek/modus-lokal.test.ts lewat cek(). Minimal 1 positif dan 1 negatif per aturan; R04 tidak cocok di Teks luar negeri; ketiga bentuk nominal tertangkap; Teks loker pabrik palsu atas nama PT besar dengan email @gmail memberi modus "lokal".

Larangan: jangan ubah tipe.ts (HasilCek) atau skor.ts. Semua tes lama harus tetap lulus.
```

### Tiket 07 — Aturan umum dan tersirat

```
/implement .scratch/jobshift-mvp/issues/07-aturan-umum-dan-tersirat.md

Konteks repo: katalog Aturan di src/cek/aturan/katalog.ts, mesin di src/cek/aturan/mesin.ts, inti di src/cek/cek.ts. HasilCek sudah punya field tandaBahayaTersirat (lihat src/cek/tipe.ts). Baca AGENTS.md dan spec.md bagian "Mesin Aturan" (terutama catatan R13) serta "Skor, Label, Modus".

Yang dikerjakan: tambah R06a, R09, R10, R14, R15 sebagai aturan biasa (tanpa modus, pakaiPenyangkal false). R06a dan R10 memuat pola Inggris. Lalu R13: tanda bahaya tersirat, bobot 10, tidak kritis, tanpa kutipan, paling banyak satu, dan hanya kalau nama badan usaha (PT/CV/Tbk/nama toko) DAN alamat sama-sama tidak ada. Mesin belum mendukung aturan "ketiadaan"; tambahkan dukungannya dengan perubahan sekecil mungkin, masuk ke tandaBahayaTersirat dan ikut dihitung di Skor. Jelaskan perubahan mesin di ringkasan akhir.

Tes: buat src/cek/aturan-umum.test.ts lewat cek(). Minimal 1 positif dan 1 negatif per aturan; R13 tidak muncul kalau salah satu (nama badan usaha atau alamat) ada; R13 ikut menambah Skor. Tambah satu tes bahwa katalog memberi tanda bahaya dari minimal 15 aturan berbeda di seluruh tes (atau cek jumlah KATALOG ≥ 15 lewat perilaku).

Larangan: jangan ubah bentuk HasilCek di tipe.ts. Semua tes lama harus tetap lulus.
```

### Setelah tiket 11 ada: setel bobot (bukan `/implement`)

```
Jalankan npm run eval (Set dev saja, jangan --set test). Usulkan perubahan bobot non-kritis di src/cek/aturan/katalog.ts untuk menaikkan recall tanpa menambah false positive Asli → Bahaya. Jangan ubah bobot aturan kritis (60) atau jarak Penyangkal. Tunjukkan angka sebelum dan sesudah, lalu commit di branch setel-bobot.
```

---

## Ayudhya Naja

Sekarang: kumpulkan **Set test 40 contoh secara manual**, disimpan di luar repo (misalnya `~/jobshift-set-test/test.jsonl`). Jangan pakai agent di folder repo untuk Set test, dan jangan bagikan ke Zamil atau Daniel.

### Tiket 11 — Skrip eval (setelah 10 dan Set dev di `main`)

```
/implement .scratch/jobshift-mvp/issues/11-skrip-eval.md

Konteks repo: inti cek() dan buatCek ada di src/cek/cek.ts; adapter AI (Groq, Palsu, perekam) ada di src/cek setelah tiket 10. Set dev ada di data/dev.jsonl. Baca AGENTS.md, spec.md bagian "Dataset dan eval", dan PRD.md FR-12.

Yang dikerjakan: script npm run eval (default data/dev.jsonl) dengan opsi --set test (membaca data/test.jsonl) dan --model untuk gpt-oss-20b. Satu panggilan AI per contoh, direkam, lalu dipakai ulang untuk mode "aturan", "AI saja", dan "gabungan". Mode AI saja menghitung Skor dari Tanda bahaya AI yang sah saja. Cetak per mode: recall Palsu → Waspada/Bahaya, presisi, false positive Asli → Bahaya, Asli → Waspada, tabel confusion 2×3, jumlah contoh sintetis, p95 latensi AI, masing-masing dengan pembilang/penyebut. Hasil --set test ditulis ke file JSON (misalnya src/data/hasil-eval.json) untuk halaman Cara kerja.

Larangan: jangan membuat atau membaca data/test.jsonl selain lewat opsi --set test; jangan ubah katalog Aturan atau bobotnya; jangan log isi Teks. Tes skrip dengan dataset kecil buatan dan adapter Palsu, tanpa memanggil Groq.
```

### Tiket 13 — Halaman Cara kerja (setelah 04–07 dan 11 di `main`)

```
/implement .scratch/jobshift-mvp/issues/13-halaman-cara-kerja.md

Konteks repo: halaman utama di src/app/page.tsx, komponen UI di src/ui, hasil eval Set test di file JSON yang ditulis npm run eval --set test. Baca AGENTS.md, node_modules/next/dist/docs untuk App Router, spec.md bagian "Dataset dan eval", dan PRD.md FR-10.

Yang dikerjakan: halaman /cara-kerja berisi ringkasan Aturan dalam bahasa awam tanpa ID aturan, angka akurasi yang dibaca dari file hasil eval saat build (dengan pembilang/penyebut, misalnya 17/20), jumlah contoh sintetis, batasan ("dioptimalkan untuk bahasa Indonesia", "bukan vonis hukum"), dan kebijakan privasi (Teks dan gambar tidak disimpan, Penyamaran sebelum ke AI, log Groq 30 hari kalau ZDR tidak tersedia). Tautkan dari halaman cek dan hasil.

Larangan: angka jangan diketik tangan; kalau file hasil eval belum ada, tampilkan "belum dievaluasi" dan beri tahu saya. Teks halaman tidak memuat kata "aman", "asli", "legit", "terpercaya" (kecuali tagline dan domain resmi). Pakai struktur heading yang benar (satu h1, lalu h2). Jangan menambah warna, font, atau tata letak baru di CSS: desain visual dipegang Zamil (tiket 15).
```

### Sabtu malam setelah bobot dibekukan (manual, bukan `/implement`)

```bash
cp ~/jobshift-set-test/test.jsonl data/test.jsonl
```

```bash
npm run eval -- --set test
```

Lalu tiket 14 (audit) dikerjakan manual mengikuti checklist di file tiketnya.

---

## Nadine

Urutan: **08 → 09 → 12**. Tiket 08 ada di jalur kritis karena tiket 10 milik Zamil menunggunya.

### Tiket 08 — Penjelasan, Langkah aman, Langkah darurat (sekarang)

```
/implement .scratch/jobshift-mvp/issues/08-penjelasan-dan-langkah-aman.md

Konteks repo: templat Penjelasan per Label sudah ada di src/cek/penjelasan.ts; inti di src/cek/cek.ts saat ini mengisi langkahAman dan langkahDarurat dengan array kosong. Tampilan hasil di src/ui/TampilanHasil.tsx. Baca AGENTS.md, spec.md bagian "Penjelasan dan kata terlarang" serta "Langkah aman dan Langkah darurat", dan docs/research/ai-api-and-iasc.md untuk URL resmi.

Yang dikerjakan:
1. Tambah satu kalimat Penjelasan per Modus terkuat di penjelasan.ts (total ≤ 3 kalimat).
2. Buat data statis Langkah aman per Label dan per Modus (misalnya src/cek/langkah.ts). Setiap tautan menyimpan url dan domain. Wajib: Karirhub Kemnaker, aduankonten.id, IASC https://iasc.ojk.go.id/, Kontak OJK 157. Modus luar_negeri selalu memuat https://migran-aman.kp2mi.go.id/cek-legalitas, KP2MI 0800-1000, dan WA 0811-8080-141.
3. Langkah darurat untuk waspada dan bahaya: "Sudah telanjur transfer?" (IASC, bank/e-wallet, OJK 157) dan "Sudah telanjur kirim data?" (bank/e-wallet, OJK 157, lapor akun pelaku). Risiko rendah tetap null.
4. Isi langkahAman dan langkahDarurat dari data itu di cek.ts, dan tampilkan di TampilanHasil.tsx dengan domain di samping setiap tautan.
5. Buat satu fungsi filter kata terlarang yang diekspor dari src/cek (kata utuh "aman", "asli", "legit", "terpercaya", dengan pengecualian tagline dan domain resmi), karena tiket 10 akan memakainya untuk Penjelasan AI.

Tes lewat cek(): langkah sesuai Label dan Modus; langkahDarurat null untuk risiko rendah; satu tes yang memindai seluruh copy statis (templat Penjelasan, alasan semua Aturan di katalog, Langkah aman) dan gagal kalau ada kata terlarang.

Larangan: jangan ubah bentuk HasilCek di tipe.ts. Jangan mengarang URL; pakai hanya URL di atas dan yang ada di docs/research. Teks bahasa awam untuk usia 17–30 tahun. Jangan menambah warna, font, atau tata letak baru di CSS: desain visual dipegang Zamil (tiket 15). Tulis markup semantik dengan label dan atribut aria yang benar, pakai kelas yang sudah ada.
```

Setelah PR di-merge, buka setiap URL di browser satu per satu dan centang kriteria "Semua URL tautan sudah dicek manual" di tiket 08.

### Tiket 09 — Screenshot OCR (setelah 08 di-merge)

```
/implement .scratch/jobshift-mvp/issues/09-input-screenshot-ocr.md

Konteks repo: form input ada di src/ui/FormCek.tsx, halaman di src/app/page.tsx. Baca AGENTS.md, node_modules/next/dist/docs untuk komponen client dan aset statis di public/, spec.md bagian "Stack" dan "Panjang Teks", dan PRD.md FR-02.

Yang dikerjakan: unggah PNG/JPG/WebP ≤ 5 MB (tolak file lain dengan pesan jelas). OCR dengan Tesseract.js bahasa ind+eng di Web Worker, data bahasa di-host sendiri di public/ (jangan dari CDN). Indikator progres dengan aria-live. Hasil OCR mengisi kotak teks yang bisa diedit dengan penghitung; teks > 3.000 karakter tidak dipotong. OCR gagal atau kosong → arahkan pengguna untuk menempel teks.

Larangan: gambar tidak boleh dikirim ke server mana pun; jangan ubah src/cek atau route API. Jangan menambah warna, font, atau tata letak baru di CSS: desain visual dipegang Zamil (tiket 15). Tulis markup semantik dengan label dan atribut aria yang benar, pakai kelas yang sudah ada. Tulis tes untuk validasi file (tipe dan ukuran). Ukur waktu OCR di satu HP kelas menengah dan catat hasilnya di file tiket.
```

### Tiket 12 — Contoh siap pakai (setelah 04–07 dan 10 di-merge)

```
/implement .scratch/jobshift-mvp/issues/12-contoh-siap-pakai.md

Konteks repo: adapter AI Statis dibuat di tiket 10 (cari di src/cek). Form di src/ui/FormCek.tsx. Baca AGENTS.md, spec.md bagian "Modul" (adapter Statis), dan PRD.md FR-08.

Yang dikerjakan: 4 tombol contoh (Tugas, Lokal, Luar negeri, Asli) yang bisa dioperasikan dengan keyboard; satu klik mengisi kotak teks. Teks contoh fiktif tanpa data pribadi sungguhan. Isi keluaran AI tersimpan untuk keempat contoh di adapter Statis, dikunci hash Teks yang dinormalisasi.

Tes lewat cek(): tiga contoh Palsu berlabel waspada atau bahaya dengan modusTerkuat yang sesuai, contoh Asli berlabel risiko_rendah, dan Teks contoh tidak memicu panggilan Groq (pakai adapter perekam).

Larangan: jangan ubah kontrak POST /api/cek atau HasilCek. Jangan menambah warna, font, atau tata letak baru di CSS: desain visual dipegang Zamil (tiket 15). Tulis markup semantik dengan label dan atribut aria yang benar, pakai kelas yang sudah ada.
```

Sesudahnya: bantu Ayudhya mengecek tampilan di HP sungguhan (Chrome Android dan Safari iOS) dan laporkan temuan desain ke Zamil.
