// Katalog Aturan (spec, "Mesin Aturan", katalog awal). Privat untuk inti:
// dites lewat cek(), tidak langsung. Pola ditulis untuk Teks normal (huruf
// kecil, spasi tunggal) dan otomatis dibatasi kata utuh.
//
// Alasan tampil di UI: bahasa awam, tanpa ID aturan, dan tanpa kata "aman",
// "asli", "legit", atau "terpercaya".

import type { Aturan, Pola } from "./mesin";

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

// R07 kritis, jadi kata tunggal ("deposit", "top up", "VIP") tidak cukup:
// teller bank, konter pulsa, dan ruang VIP hotel bukan penipuan. Penyangkal
// berlaku (ADR-0002) supaya peringatan "tidak pernah meminta deposit …" batal.
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
  pakaiPenyangkal: true,
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

/** Negara dan kota tujuan rawan TPPO untuk kerja online (R16). Thailand hanya di perbatasan. */
const NEGARA_RAWAN = [
  "kamboja",
  "cambodia",
  "phnom penh",
  "sihanoukville",
  "bavet",
  "poipet",
  "myanmar",
  "burma",
  "myawaddy",
  "shwe kokko",
  "laos",
  "bokeo",
  "segitiga emas",
  "golden triangle",
  "mae sot",
  "perbatasan (?:thailand|thai|myanmar|kamboja|laos)",
  "thailand perbatasan",
  "thai border",
].join("|");

/** Kata benda yang membuat nama negara menjadi kata sifat: "restoran Jepang", "skincare Korea". */
const NEGARA_SEBAGAI_SIFAT = [
  "bahasa",
  "wisatawan",
  "turis",
  "tamu",
  "restoran",
  "resto",
  "masakan",
  "makanan",
  "kuliner",
  "produk",
  "toko",
  "skincare",
  "kosmetik",
  "drama",
  "budaya",
  "gaya",
  "mobil",
  "motor",
  "merek",
  "brand",
].join("|");

/**
 * Penanda luar negeri (spec, "Mesin Aturan"): nama negara atau kota tujuan
 * umum, atau kata "luar negeri"/"overseas". Sumber regex untuk Teks normal,
 * tanpa batas kata; bungkus dengan `diTeks()` atau batas kata sendiri. Nama
 * negara yang menjadi kata sifat ("restoran Jepang", "wisatawan mancanegara")
 * tidak dihitung. Dipakai R05 dan R12, dan oleh R04 untuk menolak gaji luar
 * negeri.
 *
 * "Inggris" sengaja tidak ada karena juga berarti bahasa Inggris.
 */
export const PENANDA_LUAR_NEGERI = `(?<!(?:${NEGARA_SEBAGAI_SIFAT}) )(?:${[
  "luar negeri",
  "mancanegara",
  "overseas",
  "abroad",
  // Asia Tenggara
  "malaysia",
  "kuala lumpur",
  "johor",
  "penang",
  "sabah",
  "sarawak",
  "singapura",
  "singapore",
  "brunei",
  "thailand",
  "bangkok",
  NEGARA_RAWAN,
  "vietnam",
  "filipina",
  "philippines",
  // Asia Timur
  "makau",
  "macau",
  "hong ?kong",
  "taiwan",
  "taipei",
  "jepang",
  "japan",
  "tokyo",
  "osaka",
  "korea(?: selatan)?",
  "south korea",
  "seoul",
  "busan",
  "china",
  "tiongkok",
  // Timur Tengah
  "arab saudi",
  "saudi(?: arabia)?",
  "riyadh",
  "jeddah",
  "uni emirat arab",
  "uae",
  "dubai",
  "abu dhabi",
  "qatar",
  "doha",
  "kuwait",
  "oman",
  "bahrain",
  "turki",
  // Lainnya
  "australia",
  "selandia baru",
  "new zealand",
  "polandia",
  "poland",
  "jerman",
  "germany",
  "belanda",
  "rusia",
  "amerika(?: serikat)?",
  "kanada",
  "canada",
].join("|")})`;

/** Kata utuh dari `sumber` muncul di mana pun dalam Teks, sebelum atau sesudah posisi ini. */
const diTeks = (sumber: string) => {
  const kata = String.raw`(?<![\p{L}\p{N}])(?:${sumber})(?![\p{L}\p{N}])`;
  // Teks normal tidak memuat baris baru, jadi "." menjangkau seluruh Teks.
  return `(?:(?<=${kata}.*)|(?=.*${kata}))`;
};

/** Pola hanya cocok kalau Teks memuat penanda luar negeri. */
const diLuarNegeri = (pola: Pola[]): Pola[] =>
  pola.map((p) => ({ ...p, cari: `(?:${p.cari})${diTeks(PENANDA_LUAR_NEGERI)}` }));

