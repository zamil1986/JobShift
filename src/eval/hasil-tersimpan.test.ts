import { describe, expect, it } from "vitest";
import { CONTOH_HASIL_TEST } from "./contoh-hasil.fixture";
import { bacaHasilEval } from "./hasil-tersimpan";

describe("bacaHasilEval", () => {
  it("mengembalikan null kalau file hasil eval belum ada", () => {
    expect(bacaHasilEval(null)).toBeNull();
  });

  it("membaca hasil Set test yang ditulis npm run eval --set test", () => {
    const hasil = bacaHasilEval(JSON.stringify(CONTOH_HASIL_TEST));
    expect(hasil?.mode.gabungan.recall).toEqual({ pembilang: 17, penyebut: 20, persen: 85 });
    expect(hasil?.jumlahSintetis).toBe(6);
  });

  it("menolak hasil dari Set dev, karena angka akurasi hanya boleh dari Set test", () => {
    expect(() => bacaHasilEval(JSON.stringify({ ...CONTOH_HASIL_TEST, dataset: "dev" }))).toThrow(
      /Set test/,
    );
  });

  it("menggagalkan build kalau file rusak, bukan diam-diam menampilkan belum dievaluasi", () => {
    expect(() => bacaHasilEval("{bukan json")).toThrow(/hasil-eval/);
    expect(() => bacaHasilEval(JSON.stringify({ dataset: "test" }))).toThrow(/hasil-eval/);
  });
});
