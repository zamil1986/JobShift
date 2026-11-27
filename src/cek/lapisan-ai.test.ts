import { afterEach, describe, expect, it, vi } from "vitest";
import { cek } from "@/cek";
import { penilaiPalsu, penilaiPerekam } from "@/cek/ai";
import type { PenilaiAI } from "@/cek";

const DATA_PRIBADI = [
  "hrd.rekrutmen@gmail.com",
  "3201234567890123",
  "0812-3456-7890",
  "+62 813 9876 5432",
  "6281234567890",
  "1234567890",
];

const TEKS_DENGAN_DATA =
  "Dibutuhkan admin gudang, gaji Rp 8.000.000 per bulan. Kirim CV ke hrd.rekrutmen@gmail.com " +
  "atau WA 0812-3456-7890 dan +62 813 9876 5432, cadangan 6281234567890. Sertakan NIK " +
  "3201234567890123 dan nomor rekening BCA 1234567890 untuk pembayaran gaji.";

describe("cek: Penyamaran sebelum Teks dikirim ke AI", () => {
  it("Teks yang sampai ke AI tidak memuat email, NIK, nomor HP, atau rekening dari input", async () => {
    const { penilai, rekaman } = penilaiPerekam();

    await cek(TEKS_DENGAN_DATA, { ai: penilai });

    expect(rekaman).toHaveLength(1);
    for (const data of DATA_PRIBADI) expect(rekaman[0]).not.toContain(data);
  });

  it("mengganti setiap data pribadi dengan penandanya", async () => {
    const { penilai, rekaman } = penilaiPerekam();

    await cek(TEKS_DENGAN_DATA, { ai: penilai });

    expect(rekaman[0]).toBe(
      "Dibutuhkan admin gudang, gaji Rp 8.000.000 per bulan. Kirim CV ke [EMAIL] " +
        "atau WA [NOMOR] dan [NOMOR], cadangan [NOMOR]. Sertakan NIK " +
        "[NIK] dan nomor rekening BCA [REKENING] untuk pembayaran gaji.",
    );
  });

  it.each([
    ["Rp 8.000.000", "Rp 8.000.000"],
    ["Rp8000000000", "Rp8000000000"],
    ["Rp 2500000000", "Rp 2500000000"],
    ["15.000.000", "15.000.000"],
  ])("tidak menyentuh nominal %s", async (nominal, harapan) => {
    const { penilai, rekaman } = penilaiPerekam();

    await cek(`Lowongan admin kantor cabang dengan gaji ${nominal} per bulan, kirim CV ke HRD.`, {
      ai: penilai,
    });

    expect(rekaman[0]).toContain(harapan);
  });

  it("Aturan tetap menilai Teks asli: kutipan Tanda bahaya diambil dari Teks sebelum disamarkan", async () => {
    const { penilai } = penilaiPerekam();
    const teks =
      "Selamat, kamu diterima kerja. Wajib transfer biaya seragam Rp250.000 ke rekening 1234567890 hari ini.";

    const hasil = await cek(teks, { ai: penilai });

    for (const t of hasil.tandaBahaya) {
      expect(teks.slice(t.rentang[0], t.rentang[1])).toBe(t.kutipan);
    }
    expect(hasil.tandaBahaya.length).toBeGreaterThan(0);
  });
});

/** Lowongan tanpa Tanda bahaya Aturan. */
const TEKS_NETRAL =
  "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Gaji dibayar mingguan lewat kantor pusat, kirim CV ke HRD.";

/** Keluaran AI yang valid secara skema. */
const jawabanAI = (
  tandaBahaya: { kutipan: string; alasan: string }[] = [],
  label = "risiko_rendah",
  penjelasan = "Penjelasan dari AI.",
) => ({ label, tanda_bahaya: tandaBahaya, penjelasan });

describe("cek: batas waktu AI 3,5 detik", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Adapter yang tidak pernah menjawab dan mengabaikan signal. */
  const penilaiMacet: PenilaiAI = () => new Promise(() => {});

  it("adapter yang tidak menjawab dalam 3,5 detik memberi hasil Aturan saja dengan catatanAI", async () => {
    vi.useFakeTimers();
    let selesai = false;
    const janji = cek(TEKS_NETRAL, { ai: penilaiMacet }).finally(() => {
      selesai = true;
    });

    await vi.advanceTimersByTimeAsync(3499);
    expect(selesai).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const hasil = await janji;
    expect(hasil.sumberPenilaian).toBe("aturan");
    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
    expect(hasil).toEqual({ ...(await cek(TEKS_NETRAL)), catatanAI: "ai_tidak_tersedia" });
  });

  it("membatalkan signal adapter tepat saat batas waktu", async () => {
    vi.useFakeTimers();
    let signalAdapter: AbortSignal | undefined;
    const janji = cek(TEKS_NETRAL, {
      ai: (_teks, signal) => {
        signalAdapter = signal;
        return new Promise(() => {});
      },
    });

    await vi.advanceTimersByTimeAsync(3499);
    expect(signalAdapter?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(signalAdapter?.aborted).toBe(true);
    await janji;
  });

  it("memakai jawaban AI yang datang sebelum batas waktu", async () => {
    vi.useFakeTimers();
    const janji = cek(TEKS_NETRAL, {
      ai: () => new Promise((selesai) => setTimeout(() => selesai(jawabanAI()), 3000)),
    });

    await vi.advanceTimersByTimeAsync(3000);
    const hasil = await janji;
    expect(hasil.sumberPenilaian).toBe("aturan+AI");
    expect(hasil.catatanAI).toBeUndefined();
  });
});

