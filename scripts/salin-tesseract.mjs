// Menyalin aset Tesseract.js dari node_modules ke public/tesseract supaya OCR
// tidak bergantung pada CDN pihak ketiga (spec, "Stack"). Dijalankan otomatis
// sebelum `dev` dan `build`. Folder tujuannya di-gitignore: versinya selalu
// mengikuti package-lock, bukan file biner yang di-commit.
//
// Hanya varian LSTM yang disalin karena src/ui/ocr.ts memakai OEM.LSTM_ONLY.

import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const akar = join(dirname(fileURLToPath(import.meta.url)), "..");
const tujuan = join(akar, "public", "tesseract");
const require = createRequire(join(akar, "package.json"));

const folderPaket = (nama, dari = require) => dirname(dari.resolve(`${nama}/package.json`));

const tesseract = folderPaket("tesseract.js");
const core = folderPaket("tesseract.js-core", createRequire(join(tesseract, "package.json")));

/** Versi data bahasa yang sama dengan bawaan Tesseract.js untuk LSTM. */
const VERSI_DATA = "4.0.0_best_int";

const salinan = [
  [join(tesseract, "dist", "worker.min.js"), "worker.min.js"],
  ...["", "simd-", "relaxedsimd-"].map((varian) => [
    join(core, `tesseract-core-${varian}lstm.wasm.js`),
    join("core", `tesseract-core-${varian}lstm.wasm.js`),
  ]),
  ...["ind", "eng"].map((bahasa) => [
    join(folderPaket(`@tesseract.js-data/${bahasa}`), VERSI_DATA, `${bahasa}.traineddata.gz`),
    join("lang", `${bahasa}.traineddata.gz`),
  ]),
];

rmSync(tujuan, { recursive: true, force: true });
for (const [dari, ke] of salinan) {
  const lengkap = join(tujuan, ke);
  mkdirSync(dirname(lengkap), { recursive: true });
  copyFileSync(dari, lengkap);
}
console.log(`Aset OCR disalin ke public/tesseract (${salinan.length} file).`);
