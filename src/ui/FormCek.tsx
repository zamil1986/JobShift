"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { PANJANG_MAKS, panjangTeks, periksaPanjang } from "@/cek/panjang";
import { PESAN_ERROR, PESAN_GAGAL_SERVER } from "@/cek/pesan";
import type { ErrorCek, HasilCek } from "@/cek/tipe";
import { DISCLAIMER_PRIVASI, PESAN_GAGAL_KONEKSI } from "./salinan";
import { TampilanHasil } from "./TampilanHasil";
import { UnggahScreenshot } from "./UnggahScreenshot";

const angka = new Intl.NumberFormat("id-ID");

export function FormCek() {
  const [teks, setTeks] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [cekTerakhir, setCekTerakhir] = useState<{ hasil: HasilCek; teks: string } | null>(null);
  const [ocrSibuk, setOcrSibuk] = useState(false);
  const kotak = useRef<HTMLTextAreaElement>(null);

  const idKotak = useId();
  const idPenghitung = useId();
  const idGalat = useId();
  const kotak = useRef<HTMLTextAreaElement>(null);

  const panjang = panjangTeks(teks);
  const kelebihan = panjang > PANJANG_MAKS;

  async function jalankanCek(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (memuat) return;

    // Teks di luar batas tidak dicek sama sekali; pesannya sama dengan API.
    const kode = periksaPanjang(teks);
    // Kotak kosong atau terlalu pendek: tombol tetap bisa ditekan, lalu pesan
    // muncul dan fokus kembali ke kotak tempel supaya jelas apa yang kurang.
    if (kode) {
      setGalat(PESAN_ERROR[kode]);
      setCekTerakhir(null);
      kotak.current?.focus();
      return;
    }

    const teksDicek = teks;
    setMemuat(true);
    setGalat(null);
    try {
      const res = await fetch("/api/cek", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teks: teksDicek }),
      });
      const body: unknown = await res.json().catch(() => null);
      if (res.ok) {
        setCekTerakhir({ hasil: body as HasilCek, teks: teksDicek });
      } else {
        setCekTerakhir(null);
        setGalat((body as Partial<ErrorCek> | null)?.error?.pesan ?? PESAN_GAGAL_SERVER);
      }
    } catch {
      setCekTerakhir(null);
      setGalat(PESAN_GAGAL_KONEKSI);
    } finally {
      setMemuat(false);
    }
  }

  // Form dan hasil berada di satu panel: hasil muncul di bawah kotak tempel,
  // di tempat yang sama dengan yang baru saja diisi.
  return (
    <div className="alat" id="kotak-cek">
      <div className="alat-isi">
        <form className="form-cek" onSubmit={jalankanCek} noValidate>
          <label htmlFor={idKotak} className="label-kotak">
            Tempel teks lowongan di sini
          </label>
          <textarea
            ref={kotak}
            id={idKotak}
            name="teks"
            value={teks}
            onChange={(e) => {
              setTeks(e.target.value);
              setGalat(null);
            }}
            rows={8}
            spellCheck={false}
            aria-describedby={galat ? `${idPenghitung} ${idGalat}` : idPenghitung}
            aria-invalid={galat ? true : undefined}
            placeholder="Contoh: Dibutuhkan admin online, kerja dari rumah, gaji harian…"
          />
          <p id={idPenghitung} className={kelebihan ? "penghitung penghitung-lebih" : "penghitung"}>
            {angka.format(panjang)} / {angka.format(PANJANG_MAKS)} karakter
          </p>

          <UnggahScreenshot
            teks={teks}
            onSibuk={setOcrSibuk}
            onTeks={(hasilOcr) => {
              // Hasil OCR menggantikan isi kotak dan tidak dipotong; pengguna memeriksanya dulu.
              setTeks(hasilOcr);
              setGalat(null);
              kotak.current?.focus();
            }}
          />

          {galat && (
            <p id={idGalat} className="galat" role="alert">
              {galat}
            </p>
          )}

          <button type="submit" className="tombol-cek" disabled={memuat || ocrSibuk}>
            {memuat ? "Mengecek…" : "Cek"}
          </button>
          <p className="disclaimer">{DISCLAIMER_PRIVASI}</p>
        </form>

        <div aria-live="polite" className="wadah-hasil">
          {cekTerakhir && <TampilanHasil hasil={cekTerakhir.hasil} teks={cekTerakhir.teks} />}
        </div>
      </div>
    </div>
  );
}
