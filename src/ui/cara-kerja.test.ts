import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cek, memuatKataTerlarang } from "@/cek";
import { RINGKASAN_ATURAN } from "@/cek/ringkasan-aturan";
import { CONTOH_HASIL_TEST } from "@/eval/contoh-hasil.fixture";
import { bacaHasilEval } from "@/eval/hasil-tersimpan";
import { FormCek } from "./FormCek";
import { IsiCaraKerja } from "./IsiCaraKerja";
import { TampilanHasil } from "./TampilanHasil";

const HASIL = bacaHasilEval(JSON.stringify(CONTOH_HASIL_TEST));

const render = (hasil: typeof HASIL) => renderToStaticMarkup(createElement(IsiCaraKerja, { hasil }));
const teksSaja = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const tingkatJudul = (html: string) => [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));

describe.each([
  ["belum dievaluasi", null],
  ["sudah dievaluasi", HASIL],
])("halaman Cara kerja, %s", (_nama, hasil) => {
  const html = render(hasil);
  const teks = teksSaja(html);

  it("punya tepat satu h1 dan heading tidak melompat tingkat", () => {
    const tingkat = tingkatJudul(html);
    expect(tingkat.filter((t) => t === 1)).toHaveLength(1);
    expect(tingkat[0]).toBe(1);
    for (let i = 1; i < tingkat.length; i++) expect(tingkat[i] - tingkat[i - 1]).toBeLessThanOrEqual(1);
  });

  it("tidak memuat kata terlarang", () => {
    expect(memuatKataTerlarang(teks)).toBe(false);
  });

  it("tidak menampilkan ID aturan", () => {
    expect(teks).not.toMatch(/\bR\d{2}[ab]?\b/);
  });

  it("menjelaskan cara penilaian dalam bahasa awam", () => {
    for (const alasan of [...RINGKASAN_ATURAN.kritis, ...RINGKASAN_ATURAN.lain]) expect(teks).toContain(alasan);
    expect(teks).toMatch(/AI hanya boleh menambah/);
    expect(teks).toContain("60–100");
  });

  it("memuat batasan", () => {
    expect(teks).toMatch(/dioptimalkan untuk bahasa Indonesia/);
    expect(teks).toMatch(/bukan vonis hukum/);
  });

  it("memuat kebijakan privasi", () => {
    expect(teks).toMatch(/Teks dan gambar tidak disimpan/);
    expect(teks).toMatch(/disamarkan sebelum dikirim ke AI/);
    expect(teks).toMatch(/Groq[^.]*30 hari[^.]*ZDR/);
  });

  it("menautkan kembali ke halaman cek", () => {
    expect(html).toContain('href="/#kotak-cek"');
  });
});

describe("angka akurasi", () => {
  it("menampilkan belum dievaluasi kalau file hasil eval belum ada", () => {
    const teks = teksSaja(render(null));
    expect(teks).toMatch(/[Bb]elum dievaluasi/);
    expect(teks).not.toMatch(/\d+\/\d+/);
  });

  it("menampilkan angka Set test dengan pembilang dan penyebut", () => {
    const teks = teksSaja(render(HASIL));
    expect(teks).not.toMatch(/[Bb]elum dievaluasi/);
    expect(teks).toContain("17/20"); // penipuan yang tertangkap
    expect(teks).toContain("0/20"); // lowongan sungguhan yang keliru diberi Bahaya
    expect(teks).toContain("2/20"); // lowongan sungguhan yang diberi Waspada
    expect(teks).toMatch(/6 dari 40 contoh/); // contoh sintetis
  });

  it("menyebut kalau sebagian contoh dinilai tanpa AI karena AI gagal", () => {
    const gagal = bacaHasilEval(JSON.stringify({ ...CONTOH_HASIL_TEST, jumlahAiGagal: 3 }));
    expect(teksSaja(render(gagal))).toMatch(/3 dari 40 contoh/);
  });
});

describe("tautan ke halaman Cara kerja", () => {
  const TEKS =
    "Dicari staf gudang, gaji 4 juta. Sebelum mulai kerja wajib transfer biaya seragam Rp350.000 ke admin.";

  it("ada di hasil cek", async () => {
    const hasil = await cek(TEKS);
    const html = renderToStaticMarkup(createElement(TampilanHasil, { hasil, teks: TEKS }));
    expect(html).toContain('href="/cara-kerja"');
  });

  it("ada di halaman cek, di samping disclaimer privasi", () => {
    const html = renderToStaticMarkup(createElement(FormCek));
    expect(html).toContain('href="/cara-kerja"');
  });
});