describe("cek: AI gagal atau keluarannya tidak valid", () => {
  it.each([
    ["null", null],
    ["string", "bukan objek"],
    ["tanpa label", { tanda_bahaya: [], penjelasan: "x" }],
    ["label di luar daftar", { label: "aman", tanda_bahaya: [], penjelasan: "x" }],
    ["tanda_bahaya bukan array", { label: "waspada", tanda_bahaya: "x", penjelasan: "x" }],
    ["butir tanpa kutipan", { label: "waspada", tanda_bahaya: [{ alasan: "x" }], penjelasan: "x" }],
    ["field tambahan", { ...jawabanAI(), skor: 90 }],
  ])("keluaran %s memberi hasil Aturan saja dengan catatanAI", async (_nama, keluaran) => {
    const hasil = await cek(TEKS_NETRAL, { ai: penilaiPalsu(keluaran) });

    expect(hasil).toEqual({ ...(await cek(TEKS_NETRAL)), catatanAI: "ai_tidak_tersedia" });
  });

  it("adapter yang melempar error (misalnya 429 atau 5xx) memberi catatanAI", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: async () => {
        throw Object.assign(new Error("429 Too Many Requests"), { status: 429 });
      },
    });

    expect(hasil.sumberPenilaian).toBe("aturan");
    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
  });

  it("adapter yang melempar secara sinkron juga memberi catatanAI", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: () => {
        throw new Error("gagal");
      },
    });

    expect(hasil.catatanAI).toBe("ai_tidak_tersedia");
  });

  it("tanpa adapter AI, Cek dinilai Aturan saja tanpa catatanAI", async () => {
    const hasil = await cek(TEKS_NETRAL);

    expect(hasil.sumberPenilaian).toBe("aturan");
    expect(hasil).not.toHaveProperty("catatanAI");
  });

  it("AI tidak dipanggil kalau Teks ditolak karena panjangnya", async () => {
    const { penilai, rekaman } = penilaiPerekam();

    await expect(cek("terlalu pendek", { ai: penilai })).rejects.toMatchObject({
      kode: "teks_terlalu_pendek",
    });
    expect(rekaman).toEqual([]);
  });
});

const butir = (kutipan: string, alasan = "Gaji dibayar dengan cara yang tidak biasa.") => ({
  kutipan,
  alasan,
});

/** Lowongan dengan Tanda bahaya R01 di kutipan "biaya seragam". */
const TEKS_R01 =
  "Selamat, kamu diterima kerja di gudang kami. Wajib transfer biaya seragam Rp250.000 hari ini juga ya kak.";

