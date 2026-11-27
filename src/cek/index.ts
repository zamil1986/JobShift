// Antarmuka server untuk Inti Cek. Kode browser tidak mengimpor dari sini,
// tetapi langsung dari `@/cek/panjang`, `@/cek/pesan`, dan `@/cek/tipe`,
// supaya kode server (misalnya SDK AI) tidak ikut terkirim ke browser.

export { cek, type OpsiCek } from "./cek";
export { memuatKataTerlarang } from "./kata-terlarang";
export { TeksTidakValid } from "./panjang";
export { PESAN_ERROR, PESAN_GAGAL_SERVER } from "./pesan";
export type * from "./tipe";
