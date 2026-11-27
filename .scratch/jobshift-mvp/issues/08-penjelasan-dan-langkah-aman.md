# 08: Penjelasan, Langkah aman, dan Langkah darurat

**What to build:** Setiap hasil memuat Penjelasan singkat (≤ 3 kalimat) dan langkah yang harus dilakukan pengguna: langkah umum sesuai Label, langkah spesifik untuk Modus terkuat, dan untuk Waspada/Bahaya, Langkah darurat dua bagian. Setiap tautan menampilkan domain resminya. Lihat spec bagian Penjelasan dan kata terlarang, serta Langkah aman dan Langkah darurat.

**Blocked by:** 03

**Status:** ready-for-agent

- [x] Templat Penjelasan per Label ditambah satu kalimat per Modus terkuat, total ≤ 3 kalimat
- [x] Copy Langkah aman disimpan sebagai data statis per Label dan per Modus; semua tautan menyimpan dan menampilkan `domain`
- [x] Ada tautan Karirhub Kemnaker dan aduankonten.id; Modus Luar negeri selalu memuat cek legalitas P3MI KP2MI, 0800-1000, dan WA 0811-8080-141
- [x] Waspada dan Bahaya memuat "Sudah telanjur transfer?" (IASC, bank/e-wallet, OJK 157) dan "Sudah telanjur kirim data?" (bank/e-wallet, OJK 157, lapor akun pelaku); Risiko rendah `langkahDarurat: null`
- [x] Tes memindai seluruh copy statis (Penjelasan, alasan Aturan, Langkah aman): tidak memuat kata utuh "aman", "asli", "legit", atau "terpercaya", dengan pengecualian nama merek, tagline, dan domain resmi
- [ ] Semua URL tautan sudah dicek manual membuka situs resmi

## Comments

**2026-11-27, implementasi:**
- Data statis di `src/cek/langkah.ts`, Penjelasan di `src/cek/penjelasan.ts`, filter `memuatKataTerlarang` diekspor dari `@/cek` untuk tiket 10.
- Langkah spesifik mengikuti Modus terkuat untuk semua Label, termasuk Risiko rendah. Kanal KP2MI muncul kalau Modus terkuatnya Luar negeri, bukan setiap kali Luar negeri ada di daftar Modus.
- Nomor 157, 0800-1000, dan 0811-8080-141 ditulis di teks, bukan tautan `tel:`/`wa.me`.
- Judul bagian di UI "Langkah berikutnya", karena "Langkah aman" memuat kata terlarang.
- Cek URL otomatis (curl, 2026-11-27): karirhub.kemnaker.go.id, iasc.ojk.go.id, dan migran-aman.kp2mi.go.id/cek-legalitas menjawab 200 tanpa redirect ke domain lain. aduankonten.id menjawab tantangan Cloudflare (403), jadi **belum terverifikasi**: perlu dibuka manual di browser.
- Catatan: Risiko rendah dengan Modus (Skor < 25) menghasilkan "Tidak ditemukan tanda bahaya di teks ini. Ada ciri yang mirip Modus …", yang agak bertentangan. Kalimat Label Risiko rendah belum diubah.
