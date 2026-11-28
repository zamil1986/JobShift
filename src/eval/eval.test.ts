import { describe, expect, it, vi } from "vitest";
import { penilaiPalsu } from "@/cek/ai";
import { evaluasiDataset, parseJsonlDataset, type ContohDataset } from "./eval";

const TEKS_PALSU_ATURAN =
  "Selamat, kamu lolos seleksi admin gudang. Segera transfer biaya seragam Rp250.000 hari ini.";
const TEKS_PALSU_SAMAR =
  "Kerja paruh waktu dari rumah bersama CV Kreasi Digital, cukup pakai HP dan gabung grup Telegram untuk info harian.";
const TEKS_ASLI_NETRAL =
  "PT Maju Bersama membuka lowongan staf akuntansi di Bandung. Kirim lamaran dan CV resmi ke bagian HRD.";
const TEKS_ASLI_FALSE_POSITIVE =
  "Lowongan magang resmi di kantor pusat. Peserta tidak perlu membayar biaya seragam? Ada biaya seragam yang ditanggung, harap konfirmasi.";

describe("parseJsonlDataset", () => {
  it("mem-parse baris JSONL valid dan mengabaikan baris kosong", () => {
    const isi = [
      JSON.stringify({
        id: "dev-01",
        teks: TEKS_PALSU_ATURAN,
        kebenaran: "palsu",
        modus: "lokal",
        sumber: "wa-grup",
        sintetis: false,
      }),
      "",
      JSON.stringify({
        id: "dev-02",
        teks: TEKS_ASLI_NETRAL,
        kebenaran: "asli",
        sumber: "job-portal",
        sintetis: true,
      }),
      "   ",
    ].join("\n");

    expect(parseJsonlDataset(isi)).toEqual([
      {
        id: "dev-01",
        teks: TEKS_PALSU_ATURAN,
        kebenaran: "palsu",
        modus: "lokal",
        sumber: "wa-grup",
        sintetis: false,
      },
      {
        id: "dev-02",
        teks: TEKS_ASLI_NETRAL,
        kebenaran: "asli",
        sumber: "job-portal",
        sintetis: true,
      },
    ]);
  });

  it("menolak JSONL rusak tanpa menyertakan isi Teks pada pesan error", () => {
    const isi = JSON.stringify({
      id: "dev-bad",
      teks: "RAHASIA-TEKS-TIDAK-BOLEH-BOCOR " + TEKS_ASLI_NETRAL,
      kebenaran: "bukan_label",
      sumber: "x",
      sintetis: false,
    });

    expect(() => parseJsonlDataset(isi)).toThrow(/baris 1/i);
    try {
      parseJsonlDataset(isi);
    } catch (galat) {
      expect(String(galat)).not.toContain("RAHASIA-TEKS-TIDAK-BOLEH-BOCOR");
    }
  });
});

