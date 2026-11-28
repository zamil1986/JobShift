import { describe, expect, it } from "vitest";
import { PROGRES_AWAL, progresOcr } from "./ocr";

describe("progresOcr", () => {
  it("menyebut tahap persiapan tanpa persen", () => {
    expect(progresOcr({ status: "loading tesseract core", progress: 0.5 })).toEqual(PROGRES_AWAL);
    expect(progresOcr({ status: "loading language traineddata", progress: 0.3 })).toEqual({
      teks: "Memuat data bahasa…",
      persen: null,
    });
    expect(progresOcr({ status: "initializing api", progress: 1 })).toEqual(PROGRES_AWAL);
  });

  // Dibulatkan ke bawah per 10% supaya screen reader tidak dibanjiri pengumuman.
  it.each([
    [0, 0],
    [0.07, 0],
    [0.42, 40],
    [0.999, 90],
    [1, 100],
  ])("membaca teks %d → %d%", (progress, persen) => {
    expect(progresOcr({ status: "recognizing text", progress })).toEqual({
      teks: `Membaca teks dari screenshot… ${persen}%`,
      persen,
    });
  });

  it("status yang tidak dikenal tetap memberi teks persiapan", () => {
    expect(progresOcr({ status: "something new", progress: 0.2 })).toEqual(PROGRES_AWAL);
  });
});
