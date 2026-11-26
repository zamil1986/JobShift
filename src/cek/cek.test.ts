import { describe, expect, it } from "vitest";
import { cek } from "@/cek";

/** Teks tanpa spasi di ujung yang panjangnya persis `n` karakter. */
const teksSepanjang = (n: number) => "a".repeat(n);

const PESAN_TERLALU_PENDEK =
  "Teksnya terlalu pendek untuk dinilai, tempel seluruh pesan lowongannya.";

describe("cek: panjang Teks dihitung setelah trim", () => {
  it.each([
    ["kosong", ""],
    ["hanya spasi dan baris baru", "   \n\t  "],
  ])("menolak Teks %s dengan kode teks_kosong", async (_nama, teks) => {
    await expect(cek(teks)).rejects.toMatchObject({ kode: "teks_kosong" });
  });

  it("menolak 49 karakter dengan pesan FR-01", async () => {
    await expect(cek(teksSepanjang(49))).rejects.toMatchObject({
      kode: "teks_terlalu_pendek",
      pesan: PESAN_TERLALU_PENDEK,
    });
  });

  it("menolak 49 karakter walaupun diberi spasi di ujung hingga lebih dari 50", async () => {
    await expect(cek(`   ${teksSepanjang(49)}\n\n  `)).rejects.toMatchObject({
      kode: "teks_terlalu_pendek",
    });
  });

  it("menerima tepat 50 karakter", async () => {
    await expect(cek(teksSepanjang(50))).resolves.toMatchObject({ label: "risiko_rendah" });
  });

  it("menerima tepat 3.000 karakter walaupun diberi spasi di ujung", async () => {
    await expect(cek(`  ${teksSepanjang(3000)}  \n`)).resolves.toMatchObject({
      label: "risiko_rendah",
    });
  });

  it("menolak 3.001 karakter dengan kode teks_terlalu_panjang", async () => {
    await expect(cek(teksSepanjang(3001))).rejects.toMatchObject({
      kode: "teks_terlalu_panjang",
      pesan: expect.stringContaining("3.000"),
    });
  });

  it("tidak menyertakan isi Teks di pesan error", async () => {
    const teks = "RAHASIA-0812345678";
    const galat = await cek(teks).catch((e: unknown) => e);

    expect(galat).toBeInstanceOf(Error);
    expect(String((galat as Error).message)).not.toContain("RAHASIA");
  });
});

const TEKS_LOWONGAN =
  "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD.";

describe("cek: Teks valid tanpa Aturan", () => {
  it("memberi Label Risiko rendah dengan Skor 0", async () => {
    const hasil = await cek(TEKS_LOWONGAN);

    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.skor).toBe(0);
  });

  it("tidak memuat Tanda bahaya, Modus, atau Langkah darurat, dan dinilai oleh Aturan saja", async () => {
    const hasil = await cek(TEKS_LOWONGAN);

    expect(hasil).toMatchObject({
      tandaBahaya: [],
      tandaBahayaTersirat: [],
      modus: [],
      modusTerkuat: null,
      langkahDarurat: null,
      sumberPenilaian: "aturan",
    });
  });

  it("memberi Penjelasan singkat yang tidak kosong", async () => {
    const hasil = await cek(TEKS_LOWONGAN);

    expect(hasil.penjelasan).toBe("Tidak ditemukan tanda bahaya di teks ini.");
  });

  it("memberi hasil identik untuk Teks yang sama", async () => {
    expect(await cek(TEKS_LOWONGAN)).toEqual(await cek(TEKS_LOWONGAN));
  });

  it("menerima adapter AI lewat opsi { ai }", async () => {
    const hasil = await cek(TEKS_LOWONGAN, { ai: async () => null });

    expect(hasil.label).toBe("risiko_rendah");
  });
});
