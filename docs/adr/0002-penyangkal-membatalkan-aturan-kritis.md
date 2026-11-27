# Penyangkal membatalkan kecocokan Aturan kritis, tetapi tidak pernah mengurangi Skor

Kata Penyangkal ("tidak", "tanpa", "bebas", "jangan", "gratis") yang muncul paling jauh tiga kata sebelum kata pemicu membatalkan kecocokan Aturan kritis "Minta uang di awal" (R01), "Minta OTP/PIN/password" (R02), dan "Deposit untuk naik level atau mencairkan komisi" (R07). Contohnya "tidak dipungut biaya apa pun", "jangan berikan OTP kepada siapa pun", atau "kami tidak pernah meminta deposit untuk pencairan komisi". Penyangkal hanya membatalkan kecocokan; kalimat "tanpa biaya" tidak pernah menurunkan Skor. Alasannya, lowongan Asli justru sering memuat peringatan seperti itu, dan tanpa aturan ini satu kalimat peringatan sudah membuat lowongan Asli langsung berlabel Bahaya. Akibatnya target false positive (≤ 10%) tidak mungkin tercapai.

## Opsi yang dipertimbangkan

- **Abaikan penyangkalan.** Ditolak: recall sedikit lebih tinggi, tetapi lowongan Asli dicap penipu tanpa penjelasan yang masuk akal, dan itu anti-tujuan.
- **Penyangkalan menurunkan R01/R02 menjadi bobot 25.** Ditolak: lowongan Asli dengan peringatan tetap selalu Waspada, dan aturannya lebih sulit dijelaskan.
- **"Gratis/tanpa biaya" mengurangi Skor.** Ditolak: penipu mudah menulis "gratis" untuk memancing, sama seperti logo resmi yang mudah dipalsukan.

## Konsekuensi

- Penipu yang menulis "tanpa biaya pendaftaran" lalu meminta "biaya seragam" tetap tertangkap, karena kecocokan kedua tidak didahului Penyangkal.
- Setiap Aturan wajib punya minimal satu tes negatif yang berisi kalimat penyangkalan.
- Jarak tiga kata ditetapkan sebelum penyetelan bobot pada Set dev. Mengubahnya sesudah bobot dibekukan berarti penyetelan harus diulang.
- Aturan non-kritis tidak memakai Penyangkal. Bobotnya kecil, jadi kalimat peringatan paling jauh membuat Waspada, sedangkan Penyangkal membuka celah ("tanpa interview, langsung join grup Telegram" akan batal).

## Revisi 2026-11-27: R07 ikut memakai Penyangkal

Semula hanya R01 dan R02. R07 (tiket 04) ditambahkan karena peringatan anti-penipuan "kami tidak pernah meminta deposit atau top up untuk pencairan komisi" punya bentuk yang sama dengan pemicunya, dan sebagai Aturan kritis satu kalimat itu langsung memberi Label Bahaya. Penipu yang menulis "level 1 tanpa deposit" lalu "level 2 wajib deposit" tetap tertangkap lewat kecocokan kedua. Batasannya:

- Penyangkal hanya diperiksa sebelum awal kecocokan. Pola R07 yang diawali kata tujuan ("untuk naik level, tidak perlu deposit") memuat Penyangkal di dalam kecocokan, jadi tidak batal.
- "Never", "not", dan "don't" tidak ada di daftar, jadi "we never ask for a deposit to upgrade to VIP" tetap Bahaya.
