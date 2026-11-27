// Mesin Aturan (spec, "Mesin Aturan"). Sinkron dan deterministik: tidak ada
// waktu, acak, atau jaringan. Menilai Teks asli, bukan Teks tersamar.

import type { Modus, TandaBahaya, TandaBahayaTersirat } from "../tipe";
import { normalisasi, rentangAsli, type TeksNormal } from "./normalisasi";

export type Bahasa = "id" | "en";

export type Pola = {
  /**
   * Sumber regex yang dicocokkan ke Teks normal (huruf kecil, spasi tunggal).
   * Otomatis dibatasi sebagai kata utuh dan dikompilasi dengan flag `u`.
   */
  cari: string;
  /** Menentukan daftar Penyangkal yang berlaku: "no"/"free" hanya untuk pola Inggris. */
  bahasa: Bahasa;
};

export type Aturan = {
  id: string;
  /** Alasan dalam bahasa awam; tampil di UI sebagai alasan Tanda bahaya. */
  alasan: string;
  bobot: number;
  /** Aturan kritis (spec: selalu berbobot 60); satu saja sudah cukup untuk Label Bahaya. */
  kritis: boolean;
  modus?: Modus;
  /** Penyangkal ≤ 3 kata sebelum pemicu membatalkan kecocokan (ADR-0002: hanya R01/R02). */
  pakaiPenyangkal: boolean;
  /**
   * Kalau true, aturan cocok saat TIDAK ada pola yang cocok di Teks, dan
   * menghasilkan satu TandaBahayaTersirat tanpa kutipan (spec: R13).
   */
  ketiadaan?: boolean;
  pola: Pola[];
};

/** ADR-0002. Daftar dan jaraknya dibekukan; mengubahnya berarti menyetel ulang bobot. */
const PENYANGKAL_ID = ["tidak", "tanpa", "bebas", "jangan", "gratis"];
const PENYANGKAL: Record<Bahasa, ReadonlySet<string>> = {
  id: new Set(PENYANGKAL_ID),
  // Spec: "no"/"free" hanya untuk pola Inggris.
  en: new Set([...PENYANGKAL_ID, "no", "free"]),
};
const JARAK_PENYANGKAL = 3;

const KATA = /[\p{L}\p{N}]+/gu;

/** Pola dibatasi kata utuh: "pin" tidak cocok di "pinjaman". */
const kompilasi = (pola: Pola) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(?:${pola.cari})(?![\\p{L}\\p{N}])`, "gu");

const cacheRegex = new WeakMap<Pola, RegExp>();
function regexDari(pola: Pola): RegExp {
  let regex = cacheRegex.get(pola);
  if (!regex) {
    regex = kompilasi(pola);
    cacheRegex.set(pola, regex);
  }
  return regex;
}

function didahuluiPenyangkal(teksNormal: string, posisi: number, bahasa: Bahasa): boolean {
  const kataSebelum = teksNormal.slice(0, posisi).match(KATA) ?? [];
  return kataSebelum.slice(-JARAK_PENYANGKAL).some((kata) => PENYANGKAL[bahasa].has(kata));
}

/**
 * Kecocokan pertama yang sah: yang paling awal di Teks di antara semua pola,
 * tidak didahului Penyangkal (kalau Aturan memakainya). Kalau posisinya sama,
 * yang terpanjang dipakai.
 */
function kecocokanPertama(aturan: Aturan, normal: TeksNormal): [number, number] | null {
  let terbaik: [number, number] | null = null;
  for (const pola of aturan.pola) {
    // matchAll menyalin regex, jadi lastIndex regex di cache tidak berubah.
    for (const m of normal.teks.matchAll(regexDari(pola))) {
      const dari = m.index;
      const sampai = dari + m[0].length;
      if (sampai === dari) continue;
      if (aturan.pakaiPenyangkal && didahuluiPenyangkal(normal.teks, dari, pola.bahasa)) continue;
      if (!terbaik || dari < terbaik[0] || (dari === terbaik[0] && sampai > terbaik[1])) {
        terbaik = [dari, sampai];
      }
      break;
    }
  }
  return terbaik;
}

export type HasilAturan = {
  tandaBahaya: TandaBahaya[];
  tandaBahayaTersirat: TandaBahayaTersirat[];
};

/**
 * Menjalankan katalog atas Teks persis seperti diterima. Satu Aturan
 * menghasilkan paling banyak satu Tanda bahaya (dengan `kutipan` dari Teks asli
 * lewat `rentang`) atau satu Tanda bahaya tersirat (untuk aturan `ketiadaan`).
 */
export function jalankanAturan(teks: string, katalog: readonly Aturan[]): HasilAturan {
  const normal = normalisasi(teks);
  const tandaBahaya: TandaBahaya[] = [];
  const tandaBahayaTersirat: TandaBahayaTersirat[] = [];

  for (const aturan of katalog) {
    const cocok = kecocokanPertama(aturan, normal);
    if (aturan.ketiadaan) {
      if (!cocok) {
        tandaBahayaTersirat.push({ alasan: aturan.alasan, bobot: aturan.bobot });
      }
      continue;
    }
    if (!cocok) continue;

    const rentang = rentangAsli(normal, cocok[0], cocok[1]);
    tandaBahaya.push({
      sumber: "aturan",
      aturanId: aturan.id,
      alasan: aturan.alasan,
      kutipan: teks.slice(rentang[0], rentang[1]),
      rentang,
      bobot: aturan.bobot,
      ...(aturan.modus ? { modus: aturan.modus } : {}),
    });
  }

  return { tandaBahaya, tandaBahayaTersirat };
}
