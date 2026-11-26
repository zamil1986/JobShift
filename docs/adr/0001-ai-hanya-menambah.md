# AI hanya menambah Tanda bahaya, tidak pernah menurunkan hasil Aturan

Lapisan AI hanya boleh **menambah** Tanda bahaya dan menaikkan Skor, tidak pernah menurunkannya. Setiap Tanda bahaya dari AI bernilai tetap 10 poin, dan total sumbangan AI paling banyak +25, sehingga AI sendirian bisa menaikkan Risiko rendah menjadi Waspada tetapi tidak pernah sampai Bahaya. Tanda bahaya AI wajib punya Kutipan pemicu yang persis ada di Teks, dan dibuang kalau kutipannya tumpang-tindih dengan Tanda bahaya dari Aturan. Alasannya, anti-tujuan terbesar Legitly adalah pengguna merasa aman padahal lowongannya palsu. Hasil tidak boleh menjadi "lebih aman" hanya karena AI sempat atau tidak sempat menjawab dalam 6 detik, dan setiap poin Skor harus bisa ditunjuk ke kalimat di Teks.

## Opsi yang dipertimbangkan

- **AI boleh menaikkan dan menurunkan Skor** (kecuali di bawah Aturan kritis). Ditolak: bisa mengurangi false positive, tetapi hasil jadi bergantung pada AI yang tidak deterministik dan bisa berubah saat kuota habis.
- **AI tampil terpisah tanpa memengaruhi Skor.** Ditolak: pengguna melihat dua penilaian yang mungkin bertentangan.
- **Bobot ditentukan AI per Tanda bahaya.** Ditolak: kurang deterministik dan sulit dievaluasi.

## Konsekuensi

- AI tidak bisa mengoreksi false positive dari Aturan. Target false positive (≤ 10% Asli → Bahaya) sepenuhnya ditanggung oleh penyetelan Aturan pada Set dev.
- Bahaya selalu butuh bukti dari Aturan, jadi mode "AI saja" di `npm run eval` tidak akan pernah menghasilkan Bahaya. Ini disengaja, bukan bug.
- Penjelasan dari AI boleh menggantikan Penjelasan templat, tetapi ditolak kalau memakai kata yang dihindari (misalnya "aman" atau "asli") atau menyiratkan tingkat risiko yang berbeda dari Label.
