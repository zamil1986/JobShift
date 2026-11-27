// Copy beranda (landing). Statistik hanya dari PRD.md beserta sumbernya;
// tidak ada testimoni, angka pengguna, logo mitra, atau angka akurasi
// sebelum M3 (PRODUCT.md, "Evidence on Hand"). Copy tidak memakai kata yang
// dilarang untuk teks hasil (lihat src/cek/kata-terlarang.ts).

export const DESKRIPSI =
  "Tempel teks lowongan kerja yang kamu terima, lalu lihat tanda bahayanya sebelum kamu membayar atau mengirim data pribadi.";

export const LEWATI_KE_CEK = "Langsung ke kotak cek";
export const NAV_CARA_KERJA = "Cara kerja";
export const NAV_CEK_SEKARANG = "Cek sekarang";
export const NAV_SUDAH_TELANJUR = "Sudah telanjur?";

export const JUDUL_CARA_KERJA = "Cara kerja";
export const PENGANTAR_CARA_KERJA =
  "Tiga langkah, tanpa daftar akun. Hasilnya menunjuk kalimat di teksmu sendiri, bukan cuma angka.";

export const LANGKAH_PAKAI = [
  {
    nama: "Salin",
    teks: "Salin pesan lowongan dari WhatsApp, Telegram, atau media sosial, lengkap dari awal sampai akhir.",
  },
  {
    nama: "Tempel dan cek",
    teks: "Tempel di kotak cek, lalu tekan Cek. Tidak perlu daftar atau masuk.",
  },
  {
    nama: "Baca alasannya",
    teks: "Lihat Label, kalimat yang ditandai, dan langkah berikutnya sebelum kamu membalas pesannya.",
  },
] as const;

export const JUDUL_FITUR = "Yang dilakukan JobShift sebelum kamu transfer";

export const FITUR = [
  {
    ikon: "kutip",
    nama: "Menunjuk kalimatnya",
    teks: "Setiap tanda bahaya disertai kutipan dari teks yang kamu tempel, jadi kamu tahu persis bagian mana yang mencurigakan.",
  },
  {
    ikon: "kunci",
    nama: "Teks tidak disimpan",
    teks: "Teks hanya dipakai untuk satu kali cek. Nomor HP, rekening, NIK, dan email disamarkan sebelum dikirim ke AI.",
  },
  {
    ikon: "tambah",
    nama: "AI hanya menambah",
    teks: "Aturan yang bisa dijelaskan bekerja lebih dulu. AI boleh menambah tanda bahaya, tapi tidak pernah menghapusnya.",
  },
  {
    ikon: "orang",
    nama: "Tanpa akun",
    teks: "Tidak perlu daftar atau masuk. Buka dari HP, tempel, tekan Cek.",
  },
  {
    ikon: "pola",
    nama: "Tiga modus dikenali",
    teks: "Modus Tugas, Lokal, dan Luar negeri dikenali dari kalimat khasnya, lalu langkah berikutnya disesuaikan.",
  },
  {
    ikon: "arah",
    nama: "Langkah dan kanal resmi",
    teks: "Setiap hasil memberi langkah berikutnya beserta tautan ke kanal resmi seperti IASC, Karirhub, dan KP2MI.",
  },
] as const;

export type NamaIkonFitur = (typeof FITUR)[number]["ikon"];

export const JUDUL_MODUS = "Tiga modus yang dikenali JobShift";

/** Dari GLOSSARY.md, "Modus Tugas", "Modus Lokal", "Modus Luar negeri". */
export const CIRI_MODUS = [
  {
    nama: "Tugas",
    ciri: "Kerja “tugas” daring (like, rating, ulasan) yang meminta deposit untuk naik level atau mencairkan komisi.",
  },
  {
    nama: "Lokal",
    ciri: "Lowongan dalam negeri palsu yang sering mengatasnamakan perusahaan besar dan meminta biaya seperti seragam, medical, atau pelatihan.",
  },
  {
    nama: "Luar negeri",
    ciri: "Lowongan luar negeri fiktif bergaji tinggi di luar jalur penempatan resmi, yang berisiko menjadi pintu masuk perdagangan orang.",
  },
];

export const JUDUL_ALASAN = "Kanal resmi bekerja setelah kejadian. JobShift bekerja sebelumnya.";

export type Fakta = {
  angka: string;
  teks: string;
  sumber: { nama: string; url: string };
};

export const FAKTA: Fakta[] = [
  {
    angka: "26.910",
    teks: "laporan penipuan lowongan kerja masuk ke IASC sampai sekitar 31 Mei 2026.",
    sumber: {
      nama: "Katadata",
      url: "https://katadata.co.id/finansial/keuangan/6a4324b291318/korban-scam-tak-tahu-harus-lapor-ke-mana-kenali-layanan-iasc",
    },
  },
  {
    angka: "80%",
    teks: "korban scam baru melapor 12 jam setelah kejadian, padahal dana sudah berpindah dalam hitungan jam.",
    sumber: {
      nama: "Kontan, 17 Nov 2026",
      url: "https://keuangan.kontan.co.id/news/iasc-terima-741545-laporan-scam-80-korban-lapor-setelah-12-jam",
    },
  },
  {
    angka: "7.908",
    teks: "iklan lowongan luar negeri fiktif diblokir Komdigi dan BP2MI sepanjang Januari–Agustus 2026.",
    sumber: {
      nama: "Katadata",
      url: "https://katadata.co.id/digital/teknologi/6a9ec5336a97b/komdigi-blokir-7908-loker-luar-negeri-palsu-waspada-modus-perdagangan-orang",
    },
  },
];

export const PENGANTAR_TELANJUR = "Jangan tunggu sampai besok. Hubungi kanal resmi ini secepatnya.";

export const JUDUL_AJAKAN = "Dapat tawaran kerja lagi? Cek dulu sebelum transfer.";

export const KAKI_HALAMAN = "Halaman";
export const KAKI_KANAL = "Kanal resmi";
export const BUKAN_PENGGANTI =
  "JobShift bukan pengganti kanal pelaporan resmi dan tidak memeriksa izin resmi perusahaan. Hasil cek bukan jaminan.";

/** Legenda skala Label di kaki hasil (PRD FR-04). */
export const RENTANG_LABEL = {
  risiko_rendah: "0–24",
  waspada: "25–59",
  bahaya: "60–100",
} as const;
