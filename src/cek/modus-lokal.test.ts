import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

const idAturan = (hasil: HasilCek) => hasil.tandaBahaya.map((t) => t.aturanId).sort();

describe("cek: R04 Gaji tidak wajar untuk kerja dalam negeri", () => {
  it("tidak cocok kalau posisi mensyaratkan pengalaman bertahun-tahun", async () => {
    const id = await cek(
      "Dicari Senior Data Engineer di Jakarta, minimal 6 tahun pengalaman dengan Spark. Gaji Rp30.000.000 per bulan plus asuransi.",
    );
    const urutanLain = await cek(
      "Lowongan Plant Manager pabrik semen di Tuban. Pengalaman kerja minimal 10 tahun di bidang produksi. Gaji hingga 45 juta.",
    );

    expect(tanda(id, "R04")).toBeUndefined();
    expect(tanda(urutanLain, "R04")).toBeUndefined();
  });

  it("tetap cocok kalau syarat pengalamannya hanya 1–2 tahun", async () => {
    const hasil = await cek(
      "Dibutuhkan admin toko online di Bekasi, pengalaman minimal 1 tahun. Gaji Rp18 juta per bulan, langsung kerja.",
    );

    expect(tanda(hasil, "R04")?.kutipan).toBe("Gaji Rp18 juta");
  });

  it("memberi Label Waspada dengan Modus Lokal untuk gaji Rp15 juta sebulan", async () => {
    const teks =
      "Dibutuhkan staf gudang di Cikarang, lulusan SMA. Gaji  Rp15 juta per bulan, langsung kerja minggu depan.";
    const hasil = await cek(teks);

    const r04 = tanda(hasil, "R04");
    expect(r04).toMatchObject({ sumber: "aturan", bobot: 25, modus: "lokal", kutipan: "Gaji  Rp15 juta" });
    expect(teks.slice(...r04!.rentang)).toBe(r04!.kutipan);
    expect(hasil.label).toBe("waspada");
    expect(hasil.modus).toEqual(["lokal"]);
    expect(hasil.modusTerkuat).toBe("lokal");
  });

  it("mengenali nominal tanpa Rp, gaji harian, dan high salary", async () => {
    const titik = await cek(
      "Lowongan admin toko online di Bandung. Gaji pokok 15.000.000 sebulan, kerja dari rumah, cukup punya HP.",
    );
    const harian = await cek(
      "Kerja santai jaga stand pameran di Jakarta, dapat Rp500 ribu per hari, dibayar tunai setiap sore.",
    );
    const inggris = await cek(
      "Urgently hiring data entry staff in Surabaya. High salary, flexible hours, no interview, apply via WhatsApp.",
    );

    expect(tanda(titik, "R04")?.kutipan).toBe("Gaji pokok 15.000.000");
    expect(tanda(harian, "R04")?.kutipan).toBe("Rp500 ribu per hari");
    expect(tanda(inggris, "R04")?.kutipan).toBe("High salary");
    for (const hasil of [titik, harian, inggris]) expect(tanda(hasil, "R04")?.modus).toBe("lokal");
  });

  it("mengenali gaji bulanan tanpa kata gaji, seperti gaji harian", async () => {
    const dapat = await cek(
      "Kerja input data dari rumah, cukup modal HP. Kamu bisa dapat Rp15 juta per bulan tanpa target apa pun.",
    );
    const garisMiring = await cek(
      "Dicari admin media sosial di Yogyakarta, lulusan SMA boleh. Hasilnya bisa 15.000.000/bulan, kerja santai.",
    );
    const sebulan = await cek(
      "Lowongan packing barang di rumah, kerja 3 jam sehari. Hasilkan 20 jt sebulan, pendaftaran lewat WA saja.",
    );

    expect(tanda(dapat, "R04")?.kutipan).toBe("Rp15 juta per bulan");
    expect(tanda(garisMiring, "R04")?.kutipan).toBe("15.000.000/bulan");
    expect(tanda(sebulan, "R04")?.kutipan).toBe("20 jt sebulan");
  });

  it("mengenali kata gaji yang diikuti bisa atau dapat", async () => {
    const bisa = await cek(
      "Lowongan admin chat di Bandung, cukup lulusan SMP. Gaji bisa mencapai Rp15 juta kalau rajin, daftar sekarang.",
    );
    const dapat = await cek(
      "Kerja paruh waktu dari rumah untuk ibu rumah tangga. Penghasilan dapat 20 juta, tanpa modal dan tanpa target.",
    );

    expect(tanda(bisa, "R04")?.kutipan).toBe("Gaji bisa mencapai Rp15 juta");
    expect(tanda(dapat, "R04")?.kutipan).toBe("Penghasilan dapat 20 juta");
  });

  it("tidak cocok untuk gaji wajar yang diikuti bisa atau dapat", async () => {
    const hasil = await cek(
      "Dibutuhkan staf administrasi di Tangerang. Gaji bisa mencapai Rp 9 juta sesuai pengalaman, plus BPJS dan THR.",
    );

    expect(tanda(hasil, "R04")).toBeUndefined();
    expect(hasil.label).toBe("risiko_rendah");
  });

  it("tidak cocok untuk angka bulanan yang bukan bayaran", async () => {
    const target = await cek(
      "Dicari supervisor sales di Makassar untuk mengejar target penjualan Rp 100 juta per bulan bersama tim.",
    );
    const cicilan = await cek(
      "Staf penagihan leasing di Palembang, bertugas memantau cicilan Rp20 juta per bulan dari nasabah korporat.",
    );
    const rentang = await cek(
      "Kepala gudang di Cirebon wajib terbiasa mengelola omzet 10-20 juta per bulan dan stok barang harian.",
    );

    for (const hasil of [target, cicilan, rentang]) expect(tanda(hasil, "R04")).toBeUndefined();
  });

  it("tidak cocok untuk gaji wajar atau angka besar yang bukan gaji", async () => {
    const bulanan = await cek(
      "Dibutuhkan admin gudang di Bekasi. Gaji Rp 8.000.000 per bulan, BPJS, dan THR. Kirim CV ke kantor kami.",
    );
    const desimal = await cek(
      "Lowongan kasir minimarket di Depok. Gaji Rp4,25 juta per bulan sesuai UMK, lembur dibayar sesuai aturan.",
    );
    const harian = await cek(
      "Dicari tukang bangunan harian di Bogor, upah Rp150.000 per hari plus makan siang, kerja Senin sampai Sabtu.",
    );
    const modal = await cek(
      "Dicari kepala toko cabang Semarang yang mampu mengelola omzet Rp 50 juta per bulan dan memimpin lima staf.",
    );

    for (const hasil of [bulanan, desimal, harian, modal]) {
      expect(tanda(hasil, "R04")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak cocok kalau Teks memuat penanda luar negeri, berapa kali pun dicek", async () => {
    const teks = [
      "Dibutuhkan operator pabrik di Malaysia, pengalaman minimal 1 tahun. Gaji Rp25 juta per bulan.",
      "Hiring warehouse staff for our overseas branch. High salary and dormitory provided for all workers.",
      "Kerja jaga toko di luar negeri, upah Rp750 ribu per hari, kontrak dua tahun lewat agen resmi.",
    ];

    for (const t of teks) {
      for (let i = 0; i < 2; i++) expect(tanda(await cek(t), "R04")).toBeUndefined();
    }
  });

  it("tidak cocok untuk omzet, denda, atau gaji tahunan", async () => {
    const omzet = await cek(
      "Dicari kepala toko di Medan yang terbiasa mengelola omzet Rp 5 juta per hari dan menyusun laporan stok mingguan.",
    );
    const denda = await cek(
      "Staf administrasi gudang di Gresik. Keterlambatan setor laporan dikenai denda Rp500.000 per hari sesuai kontrak.",
    );
    const tahunan = await cek(
      "Dibutuhkan akuntan senior bersertifikat di Jakarta, pengalaman 5 tahun. Gaji 180 juta per tahun, belum termasuk bonus.",
    );

    for (const hasil of [omzet, denda, tahunan]) expect(tanda(hasil, "R04")).toBeUndefined();
  });

  it("tidak cocok untuk kalimat penyangkalan tentang gaji tinggi", async () => {
    const hasil = await cek(
      "Lowongan kasir di Solo. Gaji tidak sampai Rp15 juta, hanya sesuai UMK, jadi hati-hati dengan tawaran yang berlebihan.",
    );

    expect(tanda(hasil, "R04")).toBeUndefined();
  });

  it("tidak dibatalkan kalimat penyangkalan, karena bukan Aturan kritis", async () => {
    const hasil = await cek(
      "Lowongan admin online di Bogor tanpa pengalaman. Tidak ada potongan, gaji Rp20 juta per bulan langsung masuk rekening.",
    );

    expect(tanda(hasil, "R04")?.kutipan).toBe("gaji Rp20 juta");
  });

  it("tetap cocok kalau nama negara hanya menjadi kata sifat", async () => {
    const hasil = await cek(
      "Restoran Jepang di Jakarta Selatan mencari juru masak berpengalaman. Gaji Rp 20 juta per bulan plus servis.",
    );

    expect(tanda(hasil, "R04")?.kutipan).toBe("Gaji Rp 20 juta");
  });
});

describe("cek: R11 Mengatasnamakan perusahaan besar dengan kontak tidak resmi", () => {
  it("mengutip email gratisan saat Teks mengatasnamakan perusahaan besar", async () => {
    const teks =
      "Rekrutmen PT Pertamina (Persero) 2026 untuk lulusan SMA. Kirim CV ke rekrutmen.pertamina@gmail.com paling lambat Jumat.";
    const hasil = await cek(teks);

    const r11 = tanda(hasil, "R11");
    expect(r11).toMatchObject({ sumber: "aturan", bobot: 20, modus: "lokal", kutipan: "rekrutmen.pertamina@gmail.com" });
    expect(teks.slice(...r11!.rentang)).toBe(r11!.kutipan);
  });

  it("mengenali email Yahoo, nomor pribadi, dan BUMN", async () => {
    const yahoo = await cek(
      "Lowongan kerja Bank BRI cabang Medan untuk posisi teller. Lamaran dikirim ke hrd_bri_medan@yahoo.co.id segera.",
    );
    const nomor = await cek(
      "PT Indofood Sukses Makmur membuka lowongan operator produksi. Info lengkap hubungi WA 0812-3456-7890 (Bu Rina).",
    );
    const bumn = await cek(
      "Rekrutmen bersama BUMN tahun ini dibuka untuk lulusan SMK. Kirim berkas lengkap ke rekrutmenbumn.2026@gmail.com.",
    );

    expect(tanda(yahoo, "R11")?.kutipan).toBe("hrd_bri_medan@yahoo.co.id");
    expect(tanda(nomor, "R11")?.kutipan).toBe("0812-3456-7890");
    expect(tanda(bumn, "R11")?.kutipan).toBe("rekrutmenbumn.2026@gmail.com");
  });

  it("tidak cocok untuk perusahaan besar dengan email resmi atau usaha kecil dengan email gratisan", async () => {
    const resmi = await cek(
      "PT Astra Honda Motor membuka lowongan teknisi. Lamaran dikirim lewat recruitment@astra-honda.com atau situs karier resmi.",
    );
    const usahaKecil = await cek(
      "Toko kue rumahan di Malang mencari karyawan bagian produksi. Kirim CV ke dapurbunda.malang@gmail.com ya.",
    );
    const merekMobil = await cek(
      "Dicari sopir pribadi untuk mobil Toyota Innova keluarga di Bekasi, sabar dan jujur. Kirim CV ke keluargabudi@gmail.com.",
    );
    const mandiri = await cek(
      "Dicari asisten rumah tangga yang bisa bekerja mandiri dan rapi. Gaji sesuai kesepakatan, hubungi Bu Ani di 0813-2222-4444.",
    );

    for (const hasil of [resmi, usahaKecil, merekMobil, mandiri]) {
      expect(tanda(hasil, "R11")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak cocok kalau nama perusahaan besar hanya menjadi tempat atau bank rekening gaji", async () => {
    const spbu = await cek(
      "Dicari operator SPBU Pertamina di Klaten, shift pagi dan malam. Lamaran diantar langsung atau hubungi 0812-5555-1234.",
    );
    const dekat = await cek(
      "Warung makan dekat Indomaret Jalan Kaliurang mencari juru masak. Hubungi Pak Joko di 0857-1111-2222 untuk info.",
    );
    const rekening = await cek(
      "CV Maju Jaya mencari staf gudang. Gaji dibayar ke rekening Bank BCA milik karyawan. Info lowongan: majujaya.cv@gmail.com.",
    );

    for (const hasil of [spbu, dekat, rekening]) expect(tanda(hasil, "R11")).toBeUndefined();
  });

  it("tidak cocok untuk kalimat penyangkalan tanpa kontak tidak resmi", async () => {
    const hasil = await cek(
      "PT Pertamina tidak pernah merekrut lewat email gratisan atau nomor pribadi. Lamaran hanya lewat situs karier resmi.",
    );

    expect(tanda(hasil, "R11")).toBeUndefined();
  });

  it("tidak dibatalkan kalimat penyangkalan, karena bukan Aturan kritis", async () => {
    const hasil = await cek(
      "Rekrutmen PT Telkom Indonesia tidak dipungut biaya. Kirim CV ke karier.telkom@gmail.com atau WA +62 812-3456-7890.",
    );

    expect(tanda(hasil, "R11")?.kutipan).toBe("karier.telkom@gmail.com");
  });

  it("mengenali PT Telkom dan nomor dengan pemisah setelah kode negara", async () => {
    const hasil = await cek(
      "Lowongan PT Telkom wilayah Jawa Barat untuk teknisi jaringan. Pendaftaran hanya lewat WA +62-812-9999-0000 ya.",
    );

    expect(tanda(hasil, "R11")?.kutipan).toBe("+62-812-9999-0000");
  });
});

describe("cek: Lowongan pabrik atas nama PT besar dengan email gratisan", () => {
  it("berlabel Waspada dengan Modus terkuat Lokal", async () => {
    const teks =
      "LOWONGAN KERJA PT ASTRA HONDA MOTOR CIKARANG\nPosisi: operator produksi, lulusan SMP/SMA.\n" +
      "Gaji Rp 18 juta per bulan, tanpa tes.\nKirim CV ke hrd.astrahonda@gmail.com sekarang juga.";
    const hasil = await cek(teks);

    expect(idAturan(hasil)).toEqual(["R04", "R11"]);
    expect(hasil.skor).toBe(45);
    expect(hasil.label).toBe("waspada");
    expect(hasil.modus).toEqual(["lokal"]);
    expect(hasil.modusTerkuat).toBe("lokal");
    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual(["Gaji Rp 18 juta", "hrd.astrahonda@gmail.com"]);
    for (const t of hasil.tandaBahaya) expect(teks.slice(...t.rentang)).toBe(t.kutipan);
  });

  it("berlabel Bahaya dengan Modus Lokal kalau juga meminta biaya seragam", async () => {
    const hasil = await cek(
      "Rekrutmen PT Indofood Sukses Makmur bagian packing. Peserta lolos wajib bayar biaya seragam Rp350.000 " +
        "sebelum mulai kerja. Konfirmasi ke indofood.rekrut@gmail.com.",
    );

    expect(idAturan(hasil)).toEqual(["R01", "R11"]);
    expect(hasil.label).toBe("bahaya");
    expect(hasil.modus).toEqual(["lokal"]);
    expect(hasil.modusTerkuat).toBe("lokal");
  });
});
