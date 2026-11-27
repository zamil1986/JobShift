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

- 2026-11-27 (Claude): semua kriteria selesai. `npm test` (260 tes), `npm run lint`, dan `npm run typecheck` lulus. Tes baru di `src/cek/modus-tugas.test.ts`, semuanya lewat `cek()`. `mesin.ts`, `skor.ts`, dan `tipe.ts` tidak diubah; bobot sesuai spec (R06b 20, R07 60 kritis, R08 25, semuanya Modus Tugas). Penyangkal hanya di R07 (lihat di bawah).
- **Pola dipersempit dari "Contoh pola" spec.** Kata tunggal tidak cukup untuk memicu aturan:
  - **R07** (kritis) baru cocok kalau uang masuk (deposit, top up, isi saldo, setor dana) menjadi syarat tujuan Modus Tugas (naik level, VIP n, cairkan/tarik komisi, "komisi bisa dicairkan") dalam satu kalimat, dan urutan mana pun wajib memakai kata penghubung: "deposit Rp200.000 **untuk** naik level", "**untuk** mencairkan komisi, lakukan top up", atau "komisi bisa dicairkan **setelah** kamu deposit". "Upgrade akun" saja bukan tujuan; harus menuju level atau VIP. Akibatnya iklan teller bank ("deposit nasabah"), konter pulsa ("top up e-wallet"), ruang VIP hotel, serta daftar tugas CS game dan CS e-wallet ("upgrade akun dan top up saldo", juga dalam bentuk butir) tidak berlabel Bahaya. Satu kalimat berarti celah tidak melewati kata yang berakhir ".", "!", atau "?"; baris baru tanpa titik tidak memutus kalimat.
  - **R08** butuh kata bayaran atau nominal ("dibayar Rp5.000 per like", "ulasan dibayar", "per tugas Rp12.000"), supaya "follow up klien" dan "rating driver" tidak kena.
  - **R06b** butuh kata kerja ajakan sebelum "Telegram" ("lanjut di", "join grup", "move to"), atau tautan `t.me/…`. "Mengelola akun Telegram perusahaan" tidak kena.
- **Keputusan terbuka untuk penyetel Aturan (Set dev):**
  - **Penyangkal untuk R07 (diputuskan pemilik spec, 2026-11-27).** Semula ketiganya `pakaiPenyangkal: false`, sehingga "Kami tidak pernah meminta deposit atau top up untuk pencairan komisi" berlabel Bahaya. Sekarang R07 memakai Penyangkal; ADR-0002 (bagian Revisi), spec, PRD FR-03, dan glossary diperbarui. R06b dan R08 tetap tanpa Penyangkal, jadi "tidak ada bayaran per like" masih Waspada. Batasan: Penyangkal di dalam kecocokan ("untuk naik level, tidak perlu deposit") tidak membatalkan, dan "never"/"not" bukan Penyangkal. Komentar `pakaiPenyangkal` di `mesin.ts` ikut diperbarui (hanya komentar, dengan izin pemilik).
  - Frasa penipuan yang belum tertangkap R07: uang lewat kata "transfer"/"modal" ("transfer Rp300.000 supaya komisi bisa ditarik"), "tarik saldo", "withdraw" tanpa objek, "paket tugas premium", "saldo minus", dan "recharge … to complete the combo task". "Penarikan saldo" sengaja tidak dipakai karena muncul di iklan teller.
  - "Aplikasi lain" di R06b hanya cocok lewat frasa harfiah "pindah/lanjut ke aplikasi (chat) lain". "Lanjut ke WhatsApp admin" dibiarkan untuk R06a (tiket 07).
  - R06b juga menerima "hubungi/kontak/chat … di Telegram". Bobotnya 20, jadi sendirian tetap Risiko rendah.
  - R08 cocok untuk iklan mystery shopper sungguhan ("dapat Rp50.000 per ulasan" → Waspada). Ini bisa diterima di bobot 25.
- Kutipan R07 berupa frasa utuh, jadi kutipan R06b/R08 bisa berada di dalamnya ("top up lewat chat Telegram untuk naik level"). `TeksBersorotan` sudah menggabungkan rentang yang beririsan. `POST /api/cek` di dev server memberi Bahaya 85 / Modus Tugas untuk Teks gabungan dan Risiko rendah untuk iklan CS e-wallet. Halaman hasil tidak dicek di browser karena dev server milik sesi lain.
