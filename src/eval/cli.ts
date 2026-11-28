import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MODEL_GROQ, penilaiGroqDariEnv, selesaikanModelGroq, type ModelGroq } from "@/cek/groq";
import type { PenilaiAI } from "@/cek/tipe";
import {
  evaluasiDataset,
  hitungRasio,
  parseJsonlDataset,
  type HasilEval,
  type Rasio,
  type RingkasanMode,
} from "./eval";
import { PATH_HASIL_TEST_DEFAULT } from "./hasil-tersimpan";

export type JenisSet = "dev" | "test";

export type ArgumenEval = {
  set: JenisSet;
  pathDataset: string;
  model: ModelGroq;
  pathOutput: string | null;
};

export type HasilEvalTersimpan = HasilEval & {
  dataset: JenisSet;
  model: ModelGroq;
  dibuatPada: string;
};

export type DependensiCli = {
  bacaFile?: (pathFile: string) => Promise<string>;
  tulisFile?: (pathFile: string, isi: string) => Promise<void>;
  cetak?: (teks: string) => void;
  buatPenilai?: (model: ModelGroq) => PenilaiAI;
  sekarang?: () => Date;
  env?: NodeJS.ProcessEnv;
};

const PATH_DATASET: Record<JenisSet, string> = {
  dev: "data/dev.jsonl",
  test: "data/test.jsonl",
};

function pastikanSet(nilai: string): JenisSet {
  if (nilai === "dev" || nilai === "test") return nilai;
  throw new Error(`Nilai --set tidak valid: "${nilai}". Gunakan "dev" atau "test".`);
}

function bacaFlag(
  argv: readonly string[],
  indeks: number,
  nama: string,
): { nilai: string; lompat: number } | null {
  const arg = argv[indeks];
  if (arg === nama) {
    const nilai = argv[indeks + 1];
    if (!nilai || nilai.startsWith("-")) throw new Error(`Opsi ${nama} membutuhkan nilai.`);
    return { nilai, lompat: 1 };
  }
  if (arg.startsWith(`${nama}=`)) {
    const nilai = arg.slice(nama.length + 1);
    if (!nilai) throw new Error(`Opsi ${nama} membutuhkan nilai.`);
    return { nilai, lompat: 0 };
  }
  return null;
}

/**
 * Mem-parse argumen CLI eval (`--set dev|test` dan `--model <nama>`).
 * Mendukung pemanggilan `npm run eval -- --set test` maupun `npm run eval --set test`.
 */
export function parseArgumenEval(
  argv: readonly string[],
  env: Record<string, string | undefined> = {},
): ArgumenEval {
  let set: JenisSet | undefined;
  let modelMentah: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") continue;

    const flagSet = bacaFlag(argv, i, "--set");
    if (flagSet) {
      set = pastikanSet(flagSet.nilai);
      i += flagSet.lompat;
      continue;
    }

    const flagModel = bacaFlag(argv, i, "--model");
    if (flagModel) {
      modelMentah = flagModel.nilai;
      i += flagModel.lompat;
      continue;
    }

    if (!arg.startsWith("-") && env.npm_config_set && (arg === "dev" || arg === "test") && !set) {
      set = arg;
    } else if (!arg.startsWith("-") && env.npm_config_model && !modelMentah) {
      modelMentah = arg;
    } else {
      throw new Error(`Argumen tidak dikenal: "${arg}".`);
    }
  }

  if (!set && env.npm_config_set && env.npm_config_set !== "true") {
    set = pastikanSet(env.npm_config_set);
  }
  if (!modelMentah && env.npm_config_model && env.npm_config_model !== "true") {
    modelMentah = env.npm_config_model;
  }

  const setDipilih = set ?? "dev";

  return {
    set: setDipilih,
    pathDataset: PATH_DATASET[setDipilih],
    model: selesaikanModelGroq(modelMentah ?? MODEL_GROQ),
    pathOutput: setDipilih === "test" ? PATH_HASIL_TEST_DEFAULT : null,
  };
}

function formatRasio(rasio: Rasio): string {
  const persen = rasio.persen === null ? "-" : `${rasio.persen.toFixed(1)}%`;
  return `${rasio.pembilang}/${rasio.penyebut} (${persen})`;
}

