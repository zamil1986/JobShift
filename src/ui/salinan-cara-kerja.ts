// Copy halaman Cara kerja (PRD FR-10). Angka akurasi tidak pernah ditulis di
// sini: semuanya dibaca dari file hasil eval Set test saat build. Copy tidak
// memakai kata terlarang untuk teks hasil (src/cek/kata-terlarang.ts), jadi
// label kebenaran dataset "Asli" ditulis "lowongan sungguhan" (GLOSSARY.md).

export const JUDUL_HALAMAN = "Cara JobShift menilai lowongan";
export const PENGANTAR_HALAMAN =
  "Cara penilaian, seberapa sering hasilnya tepat, batasannya, dan apa yang terjadi dengan teks yang kamu tempel.";

/** Teks tautan ke halaman ini dari halaman cek dan hasil. Sengaja beda dari "Cara kerja" (bagian tiga langkah di beranda). */
export const TAUTAN_KE_CARA_KERJA = "Cara penilaian, akurasi, dan privasi";
export const TAUTAN_KE_CEK = "Kembali ke kotak cek";

export const JUDUL_PENILAIAN = "Cara penilaian";
export const PENILAIAN = [
  "JobShift mencari pola kalimat yang sering muncul di lowongan penipuan. Setiap pola yang ditemukan menjadi tanda bahaya, lengkap dengan kalimat dari teksmu yang memicunya.",
  "Setiap tanda bahaya menambah Skor 0–100. Skor menentukan Label: Risiko rendah, Waspada, atau Bahaya.",
  "Beberapa pola hampir tidak pernah muncul di lowongan sungguhan. Satu saja sudah cukup untuk Label Bahaya.",
  "Kalimat seperti “tidak dipungut biaya” tidak dihitung sebagai permintaan uang, karena kata “tidak” membatalkan polanya.",
] as const;

export const judulAI = (sumbanganMaks: number) =>
  `AI hanya boleh menambah tanda bahaya, paling banyak ${sumbanganMaks} poin Skor, dan tidak pernah menghapus temuan pemeriksaan pola. Karena itu AI sendirian tidak bisa membuat Label Bahaya. Kalau AI sedang tidak tersedia, cek tetap berjalan dengan pemeriksaan pola saja.`;

export const JUDUL_SKALA = "Skala Label";
export const JUDUL_POLA_KRITIS = "Langsung Bahaya kalau ditemukan";
export const JUDUL_POLA_LAIN = "Menambah Skor";

export const JUDUL_AKURASI = "Seberapa sering hasilnya tepat";
export const BELUM_DIEVALUASI =
  "Belum dievaluasi. Angka akurasi muncul di sini setelah JobShift diuji dengan contoh lowongan yang tidak pernah dipakai untuk menyusun pola.";

export const pengantarAkurasi = (jumlah: number, palsu: number, sungguhan: number, tanggal: string) =>
  `Diuji pada ${tanggal} dengan ${jumlah} contoh lowongan (${palsu} penipuan, ${sungguhan} sungguhan) yang tidak pernah dipakai untuk menyusun pola. Angka di bawah adalah hasil cek lengkap, termasuk AI.`;

export const AKURASI = {
  tertangkap: "penipuan yang diberi Label Waspada atau Bahaya",
  keliruBahaya: "lowongan sungguhan yang keliru diberi Label Bahaya",
  sungguhanWaspada: "lowongan sungguhan yang diberi Label Waspada",
} as const;

export const presisi = (rasio: string) =>
  `Dari semua contoh yang diberi Label Waspada atau Bahaya, ${rasio} memang penipuan.`;

export const tanpaAI = (tertangkap: string, keliruBahaya: string) =>
  `Dengan pemeriksaan pola saja, tanpa AI: ${tertangkap} penipuan diberi Label Waspada atau Bahaya, dan ${keliruBahaya} lowongan sungguhan keliru diberi Label Bahaya.`;

export const aiGagal = (gagal: number, jumlah: number) =>
  `Saat pengujian, AI tidak menjawab untuk ${gagal} dari ${jumlah} contoh, jadi contoh itu dinilai dengan pemeriksaan pola saja.`;

export const sintetis = (jumlahSintetis: number, jumlah: number) =>
  `${jumlahSintetis} dari ${jumlah} contoh adalah contoh sintetis, yaitu disusun tim berdasarkan pola penipuan yang dilaporkan, bukan dikumpulkan langsung dari lowongan yang beredar.`;

export const SINTETIS_BELUM = "Jumlah contoh sintetis: belum dievaluasi.";

export const JUDUL_BATASAN = "Batasan";
export const BATASAN = [
  "JobShift dioptimalkan untuk bahasa Indonesia. Lowongan dalam bahasa lain atau bahasa daerah bisa saja tidak terbaca polanya.",
  "Hasil cek bukan vonis hukum dan bukan jaminan. Label Risiko rendah hanya berarti tidak ditemukan tanda bahaya yang cukup.",
  "JobShift tidak memeriksa izin resmi perusahaan atau agen penyalur. Untuk itu, pakai kanal resmi seperti Karirhub dan KP2MI.",
  "Modus penipuan baru dengan kalimat yang belum dikenal bisa lolos.",
  "Teks dari screenshot bisa salah baca, jadi periksa dulu sebelum menekan Cek.",
] as const;

export const JUDUL_PRIVASI = "Privasi";
export const PRIVASI = [
  "Teks dan gambar tidak disimpan. Teks yang kamu tempel dikirim ke server JobShift untuk satu kali cek, lalu dibuang, dan isinya tidak masuk log.",
  "Screenshot dibaca di perangkatmu sendiri. Gambarnya tidak pernah diunggah ke server.",
  "Nomor HP, nomor rekening, NIK, dan email disamarkan sebelum dikirim ke AI, misalnya nomor HP diganti [NOMOR]. Nama orang tidak ikut disamarkan.",
  "AI yang dipakai disediakan Groq. Secara bawaan Groq tidak menyimpan isi permintaan, tetapi mungkin menyimpan log penyalahgunaan sampai 30 hari di Amerika Serikat kalau Zero Data Retention (ZDR) tidak tersedia untuk akun JobShift.",
  "Tidak perlu akun, dan JobShift tidak memasang pelacak iklan.",
] as const;
