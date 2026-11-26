# Penyangkal membatalkan kecocokan Aturan kritis, tetapi tidak pernah mengurangi Skor

Kata Penyangkal ("tidak", "tanpa", "bebas", "jangan", "gratis") yang muncul paling jauh tiga kata sebelum kata pemicu membatalkan kecocokan Aturan kritis "Minta uang di awal" (R01) dan "Minta OTP/PIN/password" (R02). Contohnya "tidak dipungut biaya apa pun" atau "jangan berikan OTP kepada siapa pun". Penyangkal hanya membatalkan kecocokan; kalimat "tanpa biaya" tidak pernah menurunkan Skor. Alasannya, lowongan Asli justru sering memuat peringatan seperti itu, dan tanpa aturan ini satu kalimat peringatan sudah membuat lowongan Asli langsung berlabel Bahaya. Akibatnya target false positive (≤ 10%) tidak mungkin tercapai.

## Opsi yang dipertimbangkan

- **Abaikan penyangkalan.** Ditolak: recall sedikit lebih tinggi, tetapi lowongan Asli dicap penipu tanpa penjelasan yang masuk akal, dan itu anti-tujuan.
- **Penyangkalan menurunkan R01/R02 menjadi bobot 25.** Ditolak: lowongan Asli dengan peringatan tetap selalu Waspada, dan aturannya lebih sulit dijelaskan.
- **"Gratis/tanpa biaya" mengurangi Skor.** Ditolak: penipu mudah menulis "gratis" untuk memancing, sama seperti logo resmi yang mudah dipalsukan.

## Konsekuensi

- Penipu yang menulis "tanpa biaya pendaftaran" lalu meminta "biaya seragam" tetap tertangkap, karena kecocokan kedua tidak didahului Penyangkal.
- Setiap Aturan wajib punya minimal satu tes negatif yang berisi kalimat penyangkalan.
- Jarak tiga kata ditetapkan sebelum penyetelan bobot pada Set dev. Mengubahnya sesudah bobot dibekukan berarti penyetelan harus diulang.
