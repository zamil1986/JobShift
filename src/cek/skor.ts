// Skor, Label, dan Modus (spec, "Skor, Label, Modus").

import type { Label, Modus, TandaBahaya, TandaBahayaTersirat } from "./tipe";

export const SKOR_MAKS = 100;
const AMBANG_WASPADA = 25;
const AMBANG_BAHAYA = 60;

/** Urutan pemecah seri Modus terkuat. */
const URUTAN_SERI_MODUS: readonly Modus[] = ["luar_negeri", "lokal", "tugas"];

export function hitungSkor(tandaBahaya: TandaBahaya[], tersirat: TandaBahayaTersirat[]): number {
  const total = [...tandaBahaya, ...tersirat].reduce((jumlah, t) => jumlah + t.bobot, 0);
  return Math.min(SKOR_MAKS, total);
}

export function labelDariSkor(skor: number): Label {
  if (skor >= AMBANG_BAHAYA) return "bahaya";
  if (skor >= AMBANG_WASPADA) return "waspada";
  return "risiko_rendah";
}

/** Bobot menurun, lalu posisi kutipan. */
export function urutkanTandaBahaya(tandaBahaya: TandaBahaya[]): TandaBahaya[] {
  return [...tandaBahaya].sort((a, b) => b.bobot - a.bobot || a.rentang[0] - b.rentang[0]);
}

/**
 * Semua Modus yang berbobot > 0 dari Tanda bahaya Aturan, urut jumlah bobot
 * menurun; seri diurutkan Luar negeri, Lokal, Tugas. Elemen pertama adalah
 * Modus terkuat.
 */
export function urutkanModus(tandaBahaya: TandaBahaya[]): Modus[] {
  const bobot = new Map<Modus, number>();
  for (const t of tandaBahaya) {
    if (t.sumber !== "aturan" || !t.modus) continue;
    bobot.set(t.modus, (bobot.get(t.modus) ?? 0) + t.bobot);
  }
  return URUTAN_SERI_MODUS.filter((m) => (bobot.get(m) ?? 0) > 0).sort(
    (a, b) => bobot.get(b)! - bobot.get(a)!,
  );
}
