import { describe, expect, it } from "vitest";
import { cek } from "@/cek";
import { penilaiPalsu } from "@/cek/ai";
import type { Aturan } from "@/cek/aturan/mesin";
import { buatCek } from "@/cek/cek";

// Tes properti ADR-0001 dengan generator acak ber-seed (deterministik, jadi
// kegagalan bisa diulang dari nomor kasusnya). Setiap kasus membandingkan Cek
// dengan AI terhadap Cek yang sama tanpa AI.

const JUMLAH_KASUS = 300;

/** mulberry32: PRNG kecil ber-seed. */
function acak(seed: number) {
  let a = seed >>> 0;
  const berikut = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const bulat = (n: number) => Math.floor(berikut() * n);
  const pilih = <T,>(daftar: readonly T[]): T => daftar[bulat(daftar.length)];
  return { berikut, bulat, pilih };
}

type Acak = ReturnType<typeof acak>;

const KATA = [
  "lowongan", "admin", "gudang", "gaji", "harian", "transfer", "biaya", "seragam", "kode", "otp",
  "kirim", "cv", "hrd", "kantor", "deposit", "komisi", "tugas", "like", "rating", "visa",
  "kamboja", "tidak", "tanpa", "gratis", "pin", "password", "Rp250.000", "8.000.000", "hubungi",
  "0812-3456-7890", "hrd@contoh.co.id", "3201234567890123", "1234567890", "segera", "hari", "ini",
];

const PEMICU_UJI = ["alfa", "beta", "gama", "delta"];

/** Katalog sintetis dengan bobot acak 5–60, supaya Skor Aturan menyebar ke tiga Label. */
function katalogAcak(r: Acak): Aturan[] {
  return PEMICU_UJI.filter(() => r.berikut() < 0.6).map((pemicu, i) => ({
    id: `P${i}`,
    alasan: `Alasan uji ${pemicu}.`,
    bobot: 5 * (1 + r.bulat(12)),
    kritis: false,
    modus: r.pilih([undefined, "tugas", "lokal", "luar_negeri"] as const),
    pakaiPenyangkal: false,
    pola: [{ cari: pemicu, bahasa: "id" as const }],
  }));
}

function teksAcak(r: Acak): string {
  const kata = Array.from({ length: 12 + r.bulat(30) }, () =>
    r.berikut() < 0.15 ? r.pilih(PEMICU_UJI) : r.pilih(KATA),
  );
  const teks = kata.join(r.berikut() < 0.2 ? "  " : " ");
  return teks.padEnd(60, " lowongan");
}

/** Potongan acak dari Teks, kadang diubah huruf besar/kecil atau diberi penanda. */
function kutipanAcak(r: Acak, teks: string): unknown {
  const jenis = r.bulat(6);
  if (jenis === 0) return r.pilih(["", "   ", "[NOMOR]", "NOMOR", "tidak ada di teks", 42, null]);
  const dari = r.bulat(teks.length);
  const potongan = teks.slice(dari, dari + 1 + r.bulat(25));
  if (jenis === 1) return potongan.toUpperCase();
  if (jenis === 2) return `${potongan} [REKENING]`;
  return potongan;
}

/** Keluaran AI acak: kebanyakan valid secara skema, sebagian rusak. */
function keluaranAcak(r: Acak, teks: string): unknown {
  if (r.berikut() < 0.1) return r.pilih([null, "rusak", { label: "bahaya" }, [], { skor: 100 }]);
  return {
    label: r.pilih(["risiko_rendah", "waspada", "bahaya"]),
    tanda_bahaya: Array.from({ length: r.bulat(9) }, () => ({
      kutipan: kutipanAcak(r, teks),
      alasan: r.pilih(["Alasan dari AI.", "", "Tampak aman.", "Meminta uang di awal."]),
    })),
    penjelasan: r.pilih(["Penjelasan AI.", "Lowongan ini aman.", ""]),
  };
}

describe("cek: properti lapisan AI (ADR-0001)", () => {
  it("AI tidak pernah menurunkan Skor dan sumbangannya paling banyak +25", async () => {
    for (let kasus = 0; kasus < JUMLAH_KASUS; kasus++) {
      const r = acak(kasus);
      const cekUji = buatCek(katalogAcak(r));
      const teks = teksAcak(r);

      const tanpaAI = await cekUji(teks);
      const denganAI = await cekUji(teks, { ai: penilaiPalsu(keluaranAcak(r, teks)) });

      const pesan = `kasus ${kasus}`;
      expect(denganAI.skor, pesan).toBeGreaterThanOrEqual(tanpaAI.skor);
      expect(denganAI.skor - tanpaAI.skor, pesan).toBeLessThanOrEqual(25);
      // Tanda bahaya Aturan, Modus, dan Modus terkuat tidak diubah AI.
      expect(denganAI.tandaBahaya.filter((t) => t.sumber === "aturan"), pesan).toEqual(
        tanpaAI.tandaBahaya,
      );
      expect(denganAI.modus, pesan).toEqual(tanpaAI.modus);
      expect(denganAI.modusTerkuat, pesan).toBe(tanpaAI.modusTerkuat);
    }
  });

  it("Tanda bahaya AI selalu punya kutipan persis dari Teks dan tidak beririsan", async () => {
    for (let kasus = 0; kasus < JUMLAH_KASUS; kasus++) {
      const r = acak(kasus);
      const teks = teksAcak(r);
      const hasil = await buatCek(katalogAcak(r))(teks, {
        ai: penilaiPalsu(keluaranAcak(r, teks)),
      });

      const urut = [...hasil.tandaBahaya].sort((a, b) => a.rentang[0] - b.rentang[0]);
      for (const [i, t] of urut.entries()) {
        expect(teks.slice(t.rentang[0], t.rentang[1]), `kasus ${kasus}`).toBe(t.kutipan);
        if (t.sumber === "ai") expect(t.kutipan, `kasus ${kasus}`).not.toMatch(/\[[A-Z]+\]/);
        if (i > 0) expect(urut[i - 1].rentang[1], `kasus ${kasus}`).toBeLessThanOrEqual(t.rentang[0]);
      }
    }
  });

  it("AI sendirian tidak pernah membuat Bahaya", async () => {
    const tanpaAturan = buatCek([]);
    for (let kasus = 0; kasus < JUMLAH_KASUS; kasus++) {
      const r = acak(kasus);
      const teks = teksAcak(r);
      const hasil = await tanpaAturan(teks, { ai: penilaiPalsu(keluaranAcak(r, teks)) });

      expect(hasil.skor, `kasus ${kasus}`).toBeLessThanOrEqual(25);
      expect(hasil.label, `kasus ${kasus}`).not.toBe("bahaya");
    }
  });

  it("AI sendirian tidak pernah membuat Bahaya dengan katalog asli, walaupun AI menjawab bahaya", async () => {
    const teks =
      "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Gaji dibayar mingguan lewat kantor pusat, kirim CV ke HRD.";
    const kutipan = [
      "Dibutuhkan staf",
      "administrasi untuk",
      "kantor cabang",
      "di Bandung",
      "Gaji dibayar mingguan",
    ];
    const hasil = await cek(teks, {
      ai: penilaiPalsu({
        label: "bahaya",
        tanda_bahaya: kutipan.map((k) => ({ kutipan: k, alasan: "Mencurigakan." })),
        penjelasan: "Teks ini sangat berbahaya.",
      }),
    });

    expect((await cek(teks)).skor).toBe(0);
    expect(hasil.skor).toBe(25);
    expect(hasil.label).toBe("waspada");
  });
});
