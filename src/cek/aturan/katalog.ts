// Katalog Aturan (spec, "Mesin Aturan", katalog awal). Privat untuk inti:
// dites lewat cek(), tidak langsung. Pola ditulis untuk Teks normal (huruf
// kecil, spasi tunggal) dan otomatis dibatasi kata utuh.
//
// Alasan tampil di UI: bahasa awam, tanpa ID aturan, dan tanpa kata "aman",
// "asli", "legit", atau "terpercaya".

import type { Aturan } from "./mesin";

/** Pemisah dalam daftar: "seragam, medical, atau pelatihan". */
const PEMISAH = String.raw`(?: ?[,/&] ?| (?:atau|dan|serta|or|and) | ?, (?:atau|dan|or|and) )`;

/** "a, b, atau c" sebagai satu kecocokan, supaya Penyangkal di depan daftar berlaku untuk seluruh daftar. */
const daftar = (kata: string) => `(?:${kata})(?:${PEMISAH}(?:${kata}))*`;

const JENIS_BIAYA = [
  "seragam",
  "medical(?: check ?up)?",
  "mcu",
  "pelatihan",
  "training",
  "pendaftaran",
  "registrasi",
  "administrasi",
  "admin",
  "jaminan",
  "id ?card",
  "tes kesehatan",
].join("|");

// "pin lokasi" atau "pin point" bukan PIN rahasia.
const DATA_RAHASIA = ["kode otp", "otp", "pin(?! lokasi| point| map)", "kata sandi", "password", "kode verifikasi"].join("|");
// Kata serapan (otp, pin, password) cukup di daftar Indonesia: "no" bukan Penyangkal di
// pola Indonesia, supaya "kirim no HP dan PIN" tetap tertangkap.
const DATA_RAHASIA_EN = ["otp code", "verification code", "security code"].join("|");

export const R01: Aturan = {
  id: "R01",
  alasan: "Meminta uang sebelum kamu resmi diterima kerja.",
  bobot: 60,
  kritis: true,
  modus: "lokal",
  pakaiPenyangkal: true,
  pola: [
    { cari: `(?:biaya|uang) ${daftar(JENIS_BIAYA)}`, bahasa: "id" },
    { cari: "(?:transfer|bayar|membayar) (?:dulu|terlebih dahulu|di awal|di muka)", bahasa: "id" },
    {
      cari: `${daftar("registration|training|uniform|administration|admin|processing|medical")} fees?`,
      bahasa: "en",
    },
    { cari: "pay first|pay upfront|upfront (?:payment|fee)", bahasa: "en" },
  ],
};

export const R02: Aturan = {
  id: "R02",
  alasan: "Meminta kode OTP, PIN, atau password, padahal data ini bisa dipakai untuk membobol akunmu.",
  bobot: 60,
  kritis: true,
  pakaiPenyangkal: true,
  pola: [
    { cari: daftar(DATA_RAHASIA), bahasa: "id" },
    { cari: daftar(DATA_RAHASIA_EN), bahasa: "en" },
  ],
};

// R06b: Telegram yang hanya disebut ("mengelola akun Telegram perusahaan")
// bukan ajakan pindah, jadi harus didahului kata kerja ajakan.
const PINDAH = ["lanjut", "lanjutkan", "dilanjutkan", "pindah", "beralih"];
const AJAKAN_PINDAH = [...PINDAH, "gabung", "bergabung", "join", "masuk", "hubungi", "kontak", "chat"].join("|");
const SAPAAN = ["kami", "admin", "saya", "kak", "kakak", "hrd", "mentor", "kita"].join("|");
const AJAKAN_PINDAH_EN = ["move", "moving", "continue", "switch", "join", "chat", "contact", "message", "text", "reach", "talk"].join("|");

export const R06b: Aturan = {
  id: "R06b",
  alasan: "Memintamu pindah ke Telegram atau aplikasi chat lain, tempat pelaku lebih mudah menghilang.",
  bobot: 20,
  kritis: false,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: `(?:${AJAKAN_PINDAH})(?: (?:${SAPAAN}))?(?: (?:ke|di|lewat|via|melalui|dalam))?(?: (?:grup|group|channel|kanal|akun|aplikasi))? telegram`,
      bahasa: "id",
    },
    { cari: `(?:${PINDAH.join("|")}) (?:ke|di) aplikasi (?:chat )?lain`, bahasa: "id" },
    { cari: "t\\.me/[a-z0-9_]+", bahasa: "id" },
    {
      cari: `(?:${AJAKAN_PINDAH_EN})(?: (?:us|me|our admin|the admin|hr))?(?: (?:to|on|via|in|at|through))?(?: (?:our|the|my))?(?: (?:group|channel))? telegram`,
      bahasa: "en",
    },
  ],
};

/** Nominal yang ikut dikutip, misalnya "Rp200.000" atau "$5". Pola tidak boleh berakhir di "rp" (batas kata). */
const NOMINAL = String.raw`(?:rp|\$) ?\d(?:[\d.,]*\d)?(?: ?(?:rb|ribu|k|jt|juta))?`;

/** Satu kata yang tidak menutup kalimat (tidak berakhir ".", "!", "?"). "Rp200.000" tetap satu kata. */
const KATA_SEKALIMAT = String.raw`\S*[^\s.!?]`;

/**
 * Celah ≤ n kata dalam satu kalimat, boleh diawali tanda baca yang menempel
 * ("komisi, lakukan top up"). Malas supaya kutipan sependek mungkin.
 */
const celah = (n: number) => `[,;:]?(?: ${KATA_SEKALIMAT}){0,${n}}?`;

