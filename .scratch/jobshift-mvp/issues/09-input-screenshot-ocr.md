# 09: Input screenshot dengan OCR di browser

**What to build:** Pengguna mengunggah screenshot lowongan. Teksnya dibaca di browser dengan indikator progres, lalu tampil di kotak teks yang bisa diedit sebelum dicek. Gambar tidak pernah meninggalkan perangkat. Lihat PRD FR-02 dan spec bagian Stack.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] Menerima PNG/JPG/WebP ≤ 5 MB; file lain atau yang lebih besar ditolak dengan pesan yang jelas
- [x] Tesseract.js `ind`+`eng` berjalan di Web Worker dengan data bahasa yang di-host sendiri; tidak ada request gambar ke server (dicek di tab Network)
- [x] Indikator progres OCR bisa diakses screen reader
- [x] Hasil OCR mengisi kotak teks yang bisa diedit, dengan penghitung; teks > 3.000 karakter tidak dipotong otomatis
- [x] OCR gagal atau hasilnya kosong → pengguna diarahkan untuk menempel teks
- [ ] Waktu OCR diukur di satu HP kelas menengah dan dicatat (target < 15 detik)

## Comments

### Implementasi (27 November 2026)

- Validasi berkas: `src/ui/gambar.ts` (tes di `src/ui/gambar.test.ts`). Tipe dari MIME; ekstensi hanya dipakai kalau browser tidak mengisi tipe. Batas tepat 5 MB (5.242.880 byte) diterima, 1 byte di atasnya ditolak. File kosong juga ditolak.
- OCR: `src/ui/ocr.ts` memuat Tesseract.js lewat `import()` dinamis dan memakai `createWorker(["ind", "eng"], OEM.LSTM_ONLY)` dengan `workerPath`, `corePath`, `langPath` ke `/tesseract` di situs sendiri (`workerBlobURL: false`). Gambar dibaca dari `Blob` di worker, tidak ada request gambar.
- Aset OCR disalin dari `node_modules` ke `public/tesseract/` oleh `scripts/salin-tesseract.mjs`, yang jalan otomatis di `predev` dan `prebuild` (atau manual: `npm run aset:ocr`). Folder itu di-gitignore. Isinya: `worker.min.js`, 3 varian core LSTM (`.wasm.js`, ~3,9 MB masing-masing, browser hanya memuat satu), `ind.traineddata.gz` (1,2 MB) dan `eng.traineddata.gz` (3,0 MB) versi `4.0.0_best_int`. Data bahasa disimpan di IndexedDB setelah dimuat pertama kali.
- UI: `src/ui/UnggahScreenshot.tsx`, dipasang di `FormCek` di bawah penghitung. Progres tampil di `role="status"` + `aria-live="polite"` (persen dibulatkan per 10%) dan `<progress>`. Setelah sukses, teks mengganti isi kotak tanpa dipotong dan fokus pindah ke kotak teks. Tombol Cek nonaktif selama OCR.
- Dicek manual di Chrome desktop (tab Network): hanya ada GET ke `/tesseract/*` di localhost dan POST `/api/cek` berisi teks. Tidak ada request ke CDN dan tidak ada request yang membawa gambar.

### Waktu OCR

Diukur di Chrome desktop (laptop pengembang, panel browser tersembunyi), screenshot sintetis:

| Gambar | Teks | Waktu |
|---|---|---|
| 1080×1400 PNG, 9 baris, pertama kali (core + data bahasa belum di-cache) | ±300 karakter | 3,3 detik |
| 1080×2400 PNG (ukuran screenshot HP), 20 baris | 666 karakter | 6,2 detik (2 kali, stabil) |
| Gambar yang sama diperkecil ke 720×1600 | 666 karakter | 5,2 detik |
| 1400×3940 PNG, 80 baris (kasus ekstrem) | 5.919 karakter | 41 detik |

**Belum diukur di HP kelas menengah.** Agen tidak punya akses ke HP. Perlu diukur manual oleh manusia: buka URL deploy di Chrome Android, unggah screenshot lowongan asli ±20 baris, ukur dari memilih file sampai teks muncul di kotak (pertama kali dan kedua kali), lalu tulis hasilnya di sini. Dari angka desktop di atas, screenshot penuh di HP bisa mendekati atau melewati target 15 detik. Memperkecil gambar hanya menghemat ±1 detik, jadi belum diterapkan.

### Catatan untuk tiket lain

- Tiket 15 (desain visual): `<input type="file">` dan `<progress>` masih memakai gaya bawaan browser, jadi target sentuh tombol unggah kemungkinan di bawah 44×44 px (NFR-06), dan `<progress>` tanpa nilai beranimasi walau `prefers-reduced-motion`.
- Perlu satu uji manual dengan screen reader (TalkBack/NVDA): setelah OCR sukses, fokus pindah ke kotak teks bersamaan dengan pengumuman status "Teks dari screenshot sudah masuk…". Pastikan pengumumannya tetap terbaca.
