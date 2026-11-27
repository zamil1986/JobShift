import { describe, expect, it, vi } from "vitest";

// File terpisah: SDK Groq menyimpan fungsi log yang sudah di-bind ke `console`
// sejak log pertama, jadi spy harus terpasang sebelum klien pertama dipakai.
// Vitest memuat ulang modul per file, jadi di sini cache-nya masih kosong.

const tulisan: unknown[] = [];
for (const metode of ["log", "info", "warn", "error", "debug"] as const) {
  vi.spyOn(console, metode).mockImplementation((...args: unknown[]) => {
    tulisan.push(...args);
  });
}

describe("adapter Groq: log", () => {
  it("tidak menulis Teks ke log, walaupun GROQ_LOG=debug", async () => {
    vi.stubEnv("GROQ_LOG", "debug");
    const { cek } = await import("@/cek");
    const { buatPenilaiGroq } = await import("@/cek/groq");
    const fetch = (async () =>
      Response.json({ error: { message: "x" } }, { status: 500 })) as unknown as typeof globalThis.fetch;

    const hasil = await cek(
      "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. PENANDA-RAHASIA gaji mingguan.",
      { ai: buatPenilaiGroq({ apiKey: "kunci-uji", fetch }) },
    );

    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
    expect(JSON.stringify(tulisan)).not.toContain("PENANDA-RAHASIA");
  });
});
