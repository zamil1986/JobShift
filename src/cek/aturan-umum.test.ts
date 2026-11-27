import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

describe("cek: R06a Kontak hanya lewat nomor pribadi", () => {
  it("menangkap ajakan menghubungi nomor WA pribadi atau chat admin (bobot 15, tanpa Modus)", async () => {
    const teks =
      "Lowongan staf gudang PT Sinar Jaya di Bekasi. Berminat? Hubungi WA 0812-3456-7890 atau chat admin untuk jadwal.";
    const hasil = await cek(teks);

    const r06a = tanda(hasil, "R06a");
    expect(r06a).toMatchObject({
      sumber: "aturan",
      aturanId: "R06a",
      bobot: 15,
      kutipan: "Hubungi WA 0812-3456-7890",
    });
    expect(r06a).not.toHaveProperty("modus");
    expect(teks.slice(...r06a!.rentang)).toBe(r06a!.kutipan);
  });

  it("mengenali pola Inggris 'contact via WhatsApp'", async () => {
    const teks =
      "PT Sinar Jaya is hiring administrative staff in Jakarta. Please contact via WhatsApp to submit your application.";
    const hasil = await cek(teks);

    expect(tanda(hasil, "R06a")?.kutipan).toBe("contact via WhatsApp");
  });

  it("tidak cocok untuk lowongan dengan kontak portal atau email resmi perusahaan", async () => {
    const hasil = await cek(
      "PT Sinar Jaya membuka lowongan staf administrasi di Bandung. Kirim lamaran melalui situs karir resmi perusahaan.",
    );

    expect(tanda(hasil, "R06a")).toBeUndefined();
  });
});

describe("cek: R09 Langsung diterima tanpa seleksi", () => {
  it("menangkap janji langsung kerja atau tanpa interview (bobot 15, tanpa Modus)", async () => {
    const teks =
      "Dibutuhkan karyawan toko pakaian di Bandung. Syarat mudah, tanpa interview dan langsung kerja besok pagi.";
    const hasil = await cek(teks);

    const r09 = tanda(hasil, "R09");
    expect(r09).toMatchObject({
      sumber: "aturan",
      aturanId: "R09",
      bobot: 15,
      kutipan: "tanpa interview",
    });
    expect(r09).not.toHaveProperty("modus");
    expect(teks.slice(...r09!.rentang)).toBe(r09!.kutipan);
  });

  it("tidak cocok untuk lowongan yang menyebutkan tahapan wawancara dan seleksi", async () => {
    const hasil = await cek(
      "PT Maju Bersama membuka lowongan kasir di Surabaya. Kandidat yang lolos seleksi berkas akan diundang wawancara.",
    );

    expect(tanda(hasil, "R09")).toBeUndefined();
  });
});

describe("cek: R10 Mendesak dan membatasi waktu", () => {
  it("menangkap desakan kuota terbatas atau hari ini juga (bobot 10, tanpa Modus)", async () => {
    const teks =
      "Lowongan kurir ekspedisi PT Kilat Nusantara di Semarang. Kuota terbatas, kirim berkas lamaranmu hari ini juga!";
    const hasil = await cek(teks);

    const r10 = tanda(hasil, "R10");
    expect(r10).toMatchObject({
      sumber: "aturan",
      aturanId: "R10",
      bobot: 10,
      kutipan: "Kuota terbatas",
    });
    expect(r10).not.toHaveProperty("modus");
    expect(teks.slice(...r10!.rentang)).toBe(r10!.kutipan);
  });

  it("mengenali pola Inggris 'urgent' dan 'limited slots'", async () => {
    const teks =
      "PT Global Tech in Jakarta is urgently hiring customer support officers. Limited slots available for this batch.";
    const hasil = await cek(teks);

    expect(tanda(hasil, "R10")?.kutipan).toBe("urgently hiring");
  });

  it("tidak cocok untuk lowongan dengan jadwal pendaftaran wajar", async () => {
    const hasil = await cek(
      "PT Karya Mandiri membuka lowongan staf akuntansi di Medan. Pendaftaran dibuka sampai akhir bulan depan.",
    );

    expect(tanda(hasil, "R10")).toBeUndefined();
  });
});

