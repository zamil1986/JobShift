import { aiNonaktif } from "./ai";
import { KATALOG } from "./aturan/katalog";
import { jalankanAturan, type Aturan } from "./aturan/mesin";
import { periksaPanjang, TeksTidakValid } from "./panjang";
import { penjelasanTemplat } from "./penjelasan";
import { hitungSkor, labelDariSkor, urutkanModus, urutkanTandaBahaya } from "./skor";
import type { HasilCek, PenilaiAI } from "./tipe";

export type OpsiCek = {
  ai: PenilaiAI;
  /**
   * Katalog Aturan yang dipakai. Bawaannya katalog asli; route API tidak
   * pernah mengisinya. Hanya untuk tes yang butuh bobot di luar katalog,
   * misalnya batas Label 24/25/59 dan seri Modus terkuat.
   */
  aturan: readonly Aturan[];
};

/**
 * Satu-satunya pintu masuk penilaian (spec, "Modul"). Urutan langkahnya:
 * validasi panjang → Aturan → Penyamaran + AI → penyaringan AI → Skor, Label,
 * Modus → Penjelasan → Langkah aman. Lapisan AI dan Langkah aman belum ada.
 *
 * @throws {TeksTidakValid} kalau Teks kosong, < 50, atau > 3.000 karakter
 *   setelah trim.
 */
export async function cek(teks: string, opsi: Partial<OpsiCek> = {}): Promise<HasilCek> {
  // `ai` belum dipakai: lapisan AI (tiket 10) yang akan memanggil adapter ini.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ai = aiNonaktif, aturan = KATALOG } = opsi;

  const kode = periksaPanjang(teks);
  if (kode) throw new TeksTidakValid(kode);

  // Aturan menilai Teks persis seperti diterima (tanpa trim), supaya `rentang`
  // cocok dengan Teks yang di-highlight UI.
  const tandaBahaya = urutkanTandaBahaya(jalankanAturan(teks, aturan));
  const tandaBahayaTersirat: HasilCek["tandaBahayaTersirat"] = [];
  const skor = hitungSkor(tandaBahaya, tandaBahayaTersirat);
  const label = labelDariSkor(skor);
  const modus = urutkanModus(tandaBahaya);

  return {
    label,
    skor,
    tandaBahaya,
    tandaBahayaTersirat,
    modus,
    modusTerkuat: modus[0] ?? null,
    penjelasan: penjelasanTemplat(label),
    // Diisi di tiket 08.
    langkahAman: { umum: [], spesifik: [] },
    langkahDarurat: label === "risiko_rendah" ? null : { sudahTransfer: [], sudahKirimData: [] },
    sumberPenilaian: "aturan",
  };
}
