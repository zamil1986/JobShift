// Mesin Aturan (spec, "Mesin Aturan"). Sinkron dan deterministik: tidak ada
// waktu, acak, atau jaringan. Menilai Teks asli, bukan Teks tersamar.

import type { Modus, TandaBahaya } from "../tipe";
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
  /** Penyangkal ≤ 3 kata sebelum pemicu, dalam kalimat yang sama, membatalkan kecocokan (ADR-0002: hanya R01, R02, R03, R07). */
  pakaiPenyangkal: boolean;
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

/** Akhir kalimat: ".", "!", atau "?" yang diikuti spasi. "Rp200.000" dan "s.id" tidak memutus. */
const AKHIR_KALIMAT = /[.!?] /gu;

/** Penyangkal hanya dicari di kalimat yang sama, paling jauh JARAK_PENYANGKAL kata sebelum pemicu. */
function didahuluiPenyangkal(teksNormal: string, posisi: number, bahasa: Bahasa): boolean {
  const sebelum = teksNormal.slice(0, posisi);
  const awalKalimat = Math.max(0, ...Array.from(sebelum.matchAll(AKHIR_KALIMAT), (m) => m.index + m[0].length));
  const kataSebelum = sebelum.slice(awalKalimat).match(KATA) ?? [];
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

/**
 * Menjalankan katalog atas Teks persis seperti diterima. Satu Aturan
 * menghasilkan paling banyak satu Tanda bahaya, dengan `kutipan` yang selalu
 * diambil dari Teks asli lewat `rentang`.
 */
export function jalankanAturan(teks: string, katalog: readonly Aturan[]): TandaBahaya[] {
  const normal = normalisasi(teks);
  const hasil: TandaBahaya[] = [];

  for (const aturan of katalog) {
    const cocok = kecocokanPertama(aturan, normal);
    if (!cocok) continue;

    const rentang = rentangAsli(normal, cocok[0], cocok[1]);
    hasil.push({
      sumber: "aturan",
      aturanId: aturan.id,
      alasan: aturan.alasan,
      kutipan: teks.slice(rentang[0], rentang[1]),
      rentang,
      bobot: aturan.bobot,
      ...(aturan.modus ? { modus: aturan.modus } : {}),
    });
  }

  return hasil;
}
