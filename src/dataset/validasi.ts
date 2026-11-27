// Validator dataset Set dev dan Set test (tiket 02, spec "Dataset dan eval").
// Memeriksa format JSONL per baris, Penyamaran, dan target komposisi set.
// Pesan tidak pernah menyalin Teks, supaya hasil Set test aman dibagikan.

import { PANJANG_MAKS, PANJANG_MIN, panjangTeks } from "@/cek/panjang";
import { POLA_DATA_PRIBADI } from "@/cek/penyamaran";
import type { Modus } from "@/cek/tipe";

export type NamaSet = "dev" | "test";

export type ContohDataset = {
  id: string;
  teks: string;
  kebenaran: "palsu" | "asli";
  modus?: Modus;
  sumber: string;
  sintetis: boolean;
};

export type Temuan = { baris: number; id?: string; pesan: string };
export type Target = { nama: string; terpenuhi: boolean; detail: string };

export type LaporanDataset = {
  contoh: ContohDataset[];
  galat: Temuan[];
  peringatan: Temuan[];
  target: Target[];
  ringkasan: {
    total: number;
    palsu: number;
    asli: number;
    sintetis: number;
    modusPalsu: Record<Modus, number>;
    palsuTanpaModus: number;
  };
};

export const JUMLAH_TARGET: Record<NamaSet, number> = { dev: 60, test: 40 };
/** Minimal contoh Palsu per Modus di Set dev. */
export const MIN_PALSU_PER_MODUS = 5;
/** Porsi Palsu yang masih dianggap "kira-kira seimbang". */
const PORSI_PALSU = { min: 0.4, maks: 0.6 };

const SEMUA_MODUS: readonly Modus[] = ["tugas", "lokal", "luar_negeri"];
const NAMA_MODUS: Record<Modus, string> = { tugas: "Tugas", lokal: "Lokal", luar_negeri: "Luar negeri" };
const FIELD = new Set(["id", "teks", "kebenaran", "modus", "sumber", "sintetis"]);
/** Angka samaran wajib memuat "0000", supaya bisa dibedakan dari angka asli. */
const TANDA_SAMARAN = "0000";

/** Kunci pembanding Teks: abaikan huruf besar dan jumlah spasi. */
const kunciTeks = (teks: string) => teks.trim().toLowerCase().replace(/\s+/g, " ");

/** Galat format satu objek, atau contoh yang sudah dipastikan sah. */
function periksaObjek(o: Record<string, unknown>): { galat: string[]; contoh?: ContohDataset } {
  const galat: string[] = [];
  const stringIsi = (field: string) => typeof o[field] === "string" && (o[field] as string).trim() !== "";

  for (const field of Object.keys(o)) {
    if (!FIELD.has(field)) galat.push(`field "${field}" tidak dikenal (yang boleh: ${[...FIELD].join(", ")})`);
  }
  if (!stringIsi("id")) galat.push(`"id" wajib berupa teks yang tidak kosong`);
  if (typeof o.teks !== "string") {
    galat.push(`"teks" wajib berupa teks`);
  } else {
    const panjang = panjangTeks(o.teks);
    if (panjang < PANJANG_MIN) galat.push(`"teks" terlalu pendek (${panjang} karakter, minimal ${PANJANG_MIN})`);
    if (panjang > PANJANG_MAKS) galat.push(`"teks" terlalu panjang (${panjang} karakter, maksimal ${PANJANG_MAKS})`);
  }
  if (o.kebenaran !== "palsu" && o.kebenaran !== "asli") galat.push(`"kebenaran" wajib "palsu" atau "asli"`);
  if (o.modus !== undefined) {
    if (!SEMUA_MODUS.includes(o.modus as Modus)) {
      galat.push(`"modus" wajib salah satu dari ${SEMUA_MODUS.join(", ")}`);
    } else if (o.kebenaran === "asli") {
      galat.push(`"modus" hanya untuk contoh palsu; hapus dari contoh asli`);
    }
  }
  if (!stringIsi("sumber")) galat.push(`"sumber" wajib diisi (URL atau keterangan asal teks)`);
  if (typeof o.sintetis !== "boolean") galat.push(`"sintetis" wajib true atau false`);

  return galat.length > 0 ? { galat } : { galat, contoh: o as ContohDataset };
}

/** Peringatan Penyamaran: penanda yang menghapus sinyal, atau angka yang belum disamarkan. */
function periksaPenyamaran(teks: string): string[] {
  const peringatan: string[] = [];
  let sisa = teks;
  for (const { jenis, pola, penanda } of POLA_DATA_PRIBADI) {
    if (teks.includes(penanda)) {
      peringatan.push(
        `penanda ${penanda} menghapus sinyal yang dibaca Aturan (misalnya R11); ganti dengan ${jenis} palsu yang bentuknya sama`,
      );
    }
    if (jenis !== "email") {
      // Angkanya sendiri tidak disalin ke pesan: bisa jadi data pribadi asli.
      [...sisa.matchAll(pola)].forEach(([cocok], i) => {
        if (!cocok.replace(/\D/g, "").includes(TANDA_SAMARAN)) {
          peringatan.push(
            `${jenis} ke-${i + 1} di teks ini belum terlihat disamarkan; angka samaran harus memuat ${TANDA_SAMARAN} (misalnya 0812-0000-1111)`,
          );
        }
      });
    }
    // Sama seperti samarkan(): pola berikutnya tidak menilai ulang yang sudah cocok.
    sisa = sisa.replace(pola, penanda);
  }
  return peringatan;
}

