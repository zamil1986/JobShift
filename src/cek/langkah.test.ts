import { describe, expect, it } from "vitest";
import { cek, type HasilCek, type Langkah, type Modus } from "@/cek";
import type { Aturan } from "@/cek/aturan/mesin";
import { buatCek } from "@/cek/cek";

// Katalog asli baru punya R01 (Lokal) dan R02 (tanpa Modus), jadi Label Waspada
// dan Modus Tugas/Luar negeri dites lewat buatCek dengan katalog sintetis.

const aturanUji = (id: string, pemicu: string, bobot: number, modus?: Modus): Aturan => ({
  id,
  alasan: `Alasan uji ${id}.`,
  bobot,
  kritis: false,
  modus,
  pakaiPenyangkal: false,
  pola: [{ cari: pemicu, bahasa: "id" }],
});

const cekUji = buatCek([
  aturanUji("TUGAS", "pemicutugas", 30, "tugas"),
  aturanUji("LOKAL", "pemiculokal", 30, "lokal"),
  aturanUji("LUAR", "pemiculuar", 30, "luar_negeri"),
  aturanUji("LUARKECIL", "pemiculuarkecil", 10, "luar_negeri"),
  aturanUji("TANPAMODUS", "pemicunetral", 30),
  aturanUji("KECIL", "pemicukecil", 10),
  aturanUji("BESAR", "pemicubesar", 60),
]);

const teksDengan = (...pemicu: string[]) =>
  `Lowongan uji untuk Langkah aman dan Langkah darurat. Pemicu: ${pemicu.join(", ")}.`;

const TEKS_LOWONGAN =
  "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD.";
const TEKS_BIAYA_SERAGAM =
  "Dibutuhkan karyawan gudang di Cikarang. Setelah wawancara, peserta wajib membayar biaya seragam Rp250.000 ke admin.";

const domainDi = (langkah: Langkah[]) => langkah.flatMap((l) => (l.tautan ? [l.tautan.domain] : []));
const urlDi = (langkah: Langkah[]) => langkah.flatMap((l) => (l.tautan ? [l.tautan.url] : []));
const teksDi = (langkah: Langkah[]) => langkah.map((l) => l.teks).join("\n");

const semuaLangkah = (h: HasilCek) => [
  ...h.langkahAman.umum,
  ...h.langkahAman.spesifik,
  ...(h.langkahDarurat?.sudahTransfer ?? []),
  ...(h.langkahDarurat?.sudahKirimData ?? []),
];

describe("cek: Langkah aman umum sesuai Label", () => {
  it.each([
    ["risiko_rendah", () => cek(TEKS_LOWONGAN)],
    ["waspada", () => cekUji(teksDengan("pemicunetral"))],
    ["bahaya", () => cek(TEKS_BIAYA_SERAGAM)],
  ] as const)("Label %s memuat tautan Karirhub Kemnaker dan aduankonten.id", async (label, jalankan) => {
    const hasil = await jalankan();

    expect(hasil.label).toBe(label);
    expect(domainDi(hasil.langkahAman.umum)).toEqual(
      expect.arrayContaining(["karirhub.kemnaker.go.id", "aduankonten.id"]),
    );
  });

  it("memberi Langkah umum yang berbeda untuk tiap Label", async () => {
    const [rendah, waspada, bahaya] = await Promise.all([
      cek(TEKS_LOWONGAN),
      cekUji(teksDengan("pemicunetral")),
      cek(TEKS_BIAYA_SERAGAM),
    ]);

    expect(rendah.langkahAman.umum).not.toEqual(waspada.langkahAman.umum);
    expect(waspada.langkahAman.umum).not.toEqual(bahaya.langkahAman.umum);
  });

  it("Bahaya meminta pengguna tidak mentransfer uang", async () => {
    const hasil = await cek(TEKS_BIAYA_SERAGAM);

    expect(teksDi(hasil.langkahAman.umum)).toMatch(/jangan transfer/i);
  });
});

