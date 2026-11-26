import { aiNonaktif } from "./ai";
import { periksaPanjang, TeksTidakValid } from "./panjang";
import type { HasilCek, PenilaiAI } from "./tipe";

export type OpsiCek = { ai: PenilaiAI };

const PENJELASAN_RISIKO_RENDAH = "Tidak ditemukan tanda bahaya di teks ini.";

/**
 * Satu-satunya pintu masuk penilaian (spec, "Modul"). Urutan langkahnya:
 * validasi panjang → Aturan → Penyamaran + AI → penyaringan AI → Skor, Label,
 * Modus → Penjelasan → Langkah aman. Saat ini belum ada Aturan maupun AI,
 * jadi setiap Teks valid berlabel Risiko rendah.
 *
 * @throws {TeksTidakValid} kalau Teks kosong, < 50, atau > 3.000 karakter
 *   setelah trim.
 */
export async function cek(
  teks: string,
  // Belum dipakai: lapisan AI (tiket 10) yang akan memanggil adapter ini.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opsi: OpsiCek = { ai: aiNonaktif },
): Promise<HasilCek> {
  const kode = periksaPanjang(teks);
  if (kode) throw new TeksTidakValid(kode);

  return {
    label: "risiko_rendah",
    skor: 0,
    tandaBahaya: [],
    tandaBahayaTersirat: [],
    modus: [],
    modusTerkuat: null,
    penjelasan: PENJELASAN_RISIKO_RENDAH,
    langkahAman: { umum: [], spesifik: [] },
    langkahDarurat: null,
    sumberPenilaian: "aturan",
  };
}
