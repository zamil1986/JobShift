# 16: `src/dataset/cli.test.ts` gagal di Windows karena `path.resolve` menghasilkan path ber-drive letter (`D:\repo\...`)

**What to build:** Saat `npm test` dijalankan di Windows, 5 dari 7 tes di `src/dataset/cli.test.ts` gagal karena `jalankanCekDataset` di `src/dataset/cli.ts` memakai `path.resolve(akar, ...)` sedangkan `src/dataset/cli.test.ts` mem-pass `akar: "/repo"` dan `rumah: "/home/naja"` dengan kunci objek mock `"/repo/data/dev.jsonl"` (format POSIX). Di Windows, `path.resolve("/repo", "data/dev.jsonl")` menghasilkan `"D:\\repo\\data\\dev.jsonl"`, sehingga `adaFile` mengembalikan `false` dan pesan galat memuat backslash serta huruf drive.

Reproduksi tanpa mesin Windows: jalankan `src/dataset/cli.test.ts` dengan `node:path` di-mock ke `path.win32` (akar `D:\`). Hasilnya 5 gagal dan 2 lulus dari 7 tes. Di macOS dan Linux (termasuk build Vercel) semua lulus.

Arah perbaikan yang mungkin: tes membangun path harapan dengan `path.resolve` juga, atau `cli.ts` menerima fungsi `lokasi` lewat `DependensiCli`. Jangan mengubah perilaku CLI di POSIX.

**Blocked by:** None

**Status:** selesai

**Assignee:** Muhammad Zamil

- [x] `src/dataset/cli.ts` atau `src/dataset/cli.test.ts` kompatibel lintas platform (Windows dan POSIX) sehingga `npm test` lulus 100% di Windows maupun Linux/macOS

Diperbaiki di [PR #14](https://github.com/zamil1986/JobShift/pull/14) (merge `dd81ba6`). `jalankanCekDataset` menerima aturan path platform lewat `DependensiCli.path`; default-nya tetap modul `path` platform yang menjalankan, jadi perilaku CLI tidak berubah. `src/dataset/cli.test.ts` menjalankan semua kasus dua kali, dengan `path.posix` dan `path.win32`, sehingga hasilnya sama di macOS, Linux, dan Windows. Sebelum perbaikan, kasus Windows menghasilkan 5 gagal dari 14 di macOS. Sesudahnya 14/14, dan seluruh suite 520/520. Belum dijalankan di mesin Windows sungguhan.