describe("cek: Langkah aman spesifik sesuai Modus terkuat", () => {
  it("kosong kalau tidak ada Modus", async () => {
    const hasil = await cekUji(teksDengan("pemicunetral"));

    expect(hasil.modusTerkuat).toBeNull();
    expect(hasil.langkahAman.spesifik).toEqual([]);
  });

  it("Modus Luar negeri memuat cek legalitas P3MI, call center KP2MI 0800-1000, dan WA 0811-8080-141", async () => {
    const hasil = await cekUji(teksDengan("pemiculuar"));

    expect(hasil.modusTerkuat).toBe("luar_negeri");
    expect(hasil.langkahAman.spesifik).toContainEqual(
      expect.objectContaining({
        tautan: {
          url: "https://migran-aman.kp2mi.go.id/cek-legalitas",
          domain: "migran-aman.kp2mi.go.id",
        },
      }),
    );
    expect(teksDi(hasil.langkahAman.spesifik)).toContain("0800-1000");
    expect(teksDi(hasil.langkahAman.spesifik)).toContain("0811-8080-141");
  });

  it("Modus Luar negeri tetap memuat kanal KP2MI walaupun Labelnya Risiko rendah", async () => {
    const hasil = await cekUji(teksDengan("pemiculuarkecil"));

    expect(hasil.label).toBe("risiko_rendah");
    expect(urlDi(hasil.langkahAman.spesifik)).toContain("https://migran-aman.kp2mi.go.id/cek-legalitas");
  });

  it("tetap memuat kanal KP2MI kalau Modus Luar negeri terdeteksi walaupun bukan Modus terkuat", async () => {
    const hasil = await cekUji(teksDengan("pemiculokal", "pemiculuarkecil"));

    expect(hasil.modusTerkuat).toBe("lokal");
    expect(hasil.modus).toContain("luar_negeri");
    expect(teksDi(hasil.langkahAman.spesifik)).toMatch(/seragam/i);
    expect(urlDi(hasil.langkahAman.spesifik)).toContain("https://migran-aman.kp2mi.go.id/cek-legalitas");
    expect(teksDi(hasil.langkahAman.spesifik)).toContain("0800-1000");
    expect(teksDi(hasil.langkahAman.spesifik)).toContain("0811-8080-141");
  });

  it("tidak menampilkan tautan yang sama dua kali di Langkah aman", async () => {
    const hasil = await cek(TEKS_BIAYA_SERAGAM);
    const url = urlDi([...hasil.langkahAman.umum, ...hasil.langkahAman.spesifik]);

    expect(url).toEqual([...new Set(url)]);
  });

  it("Modus Tugas memperingatkan soal deposit, tanpa kanal KP2MI", async () => {
    const hasil = await cekUji(teksDengan("pemicutugas"));

    expect(hasil.modusTerkuat).toBe("tugas");
    expect(teksDi(hasil.langkahAman.spesifik)).toMatch(/deposit/i);
    expect(teksDi(hasil.langkahAman.spesifik)).not.toContain("0800-1000");
  });

  it("Modus Lokal (R01 biaya seragam) menyebut biaya sebelum diterima kerja", async () => {
    const hasil = await cek(TEKS_BIAYA_SERAGAM);

    expect(hasil.modusTerkuat).toBe("lokal");
    expect(teksDi(hasil.langkahAman.spesifik)).toMatch(/seragam/i);
  });

  it("mengikuti Modus terkuat saat seri: Luar negeri menang atas Lokal dan Tugas", async () => {
    const hasil = await cekUji(teksDengan("pemicutugas", "pemiculokal", "pemiculuar"));
    const hanyaLuar = await cekUji(teksDengan("pemiculuar"));

    expect(hasil.modusTerkuat).toBe("luar_negeri");
    expect(hasil.langkahAman.spesifik).toEqual(hanyaLuar.langkahAman.spesifik);
  });
});

describe("cek: Langkah darurat", () => {
  it.each([
    ["tanpa Tanda bahaya", () => cek(TEKS_LOWONGAN)],
    ["dengan Tanda bahaya berbobot kecil", () => cekUji(teksDengan("pemicukecil"))],
  ] as const)("null untuk Risiko rendah %s", async (_nama, jalankan) => {
    const hasil = await jalankan();

    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.langkahDarurat).toBeNull();
  });

  it.each([
    ["waspada", () => cekUji(teksDengan("pemicunetral"))],
    ["bahaya", () => cekUji(teksDengan("pemicubesar"))],
  ] as const)("Label %s memuat 'Sudah telanjur transfer?': IASC, bank atau e-wallet, Kontak OJK 157", async (label, jalankan) => {
    const hasil = await jalankan();

    expect(hasil.label).toBe(label);
    const sudahTransfer = hasil.langkahDarurat!.sudahTransfer;
    expect(sudahTransfer).toContainEqual(
      expect.objectContaining({ tautan: { url: "https://iasc.ojk.go.id/", domain: "iasc.ojk.go.id" } }),
    );
    expect(teksDi(sudahTransfer)).toMatch(/bank atau e-wallet/i);
    expect(teksDi(sudahTransfer)).toMatch(/\b157\b/);
  });

  it.each([
    ["waspada", () => cekUji(teksDengan("pemicunetral"))],
    ["bahaya", () => cekUji(teksDengan("pemicubesar"))],
  ] as const)("Label %s memuat 'Sudah telanjur kirim data?': bank atau e-wallet, Kontak OJK 157, lapor akun pelaku", async (_label, jalankan) => {
    const hasil = await jalankan();

    const sudahKirimData = hasil.langkahDarurat!.sudahKirimData;
    expect(teksDi(sudahKirimData)).toMatch(/bank atau e-wallet/i);
    expect(teksDi(sudahKirimData)).toMatch(/\b157\b/);
    expect(teksDi(sudahKirimData)).toMatch(/laporkan akun pelaku/i);
    // Formulir IASC mewajibkan bukti transaksi, jadi IASC hanya untuk yang sudah transfer.
    expect(domainDi(sudahKirimData)).not.toContain("iasc.ojk.go.id");
  });
});

