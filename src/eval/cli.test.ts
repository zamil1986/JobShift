import { describe, expect, it, vi } from "vitest";
import { penilaiPalsu } from "@/cek/ai";
import { jalankanEval, parseArgumenEval } from "./cli";

const CONTOH_DEV = [
  JSON.stringify({
    id: "1",
    teks: "Lowongan kerja gudang, segera transfer biaya seragam Rp200.000 sekarang juga.",
    kebenaran: "palsu",
    modus: "lokal",
    sumber: "wa",
    sintetis: false,
  }),
  JSON.stringify({
    id: "2",
    teks: "PT Nusantara Sejahtera membuka lowongan staf administrasi di Jakarta. Kirim CV ke HRD.",
    kebenaran: "asli",
    sumber: "portal",
    sintetis: true,
  }),
].join("\n");

describe("parseArgumenEval", () => {
  it("memakai Set dev dan model default saat tanpa argumen", () => {
    expect(parseArgumenEval([])).toEqual({
      set: "dev",
      pathDataset: "data/dev.jsonl",
      model: "openai/gpt-oss-120b",
      pathOutput: null,
    });
  });

  it("membaca --set test dan --model gpt-oss-20b", () => {
    expect(parseArgumenEval(["--set", "test", "--model", "gpt-oss-20b"])).toEqual({
      set: "test",
      pathDataset: "data/test.jsonl",
      model: "openai/gpt-oss-20b",
      pathOutput: "src/data/hasil-eval.json",
    });
  });

  it("mendukung argumen gaya npm tanpa pemisah -- (npm_config_set)", () => {
    expect(parseArgumenEval(["test"], { npm_config_set: "true" })).toMatchObject({
      set: "test",
      pathDataset: "data/test.jsonl",
      pathOutput: "src/data/hasil-eval.json",
    });
  });

  it("menolak nilai --set di luar dev atau test", () => {
    expect(() => parseArgumenEval(["--set", "lain"])).toThrow(/dev|test/i);
  });
});

describe("jalankanEval", () => {
  it("membaca data/dev.jsonl secara default, mencetak laporan 3 mode, dan tidak menulis file hasil test", async () => {
    const bacaFile = vi.fn(async () => CONTOH_DEV);
    const tulisFile = vi.fn(async () => {});
    const keluaran: string[] = [];
    const buatPenilai = vi.fn(() =>
      penilaiPalsu({
        label: "risiko_rendah",
        tanda_bahaya: [],
        penjelasan: "Tidak ditemukan tanda bahaya.",
      }),
    );

    const hasil = await jalankanEval([], {
      bacaFile,
      tulisFile,
      cetak: (teks) => keluaran.push(teks),
      buatPenilai,
    });

    expect(bacaFile).toHaveBeenCalledWith("data/dev.jsonl");
    expect(tulisFile).not.toHaveBeenCalled();
    expect(buatPenilai).toHaveBeenCalledWith("openai/gpt-oss-120b");
    expect(hasil.dataset).toBe("dev");

    const laporan = keluaran.join("\n");
    expect(laporan).toContain("aturan");
    expect(laporan).toContain("AI saja");
    expect(laporan).toContain("gabungan");
    expect(laporan).toContain("1/1");
    expect(laporan).toContain("sintetis");
    expect(laporan).toContain("p95");
    expect(laporan).not.toContain("biaya seragam");
    expect(laporan).not.toContain("PT Nusantara Sejahtera");
  });

  it("pada --set test membaca data/test.jsonl, memakai --model gpt-oss-20b, dan menulis JSON hasil untuk Cara kerja", async () => {
    const bacaFile = vi.fn(async () => CONTOH_DEV);
    const tulisFile = vi.fn(async () => {});
    const buatPenilai = vi.fn(() =>
      penilaiPalsu({
        label: "risiko_rendah",
        tanda_bahaya: [],
        penjelasan: "Tidak ada temuan.",
      }),
    );

    const hasil = await jalankanEval(["--set", "test", "--model", "gpt-oss-20b"], {
      bacaFile,
      tulisFile,
      cetak: () => {},
      buatPenilai,
      sekarang: () => new Date("2026-11-27T13:00:00.000Z"),
    });

    expect(bacaFile).toHaveBeenCalledWith("data/test.jsonl");
    expect(buatPenilai).toHaveBeenCalledWith("openai/gpt-oss-20b");
    expect(tulisFile).toHaveBeenCalledTimes(1);

    const [pathDitulis, isiDitulis] = tulisFile.mock.calls[0] as unknown as [string, string];
    expect(pathDitulis).toBe("src/data/hasil-eval.json");
    const json = JSON.parse(isiDitulis);
    expect(json).toMatchObject({
      dataset: "test",
      model: "openai/gpt-oss-20b",
      dibuatPada: "2026-11-27T13:00:00.000Z",
      jumlahContoh: 2,
      jumlahSintetis: 1,
    });
    expect(hasil.model).toBe("openai/gpt-oss-20b");
  });
});