describe("cek: R14 Meminta data pribadi sensitif di awal", () => {
  it("menangkap permintaan foto KTP, selfie dengan KTP, nomor rekening, KK, atau ibu kandung (bobot 20, tanpa Modus)", async () => {
    const teks =
      "Lowongan staf input data PT Mitra Sejahtera di Depok. Untuk pendaftaran awal, kirim foto KTP dan nama ibu kandung.";
    const hasil = await cek(teks);

    const r14 = tanda(hasil, "R14");
    expect(r14).toMatchObject({
      sumber: "aturan",
      aturanId: "R14",
      bobot: 20,
      kutipan: "kirim foto KTP dan nama ibu kandung",
    });
    expect(r14).not.toHaveProperty("modus");
    expect(teks.slice(...r14!.rentang)).toBe(r14!.kutipan);
  });

  it("tidak cocok untuk lowongan yang hanya meminta CV dan portofolio", async () => {
    const hasil = await cek(
      "PT Kreatif Digital di Yogyakarta membutuhkan desainer grafis. Silakan kirim CV terbaru dan portofolio karya Anda.",
    );

    expect(tanda(hasil, "R14")).toBeUndefined();
  });
});

describe("cek: R15 Tautan pendaftaran tidak resmi", () => {
  it("menangkap pemendek tautan seperti bit.ly, s.id, tinyurl, atau form Google (bobot 15, tanpa Modus)", async () => {
    const teks =
      "Rekrutmen terbuka karyawan gudang PT Logistik Utama di Cikarang. Isi formulir pendaftaran di bit.ly/loker-gudang2026.";
    const hasil = await cek(teks);

    const r15 = tanda(hasil, "R15");
    expect(r15).toMatchObject({
      sumber: "aturan",
      aturanId: "R15",
      bobot: 15,
      kutipan: "bit.ly/loker-gudang2026",
    });
    expect(r15).not.toHaveProperty("modus");
    expect(teks.slice(...r15!.rentang)).toBe(r15!.kutipan);
  });

  it("tidak cocok untuk lowongan tanpa tautan pemendek atau form gratisan", async () => {
    const hasil = await cek(
      "PT Nusantara Abadi di Surabaya membuka lowongan teknisi listrik. Lamaran dikirim melalui karir.nusantara.co.id.",
    );

    expect(tanda(hasil, "R15")).toBeUndefined();
  });
});

describe("cek: R13 Tanda bahaya tersirat (ketiadaan nama badan usaha dan alamat)", () => {
  it("menghasilkan tepat satu Tanda bahaya tersirat (bobot 10, tanpa kutipan) kalau nama badan usaha dan alamat sama-sama tidak ada, serta menambah Skor", async () => {
    const teks =
      "Dibutuhkan karyawan paruh waktu untuk bagian pengemasan barang dari rumah. Gaji dibayar mingguan sesuai target.";
    const hasil = await cek(teks);

    expect(hasil.tandaBahaya).toEqual([]);
    expect(hasil.tandaBahayaTersirat).toEqual([
      {
        alasan: "Tidak disebutkan nama perusahaan maupun alamat kantor.",
        bobot: 10,
      },
    ]);
    expect(hasil.skor).toBe(10);
    expect(hasil.label).toBe("risiko_rendah");
  });

  it("ikut dijumlahkan dengan Tanda bahaya Aturan biasa ke dalam Skor", async () => {
    const teks =
      "Dibutuhkan karyawan pengemasan barang dari rumah. Syarat mudah, tanpa interview dan kuota terbatas untuk minggu ini.";
    const hasil = await cek(teks);

    // R09 (15) + R10 (10) + R13 tersirat (10) = 35 → Waspada
    expect(hasil.tandaBahaya.map((t) => t.aturanId)).toEqual(["R09", "R10"]);
    expect(hasil.tandaBahayaTersirat).toHaveLength(1);
    expect(hasil.skor).toBe(35);
    expect(hasil.label).toBe("waspada");
  });

  it.each([
    [
      "ada nama PT walaupun tanpa alamat",
      "PT Sinar Logistik membuka lowongan staf administrasi penuh waktu. Kirim lamaran dan daftar riwayat hidup terbaru.",
    ],
    [
      "ada nama CV walaupun tanpa alamat",
      "CV Karya Mandiri membutuhkan tenaga akuntansi berpengalaman minimal satu tahun untuk pembukuan bulanan.",
    ],
    [
      "ada nama Tbk walaupun tanpa alamat",
      "Lowongan analis data di Mandiri Sekuritas Tbk untuk lulusan baru jurusan statistika atau matematika.",
    ],
    [
      "ada nama toko walaupun tanpa alamat",
      "Dibutuhkan penjaga kasir untuk Toko Berkah Jaya. Jam kerja delapan jam sehari dengan libur satu hari seminggu.",
    ],
    [
      "ada alamat jalan walaupun tanpa nama badan usaha",
      "Dibutuhkan staf gudang dan pengiriman barang untuk penempatan di Jl. Sudirman No. 45, jam kerja Senin sampai Jumat.",
    ],
    [
      "ada lokasi kantor cabang kota walaupun tanpa nama badan usaha",
      "Dibutuhkan staf administrasi untuk kantor cabang di Bandung. Kirim lamaran dan CV ke bagian HRD.",
    ],
  ])("tidak muncul kalau %s", async (_kasus, teks) => {
    const hasil = await cek(teks);

    expect(hasil.tandaBahayaTersirat).toEqual([]);
  });
});

