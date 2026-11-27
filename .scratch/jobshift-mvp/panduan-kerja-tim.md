# Panduan kerja tim JobShift (Antigravity + skill mattpocock)

Untuk: Muhammad Zamil, Daniel, Ayudhya Naja, Nadine. Siapa mengerjakan apa ada di [pembagian-tim.md](pembagian-tim.md).

Semua orang memakai Antigravity. Skill mattpocock ada di `.agents/skills/` di repo ini, dan Antigravity membacanya otomatis. Tidak ada yang perlu diinstal selain alat di Tahap 1.

---

## Tahap 0 — Zamil saja, sekali, sebelum yang lain mulai

**0.1 Push skill dan dokumen tim ke GitHub**

```bash
git add .agents skills-lock.json .scratch/jobshift-mvp PRD.md
```

```bash
git commit -m "Add shared agent skills, team split, and team guide"
```

```bash
git push origin main
```

**0.2 Undang anggota ke repo**

Buka https://github.com/zamil1986/cekLoker/settings/access → **Add people** → undang akun GitHub Daniel, Ayudhya, dan Nadine dengan akses **Write**.

**0.3 Kerjakan tiket 01 duluan** (lihat Tahap 3). Semua tiket lain menunggu tiket 01 ada di `main`. Setelah di-merge, kabari grup.

---

## Tahap 1 — Semua orang, sekali: siapkan laptop

**1.1 Cek alat yang dibutuhkan**

```bash
git --version
```

```bash
node --version
```

Node harus versi 20 atau lebih baru. Kalau belum ada, instal dari https://nodejs.org (pilih LTS). Antigravity diunduh dari https://antigravity.google.

**1.2 Atur identitas git** (ganti dengan nama dan email akun GitHub masing-masing)

```bash
git config --global user.name "Nama Kamu"
```

```bash
git config --global user.email "email-github-kamu@example.com"
```

**1.3 Terima undangan repo** di email atau di https://github.com/notifications, lalu clone:

```bash
git clone https://github.com/zamil1986/cekLoker.git
```

**1.4 Buka di Antigravity:** File → Open Folder → pilih folder `cekLoker`.

**1.5 Cek skill terbaca:** di panel agent, ketik `/` lalu pastikan `implement`, `tdd`, dan `code-review` muncul di daftar.

---

## Tahap 2 — Setiap kali mulai tiket: ambil dan klaim

Jalankan di terminal Antigravity (Terminal → New Terminal), dari folder `cekLoker`.

**2.1 Ambil versi terbaru `main`**

```bash
git switch main
```

```bash
git pull origin main
```

**2.2 Pastikan tiketnya boleh dikerjakan.** Buka file tiket di `.scratch/jobshift-mvp/issues/`, lalu cek:

- `Blocked by:` — semua tiket yang disebut sudah di-merge ke `main`.
- `Status: ready-for-agent` — kalau `ready-for-human`, kerjakan manual, bukan lewat `/implement`.
- Belum ada baris `Assignee:` milik orang lain.

**2.3 Klaim tiket.** Tambahkan baris `**Assignee:** Nama Kamu` di bawah baris `**Status:**`, lalu:

```bash
git add .scratch/jobshift-mvp/issues
```

```bash
git commit -m "Klaim tiket 04"
```

```bash
git push origin main
```

Kalau push ditolak karena ada perubahan baru, jalankan `git pull --rebase origin main`, lalu push lagi.

**2.4 Buat branch khusus tiket ini** (satu tiket = satu branch)

```bash
git switch -c tiket-04-modus-tugas
```

```bash
npm install
```

---

## Tahap 3 — Kerjakan tiket dengan agent

**3.1 Di panel agent Antigravity, ketik:**

```
/implement .scratch/jobshift-mvp/issues/04-modus-tugas.md
```

Agent akan membaca tiket, menulis tes dulu (`tdd`), menulis kode, me-review sendiri (`code-review`), lalu commit ke branch yang aktif.

**3.2 Selama agent bekerja:**

