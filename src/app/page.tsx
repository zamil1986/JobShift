import { langkahDarurat } from "@/cek/langkah";
import { FormCek } from "@/ui/FormCek";
import { DISCLAIMER_PRIVASI, JUDUL_LANGKAH_DARURAT, JUDUL_SUDAH_KIRIM_DATA, JUDUL_SUDAH_TRANSFER, TAGLINE } from "@/ui/salinan";
import {
  BUKAN_PENGGANTI,
  CIRI_MODUS,
  DESKRIPSI,
  FAKTA,
  JUDUL_ALASAN,
  JUDUL_CARA_KERJA,
  JUDUL_MODUS,
  LANGKAH_PAKAI,
  LEWATI_KE_CEK,
  NAV_CARA_KERJA,
  NAV_SUDAH_TELANJUR,
  PENGANTAR_TELANJUR,
  PENJELASAN_CARA_KERJA,
} from "@/ui/salinan-beranda";
import { DaftarLangkah } from "@/ui/DaftarLangkah";

// Langkah darurat untuk Label Bahaya: sama persis dengan yang tampil di hasil.
const DARURAT = langkahDarurat("bahaya");

// "JobShift — cek dulu sebelum transfer." dipecah supaya nama dan tagline
// tetap satu judul tapi bisa diberi ukuran berbeda.
const [MEREK, SLOGAN] = TAGLINE.split(" — ");

export default function Beranda() {
  return (
    <>
      <a className="lewati" href="#kotak-cek">
        {LEWATI_KE_CEK}
      </a>

      <header className="kepala-situs bidang">
        <nav aria-label="Bagian halaman" className="nav-situs">
          <a href="#cara-kerja">{NAV_CARA_KERJA}</a>
          <a href="#sudah-telanjur">{NAV_SUDAH_TELANJUR}</a>
        </nav>
      </header>

      <main>
        <section className="pembuka bidang" aria-labelledby="judul-utama">
          <div className="pembuka-teks">
            <h1 id="judul-utama" className="judul-utama">
              <span className="judul-merek">{MEREK}</span>
              <span className="sr-only"> — </span>
              <span className="judul-slogan">{SLOGAN}</span>
            </h1>
            <p className="pembuka-sub">{DESKRIPSI}</p>
          </div>
          <FormCek />
        </section>

        <section className="alasan bidang-tinta" aria-labelledby="judul-alasan">
          <div className="sekat">
            <h2 id="judul-alasan" className="judul-bagian">
              {JUDUL_ALASAN}
            </h2>
            <ul className="fakta">
              {FAKTA.map((f) => (
                <li key={f.angka}>
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

        <section id="cara-kerja" className="cara-kerja bidang" aria-labelledby="judul-cara-kerja">
          <div className="sekat sekat-dua">
            <div>
              <h2 id="judul-cara-kerja" className="judul-bagian">
                {JUDUL_CARA_KERJA}
              </h2>
              <div className="penjelasan-cara">
                {PENJELASAN_CARA_KERJA.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="slip">
              <ol className="langkah-pakai">
                {LANGKAH_PAKAI.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ol>
              <a className="slip-aksi" href="#kotak-cek">
                {LEWATI_KE_CEK}
              </a>
            </div>
          </div>
        </section>

        <section className="modus bidang-kertas" aria-labelledby="judul-modus">
          <div className="sekat">
            <h2 id="judul-modus" className="judul-bagian">
              {JUDUL_MODUS}
            </h2>
            <dl className="daftar-modus">
              {CIRI_MODUS.map((m) => (
                <div key={m.nama} className="modus-baris">
                  <dt>{m.nama}</dt>
                  <dd>{m.ciri}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {DARURAT && (
          <section id="sudah-telanjur" className="telanjur bidang-tinta" aria-labelledby="judul-telanjur">
            <div className="sekat">
              <h2 id="judul-telanjur" className="judul-bagian">
                {JUDUL_LANGKAH_DARURAT}
              </h2>
              <p className="telanjur-pengantar">{PENGANTAR_TELANJUR}</p>
              <div className="telanjur-kolom">
                <section aria-labelledby="beranda-sudah-transfer">
                  <h3 id="beranda-sudah-transfer">{JUDUL_SUDAH_TRANSFER}</h3>
                  <DaftarLangkah langkah={DARURAT.sudahTransfer} />
                </section>
                <section aria-labelledby="beranda-sudah-kirim-data">
                  <h3 id="beranda-sudah-kirim-data">{JUDUL_SUDAH_KIRIM_DATA}</h3>
                  <DaftarLangkah langkah={DARURAT.sudahKirimData} />
                </section>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="kaki-situs bidang">
        <div className="sekat">
          <p className="kaki-tagline">{TAGLINE}</p>
          <p>{DISCLAIMER_PRIVASI}</p>
          <p>{BUKAN_PENGGANTI}</p>
        </div>
      </footer>
    </>
  );
}
