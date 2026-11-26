import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

describe("cek: R01 Minta uang di awal", () => {
  it("memberi Label Bahaya untuk lowongan yang meminta biaya seragam", async () => {
    const teks =
      "Dibutuhkan karyawan gudang di Cikarang. Setelah wawancara, peserta wajib membayar Biaya  \n Seragam Rp250.000 ke admin.";
    const hasil = await cek(teks);

    expect(hasil.label).toBe("bahaya");
    expect(hasil.skor).toBe(60);
    const r01 = tanda(hasil, "R01");
    expect(r01).toMatchObject({ sumber: "aturan", bobot: 60, modus: "lokal", kutipan: "Biaya  \n Seragam" });
    expect(teks.slice(...r01!.rentang)).toBe(r01!.kutipan);
    expect(hasil.modus).toEqual(["lokal"]);
    expect(hasil.modusTerkuat).toBe("lokal");
  });

  it("tidak cocok untuk lowongan yang tidak meminta uang", async () => {
    const hasil = await cek(
      "PT Sinar Logistik membuka lowongan admin gudang. Gaji sesuai UMR, BPJS, dan seragam disediakan perusahaan.",
    );

    expect(tanda(hasil, "R01")).toBeUndefined();
    expect(hasil.label).toBe("risiko_rendah");
  });

  it("dibatalkan Penyangkal: 'tidak dipungut biaya pendaftaran'", async () => {
    const hasil = await cek(
      "Lowongan operator produksi PT Maju Jaya. Proses rekrutmen tidak dipungut biaya pendaftaran apa pun.",
    );

    expect(tanda(hasil, "R01")).toBeUndefined();
    expect(hasil.skor).toBe(0);
  });

  it("dibatalkan Penyangkal untuk seluruh daftar: 'tanpa biaya seragam, medical, atau pelatihan'", async () => {
    const hasil = await cek(
      "Rekrutmen resmi PT Maju Jaya tanpa biaya seragam, medical, atau pelatihan. Kirim CV ke email HRD perusahaan.",
    );

    expect(tanda(hasil, "R01")).toBeUndefined();
  });

  it("tetap menangkap kecocokan kedua yang tidak didahului Penyangkal", async () => {
    const teks =
      "Pendaftaran gratis, tidak ada biaya pendaftaran. Setelah lolos, peserta wajib membayar biaya pelatihan Rp500.000.";
    const hasil = await cek(teks);

    const r01 = tanda(hasil, "R01");
    expect(r01?.kutipan).toBe("biaya pelatihan");
    expect(teks.slice(...r01!.rentang)).toBe("biaya pelatihan");
    expect(hasil.label).toBe("bahaya");
  });

  it("Penyangkal tepat 3 kata sebelum pemicu masih membatalkan", async () => {
    const hasil = await cek(
      "Lowongan kasir minimarket di Depok. Tidak dipungut sepeser biaya seragam, semua perlengkapan disediakan toko.",
    );

    expect(tanda(hasil, "R01")).toBeUndefined();
  });

  it("Penyangkal lebih dari 3 kata sebelum pemicu tidak membatalkan", async () => {
    const hasil = await cek(
      "Tidak perlu pengalaman kerja sebelumnya, cukup biaya seragam Rp150.000 lalu langsung mulai kerja besok pagi.",
    );

    expect(tanda(hasil, "R01")?.kutipan).toBe("biaya seragam");
  });

  it("'No.' sebelum pola Indonesia bukan Penyangkal", async () => {
    const hasil = await cek(
      "Hubungi No. HP 0812-0000-0000 untuk biaya seragam dan pelatihan sebelum mulai kerja di gudang kami.",
    );

    expect(tanda(hasil, "R01")?.kutipan).toBe("biaya seragam dan pelatihan");
  });

  it("mengenali pola Inggris dan Penyangkal 'no' untuk pola Inggris", async () => {
    const kena = await cek(
      "Hiring data entry staff, work from home. A registration fee of $20 is required before you can start.",
    );
    const batal = await cek(
      "Hiring data entry staff at our Jakarta office. No registration fee is required at any stage of the process.",
    );

    expect(tanda(kena, "R01")?.kutipan).toBe("registration fee");
    expect(tanda(batal, "R01")).toBeUndefined();
  });
});