describe("cek: Tanda bahaya AI yang sah", () => {
  it("menambah Tanda bahaya AI berbobot 10 dengan kutipan dan rentang dari Teks asli", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([butir("gaji dibayar mingguan")])),
    });

    expect(hasil.skor).toBe(10);
    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.sumberPenilaian).toBe("aturan+AI");
    expect(hasil.tandaBahaya).toEqual([
      {
        sumber: "ai",
        alasan: "Gaji dibayar dengan cara yang tidak biasa.",
        kutipan: "Gaji dibayar mingguan",
        rentang: [61, 82],
        bobot: 10,
      },
    ]);
    expect(TEKS_NETRAL.slice(61, 82)).toBe("Gaji dibayar mingguan");
  });

  it("mencocokkan kutipan tanpa membedakan huruf besar/kecil dan spasi berlebih", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([butir("  GAJI   dibayar\nmingguan ")])),
    });

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["Gaji dibayar mingguan"]);
  });

  it.each([
    [1, 10, "risiko_rendah"],
    [2, 20, "risiko_rendah"],
    [3, 25, "waspada"],
    [5, 25, "waspada"],
  ] as const)("%i butir sah menyumbang Skor %i (maksimal +25)", async (jumlah, skor, label) => {
    const kutipan = ["staf administrasi", "kantor cabang", "Gaji dibayar", "kantor pusat", "kirim CV"];
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI(kutipan.slice(0, jumlah).map((k) => butir(k)), "bahaya")),
    });

    expect(hasil.tandaBahaya).toHaveLength(jumlah);
    expect(hasil.tandaBahaya.every((t) => t.sumber === "ai" && t.bobot === 10)).toBe(true);
    expect(hasil.skor).toBe(skor);
    expect(hasil.label).toBe(label);
  });

  it("hanya membaca 5 butir pertama", async () => {
    const kutipan = ["staf", "administrasi", "kantor", "cabang", "Bandung", "mingguan"];
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI(kutipan.map((k) => butir(k)))),
    });

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).not.toContain("mingguan");
    expect(hasil.tandaBahaya).toHaveLength(5);
  });

  it("menambah Skor AI di atas Skor Aturan dan mengurutkan menurut bobot", async () => {
    const hasil = await cek(TEKS_R01, { ai: penilaiPalsu(jawabanAI([butir("hari ini juga")])) });

    expect(hasil.skor).toBe(70);
    expect(hasil.tandaBahaya.map((t) => [t.sumber, t.kutipan])).toEqual([
      ["aturan", "biaya seragam"],
      ["ai", "hari ini juga"],
    ]);
  });

  it("menaikkan Label akhir sehingga Langkah darurat ikut tampil", async () => {
    const tanpaAI = await cek(TEKS_NETRAL);
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(
        jawabanAI([butir("staf administrasi"), butir("kantor cabang"), butir("kantor pusat")]),
      ),
    });

    expect(tanpaAI.langkahDarurat).toBeNull();
    expect(hasil.label).toBe("waspada");
    expect(hasil.langkahDarurat).not.toBeNull();
    expect(hasil.langkahAman.umum).not.toEqual(tanpaAI.langkahAman.umum);
  });

  it("tidak menambah Modus dari Tanda bahaya AI", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([butir("staf administrasi"), butir("kantor cabang"), butir("kantor pusat")])),
    });

    expect(hasil.modus).toEqual([]);
    expect(hasil.modusTerkuat).toBeNull();
  });
});

describe("cek: butir AI yang dibuang", () => {
  it.each([
    ["kutipannya tidak ada di Teks", butir("transfer deposit dulu")],
    ["kutipannya kosong", butir("")],
    ["kutipannya hanya spasi", butir("   ")],
    ["alasannya kosong", butir("kantor cabang", "  ")],
    ["alasannya memuat kata terlarang", butir("kantor cabang", "Lowongan ini tampak aman.")],
  ])("membuang butir yang %s", async (_nama, b) => {
    const hasil = await cek(TEKS_NETRAL, { ai: penilaiPalsu(jawabanAI([b])) });

    expect(hasil.tandaBahaya).toEqual([]);
    expect(hasil.skor).toBe(0);
    expect(hasil.sumberPenilaian).toBe("aturan+AI");
  });

  const TEKS_BERNOMOR =
    "Lowongan admin toko online, hubungi 0812-3456-7890 sekarang juga untuk wawancara singkat hari ini.";

  it("membuang butir yang kutipannya memuat penanda Penyamaran", async () => {
    const hasil = await cek(TEKS_BERNOMOR, {
      ai: penilaiPalsu(jawabanAI([butir("hubungi [NOMOR] sekarang")])),
    });

    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("membuang butir yang kutipannya hanya cocok di dalam penanda", async () => {
    const hasil = await cek(TEKS_BERNOMOR, { ai: penilaiPalsu(jawabanAI([butir("NOMOR")])) });

    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("membuang butir yang kutipannya ada di Teks asli tetapi disamarkan untuk AI", async () => {
    const hasil = await cek(TEKS_BERNOMOR, {
      ai: penilaiPalsu(jawabanAI([butir("0812-3456-7890")])),
    });

    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("tetap menerima kutipan di sebelah penanda", async () => {
    const hasil = await cek(TEKS_BERNOMOR, {
      ai: penilaiPalsu(jawabanAI([butir("sekarang juga untuk wawancara")])),
    });

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["sekarang juga untuk wawancara"]);
  });

  it.each([
    ["sama persis", "biaya seragam"],
    ["memuatnya", "transfer biaya seragam Rp250.000"],
    ["beririsan satu karakter", "m Rp250.000"],
  ])("membuang butir yang rentangnya %s dengan Tanda bahaya Aturan", async (_nama, kutipan) => {
    const hasil = await cek(TEKS_R01, { ai: penilaiPalsu(jawabanAI([butir(kutipan)])) });

    expect(hasil.tandaBahaya.map((t) => t.sumber)).toEqual(["aturan"]);
    expect(hasil.skor).toBe(60);
  });

  it("menerima butir yang bersebelahan dengan Tanda bahaya Aturan tanpa beririsan", async () => {
    const hasil = await cek(TEKS_R01, { ai: penilaiPalsu(jawabanAI([butir(" Rp250.000")])) });

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["biaya seragam", "Rp250.000"]);
  });

  it("menghitung kutipan yang sama hanya sekali", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([butir("kantor cabang"), butir("KANTOR CABANG", "Alasan lain.")])),
    });

    expect(hasil.tandaBahaya).toHaveLength(1);
    expect(hasil.skor).toBe(10);
  });

  it("membuang butir yang beririsan dengan butir AI sebelumnya", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([butir("kantor cabang di Bandung"), butir("cabang")])),
    });

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["kantor cabang di Bandung"]);
  });

  it("memakai kemunculan kutipan berikutnya kalau kemunculan pertama beririsan", async () => {
    const teks = "Ada biaya seragam di awal. Setelah itu, kata mereka, biaya seragam dikembalikan bulan depan.";
    const hasil = await cek(teks, { ai: penilaiPalsu(jawabanAI([butir("biaya seragam")])) });

    const ai = hasil.tandaBahaya.filter((t) => t.sumber === "ai");
    expect(ai).toHaveLength(1);
    expect(ai[0].rentang[0]).toBe(teks.lastIndexOf("biaya seragam"));
  });

  it("AI sendirian dengan label bahaya hanya sampai Waspada", async () => {
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(
        jawabanAI(
          ["staf", "administrasi", "kantor", "cabang", "Bandung"].map((k) => butir(k)),
          "bahaya",
        ),
      ),
    });

    expect(hasil.skor).toBe(25);
    expect(hasil.label).toBe("waspada");
  });
});

