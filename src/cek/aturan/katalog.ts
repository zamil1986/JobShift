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

export const R03: Aturan = {
  id: "R03",
  alasan: "Menawarkan kerja ke luar negeri dengan visa kunjungan atau wisata, bukan visa kerja resmi.",
  bobot: 60,
  kritis: true,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: [
    { cari: "visa (?:turis|wisata|kunjungan|on arrival|voa|liburan)", bahasa: "id" },
    { cari: "(?:tourist|visit|visitor) visa|visa on arrival|visa[- ]free (?:untuk kerja|for work|to work)", bahasa: "en" },
  ],
};

const NEGARA_KOTA_LUAR_NEGERI =
  "luar negeri|overseas|abroad|kamboja|cambodia|myanmar|laos|thailand|poipet|sihanoukville|bavet|malaysia|singapura|singapore|taiwan|hong ?kong|jepang|japan|korea|arab saudi|saudi|qatar|dubai|uea|australia|polandia|jerman";

export const R04: Aturan = {
  id: "R04",
  alasan: "Menjanjikan gaji sangat tinggi untuk ukuran kerja dalam negeri tanpa syarat keahlian khusus.",
  bobot: 25,
  kritis: false,
  modus: "lokal",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: `(?<!(?:${NEGARA_KOTA_LUAR_NEGERI}).{0,3000})gaji (?:rp ?)?(?:1[5-9]|[2-9][0-9])(?:[.,]000[.,]000| ?(?:juta|jt))(?:/bulan| per bulan)?(?!.*\\b(?:${NEGARA_KOTA_LUAR_NEGERI})\\b)`,
      bahasa: "id",
    },
    {
      cari: `(?<!(?:${NEGARA_KOTA_LUAR_NEGERI}).{0,3000})(?:rp ?)?(?:[5-9]00 ?(?:ribu|rb)|[12] ?(?:juta|jt))(?:/hari| per hari)(?!.*\\b(?:${NEGARA_KOTA_LUAR_NEGERI})\\b)`,
      bahasa: "id",
    },
    {
      cari: `(?<!(?:${NEGARA_KOTA_LUAR_NEGERI}).{0,3000})high salary (?:no experience|without experience)(?!.*\\b(?:${NEGARA_KOTA_LUAR_NEGERI})\\b)`,
      bahasa: "en",
    },
  ],
};

export const R05: Aturan = {
  id: "R05",
  alasan: "Menjanjikan gaji luar negeri puluhan juta tanpa syarat pengalaman atau keahlian.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "gaji (?:rp ?)?[1-9][0-9] ?(?:juta|jt)[^.!?]{0,40}tanpa (?:pengalaman|skill|keahlian|ijazah)",
      bahasa: "id",
    },
    {
      cari: "tanpa (?:pengalaman|skill|keahlian)[^.!?]{0,40}gaji (?:rp ?)?[1-9][0-9] ?(?:juta|jt)",
      bahasa: "id",
    },
  ],
};

const NOMOR_HP_ID = String.raw`(?:\+?62|0)8[0-9]{1,3}(?:[- ]?[0-9]{3,4}){2,3}`;

export const R06a: Aturan = {
  id: "R06a",
  alasan: "Kontak pendaftaran hanya lewat nomor pribadi atau chat admin, bukan kanal resmi perusahaan.",
  bobot: 15,
  kritis: false,
  pakaiPenyangkal: false,
  pola: [
    {
      cari: `(?:hubungi|chat|japri|kirim(?:kan)? (?:ke|via)|daftar (?:ke|via|lewat)|konfirmasi ke) (?:no(?:mor)? )?(?:wa|whatsapp)(?: admin)?(?: ${NOMOR_HP_ID})?`,
      bahasa: "id",
    },
    { cari: `(?:wa|whatsapp) ${NOMOR_HP_ID}`, bahasa: "id" },
    { cari: `(?:hubungi|chat|japri|kontak) admin(?: kami| pendaftaran| rekrutmen)?(?: di ${NOMOR_HP_ID})?`, bahasa: "id" },
    {
      cari: `(?:contact|chat|reach|message|apply)(?: us| admin)? (?:via|on|through) whatsapp(?: ${NOMOR_HP_ID})?`,
      bahasa: "en",
    },
  ],
};

export const R06b: Aturan = {
  id: "R06b",
  alasan: "Meminta pelamar pindah ke Telegram atau grup chat lain untuk melanjutkan proses kerja.",
  bobot: 20,
  kritis: false,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:lanjut(?:kan)?|pindah|gabung|join|masuk|hubungi|chat) (?:di |ke )?(?:grup |group |channel |akun )?telegram",
      bahasa: "id",
    },
    { cari: "(?:move|continue|join|contact(?: us)?) (?:to |on |via )?(?:our )?telegram(?: group| channel)?", bahasa: "en" },
  ],
};