type BarisSah = { baris: number; contoh: ContohDataset };

/** Mengurai JSONL menjadi baris sah dan galat format. Baris kosong dilewati. */
function urai(isi: string): { sah: BarisSah[]; galat: Temuan[] } {
  const sah: BarisSah[] = [];
  const galat: Temuan[] = [];
  isi.split(/\r?\n/).forEach((teksBaris, i) => {
    const baris = i + 1;
    if (teksBaris.trim() === "") return;
    let nilai: unknown;
    try {
      nilai = JSON.parse(teksBaris);
    } catch {
      galat.push({ baris, pesan: "bukan JSON yang valid" });
      return;
    }
    if (typeof nilai !== "object" || nilai === null || Array.isArray(nilai)) {
      galat.push({ baris, pesan: "setiap baris wajib berupa satu objek JSON" });
      return;
    }
    const objek = nilai as Record<string, unknown>;
    const hasil = periksaObjek(objek);
    const id = typeof objek.id === "string" ? objek.id : undefined;
    for (const pesan of hasil.galat) galat.push({ baris, id, pesan });
    if (hasil.contoh) sah.push({ baris, contoh: hasil.contoh });
  });
  return { sah, galat };
}

/**
 * Memeriksa isi file JSONL satu set. `pembanding` adalah isi set lain; Teks
 * yang juga muncul di sana dianggap bocor antarset.
 */
export function validasiDataset(
  isi: string,
  set: NamaSet,
  opsi: { pembanding?: string } = {},
): LaporanDataset {
  const { sah, galat } = urai(isi);
  const peringatan: Temuan[] = [];
  const contoh: ContohDataset[] = [];
  const barisId = new Map<string, number>();
  const barisTeks = new Map<string, number>();
  const idPembanding = new Map<string, string>();
  for (const { contoh: c } of urai(opsi.pembanding ?? "").sah) idPembanding.set(kunciTeks(c.teks), c.id);

  for (const { baris, contoh: c } of sah) {
    const temuan = (pesan: string): Temuan => ({ baris, id: c.id, pesan });
    const kunci = kunciTeks(c.teks);
    const idSama = barisId.get(c.id);
    const teksSama = barisTeks.get(kunci);
    const bocor = idPembanding.get(kunci);

    if (idSama !== undefined) galat.push(temuan(`id "${c.id}" sudah dipakai di baris ${idSama}`));
    if (teksSama !== undefined) galat.push(temuan(`teks sama dengan baris ${teksSama}`));
    if (bocor !== undefined) galat.push(temuan(`teks juga ada di set pembanding (id ${bocor}); satu contoh hanya boleh di satu set`));
    for (const pesan of periksaPenyamaran(c.teks)) peringatan.push(temuan(pesan));

    if (idSama !== undefined || teksSama !== undefined || bocor !== undefined) continue;
    barisId.set(c.id, baris);
    barisTeks.set(kunci, baris);
    contoh.push(c);
  }

  galat.sort((a, b) => a.baris - b.baris);
  const ringkasan = meringkas(contoh);
  return { contoh, galat, peringatan, target: hitungTarget(set, ringkasan), ringkasan };
}

function meringkas(contoh: ContohDataset[]): LaporanDataset["ringkasan"] {
  const modusPalsu: Record<Modus, number> = { tugas: 0, lokal: 0, luar_negeri: 0 };
  let palsu = 0;
  let palsuTanpaModus = 0;
  for (const c of contoh) {
    if (c.kebenaran !== "palsu") continue;
    palsu += 1;
    if (c.modus) modusPalsu[c.modus] += 1;
    else palsuTanpaModus += 1;
  }
  return {
    total: contoh.length,
    palsu,
    asli: contoh.length - palsu,
    sintetis: contoh.filter((c) => c.sintetis).length,
    modusPalsu,
    palsuTanpaModus,
  };
}

function hitungTarget(set: NamaSet, r: LaporanDataset["ringkasan"]): Target[] {
  const porsi = r.total === 0 ? 0 : r.palsu / r.total;
  const target: Target[] = [
    {
      nama: `Jumlah contoh Set ${set}`,
      terpenuhi: r.total === JUMLAH_TARGET[set],
      detail: `${r.total}/${JUMLAH_TARGET[set]}`,
    },
    {
      nama: "Palsu dan Asli seimbang (porsi Palsu 40–60%)",
      terpenuhi: porsi >= PORSI_PALSU.min && porsi <= PORSI_PALSU.maks,
      detail: `palsu ${r.palsu}, asli ${r.asli}`,
    },
  ];
  if (set === "dev") {
    for (const modus of SEMUA_MODUS) {
      target.push({
        nama: `Modus ${NAMA_MODUS[modus]} minimal ${MIN_PALSU_PER_MODUS} contoh Palsu`,
        terpenuhi: r.modusPalsu[modus] >= MIN_PALSU_PER_MODUS,
        detail: `${r.modusPalsu[modus]}/${MIN_PALSU_PER_MODUS}`,
      });
    }
  }
  return target;
}

/** Set siap di-commit: tanpa galat dan semua target terpenuhi. Peringatan tidak menggagalkan. */
export function lolos(laporan: LaporanDataset): boolean {
  return laporan.galat.length === 0 && laporan.target.every((t) => t.terpenuhi);
}
