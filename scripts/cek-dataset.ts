// Memeriksa file dataset sebelum di-commit (tiket 02).
//
//   npm run cek-dataset                          # Set dev di data/dev.jsonl
//   npm run cek-dataset -- --set test ~/jobshift-set-test/test.jsonl
//
// Untuk Set test, data/dev.jsonl (kalau ada) dibaca sebagai pembanding supaya
// contoh yang sama tidak masuk ke dua set. Set dev tidak pernah membaca Set
// test: Zamil dan Daniel tidak boleh melihat Set test sebelum bobot dibekukan.
// Keluar dengan kode 1 kalau ada galat atau target belum terpenuhi.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { lolos, validasiDataset, type NamaSet, type Temuan } from "@/dataset/validasi";

const PEMAKAIAN = "Pemakaian: npm run cek-dataset -- [--set dev|test] [--banding file-set-lain.jsonl] [file.jsonl]";

const argumen = (() => {
  try {
    return parseArgs({
      options: { set: { type: "string", default: "dev" }, banding: { type: "string" } },
      allowPositionals: true,
    });
  } catch (e) {
    console.error(`${(e as Error).message}\n${PEMAKAIAN}`);
    process.exit(2);
  }
})();
const { values, positionals } = argumen;

if (values.set !== "dev" && values.set !== "test") {
  console.error(`--set harus "dev" atau "test", bukan "${values.set}".`);
  process.exit(2);
}
const set: NamaSet = values.set;
const lokasi = (p: string) => resolve(p.replace(/^~(?=$|\/)/, homedir()));
const file = lokasi(positionals[0] ?? `data/${set}.jsonl`);
const fileBanding = values.banding ? lokasi(values.banding) : set === "test" ? resolve("data/dev.jsonl") : undefined;

if (!existsSync(file)) {
  console.error(`File tidak ditemukan: ${file}`);
  process.exit(2);
}
const pembanding = fileBanding && existsSync(fileBanding) ? readFileSync(fileBanding, "utf8") : undefined;
const laporan = validasiDataset(readFileSync(file, "utf8"), set, { pembanding });
const r = laporan.ringkasan;

const cetakTemuan = (judul: string, daftar: Temuan[]) => {
  if (daftar.length === 0) return;
  console.log(`\n${judul} (${daftar.length}):`);
  for (const t of daftar) console.log(`  baris ${t.baris}${t.id ? ` [${t.id}]` : ""}: ${t.pesan}`);
};

console.log(`Set ${set}: ${file}`);
if (fileBanding) console.log(`Pembanding: ${pembanding === undefined ? "(tidak ada) " : ""}${fileBanding}`);
console.log(`\n${r.total} contoh sah: palsu ${r.palsu}, asli ${r.asli}, sintetis ${r.sintetis}`);
console.log(
  `Modus Palsu: tugas ${r.modusPalsu.tugas}, lokal ${r.modusPalsu.lokal}, luar_negeri ${r.modusPalsu.luar_negeri}, tanpa modus ${r.palsuTanpaModus}`,
);
console.log("\nTarget:");
for (const t of laporan.target) console.log(`  ${t.terpenuhi ? "✓" : "✗"} ${t.nama}: ${t.detail}`);
cetakTemuan("Galat", laporan.galat);
cetakTemuan("Peringatan (periksa manual, tidak menggagalkan)", laporan.peringatan);

const hasil = lolos(laporan);
console.log(`\nHasil: ${hasil ? "LOLOS, siap di-commit" : "BELUM LOLOS"}`);
process.exit(hasil ? 0 : 1);
