// Adapter AI yang tidak memanggil jaringan: Palsu dan perekam, untuk tes dan
// skrip eval. Adapter Groq ada di `./groq` (khusus server). Inti tidak
// memercayai keluaran adapter mana pun dan selalu memvalidasinya sendiri.

import type { PenilaiAI } from "./tipe";

/**
 * Adapter Palsu: mengembalikan keluaran tetap, atau hasil fungsi atas Teks
 * tersamar. Keluarannya sengaja `unknown`, supaya tes bisa mengirim keluaran
 * yang rusak.
 */
export function penilaiPalsu(keluaran: unknown | ((teksTersamar: string) => unknown)): PenilaiAI {
  return async (teksTersamar) =>
    typeof keluaran === "function" ? keluaran(teksTersamar) : keluaran;
}

/**
 * Membungkus adapter dan merekam setiap Teks tersamar yang dikirim ke AI.
 * Tanpa adapter, keluarannya null (AI dianggap gagal).
 */
export function penilaiPerekam(dalam: PenilaiAI = async () => null): {
  penilai: PenilaiAI;
  rekaman: string[];
} {
  const rekaman: string[] = [];
  return {
    rekaman,
    penilai: (teksTersamar, signal) => {
      rekaman.push(teksTersamar);
      return dalam(teksTersamar, signal);
    },
  };
}