- Jawab pertanyaannya kalau ia bertanya. Jangan biarkan ia menebak.
- Jangan biarkan ia mengubah tipe `HasilCek` di spec. Kalau ia mau, hentikan dan tanya Zamil.
- Jangan biarkan ia commit ke `main`. Cek dengan `git branch --show-current`.

**3.3 Periksa hasilnya sendiri sebelum push**

```bash
git branch --show-current
```

```bash
git log --oneline main..HEAD
```

```bash
npm test
```

```bash
npm run lint
```

Semua tes dan lint harus lulus. Centang kotak `- [x]` di file tiket untuk kriteria yang sudah terpenuhi, lalu commit:

```bash
git commit -am "Centang kriteria tiket 04"
```

---

## Tahap 4 — Kirim untuk di-review

**4.1 Samakan dengan `main` terbaru** (penting, karena tiket lain mungkin sudah masuk)

```bash
git fetch origin
```

```bash
git rebase origin/main
```

Kalau ada konflik: buka file yang ditandai, perbaiki, lalu `git add <file>` dan `git rebase --continue`. Kalau bingung, `git rebase --abort` dan minta tolong Zamil. Setelah rebase, jalankan `npm test` lagi.

**4.2 Push branch**

```bash
git push -u origin tiket-04-modus-tugas
```

Kalau branch ini sudah pernah di-push dan kamu baru rebase:

```bash
git push --force-with-lease
```

**4.3 Buka Pull Request.** Buka link yang dicetak oleh `git push`, atau https://github.com/zamil1986/cekLoker/pulls → **New pull request** → base `main`, compare `tiket-04-modus-tugas`. Judul: `04: Aturan Modus Tugas`. Tulis di deskripsi `Closes .scratch/jobshift-mvp/issues/04-modus-tugas.md`.

**4.4 Kabari Zamil di grup.** Kalau ada komentar review, perbaiki di branch yang sama (minta agent: "perbaiki komentar review berikut: ..."), commit, lalu `git push`. PR otomatis ter-update.

---

## Tahap 5 — Zamil: review dan merge

```bash
git fetch origin
```

```bash
git switch tiket-04-modus-tugas
```

```bash
npm install && npm test && npm run lint
```

Yang dicek: tipe `HasilCek` tidak berubah, tes masuk lewat `cek()`, tidak ada API key atau data pribadi, tiket lain tidak rusak. Kalau oke, merge di GitHub (**Squash and merge**), hapus branch-nya, lalu kabari grup bahwa tiket itu sudah di `main`.

Setelah merge, semua orang yang sedang punya branch aktif menjalankan:

```bash
git fetch origin
```

```bash
git rebase origin/main
```

---

## Tahap 6 — Ulangi

Kembali ke Tahap 2 untuk tiket berikutnya. Jangan lanjut di branch lama.

---

## Tugas khusus per orang

### Zamil

| Urutan | Tiket | Perintah di panel agent |
| --- | --- | --- |
| 1 | 01 | `/implement .scratch/jobshift-mvp/issues/01-kerangka-dan-deploy-tracer.md` |
| 2 | 03 | `/implement .scratch/jobshift-mvp/issues/03-aturan-kritis-dan-penyangkal.md` |
| 3 | 10 | `/implement .scratch/jobshift-mvp/issues/10-lapisan-ai.md` |

