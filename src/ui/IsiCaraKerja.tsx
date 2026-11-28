import Link from "next/link";
import { RINGKASAN_ATURAN, SUMBANGAN_AI_MAKS } from "@/cek/ringkasan-aturan";
import type { Label } from "@/cek/tipe";
import type { HasilEvalTest } from "@/eval/hasil-tersimpan";
import type { Rasio } from "@/eval/eval";
import { TandaJobShift } from "./IkonBeranda";
import { TAGLINE, TAMPILAN_LABEL } from "./salinan";
import { BUKAN_PENGGANTI, NAV_CEK_SEKARANG, RENTANG_LABEL } from "./salinan-beranda";
import {
  AKURASI,
  aiGagal,
  BATASAN,
  BELUM_DIEVALUASI,
  JUDUL_AKURASI,
  JUDUL_BATASAN,
  JUDUL_HALAMAN,
  JUDUL_PENILAIAN,
  JUDUL_POLA_KRITIS,
  JUDUL_POLA_LAIN,
  JUDUL_PRIVASI,
  JUDUL_SKALA,
  PENGANTAR_HALAMAN,
  penjelasanAI,
  pengantarAkurasi,
  PENILAIAN,
  presisi,
  PRIVASI,
  SINTETIS_BELUM,
  sintetis,
  TAUTAN_KE_CEK,
  tanpaAI,
} from "./salinan-cara-kerja";

const [MEREK] = TAGLINE.split(" — ");
const URUTAN_LABEL = Object.keys(RENTANG_LABEL) as Label[];

// Skala Label sebagai teks biasa: warna Label pastel hanya untuk hasil cek
// dan legendanya (DESIGN.md, "The Pastel Hanya untuk Label Rule").
const SKALA = URUTAN_LABEL.map((l) => `${TAMPILAN_LABEL[l].kata} ${RENTANG_LABEL[l]}`).join(", ");

const FORMAT_PERSEN = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });

/** "17/20 (85%)": pembilang dan penyebut selalu tampil, persen hanya kalau ada. */
function formatRasio(r: Rasio): string {
  return r.persen === null ? `${r.pembilang}/${r.penyebut}` : `${r.pembilang}/${r.penyebut} (${FORMAT_PERSEN.format(r.persen)}%)`;
}

function Bagian({ id, judul, children }: { id: string; judul: string; children: React.ReactNode }) {
  return (
    <section className="bagian-halaman muncul" aria-labelledby={id}>
      <div className="sekat">
        <div className="kepala-bagian">
          <h2 id={id} className="judul-kilau judul-bagian">
            {judul}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Akurasi({ hasil }: { hasil: HasilEvalTest | null }) {
  if (!hasil) {
    return (
      <div className="kartu daftar">
        <p>{BELUM_DIEVALUASI}</p>
        <p>{SINTETIS_BELUM}</p>
      </div>
    );
  }

  const { gabungan, aturan } = hasil.mode;
  const angka = [
    { rasio: gabungan.recall, teks: AKURASI.tertangkap },
    { rasio: gabungan.falsePositive, teks: AKURASI.keliruBahaya },
    { rasio: gabungan.asliWaspada, teks: AKURASI.sungguhanWaspada },
  ];

  return (
    <>
      <p className="pengantar-bagian">
        {pengantarAkurasi(
          hasil.jumlahContoh,
          hasil.jumlahPalsu,
          hasil.jumlahAsli,
          FORMAT_TANGGAL.format(new Date(hasil.dibuatPada)),
        )}
      </p>
      <ul className="kisi-tiga kisi-fakta">
        {angka.map((a) => (
          <li key={a.teks} className="kartu kartu-fakta">
            <p className="fakta-isi">
              <span className="fakta-angka">{formatRasio(a.rasio)}</span> {a.teks}
            </p>
          </li>
        ))}
      </ul>
      <div className="kartu daftar">
        <p>{presisi(formatRasio(gabungan.presisi))}</p>
        <p>{tanpaAI(formatRasio(aturan.recall), formatRasio(aturan.falsePositive))}</p>
        {hasil.jumlahAiGagal > 0 && <p>{aiGagal(hasil.jumlahAiGagal, hasil.jumlahContoh)}</p>}
        <p>{sintetis(hasil.jumlahSintetis, hasil.jumlahContoh)}</p>
      </div>
    </>
  );
}

function DaftarTeks({ isi }: { isi: readonly string[] }) {
  return (
    <ul className="daftar daftar-langkah">
      {isi.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

/**
 * Isi halaman Cara kerja (PRD FR-10). Angka akurasi hanya dari `hasil`, yaitu
 * file hasil eval Set test yang dibaca saat build; `null` berarti belum dievaluasi.
 */
export function IsiCaraKerja({ hasil }: { hasil: HasilEvalTest | null }) {
  return (
    <>
      <div className="cahaya-atas" aria-hidden="true" />

      <header className="kepala-situs">
        <div className="bilah">
          <Link className="logo" href="/">
            <TandaJobShift className="logo-tanda" />
            <span>{MEREK}</span>
          </Link>
          <nav aria-label="Navigasi">
            <ul className="nav-situs">
              <li>
                <Link className="tombol tombol-utama tombol-kecil" href="/#kotak-cek">
                  {NAV_CEK_SEKARANG}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="pembuka" aria-labelledby="judul-utama">
          <h1 id="judul-utama" className="judul-kilau judul-utama">
            {JUDUL_HALAMAN}
          </h1>
          <p className="pembuka-sub">{PENGANTAR_HALAMAN}</p>
        </section>

        <Bagian id="judul-penilaian" judul={JUDUL_PENILAIAN}>
          <div className="kartu daftar">
            {PENILAIAN.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>{penjelasanAI(SUMBANGAN_AI_MAKS)}</p>
            <p>
              {JUDUL_SKALA}: {SKALA}.
            </p>
          </div>
          <div className="kisi-dua">
            <section className="kartu" aria-labelledby="judul-pola-kritis">
              <h3 id="judul-pola-kritis">{JUDUL_POLA_KRITIS}</h3>
              <DaftarTeks isi={RINGKASAN_ATURAN.kritis} />
            </section>
            <section className="kartu" aria-labelledby="judul-pola-lain">
              <h3 id="judul-pola-lain">{JUDUL_POLA_LAIN}</h3>
              <DaftarTeks isi={RINGKASAN_ATURAN.lain} />
            </section>
          </div>
        </Bagian>

        <Bagian id="judul-akurasi" judul={JUDUL_AKURASI}>
          <Akurasi hasil={hasil} />
        </Bagian>

        <Bagian id="judul-batasan" judul={JUDUL_BATASAN}>
          <div className="kartu">
            <DaftarTeks isi={BATASAN} />
          </div>
        </Bagian>

        <Bagian id="judul-privasi" judul={JUDUL_PRIVASI}>
          <div className="kartu">
            <DaftarTeks isi={PRIVASI} />
          </div>
        </Bagian>

        <section className="bagian-halaman" aria-label={TAUTAN_KE_CEK}>
          <div className="sekat">
            <div className="panel-ajakan">
              <Link className="tombol tombol-utama" href="/#kotak-cek">
                {TAUTAN_KE_CEK}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="kaki-situs">
        <div className="cahaya-bawah" aria-hidden="true" />
        <div className="sekat">
          <div className="kaki-merek">
            <p>{TAGLINE}</p>
            <p>{BUKAN_PENGGANTI}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
