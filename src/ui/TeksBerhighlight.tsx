import type { TandaBahaya } from "@/cek/tipe";

type Props = { teks: string; tandaBahaya: TandaBahaya[] };

type Potongan = { teks: string; tandai: boolean };

/**
 * Memecah Teks asli berdasarkan `rentang` menjadi potongan biasa dan potongan
 * yang ditandai. Rentang diurutkan dulu menurut posisi (daftar Tanda bahaya
 * urut bobot) dan yang beririsan digabung.
 */
function pecah(teks: string, tandaBahaya: TandaBahaya[]): Potongan[] {
  const rentang = tandaBahaya
    .map((t) => [Math.max(0, t.rentang[0]), Math.min(teks.length, t.rentang[1])] as const)
    .filter(([awal, akhir]) => akhir > awal)
    .sort((a, b) => a[0] - b[0]);

  const potongan: Potongan[] = [];
  let posisi = 0;
  for (const [awal, akhir] of rentang) {
    if (akhir <= posisi) continue;
    const dari = Math.max(awal, posisi);
    if (dari > posisi) potongan.push({ teks: teks.slice(posisi, dari), tandai: false });
    const terakhir = potongan.at(-1);
    // Rentang yang bersambung atau beririsan menjadi satu <mark>.
    if (terakhir?.tandai && dari === posisi) terakhir.teks += teks.slice(dari, akhir);
    else potongan.push({ teks: teks.slice(dari, akhir), tandai: true });
    posisi = akhir;
  }
  if (posisi < teks.length) potongan.push({ teks: teks.slice(posisi), tandai: false });
  return potongan;
}

/** Teks asli dengan Kutipan pemicu di dalam <mark>. Semuanya node teks, tanpa HTML. */
export function TeksBerhighlight({ teks, tandaBahaya }: Props) {
  return (
    <p className="teks-asli">
      {pecah(teks, tandaBahaya).map((p, i) =>
        p.tandai ? (
          <mark key={i} className="sorotan">
            {p.teks}
          </mark>
        ) : (
          p.teks
        ),
      )}
    </p>
  );
}