// R03 kritis, jadi "visa turis" saja tidak cukup: staf biro perjalanan memang
// mengurus visa turis. Visa harus menjadi cara berangkat atau bekerja.
// Penyangkal berlaku (ADR-0002) supaya peringatan "jangan berangkat pakai visa
// turis" batal.
const VISA_KUNJUNGAN = ["turis", "wisata", "kunjungan", "pelancong", "on arrival", "voa", "free"].join("|");
// "masuk" tidak dipakai: petugas bandara membantu turis yang masuk dengan visa on arrival.
const BERANGKAT_KERJA = ["berangkat", "diberangkatkan", "kerja", "bekerja", "dipekerjakan"].join("|");
/** Yang berangkat adalah pelanggan, bukan pekerja: "membantu pelanggan berangkat dengan visa turis". */
const BUKAN_PEKERJA = ["pelanggan", "klien", "turis", "wisatawan", "tamu", "jamaah", "jemaah", "penumpang", "customer"].join("|");
const CARA_VISA = ["pakai", "memakai", "menggunakan", "dengan", "lewat", "via"].join("|");
// "Holiday" tidak dipakai: Working Holiday Visa memang mengizinkan bekerja.
const VISA_KUNJUNGAN_EN = ["tourist", "visit", "visitor", "visiting"].join("|");

export const R03: Aturan = {
  id: "R03",
  alasan: "Mengajakmu bekerja di luar negeri dengan visa turis atau kunjungan, padahal visa itu tidak mengizinkan bekerja.",
  bobot: 60,
  kritis: true,
  modus: "luar_negeri",
  pakaiPenyangkal: true,
  pola: [
    // "berangkat pakai visa wisata", "bekerja di Kamboja dengan visa turis"
    { cari: `(?<!(?:${BUKAN_PEKERJA}) )(?:${BERANGKAT_KERJA})${celah(4)} (?:${CARA_VISA}) visa (?:${VISA_KUNJUNGAN})`, bahasa: "id" },
    // "cukup visa turis", "modal visa on arrival"
    { cari: `(?:cukup|hanya|modal)(?: (?:${CARA_VISA}))? visa (?:${VISA_KUNJUNGAN})`, bahasa: "id" },
    // "visa kunjungan untuk kerja", "bebas visa untuk kerja". Kata "bebas" di
    // awal kecocokan bukan Penyangkal, karena Penyangkal dicari sebelum kecocokan.
    { cari: `(?:visa (?:${VISA_KUNJUNGAN})|bebas visa)${celah(3)} (?:untuk|buat|sambil) (?:kerja|bekerja)`, bahasa: "id" },
    { cari: `(?:on|with|using|via|under) (?:a |the )?(?:${VISA_KUNJUNGAN_EN}) visa`, bahasa: "en" },
    { cari: `(?:(?:${VISA_KUNJUNGAN_EN}) visas?|visa-free|visa free)${celah(3)} (?:to|for) work`, bahasa: "en" },
  ],
};

// R05: tiga syarat sering berada di baris berbeda, jadi Kutipan pemicu adalah
// nominal gaji, dan tanpa-keahlian serta penanda luar negeri cukup ada di Teks.
const TANPA_KEAHLIAN = [
  "tanpa (?:pengalaman|skill|keahlian|keterampilan|ijazah)",
  "tidak (?:perlu|butuh|harus|wajib) (?:pengalaman|berpengalaman|skill|keahlian)",
  "no (?:experience|skills?)(?: (?:needed|required))?",
  "without (?:experience|skills?)",
].join("|");
const KETERANGAN_GAJI = [
  "mulai",
  "dari",
  "hingga",
  "sampai",
  "sebesar",
  "pokok",
  "bersih",
  "bulanan",
  "per bulan",
  "sekitar",
  "capai",
  "mencapai",
  "s/d",
  "up to",
  "from",
  "around",
].join("|");
/** Dua digit juta: "Rp 25 juta", "20-30 juta", "35 million", atau "Rp18.000.000". */
const JUTA_DUA_DIGIT = [
  String.raw`(?:rp\.? ?)?\d{2}(?:[.,]\d+)?(?: ?(?:-|–|s/d|sampai|hingga|to) ?(?:rp\.? ?)?\d{2,3}(?:[.,]\d+)?)? ?(?:juta|jt|million)`,
  String.raw`rp\.? ?\d{2}\.\d{3}\.\d{3}`,
].join("|");

export const R05: Aturan = {
  id: "R05",
  alasan: "Menjanjikan gaji puluhan juta di luar negeri tanpa meminta pengalaman atau keahlian apa pun.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: diLuarNegeri([
    { cari: `(?:gaji|penghasilan|pendapatan)(?: (?:${KETERANGAN_GAJI}))*:? (?:${JUTA_DUA_DIGIT})${diTeks(TANPA_KEAHLIAN)}`, bahasa: "id" },
    { cari: `(?:salary|income)(?: (?:${KETERANGAN_GAJI}))*:? (?:${JUTA_DUA_DIGIT})${diTeks(TANPA_KEAHLIAN)}`, bahasa: "en" },
  ]),
};

