# 16: `src/dataset/cli.test.ts` gagal di Windows karena `path.resolve` menghasilkan path ber-drive letter (`D:\repo\...`)

**What to build:** Saat `npm test` dijalankan di Windows, 5 dari 7 tes di `src/dataset/cli.test.ts` gagal karena `jalankanCekDataset` di `src/dataset/cli.ts` memakai `path.resolve(akar, ...)` sedangkan `src/dataset/cli.test.ts` mem-pass `akar: "/repo"` dan `rumah: "/home/naja"` dengan kunci objek mock `"/repo/data/dev.jsonl"` (format POSIX). Di Windows, `path.resolve("/repo", "data/dev.jsonl")` menghasilkan `"D:\\repo\\data\\dev.jsonl"`, sehingga `adaFile` mengembalikan `false` dan pesan galat memuat backslash serta huruf drive.

**Blocked by:** None

**Status:** needs-triage

- [ ] `src/dataset/cli.ts` atau `src/dataset/cli.test.ts` kompatibel lintas platform (Windows dan POSIX) sehingga `npm test` lulus 100% di Windows maupun Linux/macOS

