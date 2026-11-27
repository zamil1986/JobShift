import { describe, expect, it } from "vitest";
import { memuatKataTerlarang } from "@/cek";
import { KATALOG } from "@/cek/aturan/katalog";
import { SEMUA_LANGKAH } from "@/cek/langkah";
import {
  PENJELASAN_LABEL,
  PENJELASAN_MODUS,
  PENJELASAN_RISIKO_RENDAH_ADA_TANDA,
} from "@/cek/penjelasan";
import { TAGLINE, TAMPILAN_LABEL } from "@/ui/salinan";

describe("memuatKataTerlarang", () => {
  it.each([
    "Lowongan ini aman.",
    "Perusahaan ini ASLI dan resmi.",
    "Tawarannya legit, langsung daftar saja.",
    "Agen terpercaya sejak 2010.",
    "Aman-aman saja kok, Kak.",
    "Ini asli, bukan penipuan!",
  ])("menandai kata utuh terlarang: %s", (teks) => {
    expect(memuatKataTerlarang(teks)).toBe(true);
  });

  it.each([
    "Jaga keamanan akunmu dan amankan PIN.",
    "Tawaran ini meminta keaslian dokumen.",
    "Cek izin di migran-aman.kp2mi.go.id sebelum mendaftar.",
    "Buka https://migran-aman.kp2mi.go.id/cek-legalitas untuk cek izin.",
    "Cek di situs Migran Aman milik KP2MI.",
    TAGLINE,
  ])("tidak menandai kata lain, domain resmi, nama layanan, atau tagline: %s", (teks) => {
    expect(memuatKataTerlarang(teks)).toBe(false);
  });

  it("tetap menandai kata terlarang di luar domain resmi pada teks yang sama", () => {
    expect(memuatKataTerlarang("Situs migran-aman.kp2mi.go.id bilang perekrut ini aman.")).toBe(true);
  });
});

describe("copy statis hasil tidak memuat kata terlarang", () => {
  const copy: [string, string][] = [
    ...Object.entries(TAMPILAN_LABEL).map(([k, v]) => [`Label ${k}`, v.kata] as [string, string]),
    ...Object.entries(PENJELASAN_LABEL).map(([k, v]) => [`Penjelasan Label ${k}`, v] as [string, string]),
    ["Penjelasan Risiko rendah dengan Tanda bahaya", PENJELASAN_RISIKO_RENDAH_ADA_TANDA],
    ...Object.entries(PENJELASAN_MODUS).map(([k, v]) => [`Penjelasan Modus ${k}`, v] as [string, string]),
    ...KATALOG.map((a) => [`alasan ${a.id}`, a.alasan] as [string, string]),
    ...SEMUA_LANGKAH.flatMap((l) => [
      ["Langkah", l.teks] as [string, string],
      ...(l.tautan ? [["domain Langkah", l.tautan.domain] as [string, string]] : []),
    ]),
  ];

  it("memeriksa semua bagian copy", () => {
    expect(copy.length).toBeGreaterThan(KATALOG.length + 10);
  });

  it.each(copy)("%s: %s", (_asal, teks) => {
    expect(memuatKataTerlarang(teks)).toBe(false);
  });
});