describe("evaluasiDataset", () => {
  it("memanggil AI sekali per contoh dan merekam jawabannya untuk mode AI saja dan gabungan", async () => {
    const contoh: ContohDataset[] = [
      {
        id: "c1",
        teks: TEKS_PALSU_ATURAN,
        kebenaran: "palsu",
        modus: "lokal",
        sumber: "sintetis",
        sintetis: true,
      },
      {
        id: "c2",
        teks: TEKS_PALSU_SAMAR,
        kebenaran: "palsu",
        modus: "tugas",
        sumber: "wa",
        sintetis: false,
      },
      {
        id: "c3",
        teks: TEKS_ASLI_NETRAL,
        kebenaran: "asli",
        sumber: "portal",
        sintetis: false,
      },
      {
        id: "c4",
        teks: TEKS_ASLI_FALSE_POSITIVE,
        kebenaran: "asli",
        sumber: "portal",
        sintetis: true,
      },
    ];

    const aiSpy = vi.fn(
      penilaiPalsu((teksTersamar: string) => {
        if (teksTersamar.includes("biaya seragam")) {
          // Sengaja menyertakan kutipan yang tumpang-tindih dengan R01 ("biaya seragam")
          // dan 2 kutipan lain, serta label "bahaya":
          // - di mode gabungan, "biaya seragam" dibuang karena overlap R01
          // - di mode AI saja (tanpa aturan), ketiga kutipan sah → skor 25 (waspada, bukan bahaya!)
          return {
            label: "bahaya",
            tanda_bahaya: [
              { kutipan: "biaya seragam", alasan: "Meminta uang seragam." },
              { kutipan: "lolos seleksi", alasan: "Klaim lolos sepihak." },
              { kutipan: "hari ini", alasan: "Mendesak segera transfer." },
            ],
            penjelasan: "Lowongan mencurigakan.",
          };
        }
        if (teksTersamar.includes("grup Telegram")) {
          return {
            label: "bahaya",
            tanda_bahaya: [
              { kutipan: "cukup pakai HP", alasan: "Pekerjaan tidak dijelaskan." },
              { kutipan: "grup Telegram", alasan: "Mengalihkan komunikasi ke Telegram." },
              { kutipan: "info harian", alasan: "Info kerja hanya lewat grup." },
            ],
            penjelasan: "Terindikasi modus tugas.",
          };
        }
        if (teksTersamar.includes("Kirim lamaran")) {
          // Menguji Asli -> Waspada dari AI saja & gabungan
          return {
            label: "waspada",
            tanda_bahaya: [
              { kutipan: "membuka lowongan", alasan: "Butir uji 1." },
              { kutipan: "di Bandung", alasan: "Butir uji 2." },
              { kutipan: "bagian HRD", alasan: "Butir uji 3." },
            ],
            penjelasan: "Perlu cek ulang.",
          };
        }
        return { label: "risiko_rendah", tanda_bahaya: [], penjelasan: "Tidak ada temuan." };
      }),
    );

    let waktu = 0;
    const latensiContoh = [120, 450, 200, 80];
    let indeks = 0;
    const ukurWaktu = () => {
      // Setiap pemanggilan ai memanggil ukurWaktu saat mulai dan selesai
      const langkah = indeks++;
      if (langkah % 2 === 0) return waktu;
      waktu += latensiContoh[Math.floor(langkah / 2)] ?? 0;
      return waktu;
    };

    const hasil = await evaluasiDataset(contoh, { ai: aiSpy, ukurWaktu });

    expect(aiSpy).toHaveBeenCalledTimes(contoh.length);
    expect(hasil.jumlahContoh).toBe(4);
    expect(hasil.jumlahSintetis).toBe(2);
    expect(hasil.p95LatensiAiMs).toBe(450);

    // Mode aturan:
    // c1 (palsu) -> bahaya, c2 (palsu) -> risiko_rendah
    // c3 (asli) -> risiko_rendah, c4 (asli) -> bahaya
    expect(hasil.mode.aturan.confusion).toEqual({
      palsu: { risiko_rendah: 1, waspada: 0, bahaya: 1 },
      asli: { risiko_rendah: 1, waspada: 0, bahaya: 1 },
    });
    expect(hasil.mode.aturan.recall).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });
    expect(hasil.mode.aturan.presisi).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });
    expect(hasil.mode.aturan.falsePositive).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });
    expect(hasil.mode.aturan.asliWaspada).toEqual({ pembilang: 0, penyebut: 2, persen: 0 });

    // Mode AI saja (skor hanya dari Tanda bahaya AI yang sah, tidak pernah bahaya):
    // c1 (palsu) -> waspada (3 butir sah => 25), c2 (palsu) -> waspada (25)
    // c3 (asli) -> waspada (25), c4 (asli) -> risiko_rendah (0)
    expect(hasil.mode.aiSaja.confusion).toEqual({
      palsu: { risiko_rendah: 0, waspada: 2, bahaya: 0 },
      asli: { risiko_rendah: 1, waspada: 1, bahaya: 0 },
    });
    expect(hasil.mode.aiSaja.recall).toEqual({ pembilang: 2, penyebut: 2, persen: 100 });
    expect(hasil.mode.aiSaja.presisi).toEqual({ pembilang: 2, penyebut: 3, persen: 66.7 });
    expect(hasil.mode.aiSaja.falsePositive).toEqual({ pembilang: 0, penyebut: 2, persen: 0 });
    expect(hasil.mode.aiSaja.asliWaspada).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });

    // Mode gabungan:
    // c1 (palsu) -> bahaya, c2 (palsu) -> waspada
    // c3 (asli) -> waspada, c4 (asli) -> bahaya
    expect(hasil.mode.gabungan.confusion).toEqual({
      palsu: { risiko_rendah: 0, waspada: 1, bahaya: 1 },
      asli: { risiko_rendah: 0, waspada: 1, bahaya: 1 },
    });
    expect(hasil.mode.gabungan.recall).toEqual({ pembilang: 2, penyebut: 2, persen: 100 });
    expect(hasil.mode.gabungan.presisi).toEqual({ pembilang: 2, penyebut: 4, persen: 50 });
    expect(hasil.mode.gabungan.falsePositive).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });
    expect(hasil.mode.gabungan.asliWaspada).toEqual({ pembilang: 1, penyebut: 2, persen: 50 });
  });

  it("menangani penyebut nol dan kegagalan AI dengan aman", async () => {
    const contoh: ContohDataset[] = [
      {
        id: "only-palsu",
        teks: TEKS_PALSU_SAMAR,
        kebenaran: "palsu",
        modus: "tugas",
        sumber: "sintetis",
        sintetis: true,
      },
    ];

    const hasil = await evaluasiDataset(contoh, {
      ai: async () => {
        throw new Error("503");
      },
    });

    expect(hasil.jumlahAiGagal).toBe(1);
    expect(hasil.p95LatensiAiMs).toBeNull();
    expect(hasil.mode.aturan.presisi).toEqual({ pembilang: 0, penyebut: 0, persen: null });
    expect(hasil.mode.aturan.falsePositive).toEqual({ pembilang: 0, penyebut: 0, persen: null });
    expect(hasil.mode.aiSaja.recall).toEqual({ pembilang: 0, penyebut: 1, persen: 0 });
  });

  it("tidak membocorkan isi Teks saat contoh gagal validasi panjang", async () => {
    const contoh: ContohDataset[] = [
      {
        id: "pendek-1",
        teks: "RAHASIA-TEKS-PENDEK",
        kebenaran: "asli",
        sumber: "x",
        sintetis: false,
      },
    ];

    let pesan = "";
    try {
      await evaluasiDataset(contoh);
    } catch (galat) {
      pesan = String(galat);
    }
    expect(pesan).toContain("pendek-1");
    expect(pesan).toContain("teks_terlalu_pendek");
    expect(pesan).not.toContain("RAHASIA-TEKS-PENDEK");
  });
});