describe("cek: tautan Langkah", () => {
  it("setiap tautan memakai https dan domain yang sama dengan host URL-nya", async () => {
    const hasil = await Promise.all([
      cek(TEKS_LOWONGAN),
      cek(TEKS_BIAYA_SERAGAM),
      ...["pemicutugas", "pemiculokal", "pemiculuar", "pemicunetral"].map((p) => cekUji(teksDengan(p))),
    ]);
    const tautan = hasil.flatMap(semuaLangkah).flatMap((l) => (l.tautan ? [l.tautan] : []));

    expect(tautan.length).toBeGreaterThan(0);
    for (const t of tautan) {
      const url = new URL(t.url);
      expect(url.protocol).toBe("https:");
      expect(t.domain).toBe(url.hostname);
    }
  });
});

/** Jumlah kalimat: dipisah titik, tanda tanya, atau tanda seru yang diikuti spasi atau akhir teks. */
const jumlahKalimat = (teks: string) => teks.split(/(?<=[.!?])(?:\s+|$)/).filter(Boolean).length;

describe("cek: Penjelasan templat", () => {
  it("tanpa Modus hanya memuat kalimat Label", async () => {
    const hasil = await cekUji(teksDengan("pemicunetral"));

    expect(hasil.penjelasan).toBe(
      "Ada tanda bahaya yang perlu kamu perhatikan sebelum menanggapi lowongan ini.",
    );
  });

  it("Risiko rendah dengan Tanda bahaya kecil tidak mengatakan bahwa tanda bahaya tidak ditemukan", async () => {
    const hasil = await cekUji(teksDengan("pemiculuarkecil"));

    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.tandaBahaya).toHaveLength(1);
    expect(hasil.penjelasan).not.toMatch(/tidak ditemukan tanda bahaya/i);
    expect(hasil.penjelasan).toMatch(/tanda bahaya/i);
    expect(hasil.penjelasan).toMatch(/Modus Luar negeri/);
  });

  it("Risiko rendah dengan Tanda bahaya tanpa Modus tetap satu kalimat", async () => {
    const hasil = await cekUji(teksDengan("pemicukecil"));

    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.penjelasan).not.toMatch(/tidak ditemukan tanda bahaya/i);
    expect(jumlahKalimat(hasil.penjelasan)).toBe(1);
  });

  it("menambah satu kalimat untuk Modus terkuat setelah kalimat Label", async () => {
    const hasil = await cek(TEKS_BIAYA_SERAGAM);

    expect(hasil.penjelasan).toMatch(
      /^Teks ini memuat tanda bahaya kuat yang sering dipakai penipu lowongan kerja\. \S/,
    );
    expect(hasil.penjelasan).toMatch(/Modus Lokal/);
    expect(jumlahKalimat(hasil.penjelasan)).toBe(2);
  });

  it.each([
    ["tugas", "pemicutugas", "Modus Tugas"],
    ["lokal", "pemiculokal", "Modus Lokal"],
    ["luar_negeri", "pemiculuar", "Modus Luar negeri"],
  ] as const)("Modus terkuat %s menambah kalimat yang menyebut nama Modus", async (modus, pemicu, nama) => {
    const hasil = await cekUji(teksDengan(pemicu));

    expect(hasil.modusTerkuat).toBe(modus);
    expect(hasil.penjelasan).toContain(nama);
  });

  it("paling banyak 3 kalimat untuk setiap Label dan Modus terkuat", async () => {
    const pemicu = [[], ["pemicutugas"], ["pemiculokal"], ["pemiculuar"]];
    const bobotLabel = [[], ["pemicukecil"], ["pemicunetral"], ["pemicubesar"]];
    for (const m of pemicu) {
      for (const b of bobotLabel) {
        const hasil = await cekUji(teksDengan(...m, ...b, "isi"));
        expect(jumlahKalimat(hasil.penjelasan), hasil.penjelasan).toBeLessThanOrEqual(3);
      }
    }
  });
});
