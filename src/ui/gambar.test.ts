import { describe, expect, it } from "vitest";
import { memuatKataTerlarang } from "@/cek";
import { periksaGambar } from "./gambar";
import {
  PESAN_GAMBAR,
  PESAN_OCR_BERHASIL,
  PESAN_OCR_GAGAL,
  PESAN_OCR_KOSONG,
  PESAN_OCR_TERLALU_PANJANG,
  PETUNJUK_SCREENSHOT,
} from "./salinan";

const MB = 1024 * 1024;

describe("periksaGambar", () => {
  it.each(["image/png", "image/jpeg", "image/webp"])("menerima %s", (type) => {
    expect(periksaGambar({ name: "loker", type, size: 300_000 })).toBeNull();
  });

  it.each([
    ["image/gif", "loker.gif"],
    ["image/svg+xml", "loker.svg"],
    ["image/heic", "loker.heic"],
    ["application/pdf", "loker.pdf"],
    ["text/plain", "loker.txt"],
    ["video/mp4", "loker.mp4"],
  ])("menolak tipe lain: %s", (type, name) => {
    expect(periksaGambar({ name, type, size: 300_000 })).toBe("tipe_tidak_didukung");
  });

  it("tidak tertipu nama berakhiran .png kalau tipenya bukan gambar yang didukung", () => {
    expect(periksaGambar({ name: "loker.png", type: "application/pdf", size: 1000 })).toBe(
      "tipe_tidak_didukung",
    );
  });

  // Beberapa browser HP mengirim tipe kosong. Ekstensi nama jadi pegangan terakhir.
  it.each(["loker.png", "loker.JPG", "loker.jpeg", "Screenshot 2026.webp"])(
    "memakai ekstensi kalau tipe kosong: %s",
    (name) => {
      expect(periksaGambar({ name, type: "", size: 1000 })).toBeNull();
    },
  );

  it.each(["loker", "loker.gif", "loker.png.exe"])("menolak tipe kosong tanpa ekstensi gambar: %s", (name) => {
    expect(periksaGambar({ name, type: "", size: 1000 })).toBe("tipe_tidak_didukung");
  });

  it("menerima gambar tepat 5 MB", () => {
    expect(periksaGambar({ name: "loker.png", type: "image/png", size: 5 * MB })).toBeNull();
  });

  it("menolak gambar 1 byte di atas 5 MB", () => {
    expect(periksaGambar({ name: "loker.png", type: "image/png", size: 5 * MB + 1 })).toBe(
      "terlalu_besar",
    );
  });

  it("menolak file kosong", () => {
    expect(periksaGambar({ name: "loker.png", type: "image/png", size: 0 })).toBe("kosong");
  });

  it("tipe yang salah dilaporkan lebih dulu daripada ukuran", () => {
    expect(periksaGambar({ name: "loker.pdf", type: "application/pdf", size: 9 * MB })).toBe(
      "tipe_tidak_didukung",
    );
  });

  it("setiap penolakan punya pesan yang menyebut jalan keluarnya", () => {
    expect(PESAN_GAMBAR.tipe_tidak_didukung).toMatch(/PNG, JPG, atau WebP/);
    expect(PESAN_GAMBAR.terlalu_besar).toMatch(/5 MB/);
    for (const pesan of Object.values(PESAN_GAMBAR)) {
      expect(pesan).toMatch(/tempel/i);
    }
  });
});

describe("copy screenshot", () => {
  it.each([
    ...Object.values(PESAN_GAMBAR),
    PETUNJUK_SCREENSHOT,
    PESAN_OCR_BERHASIL,
    PESAN_OCR_TERLALU_PANJANG,
    PESAN_OCR_KOSONG,
    PESAN_OCR_GAGAL,
  ])("tidak memuat kata terlarang: %s", (teks) => {
    expect(memuatKataTerlarang(teks)).toBe(false);
  });

  it("OCR gagal atau kosong mengarahkan pengguna untuk menempel teks", () => {
    expect(PESAN_OCR_GAGAL).toMatch(/tempel teks/i);
    expect(PESAN_OCR_KOSONG).toMatch(/tempel teks/i);
  });
});