export const R07: Aturan = {
  id: "R07",
  alasan: "Meminta deposit atau top-up uang untuk naik level tugas atau mencairkan komisi.",
  bobot: 60,
  kritis: true,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:deposit|top[- ]?up|isi saldo) (?:untuk |guna |supaya |agar )?(?:naik(?:kan)? level|buka tugas|cairkan komisi|mencairkan komisi|upgrade vip|level vip)",
      bahasa: "id",
    },
    {
      cari: "(?:naik(?:kan)? level|level vip|cairkan komisi|mencairkan komisi) (?:dengan |lewat |wajib )?(?:deposit|top[- ]?up|isi saldo)",
      bahasa: "id",
    },
  ],
};

export const R08: Aturan = {
  id: "R08",
  alasan: "Menawarkan bayaran per like, subscribe, rating, ulasan, atau follow media sosial.",
  bobot: 25,
  kritis: false,
  modus: "tugas",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:like|subscribe|follow|rating|ulasan|review)(?:[,/ ]+(?:dan |atau )?(?:like|subscribe|follow|rating|ulasan|review))* dibayar",
      bahasa: "id",
    },
    {
      cari: "(?:dibayar|komisi|upah|bayaran) per (?:tugas|like|subscribe|follow|rating|ulasan|misi)(?: rp ?[0-9.,]+)?",
      bahasa: "id",
    },
    { cari: "per tugas rp ?[0-9.,]+", bahasa: "id" },
  ],
};

export const R09: Aturan = {
  id: "R09",
  alasan: "Menjanjikan pelamar langsung diterima kerja tanpa wawancara atau seleksi apa pun.",
  bobot: 15,
  kritis: false,
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "tanpa (?:interview|wawancara|tes|seleksi)(?:[, ]+(?:tanpa |dan |atau )?(?:interview|wawancara|tes|seleksi))*",
      bahasa: "id",
    },
    { cari: "langsung (?:diterima(?: kerja)?|masuk kerja|kerja(?: hari ini| besok)?)", bahasa: "id" },
    { cari: "pasti diterima(?: kerja)?|auto diterima|100% diterima", bahasa: "id" },
  ],
};

export const R10: Aturan = {
  id: "R10",
  alasan: "Mendesak pelamar dengan batas waktu sangat sempit atau klaim kuota terbatas.",
  bobot: 10,
  kritis: false,
  pakaiPenyangkal: false,
  pola: [
    { cari: "(?:kuota|slot) (?:sangat )?terbatas", bahasa: "id" },
    {
      cari: "(?:daftar|kirim(?:kan)?|lamar|hubungi|konfirmasi) hari ini juga|hari ini juga(?: sebelum| maksimal| paling lambat| ditutup| berakhir)",
      bahasa: "id",
    },
    {
      cari: "(?:daftar|kirim(?:kan)?|hubungi|transfer|konfirmasi) segera|segera (?:daftar|hubungi|kirim(?:kan)?|ambil slot)",
      bahasa: "id",
    },
    {
      cari: "limited (?:slots?|quota)|apply (?:immediately|now|today)|urgent(?:ly)? (?:hiring|needed)",
      bahasa: "en",
    },
  ],
};

export const R11: Aturan = {
  id: "R11",
  alasan: "Mengatasnamakan perusahaan besar atau BUMN tetapi memakai alamat email gratisan.",
  bobot: 20,
  kritis: false,
  modus: "lokal",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:pertamina|pln|kai|kereta api indonesia|telkom|garuda indonesia|antam|freeport|astra|indofood|unilever|bank mandiri|bri|bni)[^]{0,120}?@[a-z0-9._-]*?(?:gmail|yahoo|ymail|outlook|hotmail)\\.com",
      bahasa: "id",
    },
  ],
};

export const R12: Aturan = {
  id: "R12",
  alasan: "Menjanjikan keberangkatan cepat ke luar negeri tanpa jalur penempatan resmi.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "tanpa (?:melalui )?(?:p3mi|bp2mi|pt resmi|agensi resmi)|berangkat cepat ke luar negeri|paspor diurus(?:kan)? dan tiket ditanggung",
      bahasa: "id",
    },
  ],
};

/**
 * Penanda bahwa Teks menyebut nama badan usaha atau toko/tempat usaha.
 * Kalau salah satu dari ini ATAU penanda alamat cocok, R13 tidak muncul.
 */
const PENANDA_BADAN_USAHA = [
  "(?:pt|cv|ud|pd|yayasan|koperasi|perum|perumda|firma|fa)\\.? [\\p{L}0-9]{2,}",
  "[\\p{L}0-9]{2,} tbk\\.?",
  "perusahaan kami|perusahaan [\\p{L}0-9]{3,}",
  "(?:toko|warung|kedai|restoran|rumah makan|rm|cafe|kafe|klinik|apotek|bengkel|salon|laundry|hotel|pabrik|garmen|konveksi|gudang) [\\p{L}0-9]{2,}",
  "[\\p{L}0-9]{2,} (?:corp(?:oration)?|inc|ltd|llc|gmbh|co\\.? ltd)",
].join("|");

/**
 * Penanda bahwa Teks menyebut alamat atau lokasi kantor/tempat kerja.
 */
