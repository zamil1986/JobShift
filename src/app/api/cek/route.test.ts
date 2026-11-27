import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

// Hanya untuk tes jalur 500: membuat cek() gagal tak terduga dengan error yang
// pesannya memuat isi Teks. Selain itu cek() asli yang dipakai.
const gagalkanCek = vi.hoisted(() => ({ aktif: false }));
vi.mock("@/cek", async (importOriginal) => {
  const asli = await importOriginal<typeof import("@/cek")>();
  return {
    ...asli,
    cek: (teks: string, opsi?: Parameters<typeof asli.cek>[1]) =>
      gagalkanCek.aktif ? Promise.reject(new Error(`gagal menilai: ${teks}`)) : asli.cek(teks, opsi),
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

beforeEach(() => {
  // Tes route tidak pernah memanggil Groq sungguhan, walaupun shell punya API key.
  vi.stubEnv("GROQ_API_KEY", "");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  gagalkanCek.aktif = false;
});

/** Mengganti fetch global dengan respons Groq buatan, dan mengaktifkan GROQ_API_KEY. */
function groqPalsu(respons: () => Response) {
  vi.stubEnv("GROQ_API_KEY", "kunci-uji");
  const fetch = vi.fn(async () => respons());
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const responsGroq = (keluaran: unknown) =>
  Response.json({
    id: "chatcmpl-uji",
    object: "chat.completion",
    created: 0,
    model: "openai/gpt-oss-120b",
    choices: [
      { index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(keluaran) } },
    ],
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
      langkahAman: {
        umum: expect.arrayContaining([
          expect.objectContaining({ tautan: expect.objectContaining({ domain: "karirhub.kemnaker.go.id" }) }),
        ]),
        spesifik: [],
      },
      langkahDarurat: null,
      sumberPenilaian: "aturan",
      // Tes ini berjalan tanpa GROQ_API_KEY (lihat beforeEach).
      catatanAI: "ai_tidak_tersedia",
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

describe("POST /api/cek dengan Groq", () => {
  it("menilai dengan Groq kalau GROQ_API_KEY ada", async () => {
    const fetch = groqPalsu(() =>
      responsGroq({
        label: "risiko_rendah",
        tanda_bahaya: [{ kutipan: "kantor cabang", alasan: "Alasan uji." }],
        penjelasan: "Penjelasan uji.",
      }),
    );

    const res = await kirim(JSON.stringify({ teks: TEKS_LOWONGAN }));
    const hasil = await res.json();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(hasil.sumberPenilaian).toBe("aturan+AI");
    expect(hasil.tandaBahaya).toEqual([expect.objectContaining({ sumber: "ai", kutipan: "kantor cabang" })]);
  });

  it("menjawab 200 dengan catatanAI kalau Groq menolak (429)", async () => {
    groqPalsu(() => Response.json({ error: { message: "rate limit" } }, { status: 429 }));

    const res = await kirim(JSON.stringify({ teks: TEKS_LOWONGAN }));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ sumberPenilaian: "aturan", catatanAI: "ai_tidak_tersedia" });
  });

  it("tanpa GROQ_API_KEY tidak memanggil jaringan, dinilai Aturan saja, dan memberi catatanAI", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const hasil = await (await kirim(JSON.stringify({ teks: TEKS_LOWONGAN }))).json();

    expect(fetch).not.toHaveBeenCalled();
    expect(hasil).toMatchObject({ sumberPenilaian: "aturan", catatanAI: "ai_tidak_tersedia" });
  });
});
