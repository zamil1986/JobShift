// Penyaringan Tanda bahaya AI (spec, "Penyamaran dan lapisan AI"; ADR-0001).
// AI hanya boleh menambah Tanda bahaya yang punya Kutipan pemicu sah: ada di
// Teks tersamar, tidak memuat penanda Penyamaran, dan tidak beririsan dengan
// Tanda bahaya Aturan maupun butir AI yang sudah diterima.

import { normalisasi, rentangAsli } from "./aturan/normalisasi";
import { memuatKataTerlarang } from "./kata-terlarang";
import { PENANDA } from "./penyamaran";
import type { KeluaranAI } from "./skema-ai";
import type { TandaBahaya } from "./tipe";

/** Bobot tetap setiap Tanda bahaya AI. Total sumbangan AI dibatasi di `skor.ts`. */
export const BOBOT_TANDA_AI = 10;
/** Jumlah butir `tanda_bahaya` yang dibaca; sisanya diabaikan. */
const BUTIR_DIBACA = 5;

type Rentang = [number, number];

const beririsan = (a: Rentang, b: Rentang) => a[0] < b[1] && b[0] < a[1];

/** Kutipan dalam bentuk normal: huruf kecil, spasi tunggal, tanpa spasi di ujung. */
const kutipanNormal = (kutipan: string) => normalisasi(kutipan).teks.trim();

/** Semua posisi awal `cari` di `teks`, berurutan. */
function* posisi(teks: string, cari: string): Generator<number> {
  for (let i = teks.indexOf(cari); i !== -1; i = teks.indexOf(cari, i + 1)) yield i;
}

/**
 * Tanda bahaya AI yang sah, dengan `kutipan` dan `rentang` dari Teks asli.
 *
 * Kutipan dicocokkan ternormalisasi ke Teks tersamar. Karena kutipan yang sah
 * tidak memuat penanda, kutipan itu juga ada di Teks asli, jadi `rentang`
 * dicari langsung di Teks asli: kemunculan pertama yang tidak beririsan dengan
 * rentang yang sudah terpakai.
 */
export function tandaBahayaAI(
  teks: string,
  teksTersamar: string,
  keluaran: KeluaranAI,
  tandaBahayaAturan: readonly TandaBahaya[],
): TandaBahaya[] {
  const asli = normalisasi(teks);
  const tersamar = normalisasi(teksTersamar).teks;
  const terpakai: Rentang[] = tandaBahayaAturan.map((t) => t.rentang);
  const hasil: TandaBahaya[] = [];

  for (const { kutipan, alasan } of keluaran.tanda_bahaya.slice(0, BUTIR_DIBACA)) {
    const alasanBersih = alasan.trim();
    if (!alasanBersih || memuatKataTerlarang(alasanBersih)) continue;

    const cari = kutipanNormal(kutipan);
    if (!cari || PENANDA.test(cari.toUpperCase()) || !tersamar.includes(cari)) continue;

    for (const dari of posisi(asli.teks, cari)) {
      const rentang = rentangAsli(asli, dari, dari + cari.length);
      if (terpakai.some((r) => beririsan(r, rentang))) continue;

      terpakai.push(rentang);
      hasil.push({
        sumber: "ai",
        alasan: alasanBersih,
        kutipan: teks.slice(rentang[0], rentang[1]),
        rentang,
        bobot: BOBOT_TANDA_AI,
      });
      break;
    }
  }

  return hasil;
}