describe("cek: cakupan katalog Aturan (FR-03: minimal 15 aturan)", () => {
  it("memberi Tanda bahaya dari minimal 15 aturan berbeda lewat perilaku cek()", async () => {
    const sampel = [
      // R01, R02
      "Wajib transfer biaya seragam Rp200.000 dan kirim kode OTP ke admin di Bandung.",
      // R03, R05, R12, R16
      "Kerja admin online di Kamboja dengan visa turis, gaji 25 juta tanpa pengalaman, berangkat cepat ke luar negeri.",
      // R04, R11
      "Lowongan PT Pertamina di Jakarta, gaji Rp18 juta per bulan, kirim CV ke rekrutmen.pertamina@gmail.com.",
      // R06a, R06b, R07, R08
      "Kerja mudah like dan subscribe dibayar, wajib deposit untuk naik level, hubungi WA 0812-3456-7890 lalu lanjut di Telegram.",
      // R09, R10, R13 (tersirat), R14, R15
      "Lowongan kerja tanpa interview, kuota terbatas hari ini juga! Kirim foto KTP dan daftar lewat bit.ly/daftar-kerja99.",
    ];

    const hasilSemua = await Promise.all(sampel.map((t) => cek(t)));
    const aturanTerpicu = new Set(
      hasilSemua.flatMap((h) => [
        ...h.tandaBahaya.map((t) => t.aturanId).filter(Boolean),
        ...(h.tandaBahayaTersirat.length > 0 ? ["R13"] : []),
      ]),
    );

    expect(aturanTerpicu.size).toBeGreaterThanOrEqual(15);
  });
});

describe("cek: batas aturan umum (tidak cocok untuk Teks wajar)", () => {
  it.each([
    ["R06a", "PT Sinar Jaya di Bekasi membuka lowongan. Karyawan akan dimasukkan ke grup WA divisi setelah kontrak ditandatangani."],
    ["R10", "PT Sinar Jaya di Bekasi. Dibutuhkan segera staf gudang, pendaftaran dibuka sampai akhir bulan."],
    ["R10", "PT Global Tech in Jakarta is hiring support officers. Apply now through our careers page."],
    ["R14", "PT Sinar Jaya di Bekasi. Gaji ditransfer ke nomor rekening karyawan setiap tanggal 25."],
    ["R15", "Toko Berkah Jaya di Bandung mencari kasir. Isi form Google yang kami bagikan di Instagram toko."],
  ])("%s tidak cocok: %s", async (id, teks) => {
    expect(tanda(await cek(teks), id)).toBeUndefined();
  });

  it("R15 mencurigai formulir Google yang mengatasnamakan perusahaan besar", async () => {
    const hasil = await cek("Rekrutmen PT Pertamina tahun ini. Daftar lewat forms.gle/rekrutmen2026 sebelum kuota penuh.");

    expect(tanda(hasil, "R15")?.kutipan).toBe("forms.gle/rekrutmen2026");
  });

  it.each([
    ["perusahaan ternama", "Dibutuhkan admin untuk perusahaan ternama. Kerja dari rumah, gaji dibayar mingguan sesuai target."],
    ["PT resmi", "Kerja ke luar negeri lewat PT resmi, proses mudah. Gaji dibayar setiap bulan langsung ke pekerja."],
    ["penempatan", "Dibutuhkan operator pabrik, penempatan Kamboja. Gaji dibayar setiap bulan langsung ke pekerja."],
    ["domisili pelamar", "Dibutuhkan admin input data, domisili Bandung diutamakan. Kerja dari rumah, gaji mingguan."],
    ["CV pelamar", "Dibutuhkan admin input data kerja dari rumah. Kirim CV terbaru ke WA 0812-3456-7890 sekarang."],
    ["CV di akhir kalimat", "Dibutuhkan admin input data kerja dari rumah, gaji mingguan. Kirim CV. Hubungi admin untuk info."],
    ["alamat email", "Dibutuhkan admin input data kerja dari rumah. Kirim lamaran ke alamat email hrd.loker@gmail.com."],
    ["alamat pelamar", "Dibutuhkan admin input data kerja dari rumah. Sertakan alamat lengkap kamu dan nomor HP aktif."],
    ["lokasi kerja fleksibel", "Dibutuhkan admin input data, lokasi kerja fleksibel dari rumah. Gaji dibayar setiap minggu."],
  ])("R13 tetap muncul walau Teks menyebut %s", async (_kasus, teks) => {
    expect((await cek(teks)).tandaBahayaTersirat).toHaveLength(1);
  });
});
