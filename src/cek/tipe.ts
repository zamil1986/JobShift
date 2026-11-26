// Kontrak hasil Cek. Disalin persis dari spec (.scratch/jobshift-mvp/spec.md,
// "Kontrak HasilCek"). Jangan diubah tanpa persetujuan pemilik inti.

export type Label = "risiko_rendah" | "waspada" | "bahaya";
export type Modus = "tugas" | "lokal" | "luar_negeri";

export type Langkah = { teks: string; tautan?: { url: string; domain: string } };

export type TandaBahaya = {
  sumber: "aturan" | "ai";
  /** Hanya untuk sumber "aturan"; tidak ditampilkan di UI. */
  aturanId?: string;
  alasan: string;
  /** Potongan persis dari Teks asli. */
  kutipan: string;
  /** Offset karakter [awal, akhir) di Teks asli, untuk highlight. */
  rentang: [number, number];
  bobot: number;
  modus?: Modus;
};

export type TandaBahayaTersirat = { alasan: string; bobot: number };

export type HasilCek = {
  label: Label;
  /** 0–100, bilangan bulat. */
  skor: number;
  /** Urut bobot menurun, lalu posisi kutipan. */
  tandaBahaya: TandaBahaya[];
  tandaBahayaTersirat: TandaBahayaTersirat[];
  /** Semua Modus yang cocok, urut jumlah bobot. */
  modus: Modus[];
  modusTerkuat: Modus | null;
  /** Paling banyak 3 kalimat. */
  penjelasan: string;
  langkahAman: { umum: Langkah[]; spesifik: Langkah[] };
  /** null untuk Risiko rendah. */
  langkahDarurat: { sudahTransfer: Langkah[]; sudahKirimData: Langkah[] } | null;
  sumberPenilaian: "aturan" | "aturan+AI";
  /** AI timeout, gagal, atau keluaran tidak valid. */
  catatanAI?: "ai_tidak_tersedia";
};

export type KodeError =
  | "teks_kosong"
  | "teks_terlalu_pendek"
  | "teks_terlalu_panjang"
  | "format_tidak_valid";

/** Body respons 400 dari POST /api/cek. */
export type ErrorCek = { error: { kode: KodeError; pesan: string } };

/**
 * Adapter AI. Menerima Teks yang sudah melalui Penyamaran dan mengembalikan
 * keluaran mentah. Inti tidak memercayai keluaran ini dan selalu
 * memvalidasinya sendiri.
 */
export type PenilaiAI = (teksTersamar: string, signal: AbortSignal) => Promise<unknown>;