// R12: "berangkat cepat" atau "tiket ditanggung" juga muncul di lowongan dalam
// negeri, jadi Teks harus memuat penanda luar negeri.
const JALUR_RESMI = daftar("pt|p3mi|pjtki|pptkis|agen|agensi|lpk|sponsor|kp2mi|bp2mi");
const WAKTU_CEPAT = [
  "cepat",
  "secepatnya",
  "kilat",
  "segera",
  "dalam \\d+ (?:hari|minggu)",
  "\\d+ (?:hari|minggu) lagi",
  "minggu (?:ini|depan)",
  "bulan ini",
  "besok",
  "hari ini",
].join("|");
/** "Tiket pesawat dibayar sendiri" justru jalur biasa. */
const BUKAN_SENDIRI = "(?! sendiri| oleh (?:pekerja|peserta|calon pekerja|kamu|anda))";
const DITANGGUNG = ["ditanggung", "dibayar", "dibayarin", "dibayari", "dibiayai", "dibelikan", "disediakan", "gratis"].join("|");
const DIURUS_EN = ["arranged", "processed", "handled", "provided", "covered", "paid", "free"].join("|");

export const R12: Aturan = {
  id: "R12",
  alasan: "Menjanjikan proses berangkat ke luar negeri yang cepat atau serba diurus, di luar jalur penempatan resmi.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: diLuarNegeri([
    // "berangkat cepat", "keberangkatan dalam 2 minggu", "langsung berangkat"
    { cari: `(?:berangkat|keberangkatan|terbang|diberangkatkan)(?: (?:bisa|lebih))? (?:${WAKTU_CEPAT})`, bahasa: "id" },
    { cari: "(?:proses (?:cepat|kilat|singkat),? )?langsung (?:berangkat|terbang|diberangkatkan)", bahasa: "id" },
    // "tanpa lewat PT atau P3MI"
    { cari: `tanpa (?:lewat |melalui |perlu |harus )?${JALUR_RESMI}`, bahasa: "id" },
    // "paspor diurus", "gratis pembuatan paspor"
    { cari: `paspor (?:diurus|diuruskan|dibuatkan|dibantu|disiapkan|ditanggung|dibiayai|gratis)${BUKAN_SENDIRI}`, bahasa: "id" },
    { cari: "gratis (?:pembuatan |pengurusan )?paspor", bahasa: "id" },
    // "tiket pesawat ditanggung", "gratis tiket keberangkatan"
    { cari: `tiket(?: (?:pesawat|keberangkatan|berangkat))?(?: (?:pp|pulang pergi|sekali jalan))? (?:${DITANGGUNG})${BUKAN_SENDIRI}`, bahasa: "id" },
    { cari: "gratis tiket (?:pesawat|keberangkatan|berangkat)", bahasa: "id" },
    { cari: `(?:fly|depart|leave)(?: out)? (?:immediately|asap|within \\d+ (?:days?|weeks?)|next week|this week)`, bahasa: "en" },
    { cari: `passports? (?:(?:will be|is|are) )?(?:${DIURUS_EN})`, bahasa: "en" },
    { cari: `(?:free (?:air ?|flight |plane )?tickets?|(?:air|flight|plane) tickets? (?:(?:is|are|will be) )?(?:${DIURUS_EN}))`, bahasa: "en" },
    { cari: "no (?:agency|agent|recruitment agency) (?:needed|required)", bahasa: "en" },
  ]),
};

// R16: pekerjaan online saja wajar, negara rawan saja juga (guru di Kamboja).
// Kalau keduanya sekalimat, Kutipan pemicu memuat keduanya; kalau tidak,
// Kutipan pemicu adalah pekerjaannya dan negara rawan cukup ada di Teks.
// Spec: admin, operator, atau customer service online. "Operator mesin" dan
// "staf marketing" di Kamboja atau Laos tidak cocok.
const PEKERJAAN_ONLINE = [
  `(?:admin|operator|customer service|cs|telemarketing|marketing)(?: (?:${[
    "online",
    "chat",
    "sosmed",
    "media sosial",
    "game",
    "judi",
    "kasino",
    "casino",
    "slot",
    "crypto",
    "kripto",
    "trading",
    "investasi",
  ].join("|")}))(?: (?:staff|staf))?`,
  "(?:kerja|bekerja) online",
].join("|");

export const R16: Aturan = {
  id: "R16",
  alasan: "Menawarkan kerja online di negara yang sering menjadi tujuan perdagangan orang untuk penipuan daring.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: [
    // "admin online untuk perusahaan di Kamboja"
    { cari: `(?:${PEKERJAAN_ONLINE})${celah(8)} (?:${NEGARA_RAWAN})`, bahasa: "id" },
    // "di Myanmar sebagai operator chat"
    { cari: `(?:${NEGARA_RAWAN})${celah(8)} (?:${PEKERJAAN_ONLINE})`, bahasa: "id" },
    { cari: `(?:${PEKERJAAN_ONLINE})${diTeks(NEGARA_RAWAN)}`, bahasa: "id" },
  ],
};

export const KATALOG: readonly Aturan[] = [R01, R02, R03, R05, R06b, R07, R08, R12, R16];
