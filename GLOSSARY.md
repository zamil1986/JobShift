# Legitly

Legitly menilai risiko penipuan sebuah lowongan kerja yang diterima di luar job portal, sebelum pencari kerja membayar atau menyerahkan data pribadi. Nama Legitly tidak berarti hasilnya menyatakan sebuah lowongan legit.

## Pengecekan

**Cek**:
Satu kali penilaian risiko atas satu Teks, yang menghasilkan satu Label.
_Hindari_: scan, analisis, verifikasi

**Teks**:
Isi yang dinilai dalam satu Cek: teks yang ditempel pengguna atau hasil bacaan screenshot yang sudah dikonfirmasi pengguna. Satu Teks bisa berisi lebih dari satu lowongan, tetapi tetap dinilai sebagai satu kesatuan.
_Hindari_: input, pesan, lowongan (untuk hal yang dinilai)

**Lowongan**:
Tawaran kerja yang diterima pengguna, termasuk lewat pesan pribadi, grup, atau media sosial.
_Hindari_: job, iklan kerja (boleh "loker" di teks antarmuka)

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
Satu temuan mencurigakan dalam Teks, berupa alasan dan Kutipan pemicu. Bisa berasal dari Aturan atau dari AI.
_Hindari_: flag, red flag, indikator

**Kutipan pemicu**:
Potongan kalimat yang persis ada di Teks dan menjadi bukti sebuah Tanda bahaya. Tanda bahaya tanpa Kutipan pemicu tidak sah.
_Hindari_: highlight, cuplikan, bukti

**Penjelasan**:
Ringkasan hasil Cek dalam bahasa awam, paling banyak tiga kalimat, yang tidak boleh menyiratkan tingkat risiko yang berbeda dari Label.
_Hindari_: kesimpulan, analisis AI

**Sumber penilaian**:
Asal hasil sebuah Cek: "aturan" saja, atau "aturan+AI" kalau AI ikut menilai.

**Langkah aman**:
Tindakan yang disarankan sesuai Label dan Modus, beserta tautan ke kanal resmi.
_Hindari_: rekomendasi, solusi

**Langkah darurat**:
Bagian tetap di hasil Waspada dan Bahaya untuk pengguna yang sudah telanjur mentransfer uang atau mengirim data, yang mengarah ke IASC dan Kontak OJK.
_Hindari_: pemulihan

## Penilaian

**Aturan**:
Pola tetap yang dicari di Teks. Kalau cocok, Aturan menghasilkan satu Tanda bahaya dengan bobot tertentu.
_Hindari_: rule, R01, filter (di teks antarmuka)

**Aturan kritis**:
Aturan untuk perilaku yang praktis tidak pernah dilakukan lowongan asli, misalnya meminta uang sebelum diterima atau memberangkatkan ke luar negeri dengan visa wisata. Satu Aturan kritis yang cocok sudah cukup untuk Label Bahaya.
_Hindari_: aturan berat, aturan utama

**Modus**:
Pola penipuan lowongan yang dikenali Legitly: Tugas, Lokal, atau Luar negeri. Sebuah Aturan atau Tanda bahaya terkait dengan paling banyak satu Modus.
_Hindari_: kategori, jenis scam

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
Bagian dataset yang tidak pernah dipakai untuk menyetel Aturan, dan menjadi sumber satu-satunya angka akurasi yang dilaporkan.
_Hindari_: data uji (untuk set dev)