describe("cek: R02 Minta OTP/PIN/password", () => {
  it("memberi Label Bahaya tanpa Modus untuk lowongan yang meminta kode OTP", async () => {
    const teks =
      "Selamat, kamu lolos seleksi admin online! Untuk aktivasi akun karyawan, kirimkan KODE   OTP yang masuk ke HP kamu.";
    const hasil = await cek(teks);

    expect(hasil.label).toBe("bahaya");
    expect(hasil.skor).toBe(60);
    const r02 = tanda(hasil, "R02");
    expect(r02).toMatchObject({ sumber: "aturan", bobot: 60, kutipan: "KODE   OTP" });
    expect(r02).not.toHaveProperty("modus");
    expect(teks.slice(...r02!.rentang)).toBe(r02!.kutipan);
    expect(hasil.modus).toEqual([]);
    expect(hasil.modusTerkuat).toBeNull();
  });

  it("tidak cocok di kata yang hanya diawali 'pin', seperti pinjaman atau pindah", async () => {
    const hasil = await cek(
      "Dibutuhkan staf administrasi koperasi simpan pinjaman. Karyawan bisa pindah cabang setelah satu tahun bekerja.",
    );

    expect(tanda(hasil, "R02")).toBeUndefined();
    expect(hasil.label).toBe("risiko_rendah");
  });

  it("tidak menganggap 'pin lokasi' sebagai PIN rahasia", async () => {
    const hasil = await cek(
      "Lowongan kurir paket area Bekasi. Setelah diterima, kirim pin lokasi rumah kamu ke koordinator untuk pembagian rute.",
    );

    expect(tanda(hasil, "R02")).toBeUndefined();
  });

  it("dibatalkan Penyangkal untuk seluruh daftar: 'jangan berikan kode OTP, PIN, atau password'", async () => {
    const hasil = await cek(
      "Waspada penipuan atas nama perusahaan kami. Jangan berikan kode OTP, PIN, atau password kepada siapa pun.",
    );

    expect(tanda(hasil, "R02")).toBeUndefined();
    expect(hasil.skor).toBe(0);
  });

  it("tetap menangkap kecocokan kedua yang tidak didahului Penyangkal", async () => {
    const teks =
      "Jangan bagikan OTP ke orang lain ya kak. Tapi untuk verifikasi gaji, admin perlu PIN ATM kamu hari ini juga.";
    const hasil = await cek(teks);

    const r02 = tanda(hasil, "R02");
    expect(r02?.kutipan).toBe("PIN");
    expect(teks.slice(...r02!.rentang)).toBe("PIN");
    expect(hasil.label).toBe("bahaya");
  });

  it("mengenali pola Inggris dan Penyangkal 'no' untuk pola Inggris", async () => {
    const kena = await cek(
      "Congratulations, you are hired as an online assistant. Please send the verification code sent to your phone.",
    );
    const batal = await cek(
      "Applying to our Jakarta office requires no verification code, payment, or bank details at any stage.",
    );

    expect(tanda(kena, "R02")?.kutipan).toBe("verification code");
    expect(tanda(batal, "R02")).toBeUndefined();
  });

  it("'no' sebagai singkatan nomor tidak membatalkan pola Indonesia", async () => {
    const hasil = await cek(
      "Untuk pencairan gaji pertama, kirim no HP dan PIN m-banking kamu ke admin kami paling lambat malam ini.",
    );

    expect(tanda(hasil, "R02")?.kutipan).toBe("PIN");
  });
});

describe("cek: Skor, urutan, dan determinisme dengan katalog asli", () => {
  const TEKS_R01_R02 =
    "Lolos seleksi! Kirim kode OTP dari HP kamu ke admin, lalu transfer dulu biaya seragam Rp200.000 sebelum mulai kerja.";

  it("tidak pernah melebihi Skor 100 walaupun R01 dan R02 sama-sama cocok", async () => {
    const hasil = await cek(TEKS_R01_R02);

    expect(hasil.skor).toBe(100);
    expect(hasil.label).toBe("bahaya");
  });

  it("mengurutkan Tanda bahaya berbobot sama menurut posisi kutipan", async () => {
    const hasil = await cek(TEKS_R01_R02);

    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["kode OTP", "transfer dulu"]);
  });

  it("memberi hasil identik untuk dua kali Cek atas Teks yang sama", async () => {
    expect(await cek(TEKS_R01_R02)).toEqual(await cek(TEKS_R01_R02));
  });

  it("menghitung rentang dari Teks persis seperti diterima, termasuk spasi di awal", async () => {
    const teks = `\n\n   ${TEKS_R01_R02}`;
    const hasil = await cek(teks);

    for (const t of hasil.tandaBahaya) expect(teks.slice(...t.rentang)).toBe(t.kutipan);
  });

  it("memberi Penjelasan yang tidak sama dengan Penjelasan Risiko rendah", async () => {
    const hasil = await cek(TEKS_R01_R02);

    expect(hasil.penjelasan).not.toBe("Tidak ditemukan tanda bahaya di teks ini.");
    expect(hasil.langkahDarurat).not.toBeNull();
  });
});
