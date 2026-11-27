import { describe, expect, it } from "vitest";
import type { Modus } from "@/cek";
import { lolos, validasiDataset } from "@/dataset/validasi";

type Baris = Record<string, unknown>;

/** Contoh yang sah. `n` membuat id dan teks unik. */
const contoh = (n: number, ubah: Baris = {}): Baris => ({
  id: `dev-${String(n).padStart(3, "0")}`,
  teks: `Lowongan contoh nomor ${n} untuk posisi admin gudang di kota besar, lamar lewat situs resmi.`,
  kebenaran: "asli",
  sumber: "https://contoh.test/loker",
  sintetis: false,
  ...ubah,
});

const jsonl = (...baris: (Baris | string)[]) =>
  baris.map((b) => (typeof b === "string" ? b : JSON.stringify(b))).join("\n");

/** Set dev 60 contoh yang memenuhi semua target: 30 palsu (10 per Modus), 30 asli. */
const setDevLengkap = () => {
  const modus: Modus[] = ["tugas", "lokal", "luar_negeri"];
  return Array.from({ length: 60 }, (_, i) =>
    i < 30 ? contoh(i + 1, { kebenaran: "palsu", modus: modus[i % 3] }) : contoh(i + 1),
  );
};

describe("validasiDataset: per baris", () => {
  it("contoh yang sah tidak memberi galat dan dihitung di ringkasan", () => {
    const laporan = validasiDataset(
      jsonl(contoh(1, { kebenaran: "palsu", modus: "tugas", sintetis: true }), contoh(2)),
      "dev",
    );
    expect(laporan.galat).toEqual([]);
    expect(laporan.ringkasan).toMatchObject({
      total: 2,
      palsu: 1,
      asli: 1,
      sintetis: 1,
      modusPalsu: { tugas: 1, lokal: 0, luar_negeri: 0 },
      palsuTanpaModus: 0,
    });
  });

  it("baris kosong dilewati dan nomor baris tetap sesuai file", () => {
    const laporan = validasiDataset(jsonl(contoh(1), "", "{bukan json", ""), "dev");
    expect(laporan.ringkasan.total).toBe(1);
    expect(laporan.galat).toHaveLength(1);
    expect(laporan.galat[0]).toMatchObject({ baris: 3 });
    expect(laporan.galat[0].pesan).toMatch(/JSON/);
  });

  it("baris yang bukan objek ditolak", () => {
    const laporan = validasiDataset(jsonl("[1, 2]"), "dev");
    expect(laporan.galat[0].pesan).toMatch(/objek/);
  });

  it.each([
    ["id kosong", { id: " " }, /id/],
    ["teks bukan string", { teks: 5 }, /teks/],
    ["kebenaran di luar palsu/asli", { kebenaran: "fake" }, /kebenaran/],
    ["sumber kosong", { sumber: "" }, /sumber/],
    ["sintetis bukan boolean", { sintetis: "ya" }, /sintetis/],
    ["modus tidak dikenal", { kebenaran: "palsu", modus: "investasi" }, /modus/],
    ["modus pada contoh asli", { kebenaran: "asli", modus: "lokal" }, /modus/],
    ["field tak dikenal", { label: "bahaya" }, /label/],
  ])("%s memberi galat", (_, ubah, pesan) => {
    const laporan = validasiDataset(jsonl(contoh(1, ubah)), "dev");
    expect(laporan.galat).toHaveLength(1);
    expect(laporan.galat[0]).toMatchObject({ baris: 1, id: expect.any(String) });
    expect(laporan.galat[0].pesan).toMatch(pesan);
  });

  it("field wajib yang hilang memberi galat", () => {
    const tanpaSumber = contoh(1);
    delete tanpaSumber.sumber;
    const laporan = validasiDataset(jsonl(tanpaSumber), "dev");
    expect(laporan.galat[0].pesan).toMatch(/sumber/);
  });

  it.each([
    ["terlalu pendek", "Kerja dari rumah, gaji besar.", /pendek/],
    ["terlalu panjang", "a".repeat(3001), /panjang/],
  ])("teks %s ditolak karena cek() juga menolaknya", (_, teks, pesan) => {
    const laporan = validasiDataset(jsonl(contoh(1, { teks })), "dev");
    expect(laporan.galat[0].pesan).toMatch(pesan);
  });

  it("id ganda memberi galat di baris kedua", () => {
    const laporan = validasiDataset(jsonl(contoh(1), contoh(2, { id: "dev-001" })), "dev");
    expect(laporan.galat).toEqual([
      expect.objectContaining({ baris: 2, pesan: expect.stringMatching(/id .*baris 1/) }),
    ]);
  });

  it("teks ganda (beda spasi dan huruf besar) memberi galat", () => {
    const teks = "Lowongan admin online, kerja dari HP, komisi besar setiap hari tanpa modal.";
    const laporan = validasiDataset(
      jsonl(contoh(1, { teks }), contoh(2, { teks: `  ${teks.toUpperCase().replace(/ /g, "   ")}` })),
      "dev",
    );
    expect(laporan.galat).toEqual([
      expect.objectContaining({ baris: 2, pesan: expect.stringMatching(/teks sama .*baris 1/) }),
    ]);
  });
});

