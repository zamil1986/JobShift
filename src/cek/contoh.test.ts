import { describe, expect, it } from "vitest";
import { cek } from "@/cek";
import { penilaiPerekam } from "@/cek/ai";
import { CONTOH, type IdContoh } from "@/cek/contoh";
import { penilaiStatis } from "@/cek/statis";

const contoh = (id: IdContoh) => CONTOH.find((c) => c.id === id)!.teks;

describe("Contoh siap pakai (FR-08)", () => {
  it("ada empat contoh: tiga Modus Palsu dan satu loker resmi", () => {
    expect(CONTOH.map((c) => c.id)).toEqual(["tugas", "lokal", "luar_negeri", "resmi"]);
  });

  it.each([
    ["tugas", "tugas"],
    ["lokal", "lokal"],
    ["luar_negeri", "luar_negeri"],
  ] as const)("contoh %s berlabel waspada atau bahaya dengan Modus terkuat %s", async (id, modus) => {
    const hasil = await cek(contoh(id), { ai: penilaiStatis(penilaiPerekam().penilai) });

    expect(["waspada", "bahaya"]).toContain(hasil.label);
    expect(hasil.modusTerkuat).toBe(modus);
  });

  it.each(["tugas", "lokal", "luar_negeri"] as const)(
    "Tanda bahaya AI tersimpan untuk contoh %s lolos penyaringan inti",
    async (id) => {
      const hasil = await cek(contoh(id), { ai: penilaiStatis(penilaiPerekam().penilai) });

      expect(hasil.tandaBahaya.filter((t) => t.sumber === "ai")).toHaveLength(1);
    },
  );

  it("contoh loker resmi berlabel risiko_rendah", async () => {
    const hasil = await cek(contoh("resmi"), { ai: penilaiStatis(penilaiPerekam().penilai) });

    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it.each(CONTOH.map((c) => [c.id, c.teks]))(
    "contoh %s memakai keluaran AI tersimpan tanpa memanggil AI cadangan",
    async (_id, teks) => {
      const { penilai, rekaman } = penilaiPerekam();

      const hasil = await cek(teks, { ai: penilaiStatis(penilai) });

      expect(rekaman).toEqual([]);
      expect(hasil.sumberPenilaian).toBe("aturan+AI");
      expect(hasil.catatanAI).toBeUndefined();
    },
  );

  it.each(CONTOH.map((c) => [c.id, c.teks]))(
    "Penjelasan contoh %s berasal dari keluaran tersimpan, jadi selalu sama",
    async (_id, teks) => {
      const ai = penilaiStatis(penilaiPerekam().penilai);
      const tanpaAI = await cek(teks);

      const pertama = await cek(teks, { ai });
      const kedua = await cek(teks, { ai });

      expect(pertama).toEqual(kedua);
      // Penjelasan tersimpan lolos filter, bukan jatuh ke templat.
      expect(pertama.penjelasan).not.toBe(tanpaAI.penjelasan);
    },
  );

  it("contoh dengan spasi dan baris berbeda tetap dikenali", async () => {
    const { penilai, rekaman } = penilaiPerekam();
    const teks = `  ${contoh("tugas").replace(/\. /g, ".\r\n\r\n")}\n`;

    await cek(teks, { ai: penilaiStatis(penilai) });

    expect(rekaman).toEqual([]);
  });

  it("Teks yang bukan contoh diteruskan ke AI cadangan", async () => {
    const { penilai, rekaman } = penilaiPerekam();
    const teks = `${contoh("tugas")} Tambahan satu kalimat dari pengguna.`;

    const hasil = await cek(teks, { ai: penilaiStatis(penilai) });

    expect(rekaman).toHaveLength(1);
    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
  });

  it("Teks contoh tidak memuat data yang disamarkan selain email fiktif", () => {
    for (const { teks } of CONTOH) {
      expect(teks).not.toMatch(/\b(?:\+?62|0)8\d{8,}/);
      expect(teks).not.toMatch(/\b\d{10,16}\b/);
    }
  });
});
