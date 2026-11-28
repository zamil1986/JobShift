// Adapter AI Statis (spec, "Modul"; PRD FR-08). Khusus server. Untuk Teks
// contoh siap pakai, adapter ini mengembalikan keluaran AI tersimpan tanpa
// memanggil jaringan, jadi hasil contoh selalu sama dan tidak memakai kuota.
// Teks lain diteruskan ke adapter cadangan (Groq di produksi).
//
// Kuncinya hash SHA-256 dari Teks tersamar yang sudah dinormalisasi, karena
// adapter AI hanya pernah menerima Teks tersamar. Keluaran tersimpan tetap
// divalidasi dan disaring inti seperti keluaran Groq.

import { createHash } from "node:crypto";
import { CONTOH, type IdContoh } from "./contoh";
import { samarkan } from "./penyamaran";
import type { KeluaranAI } from "./skema-ai";
import type { PenilaiAI } from "./tipe";

const KELUARAN_TERSIMPAN: Record<IdContoh, KeluaranAI> = {
  tugas: {
    label: "bahaya",
    tanda_bahaya: [
      {
        kutipan: "like dan follow akun toko online",
        alasan: "Tugas ringan seperti like dan follow dengan komisi adalah pola awal penipuan kerja tugas.",
      },
    ],
    penjelasan:
      "Teks ini meminta kamu menyetor deposit supaya bisa naik level dan mengambil tugas berkomisi besar. " +
      "Pola seperti ini biasanya berakhir dengan uang yang tidak bisa dicairkan. " +
      "Jangan kirim uang apa pun ke admin tersebut.",
  },
  lokal: {
    label: "bahaya",
    tanda_bahaya: [
      {
        kutipan: "paling lambat hari ini",
        alasan: "Batas waktu yang sangat mendesak membuat kamu tidak sempat memeriksa lowongan ini.",
      },
    ],
    penjelasan:
      "Lowongan ini meminta biaya seragam dan medical sebelum interview, padahal perusahaan yang merekrut tidak memungut biaya dari pelamar. " +
      "Gajinya juga terlalu tinggi untuk posisi operator, dan lamaran dikirim ke email gratisan, bukan email perusahaan. " +
      "Cocokkan lowongan ini di Karirhub Kemnaker sebelum membayar apa pun.",
  },
  luar_negeri: {
    label: "bahaya",
    tanda_bahaya: [
      {
        kutipan: "Tidak perlu lewat agen resmi",
        alasan: "Penempatan kerja ke luar negeri yang sengaja menghindari jalur resmi rawan perdagangan orang.",
      },
    ],
    penjelasan:
      "Tawaran ini memintamu berangkat ke luar negeri dengan visa wisata, bukan visa kerja. " +
      "Pekerja yang berangkat dengan cara ini tidak terlindungi dan rawan dipaksa bekerja di tempat penipuan daring. " +
      "Cek dulu legalitas perusahaan penempatannya di situs KP2MI.",
  },
  resmi: {
    label: "risiko_rendah",
    tanda_bahaya: [],
    penjelasan:
      "Tidak ditemukan permintaan uang, data pribadi, atau desakan di teks ini. " +
      "Nama perusahaan, alamat kantor, dan jalur lamaran disebutkan dengan jelas. " +
      "Tetap cocokkan lowongan ini dengan situs perusahaan sebelum mengirim data apa pun.",
  },
};

/** Spasi dan baris baru diseragamkan, supaya tempelan dari WhatsApp tetap dikenali. */
const normalkan = (teks: string) => teks.normalize("NFC").replace(/\s+/g, " ").trim();

const hash = (teksTersamar: string) =>
  createHash("sha256").update(normalkan(teksTersamar)).digest("hex");

const PETA_STATIS = new Map<string, KeluaranAI>(
  CONTOH.map((c) => [hash(samarkan(c.teks)), KELUARAN_TERSIMPAN[c.id]]),
);

/**
 * Adapter Statis: keluaran tersimpan untuk Teks contoh, selain itu adapter
 * `cadangan`. Tidak pernah memanggil jaringan untuk Teks contoh.
 */
export function penilaiStatis(cadangan: PenilaiAI): PenilaiAI {
  return (teksTersamar, signal) => {
    const tersimpan = PETA_STATIS.get(hash(teksTersamar));
    return tersimpan ? Promise.resolve(tersimpan) : cadangan(teksTersamar, signal);
  };
}
