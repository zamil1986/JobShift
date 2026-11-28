"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import type { HasilCek, Label } from "@/cek/tipe";
import { DaftarLangkah } from "./DaftarLangkah";
import {
  CATATAN_AI_TIDAK_TERSEDIA,
  JUDUL_LANGKAH,
  JUDUL_LANGKAH_DARURAT,
  JUDUL_SUDAH_KIRIM_DATA,
  JUDUL_SUDAH_TRANSFER,
  PERINGATAN_RISIKO_RENDAH,
  TAGLINE,
  TAMPILAN_LABEL,
  TAMPILAN_MODUS,
} from "./salinan";
import { IkonLabel } from "./IkonLabel";
import { RENTANG_LABEL } from "./salinan-beranda";
import { TAUTAN_KE_CARA_KERJA } from "./salinan-cara-kerja";
import { TeksBersorotan } from "./TeksBersorotan";

type Props = { hasil: HasilCek; teks: string };

/** Meter Skor: 20 sel karakter, satu sel = 5 poin, seperti blok cetak struk. */
const JUMLAH_SEL = 20;
const URUTAN_LABEL = Object.keys(RENTANG_LABEL) as Label[];

/**
 * Me-render HasilCek apa adanya. Tidak menghitung apa pun. Teks pengguna dan
 * kutipan selalu di-render sebagai node teks, tidak pernah sebagai HTML.
 * ID aturan (`aturanId`) tidak pernah ditampilkan (NFR-08).
 */
export function TampilanHasil({ hasil, teks }: Props) {
  const judul = useRef<HTMLHeadingElement>(null);

  // Setelah Cek, pindahkan fokus ke judul hasil (spec, "UI dan aksesibilitas")
  // dan gulir judul ke atas layar. focus() saja tidak menggulir kalau judul
  // sudah terlihat sebagian, sehingga Label dan peringatan FR-06 bisa
  // tertinggal di bawah layar 360 × 640.
  useEffect(() => {
    const el = judul.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "start" });
  }, [hasil]);

  const label = TAMPILAN_LABEL[hasil.label];

  return (
    <article className="hasil">
      <h2 id="judul-hasil" ref={judul} tabIndex={-1}>
        Hasil cek
      </h2>

      <p className={`label label-${hasil.label}`}>
        <span className="label-ikon" aria-hidden="true">
          <IkonLabel label={hasil.label} />
        </span>
        <span className="label-kata">{label.kata}</span>
        <span className="label-skor">Skor {hasil.skor} dari 100</span>
        <span className="label-meter" aria-hidden="true">
          {Array.from({ length: JUMLAH_SEL }, (_, i) => (
            <span
              key={i}
              className={i < Math.round(hasil.skor / (100 / JUMLAH_SEL)) ? "sel sel-isi" : "sel"}
              style={{ "--i": i } as CSSProperties}
            />
          ))}
        </span>
      </p>

      {hasil.label === "risiko_rendah" && (
        <p className="peringatan">
          <strong>{PERINGATAN_RISIKO_RENDAH}</strong>
        </p>
      )}

      <p className="penjelasan">{hasil.penjelasan}</p>

      {hasil.catatanAI && <p className="disclaimer catatan-ai">{CATATAN_AI_TIDAK_TERSEDIA}</p>}

      {hasil.modus.length > 0 && (
        <p>
          <span className="modus-judul">Modus yang cocok: </span>
          {/* `modus` sudah urut jumlah bobot; elemen pertama adalah Modus terkuat. */}
          {hasil.modus.map((m) => TAMPILAN_MODUS[m]).join(", ")}
        </p>
      )}

      {hasil.tandaBahaya.length > 0 && (
        <section className="bagian" aria-labelledby="judul-tanda-bahaya">
          <h3 id="judul-tanda-bahaya">Tanda bahaya</h3>
          <ul className="daftar daftar-tanda">
            {hasil.tandaBahaya.map((t) => (
              <li key={`${t.rentang[0]}-${t.rentang[1]}-${t.alasan}`}>
                {t.alasan}
                <q className="kutipan">{t.kutipan}</q>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasil.tandaBahayaTersirat.length > 0 && (
        <section className="bagian bagian-tersirat" aria-labelledby="judul-tersirat">
          <h3 id="judul-tersirat">Yang tidak disebutkan di teks</h3>
          <ul className="daftar">
            {hasil.tandaBahayaTersirat.map((t) => (
              <li key={t.alasan}>{t.alasan}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="bagian" aria-labelledby="judul-langkah">
        <h3 id="judul-langkah">{JUDUL_LANGKAH}</h3>
        <DaftarLangkah langkah={[...hasil.langkahAman.umum, ...hasil.langkahAman.spesifik]} />
      </section>

      {hasil.langkahDarurat && (
        <section className="bagian bagian-darurat" aria-labelledby="judul-darurat">
          <h3 id="judul-darurat">{JUDUL_LANGKAH_DARURAT}</h3>
          <section aria-labelledby="judul-sudah-transfer">
            <h4 id="judul-sudah-transfer">{JUDUL_SUDAH_TRANSFER}</h4>
            <DaftarLangkah langkah={hasil.langkahDarurat.sudahTransfer} />
          </section>
          <section aria-labelledby="judul-sudah-kirim-data">
            <h4 id="judul-sudah-kirim-data">{JUDUL_SUDAH_KIRIM_DATA}</h4>
            <DaftarLangkah langkah={hasil.langkahDarurat.sudahKirimData} />
          </section>
        </section>
      )}

      <section className="bagian" aria-labelledby="judul-teks">
        <h3 id="judul-teks">Teks yang dicek</h3>
        {hasil.tandaBahaya.length > 0 && (
          <p className="petunjuk-sorotan">Kalimat yang menjadi tanda bahaya diberi tanda di bawah ini.</p>
        )}
        <TeksBersorotan teks={teks} tandaBahaya={hasil.tandaBahaya} />
      </section>

      {/* Legenda skala di kaki struk: Label aktif bertinta penuh, lainnya putus-putus. */}
      <ul className="legenda" aria-label="Skala Label">
        {URUTAN_LABEL.map((l) => (
          <li key={l} className={`legenda-${l}`} aria-current={l === hasil.label ? "true" : undefined}>
            {TAMPILAN_LABEL[l].kata} <span className="legenda-rentang">{RENTANG_LABEL[l]}</span>
          </li>
        ))}
      </ul>

      <p className="tagline-hasil">{TAGLINE}</p>
      <p className="tagline-hasil">
        <Link href="/cara-kerja">{TAUTAN_KE_CARA_KERJA}</Link>
      </p>
    </article>
  );
}
