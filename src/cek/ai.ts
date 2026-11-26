import type { PenilaiAI } from "./tipe";

/**
 * Adapter AI bawaan selama lapisan AI belum ada: tidak pernah menilai dan
 * selalu mengembalikan null. Adapter Groq, Statis, dan Palsu menyusul di
 * tiket 10.
 */
export const aiNonaktif: PenilaiAI = async () => null;