describe("cek: Penjelasan AI", () => {
  const TEMPLAT_RISIKO_RENDAH = "Tidak ditemukan tanda bahaya di teks ini.";

  it("menggantikan templat kalau label AI sama dengan Label akhir dan lolos filter", async () => {
    const penjelasan = "Lowongan ini tidak meminta uang. Tetap cocokkan kontaknya dengan situs perusahaan.";
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([], "risiko_rendah", `  ${penjelasan} `)),
    });

    expect(hasil.penjelasan).toBe(penjelasan);
  });

  it("dipakai untuk Label akhir yang dinaikkan AI kalau label AI sama", async () => {
    const penjelasan = "Ada beberapa hal yang janggal di lowongan ini.";
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(
        jawabanAI(
          [butir("staf administrasi"), butir("kantor cabang"), butir("kantor pusat")],
          "waspada",
          penjelasan,
        ),
      ),
    });

    expect(hasil.label).toBe("waspada");
    expect(hasil.penjelasan).toBe(penjelasan);
  });

  it.each([
    ["label AI berbeda dari Label akhir", jawabanAI([], "bahaya", "Lowongan ini penipuan.")],
    ["memuat kata 'aman'", jawabanAI([], "risiko_rendah", "Lowongan ini aman untuk dilamar.")],
    ["memuat kata 'Asli'", jawabanAI([], "risiko_rendah", "Perusahaannya Asli.")],
    [
      "lebih dari 3 kalimat",
      jawabanAI([], "risiko_rendah", "Satu kalimat. Dua kalimat. Tiga kalimat. Empat kalimat."),
    ],
    ["kosong", jawabanAI([], "risiko_rendah", "   ")],
    ["memuat penanda Penyamaran", jawabanAI([], "risiko_rendah", "Hubungi [NOMOR] dulu.")],
  ])("tidak dipakai kalau %s", async (_nama, keluaran) => {
    const hasil = await cek(TEKS_NETRAL, { ai: penilaiPalsu(keluaran) });

    expect(hasil.sumberPenilaian).toBe("aturan+AI");
    expect(hasil.penjelasan).toBe(TEMPLAT_RISIKO_RENDAH);
  });

  it("tepat 3 kalimat masih dipakai, dan titik di dalam nominal bukan akhir kalimat", async () => {
    const penjelasan = "Gaji Rp8.000.000 tampak wajar. Tidak ada permintaan uang. Tetap cek kontaknya!";
    const hasil = await cek(TEKS_NETRAL, {
      ai: penilaiPalsu(jawabanAI([], "risiko_rendah", penjelasan)),
    });

    expect(hasil.penjelasan).toBe(penjelasan);
  });

  it("tidak dipakai kalau AI gagal", async () => {
    const hasil = await cek(TEKS_NETRAL, { ai: penilaiPalsu(null) });

    expect(hasil.penjelasan).toBe(TEMPLAT_RISIKO_RENDAH);
  });
});
