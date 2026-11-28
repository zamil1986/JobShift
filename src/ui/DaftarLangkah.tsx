import type { Langkah } from "@/cek/tipe";

/**
 * Daftar Langkah. Teks Langkah bertautan menjadi teks tautannya, dan domain
 * resmi selalu tampil di sampingnya sebagai teks biasa, supaya pengguna bisa
 * mencocokkan alamat sebelum membuka (IASC sering ditiru situs palsu).
 */
export function DaftarLangkah({ langkah }: { langkah: Langkah[] }) {
  return (
    <ul className="daftar daftar-langkah">
      {/* Daftar statis yang tidak pernah diurutkan ulang, jadi indeks cukup sebagai key. */}
      {langkah.map((l, i) => (
        <li key={i}>
          {l.tautan ? (
            <>
              <a href={l.tautan.url} target="_blank" rel="noopener noreferrer">
                {l.teks}
              </a>{" "}
              ({l.tautan.domain})
            </>
          ) : (
            l.teks
          )}
        </li>
      ))}
    </ul>
  );
}
