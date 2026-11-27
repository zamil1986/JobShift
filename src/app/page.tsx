import Link from "next/link";
import { langkahDarurat, SEMUA_LANGKAH } from "@/cek/langkah";
import { DaftarLangkah } from "@/ui/DaftarLangkah";
import { FormCek } from "@/ui/FormCek";
import { IkonFitur, IlustrasiLangkah, TandaJobShift } from "@/ui/IkonBeranda";
import { DISCLAIMER_PRIVASI, JUDUL_LANGKAH_DARURAT, JUDUL_SUDAH_KIRIM_DATA, JUDUL_SUDAH_TRANSFER, TAGLINE } from "@/ui/salinan";
import {
  BUKAN_PENGGANTI,
  CIRI_MODUS,
  DESKRIPSI,
  FAKTA,
  FITUR,
  JUDUL_AJAKAN,
  JUDUL_ALASAN,
  JUDUL_CARA_KERJA,
  JUDUL_FITUR,
  JUDUL_MODUS,
  KAKI_HALAMAN,
  KAKI_KANAL,
  LANGKAH_PAKAI,
  LEWATI_KE_CEK,
  NAV_CARA_KERJA,
  NAV_CEK_SEKARANG,
  NAV_SUDAH_TELANJUR,
  PENGANTAR_CARA_KERJA,
  PENGANTAR_TELANJUR,
} from "@/ui/salinan-beranda";
import { Sorotan } from "@/ui/Sorotan";

// Langkah darurat untuk Label Bahaya: sama persis dengan yang tampil di hasil.
const DARURAT = langkahDarurat("bahaya");

// Kanal resmi di kaki halaman: semua tautan unik dari tabel Langkah, jadi
// URL dan domainnya hanya ditulis sekali di src/cek/langkah.ts.
const KANAL_RESMI = [
  ...new Map(SEMUA_LANGKAH.flatMap((l) => (l.tautan ? [[l.tautan.url, l.tautan] as const] : []))).values(),
];

// "JobShift — cek dulu sebelum transfer." Nama tampil di logo; judul memakai
// tagline dengan huruf kapital di awal, dan nama tetap dibacakan.
const [MEREK, SLOGAN] = TAGLINE.split(" — ");
const JUDUL_UTAMA = SLOGAN.charAt(0).toUpperCase() + SLOGAN.slice(1);