// R07 kritis tanpa Penyangkal, jadi kata tunggal ("deposit", "top up", "VIP")
// tidak cukup: teller bank, konter pulsa, dan ruang VIP hotel bukan penipuan.
// Uang masuk harus menjadi syarat tujuan Modus Tugas dalam satu kalimat.
const UANG_MASUK = ["(?:men)?deposit(?:kan)?", "top ?-?up", "isi (?:ulang )?saldo", "setor (?:dana|saldo|uang)"].join("|");
const TUJUAN_TUGAS = [
  // "Upgrade akun" saja wajar di CS e-wallet; harus menuju level atau VIP.
  "(?:naik|naikkan|menaikkan|upgrade)(?: ke)?(?: akun)? (?:level|vip)(?! (?:jabatan|karier|karir))",
  "level ?\\d",
  "vip ?\\d",
  "member vip",
  "(?:men)?cairkan (?:komisi|bonus|keuntungan)",
  "(?:pencairan|penarikan|tarik|menarik) (?:komisi|bonus|keuntungan)",
  "(?:komisi|bonus|keuntungan)(?: (?:bisa|dapat|langsung|segera))? (?:dicairkan|ditarik)",
  "membuka (?:level|tugas)",
].join("|");
const KATA_TUJUAN = ["untuk", "supaya", "agar", "biar", "sebelum", "baru"].join("|");
const KATA_SYARAT = ["setelah", "sesudah", "kalau", "jika", "asalkan", "wajib", "harus", "perlu", "syaratnya"].join("|");
const UANG_MASUK_EN = ["deposit", "top ?-?up", "recharge"].join("|");
const TUJUAN_TUGAS_EN = [
  "upgrade(?: your account)?(?: to)? (?:vip|level)",
  "level up",
  "next level",
  "vip ?\\d",
  "withdraw (?:your )?(?:commissions?|earnings|profits?|bonus)",
  "unlock (?:the )?(?:next )?(?:level|tasks?)",
].join("|");
const KATA_TUJUAN_EN = ["to", "for", "so", "before"].join("|");
const KATA_SYARAT_EN = ["after", "once", "if", "must", "need to", "have to"].join("|");

/**
 * Uang hanya cocok sebagai syarat tujuan, dan urutan mana pun wajib memakai
 * kata penghubung, supaya daftar tugas CS ("upgrade akun dan top up saldo")
 * tidak cocok:
 * - uang, kata tujuan, tujuan: "deposit Rp200.000 untuk naik level";
 * - kata tujuan, tujuan, uang: "untuk mencairkan komisi, lakukan top up";
 * - tujuan, kata syarat, uang: "komisi bisa dicairkan setelah kamu deposit".
 */
const uangSebagaiSyarat = (uang: string, tujuan: string, kataTujuan: string, kataSyarat: string) => [
  `(?:${uang})${celah(4)} (?:${kataTujuan})${celah(3)} (?:${tujuan})`,
  `(?:${kataTujuan}) (?:${tujuan})${celah(6)} (?:${uang})`,
  `(?:${tujuan})${celah(3)} (?:${kataSyarat})${celah(3)} (?:${uang})`,
];

export const R07: Aturan = {
  id: "R07",
  alasan: "Meminta deposit atau top-up supaya kamu bisa naik level atau mencairkan komisi.",
  bobot: 60,
  kritis: true,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    ...uangSebagaiSyarat(UANG_MASUK, TUJUAN_TUGAS, KATA_TUJUAN, KATA_SYARAT).map((cari) => ({ cari, bahasa: "id" as const })),
    ...uangSebagaiSyarat(UANG_MASUK_EN, TUJUAN_TUGAS_EN, KATA_TUJUAN_EN, KATA_SYARAT_EN).map((cari) => ({
      cari,
      bahasa: "en" as const,
    })),
  ],
};

// R08: kegiatan saja ("like", "follow up", "rating driver") wajar di lowongan
// biasa, jadi harus berpasangan dengan bayaran.
const KEGIATAN = daftar("like|likes|subscribe|rating|ulasan|review|follow|komen|komentar|share");
const KEGIATAN_EN = "(?:likes?|subscribes?|ratings?|reviews?|follows?|comments?|tasks?|videos?)";
const BAYARAN = ["dibayar", "bayaran", "komisi", "upah", "imbalan", "dapat", "dapatkan", "mendapat", "mendapatkan", "dapet", "cuan"].join("|");
const PER = "(?:per|tiap|setiap|untuk setiap|untuk tiap)";

export const R08: Aturan = {
  id: "R08",
  alasan: "Menjanjikan bayaran untuk setiap like, rating, ulasan, atau follow.",
  bobot: 25,
  kritis: false,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    // "dibayar Rp5.000 per like", "komisi tiap ulasan"
    { cari: `(?:${BAYARAN})(?: ${NOMINAL})? ${PER} ${KEGIATAN}`, bahasa: "id" },
    // "like dan subscribe dibayar", "rating dapat Rp3.000"
    { cari: `${KEGIATAN} (?:dibayar|berbayar|dihargai|(?:dapat|dapet|=) ${NOMINAL})`, bahasa: "id" },
    // "Rp5.000 per like", "Rp10.000/tugas"
    { cari: `${NOMINAL} ?(?:${PER}|/) ?(?:${KEGIATAN}|tugas|task|video)`, bahasa: "id" },
    // "per tugas Rp12.000"
    { cari: `${PER} (?:tugas|task) ${NOMINAL}`, bahasa: "id" },
    { cari: `(?:paid|earn|earning|make)(?: ${NOMINAL})? (?:per|for each|for every) ${KEGIATAN_EN}`, bahasa: "en" },
    { cari: `${NOMINAL} ?(?:per|for each|for every|/) ?${KEGIATAN_EN}`, bahasa: "en" },
  ],
};

export const KATALOG: readonly Aturan[] = [R01, R02, R06b, R07, R08];