describe("validasiDataset: Penyamaran", () => {
  const dengan = (sisipan: string) =>
    validasiDataset(
      jsonl(contoh(1, { teks: `Lowongan admin gudang PT Contoh Besar, hubungi ${sisipan} untuk daftar.` })),
      "dev",
    );

  it.each(["[NOMOR]", "[EMAIL]", "[REKENING]", "[NIK]"])(
    "penanda %s diberi peringatan karena menghapus sinyal yang dibaca Aturan",
    (penanda) => {
      const laporan = dengan(penanda);
      expect(laporan.galat).toEqual([]);
      expect(laporan.peringatan).toEqual([
        expect.objectContaining({ baris: 1, pesan: expect.stringContaining(penanda) }),
      ]);
    },
  );

  it.each(["0812-3456-7890", "+62 812 3456 7890", "rekening 1234567890", "NIK 3174012345678901"])(
    "angka yang belum disamarkan (%s) diberi peringatan",
    (sisipan) => {
      const laporan = dengan(sisipan);
      expect(laporan.peringatan).toHaveLength(1);
      expect(laporan.peringatan[0].pesan).toMatch(/ke-1 .*0000/);
      // Angka yang mungkin asli tidak boleh tersalin ke keluaran.
      expect(laporan.peringatan[0].pesan.replace(/\D/g, "")).not.toContain(sisipan.replace(/\D/g, ""));
    },
  );

  it.each(["0812-0000-1111", "+62 812 0000 1111", "rekening 0000111122", "NIK 3174000012345678"])(
    "angka samaran yang memuat 0000 (%s) tidak diberi peringatan",
    (sisipan) => {
      expect(dengan(sisipan).peringatan).toEqual([]);
    },
  );

  it("nominal gaji dan email tidak diberi peringatan", () => {
    expect(dengan("hrd.rekrut@gmail.com, gaji Rp 15000000 per bulan").peringatan).toEqual([]);
  });
});

describe("validasiDataset: target set", () => {
  const target = (laporan: ReturnType<typeof validasiDataset>, nama: RegExp) =>
    laporan.target.find((t) => nama.test(t.nama));

  it("Set dev lengkap memenuhi semua target dan lolos", () => {
    const laporan = validasiDataset(jsonl(...setDevLengkap()), "dev");
    expect(laporan.target.every((t) => t.terpenuhi)).toBe(true);
    expect(lolos(laporan)).toBe(true);
  });

  it("jumlah contoh harus 60 untuk Set dev dan 40 untuk Set test", () => {
    const dev = validasiDataset(jsonl(...setDevLengkap().slice(0, 59)), "dev");
    expect(target(dev, /Jumlah/)).toMatchObject({ terpenuhi: false, detail: "59/60" });
    expect(lolos(dev)).toBe(false);

    const test = validasiDataset(jsonl(...setDevLengkap().slice(10, 50)), "test");
    expect(target(test, /Jumlah/)).toMatchObject({ terpenuhi: true, detail: "40/40" });
  });

  it("Palsu dan Asli harus seimbang: porsi Palsu 40–60%", () => {
    const palsu = (n: number) => contoh(n, { kebenaran: "palsu", modus: "tugas" });
    const seimbang = [...Array.from({ length: 6 }, (_, i) => palsu(i)), ...[6, 7, 8, 9].map((n) => contoh(n))];
    expect(target(validasiDataset(jsonl(...seimbang), "test"), /seimbang/)?.terpenuhi).toBe(true);

    const timpang = [...Array.from({ length: 7 }, (_, i) => palsu(i)), ...[7, 8, 9].map((n) => contoh(n))];
    expect(target(validasiDataset(jsonl(...timpang), "test"), /seimbang/)?.terpenuhi).toBe(false);
  });

  it("Set dev butuh minimal 5 Palsu per Modus; Set test tidak", () => {
    const kurang = setDevLengkap().map((b, i) =>
      b.modus === "luar_negeri" && i > 12 ? { ...b, modus: "lokal" } : b,
    );
    const dev = validasiDataset(jsonl(...kurang), "dev");
    expect(target(dev, /Luar negeri/)).toMatchObject({ terpenuhi: false, detail: "4/5" });
    expect(target(dev, /Tugas/)?.terpenuhi).toBe(true);

    const test = validasiDataset(jsonl(...kurang.slice(10, 50)), "test");
    expect(target(test, /Modus/)).toBeUndefined();
  });

  it("galat apa pun membuat set tidak lolos walau target terpenuhi", () => {
    const laporan = validasiDataset(jsonl(...setDevLengkap(), "{rusak"), "dev");
    expect(lolos(laporan)).toBe(false);
  });
});

describe("validasiDataset: kebocoran antarset", () => {
  it("teks yang juga ada di set pembanding memberi galat tanpa menyalin teksnya", () => {
    const dev = jsonl(contoh(1), contoh(2));
    const test = jsonl(contoh(2, { id: "test-001" }), contoh(3, { id: "test-002" }));
    const laporan = validasiDataset(test, "test", { pembanding: dev });
    expect(laporan.galat).toEqual([
      expect.objectContaining({ baris: 1, id: "test-001", pesan: expect.stringMatching(/dev-002/) }),
    ]);
    expect(laporan.galat[0].pesan).not.toContain("admin gudang");
  });
});
