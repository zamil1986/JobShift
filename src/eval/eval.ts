import { z } from "zod";
import { penilaiPalsu } from "@/cek/ai";
import { buatCek, cek } from "@/cek/cek";
import { TeksTidakValid } from "@/cek/panjang";
import type { Label, PenilaiAI } from "@/cek/tipe";

export const SkemaContohDataset = z.object({
  id: z.string().min(1),
  teks: z.string(),
  kebenaran: z.enum(["palsu", "asli"]),
  modus: z.enum(["tugas", "lokal", "luar_negeri"]).optional(),
  sumber: z.string(),
  sintetis: z.boolean(),
});

export type ContohDataset = z.infer<typeof SkemaContohDataset>;
export type Kebenaran = ContohDataset["kebenaran"];

export type Rasio = {
  pembilang: number;
  penyebut: number;
  /** Persentase dengan 1 angka desimal, atau null kalau penyebut = 0. */
  persen: number | null;
};

export type BarisConfusion = Record<Label, number>;
export type TabelConfusion = Record<Kebenaran, BarisConfusion>;

export type RingkasanMode = {
  /** Palsu yang diprediksi Waspada atau Bahaya. */
  recall: Rasio;
  /** Prediksi Waspada/Bahaya yang kebenarannya Palsu. */
  presisi: Rasio;
  /** Asli yang diprediksi Bahaya. */
  falsePositive: Rasio;
  /** Asli yang diprediksi Waspada. */
  asliWaspada: Rasio;
  confusion: TabelConfusion;
};

export type HasilEval = {
  jumlahContoh: number;
  jumlahPalsu: number;
  jumlahAsli: number;
  jumlahSintetis: number;
  jumlahAiGagal: number;
  p95LatensiAiMs: number | null;
  mode: {
    aturan: RingkasanMode;
    aiSaja: RingkasanMode;
    gabungan: RingkasanMode;
  };
};

export type OpsiEvaluasi = {
  ai?: PenilaiAI;
  /** Untuk tes: penyedia waktu milidetik untuk mengukur latensi AI. */
  ukurWaktu?: () => number;
};

const cekAISaja = buatCek([]);

/** Mem-parse isi file JSONL dataset menjadi daftar contoh tervalidasi (tanpa membocorkan teks ke error). */
export function parseJsonlDataset(isi: string): ContohDataset[] {
  const hasil: ContohDataset[] = [];
  const baris = isi.split(/\r?\n/);

  for (let i = 0; i < baris.length; i++) {
    const potongan = baris[i].trim();
    if (!potongan) continue;

    const nomorBaris = i + 1;
    let mentah: unknown;
    try {
      mentah = JSON.parse(potongan);
    } catch {
      throw new Error(`Baris ${nomorBaris} bukan JSON yang valid.`);
    }

    const tervalidasi = SkemaContohDataset.safeParse(mentah);
    if (!tervalidasi.success) {
      const bidang = tervalidasi.error.issues
        .map((issue) => issue.path.join(".") || "(akar)")
        .join(", ");
      throw new Error(`Baris ${nomorBaris} tidak sesuai skema dataset (${bidang}).`);
    }

    hasil.push(tervalidasi.data);
  }

  return hasil;
}

const buatBarisKosong = (): BarisConfusion => ({
  risiko_rendah: 0,
  waspada: 0,
  bahaya: 0,
});

const buatTabelKosong = (): TabelConfusion => ({
  palsu: buatBarisKosong(),
  asli: buatBarisKosong(),
});

export function hitungRasio(pembilang: number, penyebut: number): Rasio {
  return {
    pembilang,
    penyebut,
    persen: penyebut === 0 ? null : Math.round((pembilang / penyebut) * 1000) / 10,
  };
}

function ringkasMode(confusion: TabelConfusion): RingkasanMode {
  const totalPalsu =
    confusion.palsu.risiko_rendah + confusion.palsu.waspada + confusion.palsu.bahaya;
  const totalAsli = confusion.asli.risiko_rendah + confusion.asli.waspada + confusion.asli.bahaya;
  const palsuTertangkap = confusion.palsu.waspada + confusion.palsu.bahaya;
  const semuaPositif = palsuTertangkap + confusion.asli.waspada + confusion.asli.bahaya;

  return {
    recall: hitungRasio(palsuTertangkap, totalPalsu),
    presisi: hitungRasio(palsuTertangkap, semuaPositif),
    falsePositive: hitungRasio(confusion.asli.bahaya, totalAsli),
    asliWaspada: hitungRasio(confusion.asli.waspada, totalAsli),
    confusion,
  };
}

