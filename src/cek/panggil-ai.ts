// Memanggil adapter AI dengan batas waktu yang dikendalikan inti (spec,
// "Penyamaran dan lapisan AI"). Adapter tidak dipercaya: bisa lambat,
// mengabaikan signal, melempar error, atau mengembalikan apa saja.

import { KeluaranAI } from "./skema-ai";
import type { PenilaiAI } from "./tipe";

/** Batas waktu AI. Menggantikan 6 detik di PRD, supaya p95 total < 5 detik. */
export const BATAS_WAKTU_AI_MS = 3500;

/**
 * Keluaran AI yang valid secara skema, atau null kalau AI timeout, gagal,
 * atau keluarannya tidak cocok dengan skema. Tidak pernah melempar dan tidak
 * menulis apa pun ke log (error adapter bisa memuat isi Teks).
 */
export async function panggilAI(ai: PenilaiAI, teksTersamar: string): Promise<KeluaranAI | null> {
  const pengendali = new AbortController();
  let pewaktu: ReturnType<typeof setTimeout> | undefined;
  const habisWaktu = new Promise<null>((selesai) => {
    pewaktu = setTimeout(() => {
      pengendali.abort();
      selesai(null);
    }, BATAS_WAKTU_AI_MS);
  });

  try {
    const jawaban = Promise.resolve()
      .then(() => ai(teksTersamar, pengendali.signal))
      // Penolakan yang datang setelah batas waktu tetap ditangkap di sini.
      .catch(() => null);
    const keluaran = await Promise.race([jawaban, habisWaktu]);
    const hasil = KeluaranAI.safeParse(keluaran);
    return hasil.success ? hasil.data : null;
  } finally {
    clearTimeout(pewaktu);
  }
}
