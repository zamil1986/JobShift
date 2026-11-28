import { describe, expect, it } from "vitest";
import { cek, type HasilCek } from "@/cek";

/** Tanda bahaya Aturan dengan ID tertentu, atau undefined. */
const tanda = (hasil: HasilCek, aturanId: string) =>
  hasil.tandaBahaya.find((t) => t.aturanId === aturanId);

const idAturan = (hasil: HasilCek) => hasil.tandaBahaya.map((t) => t.aturanId).sort();

describe("cek: R07 Deposit untuk naik level atau mencairkan komisi", () => {
  it("menangkap deposit supaya hadiah atau misi terbuka", async () => {
    const hasil = await cek(
      "Misi hari ini sudah selesai kak. Top up Rp150.000 dulu supaya bisa membuka hadiah misi berikutnya, nanti modal kembali.",
    );

    expect(hasil.label).toBe("bahaya");
    expect(tanda(hasil, "R07")?.kutipan).toBe("Top up Rp150.000 dulu supaya bisa membuka hadiah");
  });

  it("menangkap setoran supaya saldo bisa ditarik", async () => {
    const hasil = await cek(
      "Saldo komisi kakak sudah Rp2.400.000. Silakan setor dana Rp500.000 agar saldo bisa ditarik ke rekening hari ini.",
    );

    expect(tanda(hasil, "R07")?.kutipan).toBe("setor dana Rp500.000 agar saldo bisa ditarik");
  });

  it("tidak cocok untuk CS dompet digital yang membantu top up dan tarik saldo", async () => {
    const hasil = await cek(
      "Dicari customer service aplikasi dompet digital di Jakarta. Tugas: membantu pengguna top up, menarik saldo, dan membuka akun baru.",
    );

    expect(tanda(hasil, "R07")).toBeUndefined();
  });

  it("dibatalkan Penyangkal: 'tidak pernah meminta deposit untuk membuka misi'", async () => {
    const hasil = await cek(
      "Program afiliasi resmi kami membayar komisi bulanan. Kami tidak pernah meminta deposit untuk membuka misi atau menarik saldo.",
    );

    expect(tanda(hasil, "R07")).toBeUndefined();
  });

  it("memberi Label Bahaya dengan Modus Tugas untuk deposit supaya naik level", async () => {
    const teks =
      "Selamat bergabung di tim kami. Setelah tugas ketiga, kamu wajib Deposit Rp200.000 untuk naik  level dan lanjut bekerja.";
    const hasil = await cek(teks);

    expect(hasil.label).toBe("bahaya");
    // + R13 tersirat (10): Teks tidak menyebut nama badan usaha maupun alamat.
    expect(hasil.skor).toBe(70);
    const r07 = tanda(hasil, "R07");
    expect(r07).toMatchObject({
      sumber: "aturan",
      bobot: 60,
      modus: "tugas",
      kutipan: "Deposit Rp200.000 untuk naik  level",
    });
    expect(teks.slice(...r07!.rentang)).toBe(r07!.kutipan);
    expect(hasil.modus).toEqual(["tugas"]);
    expect(hasil.modusTerkuat).toBe("tugas");
  });

  it("mengenali top up saldo untuk mencairkan komisi dan pola Inggris", async () => {
    const id = await cek(
      "Komisi kamu sudah Rp350.000. Untuk mencairkan komisi, lakukan top up saldo minimal Rp100.000 ke rekening admin.",
    );
    const en = await cek(
      "Your account is ready. Please make a deposit of $50 to upgrade to VIP and receive higher daily commissions.",
    );

    expect(tanda(id, "R07")?.kutipan).toBe("Untuk mencairkan komisi, lakukan top up");
    expect(id.label).toBe("bahaya");
    expect(tanda(en, "R07")?.kutipan).toBe("deposit of $50 to upgrade to VIP");
  });

  it("tidak cocok untuk deposit, top up, atau VIP yang bukan syarat naik level", async () => {
    const teller = await cek(
      "Dibutuhkan teller bank untuk melayani deposit nasabah, penarikan tunai, dan pembukaan rekening tabungan baru.",
    );
    const pulsa = await cek(
      "Lowongan kasir konter pulsa di Bekasi. Tugas melayani top up e-wallet dan penjualan voucher. Gaji UMR.",
    );
    const hotel = await cek(
      "Hotel bintang empat di Bali membuka lowongan waiter untuk ruang VIP dan restoran utama. Kirim CV ke HRD.",
    );

    for (const hasil of [teller, pulsa, hotel]) {
      expect(tanda(hasil, "R07")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak memasangkan uang dan naik level dari kalimat berbeda atau tanpa kata tujuan", async () => {
    const asuransi = await cek(
      "Sales asuransi dengan bonus naik level jabatan setiap kuartal. Tugas melayani deposit premi nasabah di kantor cabang.",
    );
    const game = await cek(
      "CS game online bertugas membantu top up diamond dan menjawab keluhan pemain yang ingin naik level lebih cepat.",
    );
    const ewallet = await cek(
      "Customer service e-wallet melayani pertanyaan top up saldo dan menjelaskan cara upgrade akun kepada pengguna.",
    );

    for (const hasil of [asuransi, game, ewallet]) expect(tanda(hasil, "R07")).toBeUndefined();
  });

  it("tidak cocok kalau tujuan disebut lebih dulu tanpa kata tujuan atau syarat", async () => {
    const ewallet = await cek(
      "Customer service e-wallet bertugas menjelaskan cara upgrade akun dan top up saldo kepada pengguna baru.",
    );
    const butir = await cek(
      "Tugas CS e-wallet:\n- Membantu upgrade akun premium\n- Melayani top up saldo\n- Menjawab keluhan pengguna",
    );
    const game = await cek(
      "CS game online: bantu pemain yang ingin naik level lebih cepat dan melayani top up diamond setiap hari.",
    );
    const untukAkun = await cek(
      "Staf CS e-wallet membantu pengguna melakukan top up saldo untuk upgrade akun premium di aplikasi resmi.",
    );

    for (const hasil of [ewallet, butir, game, untukAkun]) expect(tanda(hasil, "R07")).toBeUndefined();
  });

  it("mengenali tujuan yang disebut lebih dulu dengan kata syarat: 'dicairkan setelah deposit'", async () => {
    const hasil = await cek(
      "Komisi kamu sudah terkumpul Rp400.000. Komisi bisa dicairkan setelah kamu deposit Rp150.000 ke admin.",
    );

    expect(tanda(hasil, "R07")?.kutipan).toBe("Komisi bisa dicairkan setelah kamu deposit");
  });

  it("mengenali bentuk pasif 'supaya komisi bisa dicairkan'", async () => {
    const hasil = await cek(
      "Saldo kamu sudah cukup banyak. Isi saldo Rp500.000 dulu supaya komisi bisa dicairkan ke rekening hari ini.",
    );

    expect(tanda(hasil, "R07")?.kutipan).toBe("Isi saldo Rp500.000 dulu supaya komisi bisa dicairkan");
  });

  it("tidak cocok untuk kalimat yang menyangkal deposit", async () => {
    const hasil = await cek(
      "Kerja admin input data dari rumah. Tanpa deposit apa pun dan tidak perlu top up, gaji dibayar setiap bulan.",
    );

    expect(tanda(hasil, "R07")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("dibatalkan Penyangkal: peringatan 'tidak pernah meminta deposit … untuk pencairan komisi'", async () => {
    const hasil = await cek(
      "Hati-hati penipuan. Kami tidak pernah meminta deposit atau top up untuk pencairan komisi. Laporkan ke HRD.",
    );

    expect(tanda(hasil, "R07")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });

  it("tetap menangkap kecocokan kedua yang tidak didahului Penyangkal", async () => {
    const teks =
      "Level 1 tanpa deposit untuk naik level. Mulai level 2, kamu wajib deposit Rp100.000 untuk naik level berikutnya.";
    const hasil = await cek(teks);

    const r07 = tanda(hasil, "R07");
    expect(r07?.kutipan).toBe("level 2, kamu wajib deposit");
    expect(teks.slice(...r07!.rentang)).toBe(r07!.kutipan);
    expect(hasil.label).toBe("bahaya");
  });
});

describe("cek: R08 Bayaran per like, rating, ulasan, atau follow", () => {
  it("cocok kalau pekerjaannya sendiri adalah like, follow, subscribe, atau rating yang dibayar", async () => {
    const tugasnya = await cek(
      "Lowongan kerja dari rumah. Pekerjaannya hanya like dan rating produk di marketplace, komisi cair setiap hari.",
    );
    const cariOrang = await cek(
      "Kami mencari member untuk subscribe channel YouTube klien. Bayaran langsung masuk rekening tiap malam.",
    );

    expect(tanda(tugasnya, "R08")?.kutipan).toBe("Pekerjaannya hanya like dan rating");
    expect(tanda(cariOrang, "R08")?.kutipan).toBe("mencari member untuk subscribe");
  });

  it("tidak cocok untuk ajakan follow akun perusahaan atau tugas admin yang menaikkan like", async () => {
    const ajakan = await cek(
      "Lowongan sales PT Niaga Sentosa, gaji pokok plus bonus. Follow akun Instagram kami untuk info lowongan lain.",
    );
    const admin = await cek(
      "Tugas admin: menaikkan like dan follower akun brand. Gaji Rp4.000.000 dan bonus pencapaian target.",
    );

    expect(tanda(ajakan, "R08")).toBeUndefined();
    expect(tanda(admin, "R08")).toBeUndefined();
  });

  it("memberi Label Waspada dengan Modus Tugas untuk bayaran per like", async () => {
    const teks =
      "Kerja sampingan dari HP, cukup like dan follow akun toko online. Dibayar Rp5.000 per like, cair setiap hari.";
    const hasil = await cek(teks);

    expect(hasil.label).toBe("waspada");
    // + R13 tersirat (10): Teks tidak menyebut nama badan usaha maupun alamat.
    expect(hasil.skor).toBe(35);
    const r08 = tanda(hasil, "R08");
    expect(r08).toMatchObject({ sumber: "aturan", bobot: 25, modus: "tugas", kutipan: "Dibayar Rp5.000 per like" });
    expect(teks.slice(...r08!.rentang)).toBe(r08!.kutipan);
    expect(hasil.modusTerkuat).toBe("tugas");
  });

  it("mengenali 'per tugas Rp', 'ulasan dibayar', dan pola Inggris", async () => {
    const perTugas = await cek(
      "Lowongan freelance dari rumah, tugas mudah setiap hari. Komisi per tugas Rp12.000 langsung masuk ke e-wallet.",
    );
    const ulasan = await cek(
      "Dicari reviewer produk marketplace. Setiap ulasan dibayar tunai, bisa dikerjakan sambil santai di rumah.",
    );
    const en = await cek(
      "Part time job from home: get paid per like on YouTube videos, no experience needed, start earning today.",
    );

    expect(tanda(perTugas, "R08")?.kutipan).toBe("per tugas Rp12.000");
    expect(tanda(ulasan, "R08")?.kutipan).toBe("ulasan dibayar");
    expect(tanda(en, "R08")?.kutipan).toBe("paid per like");
  });

  it("tidak cocok untuk like, follow, rating, atau ulasan yang bukan bayaran per tugas", async () => {
    const sosmed = await cek(
      "Dibutuhkan admin media sosial untuk menaikkan jumlah like dan follower akun brand. Gaji Rp4.500.000 per bulan.",
    );
    const cs = await cek(
      "Staf customer service bertugas follow up klien dan membalas ulasan pelanggan. Hasil review dapat dilihat atasan.",
    );
    const en = await cek(
      "We would like to invite experienced drivers with a good rating to join our logistics team in Surabaya.",
    );

    for (const hasil of [sosmed, cs, en]) {
      expect(tanda(hasil, "R08")).toBeUndefined();
      expect(hasil.label).toBe("risiko_rendah");
    }
  });

  it("tidak cocok untuk kalimat penyangkalan tentang bayaran per tugas", async () => {
    const hasil = await cek(
      "Admin toko online dengan gaji tetap bulanan. Kamu tidak dibayar per tugas, dan tidak perlu memberi like atau rating.",
    );

    expect(tanda(hasil, "R08")).toBeUndefined();
    expect(hasil.tandaBahaya).toEqual([]);
  });
});

describe("cek: R06b Diminta pindah ke Telegram atau aplikasi lain", () => {
  it("cocok untuk ajakan diundang atau dimasukkan ke grup Telegram", async () => {
    const undang = await cek(
      "Kerja santai dari rumah, cukup pakai HP. Kalau minat, nanti kakak saya undang ke grup Telegram tim kami ya.",
    );
    const masukkan = await cek(
      "Pendaftaran sudah kami terima. Anda akan dimasukkan ke channel Telegram untuk pembagian tugas harian.",
    );

    expect(tanda(undang, "R06b")?.kutipan).toBe("undang ke grup Telegram");
    expect(tanda(masukkan, "R06b")?.kutipan).toBe("dimasukkan ke channel Telegram");
  });

  it("tidak cocok untuk undangan wawancara yang hanya menyebut Telegram resmi perusahaan", async () => {
    const hasil = await cek(
      "PT Data Prima mengundang pelamar wawancara di kantor Bandung. Pengumuman juga kami bagikan di kanal Telegram resmi perusahaan.",
    );

    expect(tanda(hasil, "R06b")).toBeUndefined();
  });

  it("cocok untuk 'lanjut di Telegram' dengan Modus Tugas, tanpa menaikkan Label", async () => {
    const teks =
      "Terima kasih sudah mendaftar kerja paruh waktu di CV Kreasi Digital. Info tugas harian akan dilanjutkan di Telegram oleh mentor kamu.";
    const hasil = await cek(teks);

    const r06b = tanda(hasil, "R06b");
    expect(r06b).toMatchObject({ sumber: "aturan", bobot: 20, modus: "tugas", kutipan: "dilanjutkan di Telegram" });
    expect(teks.slice(...r06b!.rentang)).toBe(r06b!.kutipan);
    expect(hasil.skor).toBe(20);
    expect(hasil.label).toBe("risiko_rendah");
    expect(hasil.modus).toEqual(["tugas"]);
  });

  it("mengenali 'join grup Telegram', tautan t.me, dan 'move to Telegram'", async () => {
    const grup = await cek(
      "Pendaftaran kerja online sudah dibuka. Silakan join grup Telegram resmi kami untuk mendapat arahan dari admin.",
    );
    const tautan = await cek(
      "Lowongan admin online, kerja santai dari rumah. Daftar sekarang lewat https://t.me/lowongan_harian ya kak.",
    );
    const en = await cek(
      "Thank you for applying to our remote team. Please move to Telegram to receive your first daily task.",
    );

    expect(tanda(grup, "R06b")?.kutipan).toBe("join grup Telegram");
    expect(tanda(tautan, "R06b")?.kutipan).toBe("t.me/lowongan_harian");
    expect(tanda(en, "R06b")?.kutipan).toBe("move to Telegram");
  });

  it("tidak cocok untuk Telegram yang hanya disebut sebagai bagian pekerjaan", async () => {
    const hasil = await cek(
      "Dicari admin media sosial untuk mengelola akun Instagram, TikTok, dan Telegram perusahaan. Kirim CV ke HRD.",
    );

    expect(tanda(hasil, "R06b")).toBeUndefined();
    expect(hasil.modus).toEqual([]);
  });

  it("tidak cocok untuk kalimat penyangkalan tentang Telegram", async () => {
    const hasil = await cek(
      "Rekrutmen staf gudang PT Sinar Logistik. Kami tidak memakai Telegram, semua informasi dikirim lewat email HRD.",
    );

    expect(tanda(hasil, "R06b")).toBeUndefined();
    expect(hasil.skor).toBe(0);
  });
});

describe("cek: Teks kerja tugas like/rating dengan deposit naik level", () => {
  it("berlabel Bahaya dengan Modus terkuat Tugas", async () => {
    const teks =
      "Kerja sampingan dari HP! Tugasnya cuma like video dan kasih rating toko, dibayar Rp5.000 per like. " +
      "Setelah 10 tugas, kamu wajib deposit Rp150.000 untuk naik level VIP dan mencairkan komisi.";
    const hasil = await cek(teks);

    expect(idAturan(hasil)).toEqual(["R07", "R08"]);
    // + R13 tersirat (10): Teks tidak menyebut nama badan usaha maupun alamat.
    expect(hasil.skor).toBe(95);
    expect(hasil.label).toBe("bahaya");
    expect(hasil.modus).toEqual(["tugas"]);
    expect(hasil.modusTerkuat).toBe("tugas");
    expect(hasil.tandaBahaya.map((t) => t.kutipan)).toEqual([
      "deposit Rp150.000 untuk naik level",
      "dibayar Rp5.000 per like",
    ]);
    for (const t of hasil.tandaBahaya) expect(teks.slice(...t.rentang)).toBe(t.kutipan);
  });
});
