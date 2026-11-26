# Legitly

Legitly menilai risiko penipuan sebuah lowongan kerja yang diterima di luar job portal, sebelum pencari kerja membayar atau menyerahkan data pribadi. Nama Legitly tidak berarti hasilnya menyatakan sebuah lowongan legit.

## Pengecekan

**Cek**:
Satu kali penilaian risiko atas satu Teks, yang menghasilkan satu Label. Teks yang terlalu pendek untuk dinilai tidak menghasilkan Cek.
_Hindari_: scan, analisis, verifikasi

**Teks**:
Isi yang dinilai dalam satu Cek: teks yang ditempel pengguna atau hasil bacaan screenshot yang sudah dikonfirmasi pengguna. Satu Teks bisa berisi lebih dari satu lowongan, tetapi tetap dinilai sebagai satu kesatuan.
_Hindari_: input, pesan, lowongan (untuk hal yang dinilai)

**Lowongan**:
Tawaran kerja yang diterima pengguna, termasuk lewat pesan pribadi, grup, atau media sosial.
_Hindari_: job, iklan kerja (boleh "loker" di teks antarmuka)

**Penyamaran**:
Penggantian data pribadi di Teks (nomor HP, nomor rekening, NIK, email) dengan penanda seperti `[NOMOR]` sebelum Teks dikirim ke AI. Aturan selalu menilai Teks asli.
_Hindari_: sensor, anonimisasi

## Hasil

**Label**:
Tingkat risiko sebuah Cek, yaitu salah satu dari Risiko rendah, Waspada, atau Bahaya.
_Hindari_: vonis, status, kategori

**Risiko rendah**:
Label terendah: tidak ditemukan Tanda bahaya yang cukup. Label ini tidak pernah berarti lowongan itu terjamin, dan selalu disertai peringatan untuk tidak mentransfer uang apa pun.
_Hindari_: aman, asli, legit, terpercaya, lolos

**Waspada**:
Label tengah: ada Tanda bahaya yang perlu diperhatikan sebelum pengguna menanggapi lowongan.

**Bahaya**:
Label tertinggi: Tanda bahayanya kuat, atau ada Aturan kritis yang cocok.

**Skor**:
Angka risiko 0–100 yang menentukan Label. Skor dan Label tidak pernah bertentangan.
_Hindari_: skor model, probabilitas, persentase penipuan

**Tanda bahaya**:
Satu temuan mencurigakan dalam Teks, berupa alasan dan Kutipan pemicu. Bisa berasal dari Aturan atau dari AI. Satu-satunya yang boleh tanpa Kutipan pemicu adalah Tanda bahaya tersirat.
_Hindari_: flag, red flag, indikator

**Tanda bahaya tersirat**:
Tanda bahaya yang buktinya adalah ketiadaan informasi di Teks, misalnya tidak ada nama perusahaan atau alamat. Hanya berasal dari Aturan, tidak pernah kritis, dan tampil terpisah tanpa highlight karena tidak ada kalimat yang bisa ditunjuk.
_Hindari_: info hilang, catatan

**Kutipan pemicu**:
Potongan kalimat yang ada di Teks dan menjadi bukti sebuah Tanda bahaya. Kecocokannya tidak membedakan huruf besar/kecil dan spasi berlebih, tetapi yang ditampilkan selalu potongan dari Teks asli. Tanda bahaya tanpa Kutipan pemicu tidak sah, kecuali Tanda bahaya tersirat.
_Hindari_: highlight, cuplikan, bukti

**Penjelasan**:
Ringkasan hasil Cek dalam bahasa awam, paling banyak tiga kalimat, yang tidak boleh menyiratkan tingkat risiko yang berbeda dari Label.
_Hindari_: kesimpulan, analisis AI

**Sumber penilaian**:
Asal hasil sebuah Cek: "aturan" saja, atau "aturan+AI" kalau AI ikut menilai.

**Langkah aman**:
Tindakan yang disarankan sesuai Label dan Modus terkuat, beserta tautan ke kanal resmi.
_Hindari_: rekomendasi, solusi

**Langkah darurat**:
Bagian tetap di hasil Waspada dan Bahaya untuk pengguna yang sudah telanjur bertindak. Terdiri dari dua bagian: "sudah transfer" (IASC, bank atau e-wallet, Kontak OJK) dan "sudah kirim data" (bank atau e-wallet, Kontak OJK, lapor akun pelaku di platformnya).
_Hindari_: pemulihan

## Penilaian

**Aturan**:
Pola tetap yang dicari di Teks. Kalau cocok, Aturan menghasilkan satu Tanda bahaya dengan Bobot tertentu.
_Hindari_: rule, R01, filter (di teks antarmuka)

**Bobot**:
Nilai yang disumbangkan satu Tanda bahaya ke Skor. Aturan kritis dihitung 60. Tanda bahaya dari AI selalu 10.
_Hindari_: poin, nilai

**Aturan kritis**:
Aturan untuk perilaku yang praktis tidak pernah dilakukan lowongan asli, misalnya meminta uang sebelum diterima atau memberangkatkan kerja ke luar negeri dengan visa wisata. Satu Aturan kritis yang cocok sudah cukup untuk Label Bahaya.
_Hindari_: aturan berat, aturan utama

**Penyangkal**:
Kata seperti "tidak", "tanpa", "bebas", "jangan", atau "gratis" yang muncul tepat sebelum kata pemicu dan membatalkan kecocokan sebuah Aturan, misalnya "tidak dipungut biaya". Penyangkal hanya membatalkan, tidak pernah mengurangi Skor.
_Hindari_: negasi (di teks antarmuka)

**Modus**:
Pola penipuan lowongan yang dikenali Legitly: Tugas, Lokal, atau Luar negeri. Sebuah Aturan terkait dengan paling banyak satu Modus. Tanda bahaya dari AI tidak terkait Modus.
_Hindari_: kategori, jenis scam, pola

**Modus terkuat**:
Modus dengan jumlah Bobot terbesar di sebuah Cek, yang menentukan Langkah aman spesifik. Kalau seri, urutannya Luar negeri, Lokal, lalu Tugas.

**Modus Tugas**:
Kerja "tugas" daring (like, rating, ulasan) yang meminta deposit untuk naik level atau mencairkan komisi.

**Modus Lokal**:
Lowongan dalam negeri palsu yang sering mengatasnamakan perusahaan besar dan meminta biaya seperti seragam, medical, atau pelatihan.

**Modus Luar negeri**:
Lowongan luar negeri fiktif bergaji tinggi di luar jalur penempatan resmi, yang berisiko menjadi pintu masuk perdagangan orang.

## Evaluasi

**Palsu**:
Label kebenaran untuk contoh lowongan di dataset yang diketahui penipuan. Hanya dipakai untuk dataset, tidak pernah untuk hasil Cek.
_Hindari_: scam, hoaks

**Asli**:
Label kebenaran untuk contoh lowongan di dataset yang diketahui sungguhan. Hanya dipakai untuk dataset, tidak pernah untuk hasil Cek.
_Hindari_: aman, valid, legit

**Set dev**:
Bagian dataset yang boleh dipakai untuk menyetel Aturan.

**Set test**:
Bagian dataset yang tidak pernah dipakai untuk menyetel Aturan, dan menjadi sumber satu-satunya angka akurasi yang dilaporkan. Dikumpulkan dan dipegang oleh orang yang tidak menyetel Aturan.
_Hindari_: data uji (untuk set dev)
