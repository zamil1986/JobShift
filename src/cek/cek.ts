import { aiNonaktif } from "./ai";
import { KATALOG } from "./aturan/katalog";
import { jalankanAturan, type Aturan } from "./aturan/mesin";
import { langkahAman, langkahDarurat } from "./langkah";
import { periksaPanjang, TeksTidakValid } from "./panjang";
import { penjelasanTemplat } from "./penjelasan";
import { hitungSkor, labelDariSkor, urutkanModus, urutkanTandaBahaya } from "./skor";
import type { HasilCek, PenilaiAI } from "./tipe";

export type OpsiCek = { ai: PenilaiAI };

export type FungsiCek = (teks: string, opsi?: OpsiCek) => Promise<HasilCek>;

/**
 * Membuat fungsi Cek dengan katalog Aturan tertentu. Kode aplikasi memakai
 * `cek` (katalog asli). `buatCek` hanya untuk tes yang butuh bobot di luar
 * katalog, misalnya batas Label 24/25/59 dan seri Modus terkuat (spec,
 * "Testing Decisions"). Tidak diekspor dari `@/cek`.
 */
export function buatCek(katalog: readonly Aturan[]): FungsiCek {
  return async function cekDenganKatalog(teks, opsi = { ai: aiNonaktif }) {
    // Belum dipakai: lapisan AI (tiket 10) yang akan memanggil adapter ini.
    void opsi;
    return nilai(teks, katalog);
  };
}

/**
 * Satu-satunya pintu masuk penilaian (spec, "Modul"). Urutan langkahnya:
 * validasi panjang → Aturan → Penyamaran + AI → penyaringan AI → Skor, Label,
 * Modus → Penjelasan → Langkah aman. Lapisan AI belum ada.
 *
 * @throws {TeksTidakValid} kalau Teks kosong, < 50, atau > 3.000 karakter
 *   setelah trim.
 */
export const cek: FungsiCek = buatCek(KATALOG);

function nilai(teks: string, katalog: readonly Aturan[]): HasilCek {
  const kode = periksaPanjang(teks);
  if (kode) throw new TeksTidakValid(kode);

  // Aturan menilai Teks persis seperti diterima (tanpa trim), supaya `rentang`
  // cocok dengan Teks yang disorot UI.
  const tandaBahaya = urutkanTandaBahaya(jalankanAturan(teks, katalog));
  const tandaBahayaTersirat: HasilCek["tandaBahayaTersirat"] = [];
  const skor = hitungSkor(tandaBahaya, tandaBahayaTersirat);
  const label = labelDariSkor(skor);
  const modus = urutkanModus(tandaBahaya);
  const modusTerkuat = modus[0] ?? null;

  return {
    label,
    skor,
    tandaBahaya,
    tandaBahayaTersirat,
    modus,
    modusTerkuat,
    penjelasan: penjelasanTemplat(label, modusTerkuat),
    langkahAman: langkahAman(label, modusTerkuat),
    langkahDarurat: langkahDarurat(label),
    sumberPenilaian: "aturan",
  };
}
