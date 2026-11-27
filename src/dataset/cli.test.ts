import { describe, expect, it } from "vitest";
import { jalankanCekDataset } from "./cli";

const baris = (id: string, teks: string, kebenaran = "asli") =>
  JSON.stringify({ id, teks, kebenaran, sumber: "https://contoh.test", sintetis: false });
const TEKS_A = "Lowongan staf administrasi PT Contoh Sejahtera di Jakarta, kirim CV lewat situs resmi.";
const TEKS_B = "Lowongan operator gudang PT Contoh Logistik di Bekasi, lamaran lewat portal karier resmi.";

/** Menjalankan CLI dengan sistem file palsu; mengembalikan kode keluar, keluaran, dan file yang dibaca. */
async function jalankan(argv: string[], file: Record<string, string>) {
  const dibaca: string[] = [];
  const keluaran: string[] = [];
  const kode = await jalankanCekDataset(argv, {
    akar: "/repo",
    rumah: "/home/naja",
    adaFile: (p) => p in file,
    bacaFile: async (p) => {
      dibaca.push(p);
      return file[p];
    },
    cetak: (t) => keluaran.push(t),
  });
  return { kode, teks: keluaran.join("\n"), dibaca };
}

describe("jalankanCekDataset", () => {
  it("tanpa argumen memeriksa data/dev.jsonl dan keluar 1 kalau target belum terpenuhi", async () => {
    const { kode, teks, dibaca } = await jalankan([], { "/repo/data/dev.jsonl": baris("dev-001", TEKS_A) });
    expect(kode).toBe(1);
    expect(dibaca).toEqual(["/repo/data/dev.jsonl"]);
    expect(teks).toMatch(/✗ Jumlah contoh Set dev: 1\/60/);
    expect(teks).toMatch(/BELUM LOLOS/);
  });

  it("Set test membaca data/dev.jsonl sebagai pembanding dan melaporkan kebocoran tanpa teks", async () => {
    const { kode, teks, dibaca } = await jalankan(["--set", "test", "~/set/test.jsonl"], {
      "/home/naja/set/test.jsonl": baris("test-001", TEKS_A),
      "/repo/data/dev.jsonl": baris("dev-001", TEKS_A),
    });
    expect(kode).toBe(1);
    expect(dibaca).toEqual(["/home/naja/set/test.jsonl", "/repo/data/dev.jsonl"]);
    expect(teks).toMatch(/baris 1 \[test-001\]: .*dev-001/);
    expect(teks).not.toContain("Contoh Sejahtera");
  });

  it("Set dev tidak pernah membaca Set test", async () => {
    const { dibaca } = await jalankan([], {
      "/repo/data/dev.jsonl": baris("dev-001", TEKS_A),
      "/repo/data/test.jsonl": baris("test-001", TEKS_B),
    });
    expect(dibaca).toEqual(["/repo/data/dev.jsonl"]);
  });

  it("--banding memakai file pembanding yang diberikan", async () => {
    const { dibaca } = await jalankan(["--set", "dev", "--banding", "lain.jsonl"], {
      "/repo/data/dev.jsonl": baris("dev-001", TEKS_A),
      "/repo/lain.jsonl": baris("x-001", TEKS_B),
    });
    expect(dibaca).toEqual(["/repo/data/dev.jsonl", "/repo/lain.jsonl"]);
  });

  it.each([
    [["--set", "salah"], /--set harus "dev" atau "test"/],
    [["--ngawur"], /Pemakaian/],
    [["tidak-ada.jsonl"], /File tidak ditemukan: \/repo\/tidak-ada.jsonl/],
  ])("argumen %j keluar dengan kode 2", async (argv, pesan) => {
    const { kode, teks } = await jalankan(argv, {});
    expect(kode).toBe(2);
    expect(teks).toMatch(pesan);
  });
});
