# 08: Penjelasan, Langkah aman, dan Langkah darurat

**What to build:** Setiap hasil memuat Penjelasan singkat (≤ 3 kalimat) dan langkah yang harus dilakukan pengguna: langkah umum sesuai Label, langkah spesifik untuk Modus terkuat, dan untuk Waspada/Bahaya, Langkah darurat dua bagian. Setiap tautan menampilkan domain resminya. Lihat spec bagian Penjelasan dan kata terlarang, serta Langkah aman dan Langkah darurat.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Templat Penjelasan per Label ditambah satu kalimat per Modus terkuat, total ≤ 3 kalimat
- [ ] Copy Langkah aman disimpan sebagai data statis per Label dan per Modus; semua tautan menyimpan dan menampilkan `domain`
- [ ] Ada tautan Karirhub Kemnaker dan aduankonten.id; Modus Luar negeri selalu memuat cek legalitas P3MI KP2MI, 0800-1000, dan WA 0811-8080-141
- [ ] Waspada dan Bahaya memuat "Sudah telanjur transfer?" (IASC, bank/e-wallet, OJK 157) dan "Sudah telanjur kirim data?" (bank/e-wallet, OJK 157, lapor akun pelaku); Risiko rendah `langkahDarurat: null`
- [ ] Tes memindai seluruh copy statis (Penjelasan, alasan Aturan, Langkah aman): tidak memuat kata utuh "aman", "asli", "legit", atau "terpercaya", dengan pengecualian nama merek, tagline, dan domain resmi
- [ ] Semua URL tautan sudah dicek manual membuka situs resmi