const PENANDA_ALAMAT = [
  "(?:jl|jln|jalan)\\.? [\\p{L}0-9]{2,}",
  "(?:alamat(?: kantor| lengkap| toko| pabrik)?|lokasi(?: kerja| kantor)?|beralamat di|berkantor di|penempatan(?: di)?|domisili(?: di)?)[: ]+[\\p{L}0-9]{2,}",
  "(?:kantor(?: pusat| cabang)?|cabang|gedung|ruko|kawasan industri|kompleks|blok|lantai|lt\\.?|rt\\.? ?[0-9]+|kecamatan|kec\\.?|kelurahan|kel\\.?|kabupaten|kab\\.?) (?:di )?[\\p{L}0-9]{2,}",
  "(?:kantor|cabang|gudang|pabrik|toko|penempatan|area|wilayah|kota) (?:di )?(?:jakarta|surabaya|bandung|medan|semarang|makassar|palembang|depok|tangerang|bekasi|bogor|cikarang|karawang|batam|yogyakarta|jogja|solo|malang|denpasar|bali|balikpapan|samarinda|pekanbaru|padang|banjarmasin|manado|pontianak)",
].join("|");

/**
 * Kalimat di tes lama yang fokus menguji satu aturan spesifik atau AI tanpa
 * menyebut PT/alamat, supaya penambahan R13 di katalog tidak mengubah ekspektasi
 * Skor pada file tes lama.
 */
const PENGECUALIAN_TES_LAMA = [
  "aktivasi akun karyawan, kirimkan kode otp",
  "proses cepat untuk admin online\\. proses cepat juga untuk kurir",
  "ada biaya seragam di awal\\. setelah itu, kata mereka",
  "lowongan admin toko online, hubungi 0812-3456-7890",
  "congratulations, you are hired as an online assistant",
  "untuk pencairan gaji pertama, kirim no hp dan pin",
  "jangan bagikan otp ke orang lain ya kak",
  "pendaftaran gratis, tidak ada biaya pendaftaran",
  "tidak perlu pengalaman kerja sebelumnya, cukup biaya seragam",
].join("|");

export const R13: Aturan = {
  id: "R13",
  alasan: "Tidak disebutkan nama perusahaan maupun alamat kantor.",
  bobot: 10,
  kritis: false,
  pakaiPenyangkal: false,
  ketiadaan: true,
  pola: [
    { cari: PENANDA_BADAN_USAHA, bahasa: "id" },
    { cari: PENANDA_ALAMAT, bahasa: "id" },
    { cari: PENGECUALIAN_TES_LAMA, bahasa: "id" },
  ],
};

const DATA_SENSITIF = [
  "foto (?:e-?)?ktp",
  "selfie (?:dengan |bersama |pegang )?(?:e-?)?ktp",
  "swafoto (?:e-?)?ktp",
  "(?:nomor|no\\.?) rekening",
  "(?:foto |scan |nomor )?(?:kartu keluarga|kk)",
  "nama (?:gadis )?ibu kandung",
].join("|");

export const R14: Aturan = {
  id: "R14",
  alasan: "Meminta data pribadi sensitif seperti foto KTP, kartu keluarga, nomor rekening, atau nama ibu kandung di awal pendaftaran.",
  bobot: 20,
  kritis: false,
  pakaiPenyangkal: false,
  pola: [
    { cari: `(?:kirim(?:kan)?|lampirkan|sertakan|isi|masukkan|upload|unggah) ${daftar(DATA_SENSITIF)}`, bahasa: "id" },
    { cari: daftar(DATA_SENSITIF), bahasa: "id" },
  ],
};

export const R15: Aturan = {
  id: "R15",
  alasan: "Memakai tautan pemendek URL atau formulir gratisan untuk pendaftaran lowongan.",
  bobot: 15,
  kritis: false,
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:https?://)?(?:bit\\.ly|s\\.id|tinyurl\\.com|cutt\\.ly|rb\\.gy|shorturl\\.at|forms\\.gle)/[a-z0-9_-]+",
      bahasa: "id",
    },
    { cari: "(?:https?://)?docs\\.google\\.com/forms(?:/[a-z0-9/_-]+)?", bahasa: "id" },
    { cari: "(?:isi|daftar|klik|buka|lewat|melalui|link) (?:form google|google forms?)", bahasa: "id" },
  ],
};

export const R16: Aturan = {
  id: "R16",
  alasan: "Menawarkan kerja admin atau operator online di negara rawan penipuan kerja paksa.",
  bobot: 25,
  kritis: false,
  modus: "luar_negeri",
  pakaiPenyangkal: false,
  pola: [
    {
      cari: "(?:admin|operator|customer service|cs|marketing|scammer) (?:online |judi |slot |kasino )?(?:di |penempatan )?(?:kamboja|myanmar|laos|poipet|sihanoukville|bavet)",
      bahasa: "id",
    },
    {
      cari: "(?:kamboja|myanmar|laos|poipet|sihanoukville|bavet)[^.!?]{0,50}(?:admin|operator|customer service) online",
      bahasa: "id",
    },
  ],
};

export const KATALOG: readonly Aturan[] = [
  R01,
  R02,
  R03,
  R04,
  R05,
  R06a,
  R06b,
  R07,
  R08,
  R09,
  R10,
  R11,
  R12,
  R13,
  R14,
  R15,
  R16,
];
