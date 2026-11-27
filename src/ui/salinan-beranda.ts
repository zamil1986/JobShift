// Copy beranda (landing). Statistik hanya dari PRD.md beserta sumbernya;
// tidak ada testimoni, angka pengguna, atau angka akurasi sebelum M3
// (PRODUCT.md, "Evidence on Hand"). Copy tidak memakai "aman", "asli",
// "legit", atau "terpercaya".

export const DESKRIPSI =
  "Tempel teks lowongan kerja yang kamu terima, lalu lihat tanda bahayanya sebelum kamu membayar atau mengirim data pribadi.";

export const LEWATI_KE_CEK = "Langsung ke kotak cek";
export const NAV_CARA_KERJA = "Cara kerja";
export const NAV_SUDAH_TELANJUR = "Sudah telanjur?";

/** Kepala struk. Dekoratif: label kotak teks tetap yang dibacakan. */
export const KEPALA_STRUK = "Struk cek lowongan";

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

export const JUDUL_CARA_KERJA = "Cara kerja";

export const LANGKAH_PAKAI = [
  "Salin pesan lowongan dari WhatsApp, Telegram, atau media sosial.",
  "Tempel di struk, lalu tekan Cek.",
  "Baca Label, kalimat yang ditandai, dan langkah berikutnya.",
];

export const PENJELASAN_CARA_KERJA = [
  "JobShift memeriksa teks dengan aturan yang bisa dijelaskan, lalu boleh dibantu AI. AI hanya bisa menambah tanda bahaya, tidak pernah menghapusnya.",
  "Sebelum teks dikirim ke AI, nomor HP, nomor rekening, NIK, dan email disamarkan. Teks yang kamu tempel tidak disimpan.",
  "Hasil JobShift bukan jaminan, dan JobShift tidak memeriksa izin resmi perusahaan.",
];

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

export const PENGANTAR_TELANJUR = "Jangan tunggu sampai besok. Hubungi kanal resmi ini secepatnya.";

export const BUKAN_PENGGANTI = "JobShift bukan pengganti kanal pelaporan resmi.";

/** Legenda skala Label di kaki struk hasil (PRD FR-04). */
export const RENTANG_LABEL = {
  risiko_rendah: "0–24",
  waspada: "25–59",
  bahaya: "60–100",
} as const;
