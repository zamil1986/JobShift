# 03: Aturan kritis R01/R02, Penyangkal, dan highlight

**What to build:** Pengguna yang menempel lowongan yang meminta biaya seragam atau kode OTP langsung mendapat Label Bahaya. Hasilnya memuat Skor ≥ 60, Tanda bahaya beralasan, dan Kutipan pemicu yang di-highlight di Teks aslinya. Lowongan yang menulis "tidak dipungut biaya" tidak terkena. Tiket ini juga membangun infrastruktur mesin Aturan yang dipakai tiket 04–07: pencocokan ternormalisasi dengan peta offset, Skor, ambang Label, dan perhitungan Modus/Modus terkuat. Lihat spec bagian Mesin Aturan, Skor, Label, Modus, serta ADR-0002.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] R01 (Minta uang di awal, Modus Lokal) dan R02 (Minta OTP/PIN/password) sudah ada, keduanya kritis berbobot 60, dengan kata kunci Indonesia dan Inggris
- [x] Pencocokan tidak membedakan huruf besar/kecil dan spasi berlebih; `kutipan` diambil dari Teks asli lewat `rentang`
- [x] Penyangkal ≤ 3 kata sebelum pemicu membatalkan R01/R02; kecocokan berikutnya yang tidak didahului Penyangkal tetap tertangkap
- [x] Skor = min(100, Σ bobot); ambang Label 0–24 / 25–59 / ≥60 dites di batas 24/25/59/60; Skor tidak pernah melebihi 100
- [x] `modus` dan `modusTerkuat` dihitung dari jumlah bobot per modus; seri diurutkan Luar negeri, Lokal, Tugas
- [x] Halaman hasil menampilkan Label (warna + ikon + kata), Skor, daftar Tanda bahaya urut bobot, Modus, dan highlight `<mark>` di Teks asli
- [x] Tes lewat `cek()`: positif, negatif, negatif-penyangkal, dan penyangkal-lalu-kecocokan-kedua untuk R01 dan R02; dua kali Cek menghasilkan hasil identik
- [x] UI tidak menampilkan ID aturan (NFR-08)

## Comments

- 2026-11-27 (Claude, branch `tiket-03-aturan-kritis-dan-penyangkal`): semua kriteria selesai. `npm test` (59 tes), `npm run lint`, dan `npm run typecheck` lulus. Halaman hasil dicek di browser 360 × 640: Label Bahaya, Skor, Modus, dua `<mark>`, kecocokan yang diawali Penyangkal tidak disorot, dan tidak ada ID aturan di halaman.
- **Seam diperlebar, perlu persetujuan pemilik spec.** `cek(teks, opsi)` sekarang menerima opsi tambahan `{ aturan }` untuk mengganti katalog di tes, dan tipe `Aturan`/`Pola` diekspor dari `@/cek`. Alasannya, Skor 24 dan 59 tidak mungkin dihasilkan katalog asli (semua bobot kelipatan 5, AI maksimal +25), padahal batas 24/25/59/60 dan seri Modus terkuat wajib dites lewat `cek()`. Route API tidak pernah mengisi opsi ini. Kalau ditolak, alternatifnya adalah menguji batas Label lewat fungsi internal, tapi itu melanggar "Testing Decisions".
- **Daftar dicocokkan sebagai satu pemicu.** "tanpa biaya seragam, medical, atau pelatihan" dan "jangan berikan kode OTP, PIN, atau password" adalah satu kecocokan, jadi Penyangkal di depan daftar membatalkan seluruh daftar walaupun item terakhir lebih dari 3 kata dari Penyangkal. Tanpa ini, peringatan seperti contoh di ADR-0002 tetap berlabel Bahaya. Ini desain pola, bukan perubahan jarak Penyangkal.
- **Keputusan terbuka untuk penyetel Aturan (tiket 04–07 / Set dev):**
  - "otp", "pin", "password" hanya ada di pola Indonesia, supaya "kirim no HP dan PIN" tetap tertangkap. Akibatnya "No password is required" dalam Teks Inggris tetap Bahaya.
  - "not"/"never"/"don't" bukan Penyangkal di spec, jadi "Do not share your OTP code" berlabel Bahaya. Menambahnya berarti mengubah daftar ADR-0002.
  - "Kata" untuk jarak Penyangkal adalah deret huruf/angka, jadi "Rp 100.000" dihitung 3 kata. Jendela 3 kata juga melewati batas kalimat ("Bebas biaya! Transfer dulu…" dibatalkan).
  - "pin lokasi", "pin point", dan "pin map" dikecualikan dari R02.
- Catatan untuk tiket 08: `penjelasan` baru satu kalimat per Label (`src/cek/penjelasan.ts`); `langkahAman` masih kosong, dan `langkahDarurat` berisi daftar kosong untuk Waspada/Bahaya.
