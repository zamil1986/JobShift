# 09: Input screenshot dengan OCR di browser

**What to build:** Pengguna mengunggah screenshot lowongan. Teksnya dibaca di browser dengan indikator progres, lalu tampil di kotak teks yang bisa diedit sebelum dicek. Gambar tidak pernah meninggalkan perangkat. Lihat PRD FR-02 dan spec bagian Stack.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Menerima PNG/JPG/WebP ≤ 5 MB; file lain atau yang lebih besar ditolak dengan pesan yang jelas
- [ ] Tesseract.js `ind`+`eng` berjalan di Web Worker dengan data bahasa yang di-host sendiri; tidak ada request gambar ke server (dicek di tab Network)
- [ ] Indikator progres OCR bisa diakses screen reader
- [ ] Hasil OCR mengisi kotak teks yang bisa diedit, dengan penghitung; teks > 3.000 karakter tidak dipotong otomatis
- [ ] OCR gagal atau hasilnya kosong → pengguna diarahkan untuk menempel teks
- [ ] Waktu OCR diukur di satu HP kelas menengah dan dicatat (target < 15 detik)
