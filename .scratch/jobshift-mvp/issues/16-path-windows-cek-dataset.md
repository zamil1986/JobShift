# 16: `src/dataset/cli.test.ts` gagal di Windows karena `path.resolve` menghasilkan path ber-drive letter (`D:\repo\...`)

**What to build:** Saat `npm test` dijalankan di Windows, 5 dari 7 tes di `src/dataset/cli.test.ts` gagal karena `jalankanCekDataset` di `src/dataset/cli.ts` memakai `path.resolve(akar, ...)` sedangkan `src/dataset/cli.test.ts` mem-pass `akar: "/repo"` dan `rumah: "/home/naja"` dengan kunci objek mock `"/repo/data/dev.jsonl"` (format POSIX). Di Windows, `path.resolve("/repo", "data/dev.jsonl")` menghasilkan `"D:\\repo\\data\\dev.jsonl"`, sehingga `adaFile` mengembalikan `false` dan pesan galat memuat backslash serta huruf drive.

Reproduksi tanpa mesin Windows: jalankan `src/dataset/cli.test.ts` dengan `node:path` di-mock ke `path.win32` (akar `D:\`). Hasilnya 5 gagal dan 2 lulus dari 7 tes. Di macOS dan Linux (termasuk build Vercel) semua lulus.

Arah perbaikan yang mungkin: tes membangun path harapan dengan `path.resolve` juga, atau `cli.ts` menerima fungsi `lokasi` lewat `DependensiCli`. Jangan mengubah perilaku CLI di POSIX.

**Blocked by:** None

**Status:** needs-triage

- [ ] `src/dataset/cli.ts` atau `src/dataset/cli.test.ts` kompatibel lintas platform (Windows dan POSIX) sehingga `npm test` lulus 100% di Windows maupun Linux/macOS