function hitungP95(nilai: readonly number[]): number | null {
  if (nilai.length === 0) return null;
  const urut = [...nilai].sort((a, b) => a - b);
  const indeks = Math.min(urut.length - 1, Math.ceil(0.95 * urut.length) - 1);
  return Math.round(urut[indeks] * 10) / 10;
}

async function nilaiContoh(
  contoh: ContohDataset,
  ai: PenilaiAI | undefined,
  ukurWaktu: () => number,
): Promise<{
  aturan: Label;
  aiSaja: Label;
  gabungan: Label;
  latensiAiMs: number | null;
  aiGagal: boolean;
}> {
  let keluaranTerekam: unknown = null;
  let latensiAiMs: number | null = null;

  const penilaiSatuKali: PenilaiAI | undefined = ai
    ? async (teksTersamar, signal) => {
        const mulai = ukurWaktu();
        try {
          keluaranTerekam = await ai(teksTersamar, signal);
          return keluaranTerekam;
        } catch (galat) {
          keluaranTerekam = null;
          throw galat;
        } finally {
          latensiAiMs = Math.max(0, ukurWaktu() - mulai);
        }
      }
    : undefined;

  try {
    const hasilAturan = await cek(contoh.teks);
    const hasilGabungan = await cek(contoh.teks, { ai: penilaiSatuKali });

    const hasilAISaja = await cekAISaja(contoh.teks, {
      ai: penilaiSatuKali ? penilaiPalsu(() => keluaranTerekam) : undefined,
    });

    const aiBerhasil = Boolean(penilaiSatuKali && hasilGabungan.sumberPenilaian === "aturan+AI");
    const aiGagal = Boolean(penilaiSatuKali && hasilGabungan.catatanAI === "ai_tidak_tersedia");

    return {
      aturan: hasilAturan.label,
      aiSaja: hasilAISaja.label,
      gabungan: hasilGabungan.label,
      latensiAiMs: aiBerhasil ? latensiAiMs : null,
      aiGagal,
    };
  } catch (galat) {
    if (galat instanceof TeksTidakValid) {
      throw new Error(`Contoh "${contoh.id}" tidak valid (${galat.kode}).`);
    }
    throw galat;
  }
}

/**
 * Mengevaluasi seluruh contoh dataset pada tiga mode: "aturan", "AI saja", dan "gabungan".
 * Setiap contoh hanya memanggil AI satu kali; jawabannya direkam lalu dipakai ulang.
 */
export async function evaluasiDataset(
  daftar: readonly ContohDataset[],
  opsi: OpsiEvaluasi = {},
): Promise<HasilEval> {
  const ukurWaktu = opsi.ukurWaktu ?? (() => performance.now());
  const tabelAturan = buatTabelKosong();
  const tabelAiSaja = buatTabelKosong();
  const tabelGabungan = buatTabelKosong();
  const latensiAi: number[] = [];

  let jumlahPalsu = 0;
  let jumlahAsli = 0;
  let jumlahSintetis = 0;
  let jumlahAiGagal = 0;

  for (const contoh of daftar) {
    if (contoh.kebenaran === "palsu") jumlahPalsu++;
    else jumlahAsli++;
    if (contoh.sintetis) jumlahSintetis++;

    const hasil = await nilaiContoh(contoh, opsi.ai, ukurWaktu);
    tabelAturan[contoh.kebenaran][hasil.aturan]++;
    tabelAiSaja[contoh.kebenaran][hasil.aiSaja]++;
    tabelGabungan[contoh.kebenaran][hasil.gabungan]++;

    if (hasil.latensiAiMs !== null) latensiAi.push(hasil.latensiAiMs);
    if (hasil.aiGagal) jumlahAiGagal++;
  }

  return {
    jumlahContoh: daftar.length,
    jumlahPalsu,
    jumlahAsli,
    jumlahSintetis,
    jumlahAiGagal,
    p95LatensiAiMs: hitungP95(latensiAi),
    mode: {
      aturan: ringkasMode(tabelAturan),
      aiSaja: ringkasMode(tabelAiSaja),
      gabungan: ringkasMode(tabelGabungan),
    },
  };
}
