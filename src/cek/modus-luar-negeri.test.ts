import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

const idAturan = (hasil: HasilCek) => hasil.tandaBahaya.map((t) => t.aturanId).sort();

describe("cek: R03 Kerja luar negeri dengan visa kunjungan atau wisata", () => {
  it("memberi Label Bahaya dengan Modus Luar negeri untuk berangkat kerja pakai visa wisata", async () => {
    const teks =
      "Lowongan kerja restoran di Malaysia, proses mudah. Kamu bisa berangkat pakai  Visa Wisata dulu, nanti diurus di sana.";
    const hasil = await cek(teks);

    expect(hasil.label).toBe("bahaya");
    // + R13 tersirat (10): Teks tidak menyebut nama badan usaha maupun alamat.
    expect(hasil.skor).toBe(70);
    const r03 = tanda(hasil, "R03");
    expect(r03).toMatchObject({
      sumber: "aturan",
      bobot: 60,
      modus: "luar_negeri",
      kutipan: "berangkat pakai  Visa Wisata",
    });
    expect(teks.slice(...r03!.rentang)).toBe(r03!.kutipan);
    expect(hasil.modus).toEqual(["luar_negeri"]);
    expect(hasil.modusTerkuat).toBe("luar_negeri");
  });

  it("mengenali 'visa kunjungan untuk kerja', 'bebas visa untuk kerja', dan pola Inggris", async () => {
    const kunjungan = await cek(
      "Dicari pelayan kafe di Dubai. Kami siapkan visa kunjungan untuk kerja, gaji dibayar setiap akhir bulan.",
    );
    const bebasVisa = await cek(
      "Ayo kerja di Thailand, prosesnya mudah. Manfaatkan fasilitas bebas visa untuk kerja selama 30 hari di sana.",
    );
    const en = await cek(
      "Hiring waiters for a restaurant in Bangkok. You will enter on a tourist visa and we sort out the rest later.",
    );

    expect(tanda(kunjungan, "R03")?.kutipan).toBe("visa kunjungan untuk kerja");
    expect(tanda(bebasVisa, "R03")?.kutipan).toBe("bebas visa untuk kerja");
    expect(tanda(en, "R03")?.kutipan).toBe("on a tourist visa");
    for (const hasil of [kunjungan, bebasVisa, en]) expect(hasil.label).toBe("bahaya");
  });

  it("tidak cocok untuk visa wisata yang bukan cara berangkat kerja", async () => {
    const travel = await cek(
      "Biro perjalanan di Jakarta mencari staf tiket. Tugas mengurus visa turis, paspor, dan jadwal tur pelanggan.",
    );
    const visaKerja = await cek(
      "Lowongan perawat ke Jepang lewat P3MI berizin. Peserta berangkat dengan visa kerja resmi setelah pelatihan bahasa.",
    );

    const pelanggan = await cek(
      "Agen perjalanan di Surabaya mencari staf CS untuk membantu pelanggan berangkat dengan visa turis ke Jepang.",
    );
    const tamu = await cek(
      "Staf travel bekerja melayani tamu yang berangkat dengan visa turis ke Jepang setiap musim liburan.",
    );
    const bandara = await cek(
      "Petugas informasi bandara di Bali, bertugas membantu turis asing yang masuk dengan visa on arrival setiap hari.",
    );

    for (const hasil of [travel, visaKerja, pelanggan, tamu, bandara]) {
      expect(tanda(hasil, "R03")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("dibatalkan Penyangkal: peringatan 'jangan berangkat kerja pakai visa turis'", async () => {
    const hasil = await cek(
      "Hati-hati penipuan kerja ke luar negeri. Jangan berangkat pakai visa turis, pastikan visa kerja resmi lewat P3MI.",
    );

    expect(tanda(hasil, "R03")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("Penyangkal sebelum koma tidak membatalkan: 'Gratis tiket, berangkat pakai visa turis'", async () => {
    const hasil = await cek(
      "Lowongan admin restoran di Kamboja. Gratis tiket, berangkat pakai visa turis, nanti diurus di sana oleh bos.",
    );

    expect(tanda(hasil, "R03")?.kutipan).toBe("berangkat pakai visa turis");
    expect(hasil.label).toBe("bahaya");
  });

  it("tetap menangkap kecocokan kedua yang tidak didahului Penyangkal", async () => {
    const teks =
      "Kami tidak memakai visa turis untuk kerja seperti agen lain. Tapi kalau mau cepat, kamu bisa berangkat dengan visa turis.";
    const hasil = await cek(teks);

    const r03 = tanda(hasil, "R03");
    expect(r03?.kutipan).toBe("berangkat dengan visa turis");
    expect(teks.slice(...r03!.rentang)).toBe(r03!.kutipan);
    expect(hasil.label).toBe("bahaya");
  });
});

describe("cek: R05 Gaji luar negeri tinggi tanpa syarat keahlian", () => {
  it("cocok untuk gaji puluhan juta tanpa pengalaman di negara tujuan, walau di baris berbeda", async () => {
    const teks =
      "LOWONGAN KERJA TAIWAN\nPosisi: operator pabrik\nGaji Rp 25 juta per bulan\nTanpa pengalaman, usia 18-40 tahun";
    const hasil = await cek(teks);

    const r05 = tanda(hasil, "R05");
    expect(r05).toMatchObject({ sumber: "aturan", bobot: 25, modus: "luar_negeri", kutipan: "Gaji Rp 25 juta" });
    expect(teks.slice(...r05!.rentang)).toBe(r05!.kutipan);
    // + R13 tersirat (10): Teks tidak menyebut nama badan usaha maupun alamat.
    expect(hasil.skor).toBe(35);
    expect(hasil.label).toBe("waspada");
    expect(hasil.modusTerkuat).toBe("luar_negeri");
  });

  it("mengenali nominal penuh, rentang, 'luar negeri', dan pola Inggris", async () => {
    const penuh = await cek(
      "Dicari pekerja kebun di luar negeri. Gaji mulai Rp18.000.000 sebulan, tidak perlu pengalaman, langsung kerja.",
    );
    const rentang = await cek(
      "Kerja pabrik di Korea Selatan untuk lulusan SMP. Tanpa skill pun bisa, gaji 20-30 juta setiap bulan.",
    );
    const en = await cek(
      "Factory jobs in Japan for everyone. No experience needed. Salary up to 35 million rupiah per month plus bonus.",
    );

    expect(tanda(penuh, "R05")?.kutipan).toBe("Gaji mulai Rp18.000.000");
    expect(tanda(rentang, "R05")?.kutipan).toBe("gaji 20-30 juta");
    expect(tanda(en, "R05")?.kutipan).toBe("Salary up to 35 million");
  });

  it("tidak cocok kalau salah satu syarat tidak ada", async () => {
    const dalamNegeri = await cek(
      "Dicari sales lapangan di Surabaya, tanpa pengalaman boleh. Gaji Rp 25 juta per bulan untuk yang capai target.",
    );
    const berpengalaman = await cek(
      "Dibutuhkan welder bersertifikat untuk proyek di Jepang. Pengalaman minimal 3 tahun. Gaji Rp30 juta per bulan.",
    );
    const gajiWajar = await cek(
      "Kerja pabrik di Malaysia lewat P3MI resmi, tanpa pengalaman boleh. Gaji sekitar 8 juta per bulan, lembur dibayar.",
    );

    const restoran = await cek(
      "Restoran Jepang di Jakarta Selatan mencari pelayan, tanpa pengalaman boleh. Gaji Rp 20 juta per bulan plus servis.",
    );

    for (const hasil of [dalamNegeri, berpengalaman, gajiWajar, restoran]) expect(tanda(hasil, "R05")).toBeUndefined();
  });

  it("tidak cocok untuk kalimat penyangkalan tentang gaji tinggi", async () => {
    const hasil = await cek(
      "Kerja di Jepang lewat P3MI resmi. Gaji tidak sampai 20 juta, dan peserta tanpa pengalaman wajib pelatihan dulu.",
    );

    expect(tanda(hasil, "R05")).toBeUndefined();
  });

  it("tidak dibatalkan kalimat penyangkalan, karena bukan Aturan kritis", async () => {
    const hasil = await cek(
      "Kerja di Jepang tidak mungkin gaji 50 juta tanpa pengalaman. Waspadai tawaran seperti itu dan cek ke KP2MI.",
    );

    expect(tanda(hasil, "R05")?.kutipan).toBe("gaji 50 juta");
    expect(hasil.label).toBe("waspada");
  });
});

describe("cek: R12 Proses berangkat ke luar negeri cepat di luar jalur resmi", () => {
  it("cocok untuk 'berangkat cepat' dengan Modus Luar negeri", async () => {
    const teks =
      "Lowongan pabrik elektronik di Malaysia untuk lulusan SMA. Proses mudah dan bisa Berangkat  Cepat, kuota terbatas.";
    const hasil = await cek(teks);

    const r12 = tanda(hasil, "R12");
    expect(r12).toMatchObject({ sumber: "aturan", bobot: 25, modus: "luar_negeri", kutipan: "Berangkat  Cepat" });
    expect(teks.slice(...r12!.rentang)).toBe(r12!.kutipan);
    expect(hasil.label).toBe("waspada");
    expect(hasil.modus).toEqual(["luar_negeri"]);
  });

  it("mengenali 'tanpa lewat PT', 'paspor diurus', 'tiket pesawat ditanggung', dan pola Inggris", async () => {
    const tanpaPt = await cek(
      "Kerja jadi ART di Hong Kong, daftar langsung ke saya tanpa lewat PT atau P3MI supaya lebih hemat waktu.",
    );
    const paspor = await cek(
      "Dicari pekerja kebun sawit di Sabah. Paspor diurus agen, kamu cukup siapkan KTP dan KK untuk pendaftaran.",
    );
    const tiket = await cek(
      "Lowongan pelayan restoran di Dubai. Tiket pesawat ditanggung bos, potong gaji tiga bulan pertama saja.",
    );
    const en = await cek(
      "Urgent hiring for a casino hotel in Macau. Fly out within 7 days, your passport will be arranged by our team.",
    );

    expect(tanda(tanpaPt, "R12")?.kutipan).toBe("tanpa lewat PT atau P3MI");
    expect(tanda(paspor, "R12")?.kutipan).toBe("Paspor diurus");
    expect(tanda(tiket, "R12")?.kutipan).toBe("Tiket pesawat ditanggung");
    expect(tanda(en, "R12")?.kutipan).toBe("Fly out within 7 days");
  });

  it("tidak cocok untuk keberangkatan atau tiket yang bukan jalur cepat ke luar negeri", async () => {
    const resmi = await cek(
      "Program magang ke Jepang lewat LPK dan P3MI berizin. Pelatihan bahasa enam bulan sebelum keberangkatan.",
    );
    const konser = await cek(
      "Event organizer di Jakarta mencari kru panggung. Bonus gratis tiket konser dan makan siang setiap acara.",
    );

    const skincare = await cek(
      "Toko skincare Korea di Bandung mencari staf gudang. Tiket pesawat ditanggung kantor untuk perjalanan dinas.",
    );
    const sendiri = await cek(
      "Penempatan ke Taiwan lewat P3MI berizin. Paspor disiapkan sendiri, tiket pesawat dibayar sendiri lalu diganti.",
    );

    for (const hasil of [resmi, konser, skincare, sendiri]) {
      expect(tanda(hasil, "R12")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak cocok untuk kalimat penyangkalan tentang jalur cepat", async () => {
    const hasil = await cek(
      "Penempatan ke Taiwan lewat P3MI resmi. Kami tidak memberangkatkan pekerja secara kilat dan tidak mengurus paspor.",
    );

    expect(tanda(hasil, "R12")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("tidak dibatalkan kalimat penyangkalan, karena bukan Aturan kritis", async () => {
    const hasil = await cek(
      "Penempatan kerja ke Taiwan lewat P3MI resmi. Kami tidak menjanjikan berangkat cepat, proses resmi butuh 3 bulan.",
    );

    expect(tanda(hasil, "R12")?.kutipan).toBe("berangkat cepat");
    expect(hasil.label).toBe("waspada");
  });
});

describe("cek: R16 Negara tujuan rawan TPPO untuk kerja online", () => {
  it("cocok untuk admin online di Kamboja dengan Modus Luar negeri", async () => {
    const teks =
      "Dibutuhkan Admin  Online untuk perusahaan investasi di Kamboja. Kerja di kantor, mess dan makan disediakan.";
    const hasil = await cek(teks);

    const r16 = tanda(hasil, "R16");
    expect(r16).toMatchObject({
      sumber: "aturan",
      bobot: 25,
      modus: "luar_negeri",
      kutipan: "Admin  Online untuk perusahaan investasi di Kamboja",
    });
    expect(teks.slice(...r16!.rentang)).toBe(r16!.kutipan);
    expect(hasil.label).toBe("waspada");
    expect(hasil.modusTerkuat).toBe("luar_negeri");
  });

  it("mengenali negara disebut lebih dulu, kota perbatasan, dan pola Inggris", async () => {
    const myanmar = await cek(
      "Lowongan kerja di Myanmar sebagai operator chat untuk aplikasi kencan. Gaji dibayar dalam dolar setiap bulan.",
    );
    const perbatasan = await cek(
      "Penempatan di Mae Sot, perbatasan Thailand. Posisi customer service online, shift malam, bisa bahasa Indonesia.",
    );
    const en = await cek(
      "We are hiring customer service online staff for our office in Phnom Penh. Indonesian speakers are welcome.",
    );

    expect(tanda(myanmar, "R16")?.kutipan).toBe("Myanmar sebagai operator chat");
    expect(tanda(perbatasan, "R16")?.kutipan).toBe("customer service online");
    expect(tanda(en, "R16")?.kutipan).toBe("customer service online staff for our office in Phnom Penh");
  });

  it("tidak cocok untuk Thailand biasa, pekerjaan lain di Kamboja, atau admin online dalam negeri", async () => {
    const thailand = await cek(
      "Hotel di Bangkok, Thailand mencari customer service untuk resepsionis. Wajib bisa bahasa Inggris dan Thai.",
    );
    const guru = await cek(
      "Sekolah internasional di Kamboja mencari guru bahasa Inggris berpengalaman dengan sertifikat mengajar resmi.",
    );
    const lokal = await cek(
      "Dicari admin online untuk toko pakaian di Bandung. Kerja di kantor, gaji UMR, kirim CV ke email HRD toko.",
    );

    const pabrik = await cek(
      "Dibutuhkan operator mesin jahit untuk pabrik garmen di Kamboja, lewat P3MI resmi dengan kontrak dua tahun.",
    );
    const resort = await cek(
      "Resort di Laos mencari staf marketing yang fasih berbahasa Inggris untuk tamu dari Asia Tenggara.",
    );

    for (const hasil of [thailand, guru, lokal, pabrik, resort]) {
      expect(tanda(hasil, "R16")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak cocok untuk kalimat penyangkalan tentang negara rawan", async () => {
    const hasil = await cek(
      "Kami tidak menempatkan pekerja di Kamboja atau Myanmar. Posisi yang dibuka hanya teknisi pabrik di Malaysia.",
    );

    expect(tanda(hasil, "R16")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("tidak dibatalkan kalimat penyangkalan, karena bukan Aturan kritis", async () => {
    const hasil = await cek(
      "Waspada! Jangan tergiur tawaran admin online di Kamboja dengan gaji besar. Cek dulu izin perusahaannya ke KP2MI.",
    );

    expect(tanda(hasil, "R16")?.kutipan).toBe("admin online di Kamboja");
    expect(hasil.label).toBe("waspada");
  });
});

describe("cek: Teks tawaran kerja ke Kamboja dengan visa wisata", () => {
  it("berlabel Bahaya dengan Modus terkuat Luar negeri", async () => {
    const teks =
      "Lowongan admin online di Kamboja, gaji 20 juta per bulan tanpa pengalaman. " +
      "Berangkat pakai visa wisata saja, tiket pesawat ditanggung perusahaan.";
    const hasil = await cek(teks);

    expect(idAturan(hasil)).toEqual(["R03", "R05", "R12", "R16"]);
    expect(hasil.skor).toBe(100);
    expect(hasil.label).toBe("bahaya");
    expect(hasil.modus).toEqual(["luar_negeri"]);
    expect(hasil.modusTerkuat).toBe("luar_negeri");
    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual([
      "Berangkat pakai visa wisata",
      "admin online di Kamboja",
      "gaji 20 juta",
      "tiket pesawat ditanggung",
    ]);
    for (const t of hasil.tandaBahaya) expect(teks.slice(...t.rentang)).toBe(t.kutipan);
  });
});

describe("cek: Modus terkuat saat bobot seri", () => {
  it("memilih Luar negeri saat bobotnya sama dengan Lokal", async () => {
    const hasil = await cek(
      "Kerja pabrik di Malaysia. Peserta wajib bayar biaya medical Rp1.500.000, lalu berangkat pakai visa turis.",
    );

    expect(idAturan(hasil)).toEqual(["R01", "R03"]);
    expect(hasil.tandaBahaya.map((t) => [t.modus, t.bobot])).toEqual([
      ["lokal", 60],
      ["luar_negeri", 60],
    ]);
    expect(hasil.modus).toEqual(["luar_negeri", "lokal"]);
    expect(hasil.modusTerkuat).toBe("luar_negeri");
  });
});