Setelah 01 di-merge, hubungkan repo ke Vercel (https://vercel.com/new → import `cekLoker`) supaya setiap merge ke `main` ter-deploy otomatis. Sebelum tiket 10: tambahkan `GROQ_API_KEY` di Vercel → Project → Settings → Environment Variables, dan di file lokal `.env.local` (jangan di-commit).

### Daniel

1. **Sekarang:** kumpulkan Set dev 60 contoh (tiket 02, manual). Simpan sebagai `data/dev.jsonl`, satu baris per contoh, sesuai format di spec. Samarkan nomor HP, nama, dan rekening. Kirim lewat branch `data-set-dev` dan PR seperti biasa.
2. **Setelah 03 di-merge:**

| Urutan | Tiket | Perintah di panel agent |
| --- | --- | --- |
| 1 | 04 | `/implement .scratch/jobshift-mvp/issues/04-modus-tugas.md` |
| 2 | 05 | `/implement .scratch/jobshift-mvp/issues/05-modus-lokal.md` |
| 3 | 06 | `/implement .scratch/jobshift-mvp/issues/06-modus-luar-negeri.md` |
| 4 | 07 | `/implement .scratch/jobshift-mvp/issues/07-aturan-umum-dan-tersirat.md` |

3. Setelah 11 ada: setel bobot dengan `npm run eval` (Set dev saja), lalu bekukan bobot sebelum Sabtu 28 Nov 21.00.

### Ayudhya Naja (pemegang Set test)

1. **Sekarang:** kumpulkan Set test 40 contoh (tiket 02, manual). Simpan **di luar folder repo**, misalnya `~/jobshift-set-test/test.jsonl`. Jangan dibagikan ke Zamil atau Daniel sebelum bobot dibekukan.
2. **Setelah 02 (Set dev) dan 10 di-merge:**

| Urutan | Tiket | Perintah di panel agent |
| --- | --- | --- |
| 1 | 11 | `/implement .scratch/jobshift-mvp/issues/11-skrip-eval.md` |
| 2 | 13 | `/implement .scratch/jobshift-mvp/issues/13-halaman-cara-kerja.md` |

3. **Setelah bobot dibekukan (Sabtu malam):** salin Set test ke repo, lalu jalankan eval sekali:

```bash
cp ~/jobshift-set-test/test.jsonl data/test.jsonl
```

```bash
npm run eval -- --set test
```

Commit file data dan hasil eval lewat branch dan PR seperti biasa.

4. **Tiket 14 (audit, manual):** buka URL Vercel di HP lewat data seluler, jalankan Lighthouse di Chrome (DevTools → Lighthouse → Accessibility), dan centang kriteria di file tiket 14. Temuan yang perlu diperbaiki ditulis sebagai file tiket baru di `.scratch/jobshift-mvp/issues/`.

### Nadine

| Urutan | Tiket | Mulai setelah | Perintah di panel agent |
| --- | --- | --- | --- |
| 1 | 09 | 01 di-merge | `/implement .scratch/jobshift-mvp/issues/09-input-screenshot-ocr.md` |
| 2 | 08 | 03 di-merge | `/implement .scratch/jobshift-mvp/issues/08-penjelasan-dan-langkah-aman.md` |
| 3 | 12 | 04–07 dan 10 di-merge | `/implement .scratch/jobshift-mvp/issues/12-contoh-siap-pakai.md` |

Sambil menunggu 01: siapkan copy Langkah aman (tiket 08) di dokumen biasa, dan cek manual semua URL resmi (Karirhub, aduankonten.id, IASC, KP2MI).

---

## Larangan

- Jangan menjalankan `/implement` di branch `main`.
- Jangan commit `.env.local`, API key, atau data pribadi sungguhan.
- Jangan menjalankan `git push --force` ke `main`.
- Jangan mengerjakan tiket yang `Blocked by`-nya belum di-merge.
- Zamil dan Daniel tidak membuka Set test sebelum bobot dibekukan.

## Kalau macet

| Masalah | Coba ini |
| --- | --- |
| `/implement` tidak muncul di Antigravity | Pastikan folder yang dibuka adalah `cekLoker` (bukan folder induknya), lalu `git pull origin main` |
| `npm test` tidak ada | Tiket 01 belum di-merge. Tunggu, lalu `git pull origin main` |
| Push ditolak (`rejected`) | `git pull --rebase origin main` lalu push lagi |
| Konflik saat rebase | `git rebase --abort`, lalu minta tolong Zamil |
| Agent mengubah banyak file di luar tiket | `git restore <file>` untuk yang tidak perlu, atau minta agent membatalkannya |
