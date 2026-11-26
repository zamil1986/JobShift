// Normalisasi Teks untuk pencocokan saja (spec, "Mesin Aturan"): huruf kecil
// dan spasi berlebih dipadatkan, dengan peta offset kembali ke Teks asli.
// Kutipan pemicu selalu diambil dari Teks asli lewat peta ini.

export type TeksNormal = {
  /** Teks huruf kecil dengan setiap deret whitespace dipadatkan jadi satu spasi. */
  teks: string;
  /** Untuk setiap code unit di `teks`: offset awal karakter asalnya di Teks asli. */
  awal: number[];
  /** Untuk setiap code unit di `teks`: offset akhir (eksklusif) karakter asalnya. */
  akhir: number[];
};

const WHITESPACE = /\s/u;

/** Teks normal beserta peta offset-nya ke Teks asli. */
export function normalisasi(asli: string): TeksNormal {
  let teks = "";
  const awal: number[] = [];
  const akhir: number[] = [];

  let i = 0;
  // Iterasi per code point, supaya pasangan surrogate tidak terbelah.
  for (const karakter of asli) {
    const ujung = i + karakter.length;
    if (WHITESPACE.test(karakter)) {
      if (!teks.endsWith(" ")) {
        teks += " ";
        awal.push(i);
        akhir.push(ujung);
      }
    } else {
      // Huruf kecil per karakter, karena toLowerCase() bisa mengubah panjang.
      const kecil = karakter.toLowerCase();
      teks += kecil;
      for (let k = 0; k < kecil.length; k++) {
        awal.push(i);
        akhir.push(ujung);
      }
    }
    i = ujung;
  }

  return { teks, awal, akhir };
}

/** Rentang [awal, akhir) di Teks asli untuk rentang [dari, sampai) di Teks normal. */
export function rentangAsli(normal: TeksNormal, dari: number, sampai: number): [number, number] {
  return [normal.awal[dari], normal.akhir[sampai - 1]];
}