export default function Beranda() {
  return (
    <>
      <a className="lewati" href="#kotak-cek">
        {LEWATI_KE_CEK}
      </a>

      <div className="cahaya-atas" aria-hidden="true" />

      <header className="kepala-situs">
        <div className="bilah">
          <Link className="logo" href="/">
            <TandaJobShift className="logo-tanda" />
            <span>{MEREK}</span>
          </Link>
          <nav aria-label="Bagian halaman">
            <ul className="nav-situs">
              <li className="nav-kedua">
                <a className="tombol tombol-kedua tombol-kecil" href="#cara-kerja">
                  {NAV_CARA_KERJA}
                </a>
              </li>
              <li>
                <a className="tombol tombol-utama tombol-kecil" href="#kotak-cek">
                  {NAV_CEK_SEKARANG}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="pembuka" aria-labelledby="judul-utama">
          <div className="pembuka-teks">
            <h1 id="judul-utama" className="judul-kilau judul-utama">
              <span className="sr-only">{MEREK} — </span>
              {JUDUL_UTAMA}
            </h1>
            <p className="pembuka-sub">{DESKRIPSI}</p>
          </div>
          <FormCek />
        </section>

        <section id="cara-kerja" className="bagian-halaman muncul" aria-labelledby="judul-cara-kerja">
          <div className="sekat">
            <div className="kepala-bagian">
              <h2 id="judul-cara-kerja" className="judul-kilau judul-bagian">
                {JUDUL_CARA_KERJA}
              </h2>
              <p className="pengantar-bagian">{PENGANTAR_CARA_KERJA}</p>
            </div>
            <Sorotan className="kisi-tiga">
              {LANGKAH_PAKAI.map((l, i) => (
                <article key={l.nama} className="kartu kartu-sorot kartu-langkah">
                  <div className="kartu-ilustrasi">
                    <IlustrasiLangkah urutan={i} />
                  </div>
                  <div className="kartu-isi">
                    <h3 className="cip">
                      <span className="cip-nomor" aria-hidden="true">
                        {i + 1}
                      </span>
                      {l.nama}
                    </h3>
                    <p>{l.teks}</p>
                  </div>
                </article>
              ))}
            </Sorotan>
          </div>
        </section>

        <section className="bagian-halaman muncul" aria-labelledby="judul-fitur">
          <div className="sekat">
            <div className="kepala-bagian">
              <h2 id="judul-fitur" className="judul-kilau judul-bagian">
                {JUDUL_FITUR}
              </h2>
            </div>
            <ul className="kisi-fitur">
              {FITUR.map((f) => (
                <li key={f.nama} className="fitur">
                  <IkonFitur nama={f.ikon} />
                  <h3>{f.nama}</h3>
                  <p>{f.teks}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bagian-halaman muncul" aria-labelledby="judul-modus">
          <div className="sekat">
            <div className="kepala-bagian">
              <h2 id="judul-modus" className="judul-kilau judul-bagian">
                {JUDUL_MODUS}
              </h2>
            </div>
            <Sorotan className="kisi-tiga">
              {CIRI_MODUS.map((m) => (
                <article key={m.nama} className="kartu kartu-sorot kartu-modus">
                  <h3>{m.nama}</h3>
                  <p>{m.ciri}</p>
                </article>
              ))}
            </Sorotan>
          </div>
        </section>

        <section className="bagian-halaman muncul" aria-labelledby="judul-alasan">
          <div className="sekat">
            <div className="kepala-bagian">
              <h2 id="judul-alasan" className="judul-kilau judul-bagian">
                {JUDUL_ALASAN}
              </h2>
            </div>
            <ul className="kisi-tiga kisi-fakta">
              {FAKTA.map((f) => (
                <li key={f.angka} className="kartu kartu-fakta">
                  <p className="fakta-sumber-atas" aria-hidden="true">
                    {f.sumber.nama}
                  </p>
                  <p>
                    <span className="fakta-angka">{f.angka}</span> {f.teks}
                  </p>
                  <p className="fakta-sumber">
                    Sumber:{" "}
                    <a href={f.sumber.url} target="_blank" rel="noopener noreferrer">
                      {f.sumber.nama}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {DARURAT && (
          <section id="sudah-telanjur" className="bagian-halaman muncul" aria-labelledby="judul-telanjur">
            <div className="sekat">
              <div className="kepala-bagian">
                <h2 id="judul-telanjur" className="judul-kilau judul-bagian">
                  {JUDUL_LANGKAH_DARURAT}
                </h2>
                <p className="pengantar-bagian">{PENGANTAR_TELANJUR}</p>
              </div>
              <div className="kisi-dua">
                <section className="kartu kartu-darurat" aria-labelledby="beranda-sudah-transfer">
                  <h3 id="beranda-sudah-transfer">{JUDUL_SUDAH_TRANSFER}</h3>
                  <DaftarLangkah langkah={DARURAT.sudahTransfer} />
                </section>
                <section className="kartu kartu-darurat" aria-labelledby="beranda-sudah-kirim-data">
                  <h3 id="beranda-sudah-kirim-data">{JUDUL_SUDAH_KIRIM_DATA}</h3>
                  <DaftarLangkah langkah={DARURAT.sudahKirimData} />
                </section>
              </div>
            </div>
          </section>
        )}

        <section className="bagian-halaman muncul" aria-labelledby="judul-ajakan">
          <div className="sekat">
            <div className="panel-ajakan">
              <h2 id="judul-ajakan" className="judul-kilau judul-bagian">
                {JUDUL_AJAKAN}
              </h2>
              <a className="tombol tombol-utama" href="#kotak-cek">
                {NAV_CEK_SEKARANG}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="kaki-situs">
        <div className="cahaya-bawah" aria-hidden="true" />
        <div className="sekat kisi-kaki">
          <div className="kaki-merek">
            <Link className="logo" href="/">
              <TandaJobShift className="logo-tanda" />
              <span>{MEREK}</span>
            </Link>
            <p>{TAGLINE}</p>
            <p>{DISCLAIMER_PRIVASI}</p>
            <p>{BUKAN_PENGGANTI}</p>
          </div>
          <nav aria-labelledby="kaki-halaman">
            <h2 id="kaki-halaman" className="kaki-judul">
              {KAKI_HALAMAN}
            </h2>
            <ul className="kaki-daftar">
              <li>
                <a href="#kotak-cek">{NAV_CEK_SEKARANG}</a>
              </li>
              <li>
                <a href="#cara-kerja">{NAV_CARA_KERJA}</a>
              </li>
              <li>
                <a href="#sudah-telanjur">{NAV_SUDAH_TELANJUR}</a>
              </li>
            </ul>
          </nav>
          <nav aria-labelledby="kaki-kanal">
            <h2 id="kaki-kanal" className="kaki-judul">
              {KAKI_KANAL}
            </h2>
            <ul className="kaki-daftar">
              {KANAL_RESMI.map((k) => (
                <li key={k.url}>
                  <a href={k.url} target="_blank" rel="noopener noreferrer">
                    {k.domain}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
