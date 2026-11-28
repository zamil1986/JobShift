// Fixture hasil `npm run eval --set test` untuk tes. Angkanya karangan, bukan hasil eval nyata.

const rasio = (pembilang: number, penyebut: number) => ({
  pembilang,
  penyebut,
  persen: penyebut === 0 ? null : Math.round((pembilang / penyebut) * 1000) / 10,
});

const mode = {
  recall: rasio(17, 20),
  presisi: rasio(17, 19),
  falsePositive: rasio(0, 20),
  asliWaspada: rasio(2, 20),
  confusion: {
    palsu: { risiko_rendah: 3, waspada: 5, bahaya: 12 },
    asli: { risiko_rendah: 18, waspada: 2, bahaya: 0 },
  },
};

export const CONTOH_HASIL_TEST = {
  dataset: "test",
  model: "openai/gpt-oss-120b",
  dibuatPada: "2026-12-01T08:00:00.000Z",
  jumlahContoh: 40,
  jumlahPalsu: 20,
  jumlahAsli: 20,
  jumlahSintetis: 6,
  jumlahAiGagal: 0,
  p95LatensiAiMs: 812.4,
  mode: { aturan: mode, aiSaja: mode, gabungan: mode },
};
