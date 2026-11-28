"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { PANJANG_MAKS, panjangTeks } from "@/cek/panjang";
import { TIPE_GAMBAR_DITERIMA, periksaGambar } from "./gambar";
import { PROGRES_AWAL, bacaScreenshot, type Progres } from "./ocr";
import {
  PESAN_GAMBAR,
  PESAN_OCR_BERHASIL,
  PESAN_OCR_GAGAL,
  PESAN_OCR_KOSONG,
  PESAN_OCR_TERLALU_PANJANG,
  PETUNJUK_SCREENSHOT,
} from "./salinan";

type Props = {
  /** Isi kotak teks sekarang. Catatan "sudah masuk" hilang begitu pengguna mengubahnya. */
  teks: string;
  /** Dipanggil dengan teks hasil OCR yang tidak kosong. Teks tidak dipotong. */
  onTeks: (teks: string) => void;
  /** Dipanggil saat OCR mulai (true) dan selesai (false). */
  onSibuk: (sibuk: boolean) => void;
};

/**
 * Pilih screenshot, validasi, lalu baca teksnya di browser. Input berkas
 * sengaja tanpa atribut `name`, jadi gambar tidak ikut terkirim walau form
 * di-submit.
 */
export function UnggahScreenshot({ teks, onTeks, onSibuk }: Props) {
  const [progres, setProgres] = useState<Progres | null>(null);
  const [teksOcr, setTeksOcr] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const pembatal = useRef<AbortController | null>(null);

  const idBerkas = useId();
  const idPetunjuk = useId();
  const idStatus = useId();
  const idGalat = useId();

  // Hentikan worker kalau komponen dilepas di tengah OCR.
  useEffect(() => () => pembatal.current?.abort(), []);

  async function pilihBerkas(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const berkas = input.files?.[0];
    if (!berkas) return;

    setTeksOcr(null);
    const kode = periksaGambar(berkas);
    if (kode) {
      setGalat(PESAN_GAMBAR[kode]);
      input.value = "";
      return;
    }

    const kendali = new AbortController();
    pembatal.current = kendali;
    setGalat(null);
    setProgres(PROGRES_AWAL);
    onSibuk(true);
    try {
      const hasil = await bacaScreenshot(berkas, { signal: kendali.signal, onProgres: setProgres });
      if (hasil) {
        onTeks(hasil);
        setTeksOcr(hasil);
      } else {
        setGalat(PESAN_OCR_KOSONG);
      }
    } catch {
      if (!kendali.signal.aborted) setGalat(PESAN_OCR_GAGAL);
    } finally {
      if (pembatal.current === kendali) pembatal.current = null;
      // Komponen yang sudah dilepas tidak perlu diperbarui.
      if (!kendali.signal.aborted) {
        setProgres(null);
        onSibuk(false);
        // Kosongkan supaya file yang sama bisa dipilih lagi.
        input.value = "";
      }
    }
  }

  let teksStatus: string | null = progres?.teks ?? null;
  if (!teksStatus && teksOcr !== null && teksOcr === teks) {
    teksStatus =
      panjangTeks(teksOcr) > PANJANG_MAKS
        ? `${PESAN_OCR_BERHASIL} ${PESAN_OCR_TERLALU_PANJANG}`
        : PESAN_OCR_BERHASIL;
  }
  const dijelaskanOleh = galat ? `${idPetunjuk} ${idGalat}` : idPetunjuk;

  return (
    <>
      <label htmlFor={idBerkas} className="label-kotak label-unggah">
        Atau unggah screenshot lowongan
      </label>
      <input
        id={idBerkas}
        type="file"
        accept={TIPE_GAMBAR_DITERIMA}
        onChange={pilihBerkas}
        disabled={progres !== null}
        aria-describedby={dijelaskanOleh}
        aria-invalid={galat ? true : undefined}
      />
      <p id={idPetunjuk} className="disclaimer">
        {PETUNJUK_SCREENSHOT}
      </p>

      {/* Wadah status selalu ada di DOM supaya perubahannya dibacakan screen reader. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="status-ocr">
        {teksStatus && <p id={idStatus}>{teksStatus}</p>}
      </div>
      {progres && (
        <progress aria-labelledby={idStatus} max={100} value={progres.persen ?? undefined} />
      )}

      {galat && (
        <p id={idGalat} className="galat" role="alert">
          {galat}
        </p>
      )}
    </>
  );
}
