import { KATALOG } from "./aturan/katalog";
import { jalankanAturan, type Aturan } from "./aturan/mesin";
import { tandaBahayaAI } from "./gabung-ai";
import { langkahAman, langkahDarurat } from "./langkah";
import { panggilAI } from "./panggil-ai";
import { periksaPanjang, TeksTidakValid } from "./panjang";
import { penjelasanAI, penjelasanTemplat } from "./penjelasan";
import { samarkan } from "./penyamaran";
import type { KeluaranAI } from "./skema-ai";
import { hitungSkor, labelDariSkor, urutkanModus, urutkanTandaBahaya } from "./skor";
import type { HasilCek, PenilaiAI } from "./tipe";

/**
 * `ai` kosong: Cek dinilai Aturan saja, tanpa `catatanAI` (misalnya mode
 * "aturan" di eval). Route selalu memasang adapter, jadi server tanpa API key
 * tetap memberi `catatanAI`.
 */
export type OpsiCek = { ai?: PenilaiAI };

export type FungsiCek = (teks: string, opsi?: OpsiCek) => Promise<HasilCek>;

/**
 * Membuat fungsi Cek dengan katalog Aturan tertentu. Kode aplikasi memakai
 * `cek` (katalog asli). `buatCek` hanya untuk tes yang butuh bobot di luar
 * katalog, misalnya batas Label 24/25/59 dan seri Modus terkuat (spec,
 * "Testing Decisions"). Tidak diekspor dari `@/cek`.
 */
export function buatCek(katalog: readonly Aturan[]): FungsiCek {
  return async function cekDenganKatalog(teks, opsi = {}) {
    const kode = periksaPanjang(teks);
    if (kode) throw new TeksTidakValid(kode);

    // AI dipanggil lebih dulu supaya berjalan bersamaan dengan Aturan.
    const teksTersamar = samarkan(teks);
    const jawabanAI = opsi.ai ? panggilAI(opsi.ai, teksTersamar) : null;
    // Aturan menilai Teks persis seperti diterima (tanpa trim), supaya
    // `rentang` cocok dengan Teks yang disorot UI.
    const tandaBahayaAturan = jalankanAturan(teks, katalog);

    if (!jawabanAI) return nilai(tandaBahayaAturan, null);
    const keluaranAI = await jawabanAI;
    if (!keluaranAI) return { ...nilai(tandaBahayaAturan, null), catatanAI: "ai_tidak_tersedia" };
    return nilai(tandaBahayaAturan, {
      keluaran: keluaranAI,
      tandaBahaya: tandaBahayaAI(teks, teksTersamar, keluaranAI, tandaBahayaAturan),
    });
  };
}

/**
 * Satu-satunya pintu masuk penilaian (spec, "Modul"). Urutan langkahnya:
 * validasi panjang → Aturan → Penyamaran + AI → penyaringan AI → Skor, Label,
 * Modus → Penjelasan → Langkah aman.
 *
 * @throws {TeksTidakValid} kalau Teks kosong, < 50, atau > 3.000 karakter
 *   setelah trim.
 */
export const cek: FungsiCek = buatCek(KATALOG);

/** Jawaban AI yang valid secara skema, beserta Tanda bahaya AI yang lolos penyaringan. */
type PenilaianAI = { keluaran: KeluaranAI; tandaBahaya: HasilCek["tandaBahaya"] };

function nilai(tandaBahayaAturan: HasilCek["tandaBahaya"], ai: PenilaianAI | null): HasilCek {
  const tandaBahaya = urutkanTandaBahaya([...tandaBahayaAturan, ...(ai?.tandaBahaya ?? [])]);
  const tandaBahayaTersirat: HasilCek["tandaBahayaTersirat"] = [];
  const skor = hitungSkor(tandaBahaya, tandaBahayaTersirat);
  const label = labelDariSkor(skor);
  const modus = urutkanModus(tandaBahaya);
  const modusTerkuat = modus[0] ?? null;
  const adaTandaBahaya = tandaBahaya.length + tandaBahayaTersirat.length > 0;
  // Penjelasan AI untuk Risiko rendah tidak dipakai kalau daftar Tanda bahaya
  // berisi: AI bisa menulis "tidak ditemukan tanda bahaya" padahal ada (tiket 08).
  const bolehPenjelasanAI = ai && !(label === "risiko_rendah" && adaTandaBahaya);

  return {
    label,
    skor,
    tandaBahaya,
    tandaBahayaTersirat,
    modus,
    modusTerkuat,
    penjelasan:
      (bolehPenjelasanAI && penjelasanAI(ai.keluaran.penjelasan, ai.keluaran.label, label)) ||
      penjelasanTemplat(label, modusTerkuat, adaTandaBahaya),
    langkahAman: langkahAman(label, modus),
    langkahDarurat: langkahDarurat(label),
    sumberPenilaian: ai ? "aturan+AI" : "aturan",
  };
}
