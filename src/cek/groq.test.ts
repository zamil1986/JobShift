import { afterEach, describe, expect, it, vi } from "vitest";
import { cek } from "@/cek";
import { buatPenilaiGroq, penilaiGroqDariEnv } from "@/cek/groq";
import { skemaJsonKeluaranAI } from "@/cek/skema-ai";

// Adapter Groq dites tanpa jaringan: SDK menerima `fetch` palsu yang merekam
// permintaan dan mengembalikan respons buatan.

const TEKS =
  "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Hubungi 0812-3456-7890, gaji dibayar mingguan.";

type Panggilan = { url: string; init: RequestInit; body: Record<string, unknown> };

function fetchPalsu(jawab: () => Response) {
  const panggilan: Panggilan[] = [];
  const fetch = vi.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    panggilan.push({ url: String(url), init, body: JSON.parse(String(init.body)) });
    return jawab();
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, panggilan };
}

const responsChat = (content: string | null) =>
  Response.json({
    id: "chatcmpl-uji",
    object: "chat.completion",
    created: 0,
    model: "openai/gpt-oss-120b",
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
  });

const KELUARAN_VALID = {
  label: "risiko_rendah",
  tanda_bahaya: [{ kutipan: "gaji dibayar mingguan", alasan: "Cara pembayaran gaji tidak biasa." }],
  penjelasan: "Penjelasan uji.",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("adapter Groq", () => {
  it("mengirim Teks tersamar ke openai/gpt-oss-120b dengan strict json_schema dari skema Zod", async () => {
    const { fetch, panggilan } = fetchPalsu(() => responsChat(JSON.stringify(KELUARAN_VALID)));

    await cek(TEKS, { ai: buatPenilaiGroq({ apiKey: "kunci-uji", fetch }) });

    expect(panggilan).toHaveLength(1);
    const { url, init, body } = panggilan[0];
    expect(url).toMatch(/\/openai\/v1\/chat\/completions$/);
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer kunci-uji");
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.response_format).toEqual({
      type: "json_schema",
      json_schema: { name: "penilaian_lowongan", strict: true, schema: skemaJsonKeluaranAI() },
    });
    expect(body.stream).toBeFalsy();

    const pesan = body.messages as { role: string; content: string }[];
    expect(pesan.map((m) => m.role)).toEqual(["system", "user"]);
    expect(pesan[1].content).toContain("[NOMOR]");
    expect(JSON.stringify(body)).not.toContain("0812-3456-7890");
  });

  it("memakai system prompt yang byte-identik antar panggilan", async () => {
    const { fetch, panggilan } = fetchPalsu(() => responsChat(JSON.stringify(KELUARAN_VALID)));
    const ai = buatPenilaiGroq({ apiKey: "kunci-uji", fetch });

    await cek(TEKS, { ai });
    await cek(`${TEKS} Teks lain yang berbeda.`, { ai });

    const sistem = panggilan.map((p) => (p.body.messages as { content: string }[])[0].content);
    expect(sistem[0]).toBe(sistem[1]);
  });

  it("jawaban valid menambah Tanda bahaya AI dan sumberPenilaian aturan+AI", async () => {
    const { fetch } = fetchPalsu(() => responsChat(JSON.stringify(KELUARAN_VALID)));

    const hasil = await cek(TEKS, { ai: buatPenilaiGroq({ apiKey: "kunci-uji", fetch }) });

    expect(hasil.sumberPenilaian).toBe("aturan+AI");
    expect(hasil.tandaBahaya.map((t) => [t.sumber, t.kutipan])).toEqual([
      ["ai", "gaji dibayar mingguan"],
    ]);
  });

  it.each([
    ["429", () => Response.json({ error: { message: "rate limit" } }, { status: 429 })],
    ["500", () => Response.json({ error: { message: "server" } }, { status: 500 })],
    ["503", () => new Response("unavailable", { status: 503 })],
    ["content bukan JSON", () => responsChat("ini bukan json")],
    ["content null", () => responsChat(null)],
    ["JSON tidak cocok skema", () => responsChat(JSON.stringify({ label: "aman" }))],
  ])("%s → hasil Aturan saja dengan catatanAI, tanpa retry", async (_nama, jawab) => {
    const { fetch, panggilan } = fetchPalsu(jawab);

    const hasil = await cek(TEKS, { ai: buatPenilaiGroq({ apiKey: "kunci-uji", fetch }) });

    expect(hasil.sumberPenilaian).toBe("aturan");
    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
    expect(panggilan).toHaveLength(1);
  });

  it("meneruskan AbortSignal dari inti ke permintaan HTTP", async () => {
    let signalFetch: AbortSignal | null | undefined;
    const fetch = (async (_url: unknown, init: RequestInit = {}) => {
      signalFetch = init.signal;
      return new Promise<Response>((_selesai, gagal) => {
        init.signal?.addEventListener("abort", () => gagal(new DOMException("aborted", "AbortError")));
      });
    }) as unknown as typeof globalThis.fetch;
    const pengendali = new AbortController();

    const janji = buatPenilaiGroq({ apiKey: "kunci-uji", fetch })("teks", pengendali.signal);
    await vi.waitFor(() => expect(signalFetch).toBeDefined());
    pengendali.abort();

    await expect(janji).rejects.toThrow();
    expect(signalFetch?.aborted).toBe(true);
  });
});

describe("penilaiGroqDariEnv", () => {
  it("tidak membuat adapter kalau GROQ_API_KEY kosong", () => {
    vi.stubEnv("GROQ_API_KEY", "");
    expect(penilaiGroqDariEnv()).toBeUndefined();
  });

  it("membuat adapter dari GROQ_API_KEY", () => {
    vi.stubEnv("GROQ_API_KEY", "kunci-uji");
    expect(penilaiGroqDariEnv()).toEqual(expect.any(Function));
  });
});
