import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

// Hanya untuk tes jalur 500: membuat cek() gagal tak terduga dengan error yang
// pesannya memuat isi Teks. Selain itu cek() asli yang dipakai.
const gagalkanCek = vi.hoisted(() => ({ aktif: false }));
vi.mock("@/cek", async (importOriginal) => {
  const asli = await importOriginal<typeof import("@/cek")>();
  return {
    ...asli,
    cek: (teks: string) =>
      gagalkanCek.aktif ? Promise.reject(new Error(`gagal menilai: ${teks}`)) : asli.cek(teks),
  };
});

const TEKS_LOWONGAN =
  "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD.";

function kirim(body: string, contentType = "application/json") {
  return POST(
    new Request("http://localhost/api/cek", {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  gagalkanCek.aktif = false;
});

describe("POST /api/cek", () => {
  it("menjawab 200 dengan HasilCek untuk Teks valid", async () => {
    const res = await kirim(JSON.stringify({ teks: TEKS_LOWONGAN }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      label: "risiko_rendah",
      skor: 0,
      tandaBahaya: [],
      tandaBahayaTersirat: [],
      modus: [],
      modusTerkuat: null,
      penjelasan: "Tidak ditemukan tanda bahaya di teks ini.",
      langkahAman: { umum: [], spesifik: [] },
      langkahDarurat: null,
      sumberPenilaian: "aturan",
    });
  });

  it.each([
    ["teks_kosong", "   "],
    ["teks_terlalu_pendek", "a".repeat(49)],
    ["teks_terlalu_panjang", "a".repeat(3001)],
  ])("menjawab 400 %s untuk Teks dengan panjang di luar batas", async (kode, teks) => {
    const res = await kirim(JSON.stringify({ teks }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.kode).toBe(kode);
    expect(body.error.pesan).toEqual(expect.any(String));
  });

  it("memakai pesan FR-01 untuk Teks terlalu pendek", async () => {
    const res = await kirim(JSON.stringify({ teks: "a".repeat(49) }));

    expect((await res.json()).error.pesan).toBe(
      "Teksnya terlalu pendek untuk dinilai, tempel seluruh pesan lowongannya.",
    );
  });

  it.each([
    ["JSON rusak", "{teks: tanpa kutip"],
    ["body kosong", ""],
    ["bukan objek", JSON.stringify("hanya string")],
    ["null", "null"],
    ["tanpa kolom teks", JSON.stringify({ isi: TEKS_LOWONGAN })],
    ["teks bukan string", JSON.stringify({ teks: 12345 })],
    ["teks berupa array", JSON.stringify({ teks: [TEKS_LOWONGAN] })],
  ])("menjawab 400 format_tidak_valid untuk %s", async (_nama, body) => {
    const res = await kirim(body);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toEqual({
      kode: "format_tidak_valid",
      pesan: expect.any(String),
    });
  });

  it("tidak pernah menulis isi Teks ke log", async () => {
    const tulisan: unknown[] = [];
    for (const metode of ["log", "info", "warn", "error", "debug"] as const) {
      vi.spyOn(console, metode).mockImplementation((...args: unknown[]) => {
        tulisan.push(...args);
      });
    }
    const penanda = "PENANDA-RAHASIA-081234567890";

    await kirim(JSON.stringify({ teks: `${TEKS_LOWONGAN} ${penanda}` }));
    await kirim(JSON.stringify({ teks: penanda }));
    await kirim(`{"teks": "${penanda}"`);

    expect(JSON.stringify(tulisan)).not.toContain("PENANDA-RAHASIA");
  });

  it("menjawab 500 tanpa menulis isi Teks ke log saat Cek gagal tak terduga", async () => {
    const tulisan: unknown[] = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      tulisan.push(...args);
    });
    gagalkanCek.aktif = true;

    const res = await kirim(
      JSON.stringify({ teks: `${TEKS_LOWONGAN} PENANDA-RAHASIA-081234567890` }),
    );

    expect(res.status).toBe(500);
    expect((await res.json()).error).toEqual({
      kode: "kesalahan_server",
      pesan: "Cek sedang bermasalah. Coba lagi sebentar lagi.",
    });
    expect(tulisan.length).toBeGreaterThan(0);
    expect(JSON.stringify(tulisan)).not.toContain("PENANDA-RAHASIA");
  });
});
