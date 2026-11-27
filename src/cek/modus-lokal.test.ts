import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

const idAturan = (hasil: HasilCek) => hasil.tandaBahaya.map((t) => t.aturanId).sort();

describe("cek: R04 Gaji tidak wajar untuk kerja dalam negeri", () => {
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
});

describe("cek: Teks loker pabrik palsu atas nama PT besar", () => {
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
