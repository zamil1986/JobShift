import { describe, expect, it } from "vitest";
import type { Modus } from "@/cek";
import type { Aturan } from "@/cek/aturan/mesin";
import { buatCek } from "@/cek/cek";

// Katalog sintetis lewat buatCek(katalog): bobot 24 dan 59 tidak mungkin
// dihasilkan katalog asli (semua bobotnya kelipatan 5), tetapi batasnya
// tetap harus dites lewat jalur cek() yang lengkap (spec, "Testing Decisions").

const aturanUji = (id: string, pemicu: string, bobot: number, modus?: Modus): Aturan => ({
  id,
  alasan: `Alasan uji ${id}.`,
  bobot,
  kritis: false,
  modus,
  pakaiPenyangkal: false,
  pola: [{ cari: pemicu, bahasa: "id" }],
});

/** Teks ≥ 50 karakter yang memuat kata pemicu yang diberikan. */
const teksDengan = (...pemicu: string[]) =>
  `Lowongan uji untuk penilaian Skor dan Label. Pemicu: ${pemicu.join(", ")}.`;

describe("cek: ambang Label", () => {
  it.each([
    [24, "risiko_rendah"],
    [25, "waspada"],
    [59, "waspada"],
    [60, "bahaya"],
  ] as const)("Skor %i memberi Label %s", async (bobot, label) => {
    const hasil = await buatCek([aturanUji("U1", "alfa", bobot)])(teksDengan("alfa"));

    expect(hasil.skor).toBe(bobot);
    expect(hasil.label).toBe(label);
  });

  it("menjumlahkan bobot dari beberapa Aturan", async () => {
    const hasil = await buatCek([aturanUji("U1", "alfa", 10), aturanUji("U2", "beta", 15)])(
      teksDengan("alfa", "beta"),
    );

    expect(hasil.skor).toBe(25);
    expect(hasil.label).toBe("waspada");
  });

  it("membatasi Skor di 100", async () => {
    const hasil = await buatCek([aturanUji("U1", "alfa", 60), aturanUji("U2", "beta", 55)])(
      teksDengan("alfa", "beta"),
    );

    expect(hasil.skor).toBe(100);
  });

  it("mengurutkan Tanda bahaya menurut bobot menurun, bukan urutan katalog atau posisi", async () => {
    const hasil = await buatCek([aturanUji("U1", "alfa", 10), aturanUji("U2", "beta", 25)])(
      teksDengan("alfa", "beta"),
    );

    expect(hasil.tandaBahaya.map((t) => t.bobot)).toEqual([25, 10]);
  });
});

describe("cek: Modus dan Modus terkuat", () => {
  it("memilih Modus dengan jumlah bobot terbesar", async () => {
    const hasil = await buatCek([
      aturanUji("U1", "alfa", 20, "tugas"),
      aturanUji("U2", "beta", 20, "tugas"),
      aturanUji("U3", "gama", 25, "luar_negeri"),
    ])(teksDengan("alfa", "beta", "gama"));

    expect(hasil.modus).toEqual(["tugas", "luar_negeri"]);
    expect(hasil.modusTerkuat).toBe("tugas");
  });

  it("memecah seri dengan urutan Luar negeri, Lokal, Tugas", async () => {
    const hasil = await buatCek([
      aturanUji("U1", "alfa", 20, "tugas"),
      aturanUji("U2", "beta", 20, "lokal"),
      aturanUji("U3", "gama", 20, "luar_negeri"),
    ])(teksDengan("alfa", "beta", "gama"));

    expect(hasil.modus).toEqual(["luar_negeri", "lokal", "tugas"]);
    expect(hasil.modusTerkuat).toBe("luar_negeri");
  });

  it("memilih Lokal atas Tugas kalau seri", async () => {
    const hasil = await buatCek([
      aturanUji("U1", "alfa", 15, "tugas"),
      aturanUji("U2", "beta", 15, "lokal"),
    ])(teksDengan("alfa", "beta"));

    expect(hasil.modusTerkuat).toBe("lokal");
  });

  it("tidak menghitung Aturan tanpa Modus", async () => {
    const hasil = await buatCek([
      aturanUji("U1", "alfa", 60),
      aturanUji("U2", "beta", 10, "tugas"),
    ])(teksDengan("alfa", "beta"));

    expect(hasil.modus).toEqual(["tugas"]);
    expect(hasil.modusTerkuat).toBe("tugas");
  });
});
