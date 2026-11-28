// Teks contoh siap pakai (PRD FR-08): tiga lowongan Palsu, satu per Modus,
// dan satu lowongan resmi. Semuanya fiktif: nama perusahaan, alamat, dan
// kontak dikarang, dan tidak ada nomor HP, email pribadi, atau rekening yang
// cocok dengan pola Penyamaran. Modul ini aman diimpor kode browser.

export type IdContoh = "tugas" | "lokal" | "luar_negeri" | "resmi";

export type Contoh = {
  id: IdContoh;
  /** Teks tombol. */
  nama: string;
  teks: string;
};

export const CONTOH: readonly Contoh[] = [
  {
    id: "tugas",
    nama: "Kerja tugas online",
    teks:
      "Halo kak, kami dari tim marketing online sedang mencari 20 orang untuk kerja paruh waktu dari HP. " +
      "Tugasnya hanya like dan follow akun toko online, komisi Rp 10.000 per tugas, bisa dicairkan setiap hari. " +
      "Untuk naik level VIP dan membuka tugas berkomisi besar, kamu wajib deposit Rp 200.000 dulu. " +
      "Kuota terbatas, daftar sekarang juga lewat Telegram admin kami.",
  },
  {
    id: "lokal",
    nama: "Loker pabrik",
    teks:
      "LOWONGAN KERJA PT GARUDA PANGAN NUSANTARA Tbk. Dibutuhkan operator produksi, lulusan SMA/SMK, " +
      "gaji Rp 15.000.000 per bulan plus mess. Pelamar yang lolos wajib membayar biaya seragam dan medical " +
      "check up Rp 750.000 sebelum interview. Kirim lamaran ke rekrutmen.garudapangan.pusat@gmail.com paling lambat hari ini.",
  },
  {
    id: "luar_negeri",
    nama: "Kerja ke luar negeri",
    teks:
      "Dibuka lowongan customer service di Kamboja, gaji 1.500 USD per bulan, tidak perlu pengalaman. " +
      "Tiket pesawat dan tempat tinggal ditanggung perusahaan. Berangkat pakai visa wisata dulu, " +
      "nanti visa kerja diurus setelah sampai. Tidak perlu lewat agen resmi, proses cepat 1 minggu langsung terbang.",
  },
  {
    id: "resmi",
    nama: "Loker resmi",
    teks:
      "PT Sinar Pangan Nusantara membuka lowongan Staf Administrasi Gudang untuk kantor cabang di " +
      "Jl. Industri Raya No. 12, Cikarang, Bekasi. Syarat: lulusan D3 atau S1, terbiasa memakai spreadsheet, " +
      "dan teliti. Lamaran dikirim melalui portal karier di situs resmi perusahaan atau Karirhub Kemnaker. " +
      "Seluruh proses rekrutmen tidak dipungut biaya apa pun.",
  },
];