function formatMode(
  judul: string,
  ringkasan: RingkasanMode,
  sintetis: Rasio,
  latensiText: string,
): string {
  const { confusion } = ringkasan;
  return [
    `=== Mode: ${judul} ===`,
    `Recall (Palsu → Waspada/Bahaya) : ${formatRasio(ringkasan.recall)}`,
    `Presisi                         : ${formatRasio(ringkasan.presisi)}`,
    `False positive (Asli → Bahaya)  : ${formatRasio(ringkasan.falsePositive)}`,
    `Asli → Waspada                  : ${formatRasio(ringkasan.asliWaspada)}`,
    `Jumlah contoh sintetis          : ${sintetis.pembilang}/${sintetis.penyebut}`,
    `p95 latensi AI                  : ${latensiText}`,
    "Tabel confusion (2×3):",
    "  Kebenaran \\ Prediksi | Risiko rendah | Waspada | Bahaya",
    `  Palsu                | ${String(confusion.palsu.risiko_rendah).padStart(13)} | ${String(confusion.palsu.waspada).padStart(7)} | ${String(confusion.palsu.bahaya).padStart(6)}`,
    `  Asli                 | ${String(confusion.asli.risiko_rendah).padStart(13)} | ${String(confusion.asli.waspada).padStart(7)} | ${String(confusion.asli.bahaya).padStart(6)}`,
  ].join("\n");
}

/** Memformat hasil eval ke laporan teks yang ringkas dan bebas isi Teks. */
export function formatLaporanEval(hasil: HasilEvalTersimpan): string {
  const sintetis = hitungRasio(hasil.jumlahSintetis, hasil.jumlahContoh);
  const latensiText = hasil.p95LatensiAiMs === null ? "-" : `${hasil.p95LatensiAiMs} ms`;

  const header = [
    `Evaluasi JobShift — Set ${hasil.dataset} (${hasil.jumlahContoh} contoh: ${hasil.jumlahPalsu} Palsu, ${hasil.jumlahAsli} Asli)`,
    `Model AI        : ${hasil.model}`,
    `Contoh sintetis : ${formatRasio(sintetis)}`,
    `p95 latensi AI  : ${latensiText}`,
    ...(hasil.jumlahAiGagal > 0
      ? [`AI gagal/timeout: ${hasil.jumlahAiGagal}/${hasil.jumlahContoh}`]
      : []),
  ].join("\n");

  return [
    header,
    "",
    formatMode("aturan", hasil.mode.aturan, sintetis, "- (tidak memakai AI)"),
    "",
    formatMode("AI saja", hasil.mode.aiSaja, sintetis, latensiText),
    "",
    formatMode("gabungan", hasil.mode.gabungan, sintetis, latensiText),
  ].join("\n");
}

async function tulisFileDefault(pathFile: string, isi: string): Promise<void> {
  await mkdir(path.dirname(pathFile), { recursive: true });
  await writeFile(pathFile, isi, "utf8");
}

/** Menjalankan alur evaluasi lengkap: parse argumen → baca JSONL → evaluasi 3 mode → cetak & simpan JSON bila `--set test`. */
export async function jalankanEval(
  argv: readonly string[],
  deps: DependensiCli = {},
): Promise<HasilEvalTersimpan> {
  const argumen = parseArgumenEval(argv, deps.env ?? process.env);
  const bacaFile = deps.bacaFile ?? ((file) => readFile(file, "utf8"));
  const tulisFile = deps.tulisFile ?? tulisFileDefault;
  const cetak = deps.cetak ?? ((teks) => console.log(teks));
  const buatPenilai = deps.buatPenilai ?? ((model) => penilaiGroqDariEnv(model));
  const sekarang = deps.sekarang ?? (() => new Date());

  const isiDataset = await bacaFile(argumen.pathDataset);
  const contoh = parseJsonlDataset(isiDataset);
  const hasil = await evaluasiDataset(contoh, { ai: buatPenilai(argumen.model) });

  const hasilLengkap: HasilEvalTersimpan = {
    dataset: argumen.set,
    model: argumen.model,
    dibuatPada: sekarang().toISOString(),
    ...hasil,
  };

  cetak(formatLaporanEval(hasilLengkap));

  if (argumen.pathOutput) {
    await tulisFile(argumen.pathOutput, `${JSON.stringify(hasilLengkap, null, 2)}\n`);
    cetak(`\nHasil eval disimpan ke ${argumen.pathOutput}`);
  }

  return hasilLengkap;
}
