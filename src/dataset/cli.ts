// CLI `npm run cek-dataset` (tiket 02). Dijalankan oleh scripts/cek-dataset.mjs.
//
//   npm run cek-dataset                          # Set dev di data/dev.jsonl
//   npm run cek-dataset -- --set test ~/jobshift-set-test/test.jsonl
//
// Untuk Set test, data/dev.jsonl (kalau ada) dibaca sebagai pembanding supaya
// contoh yang sama tidak masuk ke dua set. Set dev tidak pernah membaca Set
// test: Zamil dan Daniel tidak boleh melihat Set test sebelum bobot dibekukan.

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { lolos, validasiDataset, type NamaSet, type Temuan } from "./validasi";

export type DependensiCli = {
  /** Direktori acuan path relatif. Default: direktori kerja. */
  akar?: string;
  /** Pengganti `~`. Default: direktori rumah pengguna. */
  rumah?: string;
  adaFile?: (pathFile: string) => boolean;
  bacaFile?: (pathFile: string) => Promise<string>;
  cetak?: (teks: string) => void;
};

const PEMAKAIAN = "Pemakaian: npm run cek-dataset -- [--set dev|test] [--banding file-set-lain.jsonl] [file.jsonl]";

/**
 * Memeriksa satu file dataset dan mencetak laporannya.
 * Kode keluar: 0 lolos, 1 ada galat atau target belum terpenuhi, 2 argumen atau file salah.
 */
export async function jalankanCekDataset(argv: readonly string[], dep: DependensiCli = {}): Promise<number> {
  const akar = dep.akar ?? process.cwd();
  const rumah = dep.rumah ?? homedir();
  const adaFile = dep.adaFile ?? existsSync;
  const bacaFile = dep.bacaFile ?? ((p: string) => readFile(p, "utf8"));
  const cetak = dep.cetak ?? console.log;
  const lokasi = (p: string) => path.resolve(akar, p.replace(/^~(?=$|\/)/, rumah));

  let argumen: ReturnType<typeof bacaArgumen>;
  try {
    argumen = bacaArgumen(argv);
  } catch (galat) {
    cetak(`${(galat as Error).message}\n${PEMAKAIAN}`);
    return 2;
  }
  const { set, file: fileMentah, banding } = argumen;

  const file = lokasi(fileMentah ?? `data/${set}.jsonl`);
  const fileBanding = banding ? lokasi(banding) : set === "test" ? lokasi("data/dev.jsonl") : undefined;
  if (!adaFile(file)) {
    cetak(`File tidak ditemukan: ${file}`);
    return 2;
  }

  const isi = await bacaFile(file);
  const pembanding = fileBanding && adaFile(fileBanding) ? await bacaFile(fileBanding) : undefined;
  const laporan = validasiDataset(isi, set, { pembanding });
  const r = laporan.ringkasan;

  const cetakTemuan = (judul: string, daftar: Temuan[]) => {
    if (daftar.length === 0) return;
    cetak(`\n${judul} (${daftar.length}):`);
    for (const t of daftar) cetak(`  baris ${t.baris}${t.id ? ` [${t.id}]` : ""}: ${t.pesan}`);
  };

  cetak(`Set ${set}: ${file}`);
  if (fileBanding) cetak(`Pembanding: ${pembanding === undefined ? "(tidak ada) " : ""}${fileBanding}`);
  cetak(`\n${r.total} contoh sah: palsu ${r.palsu}, asli ${r.asli}, sintetis ${r.sintetis}`);
  cetak(
    `Modus Palsu: tugas ${r.modusPalsu.tugas}, lokal ${r.modusPalsu.lokal}, luar_negeri ${r.modusPalsu.luar_negeri}, tanpa modus ${r.palsuTanpaModus}`,
  );
  cetak("\nTarget:");
  for (const t of laporan.target) cetak(`  ${t.terpenuhi ? "✓" : "✗"} ${t.nama}: ${t.detail}`);
  cetakTemuan("Galat", laporan.galat);
  cetakTemuan("Peringatan (periksa manual, tidak menggagalkan)", laporan.peringatan);

  const hasil = lolos(laporan);
  cetak(`\nHasil: ${hasil ? "LOLOS, siap di-commit" : "BELUM LOLOS"}`);
  return hasil ? 0 : 1;
}

function bacaArgumen(argv: readonly string[]): { set: NamaSet; file?: string; banding?: string } {
  const { values, positionals } = parseArgs({
    args: [...argv],
    options: { set: { type: "string", default: "dev" }, banding: { type: "string" } },
    allowPositionals: true,
  });
  if (values.set !== "dev" && values.set !== "test") {
    throw new Error(`--set harus "dev" atau "test", bukan "${values.set}".`);
  }
  return { set: values.set, file: positionals[0], banding: values.banding };
}
