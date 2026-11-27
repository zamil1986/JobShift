# 04: Aturan Modus Tugas

**What to build:** Pengguna yang menempel lowongan dengan pola Modus Tugas mendapat Tanda bahaya yang tepat, dengan Kutipan pemicu dan Modus yang disebut di hasil. Tiket ini menambah aturan R06b, R07 (kritis), R08 sesuai katalog awal di spec (bagian Mesin Aturan). Bobot non-kritis boleh disetel hanya dengan Set dev.

**Blocked by:** 03

**Status:** ready-for-agent

- [x] Aturan R06b, R07 (kritis), R08 ada di katalog dengan alasan bahasa awam, bobot, status kritis, dan Modus sesuai spec
- [x] Setiap aturan punya minimal 1 tes positif dan 1 tes negatif lewat `cek()`
- [x] Teks kerja "tugas" like/rating dengan deposit naik level berlabel Bahaya dengan Modus terkuat Tugas
- [x] R06b memuat kata kunci Inggris ("move to Telegram")
- [x] Tidak ada tes dari tiket sebelumnya yang rusak

## Comments

- 2026-11-27 (Claude): semua kriteria selesai. `npm test` (256 tes), `npm run lint`, dan `npm run typecheck` lulus. Tes baru di `src/cek/modus-tugas.test.ts`, semuanya lewat `cek()`. `mesin.ts`, `skor.ts`, dan `tipe.ts` tidak diubah; bobot sesuai spec (R06b 20, R07 60 kritis, R08 25, semuanya Modus Tugas, `pakaiPenyangkal: false`).
- **Pola dipersempit dari "Contoh pola" spec.** Kata tunggal tidak cukup untuk memicu aturan:
  - **R07** (kritis, tanpa Penyangkal) baru cocok kalau uang masuk (deposit, top up, isi saldo, setor dana) menjadi syarat tujuan Modus Tugas (naik level, VIP n, cairkan/tarik komisi, "komisi bisa dicairkan") dalam satu kalimat. Kalau uang disebut lebih dulu, harus ada kata tujuan ("untuk", "supaya", "agar", "to"…). Akibatnya iklan teller bank ("deposit nasabah"), konter pulsa ("top up e-wallet"), ruang VIP hotel, CS game, dan CS e-wallet tidak berlabel Bahaya.
  - **R08** butuh kata bayaran atau nominal ("dibayar Rp5.000 per like", "ulasan dibayar", "per tugas Rp12.000"), supaya "follow up klien" dan "rating driver" tidak kena.
  - **R06b** butuh kata kerja ajakan sebelum "Telegram" ("lanjut di", "join grup", "move to"), atau tautan `t.me/…`. "Mengelola akun Telegram perusahaan" tidak kena.
- **Keputusan terbuka untuk penyetel Aturan (Set dev):**
  - Karena `pakaiPenyangkal: false`, kalimat peringatan seperti "Kami tidak pernah meminta deposit atau top up untuk pencairan komisi" tetap Bahaya (R07), dan "tidak ada bayaran per like" tetap Waspada (R08). Ini kasus yang sama dengan alasan ADR-0002, tetapi ADR-0002 membatasi Penyangkal hanya untuk R01/R02. Mengubahnya butuh keputusan pemilik spec. Tes negatif-penyangkalan yang ada memakai kalimat yang memang tidak membentuk pola.
  - Frasa penipuan yang belum tertangkap R07: uang lewat kata "transfer"/"modal" ("transfer Rp300.000 supaya komisi bisa ditarik"), "tarik saldo", "withdraw" tanpa objek, "paket tugas premium", "saldo minus", dan "recharge … to complete the combo task". "Penarikan saldo" sengaja tidak dipakai karena muncul di iklan teller.
  - "Aplikasi lain" di R06b hanya cocok lewat frasa harfiah "pindah/lanjut ke aplikasi (chat) lain". "Lanjut ke WhatsApp admin" dibiarkan untuk R06a (tiket 07).
  - R06b juga menerima "hubungi/kontak/chat … di Telegram". Bobotnya 20, jadi sendirian tetap Risiko rendah.
  - R08 cocok untuk iklan mystery shopper sungguhan ("dapat Rp50.000 per ulasan" → Waspada). Ini bisa diterima di bobot 25.

