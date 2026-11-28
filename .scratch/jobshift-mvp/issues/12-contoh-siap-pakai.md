# 12: Contoh siap pakai dengan AI statis

**What to build:** Juri atau pengguna baru menekan salah satu dari 4 tombol contoh (Tugas, Lokal, Luar negeri, Asli). Kotak teks langsung terisi, dan Cek memberi hasil yang sama setiap kali tanpa memakai kuota AI. Lihat spec bagian Modul (adapter Statis) dan PRD FR-08.

**Blocked by:** 04, 05, 06, 07, 10

**Status:** selesai

- [x] 4 tombol contoh bisa dioperasikan dengan keyboard; satu klik mengisi kotak teks
- [x] Teks contoh fiktif dan tidak memuat data pribadi sungguhan
- [x] Adapter Statis mengembalikan keluaran AI tersimpan kalau Teks yang dinormalisasi persis sama dengan salah satu contoh; tidak ada panggilan Groq (dites)
- [x] Ketiga contoh Palsu berlabel Bahaya atau Waspada dengan Modus terkuat yang sesuai; contoh Asli berlabel Risiko rendah
- [x] Kontrak `POST /api/cek` tidak berubah

## Catatan implementasi (28 November 2026)

- Teks contoh di `src/cek/contoh.ts` (aman diimpor browser); keluaran AI tersimpan dan adapter `penilaiStatis` di `src/cek/statis.ts` (khusus server), dikunci SHA-256 Teks tersamar yang spasi dan baris barunya diseragamkan.
- Route `POST /api/cek` memakai `penilaiStatis(penilaiGroqDariEnv())`; kontraknya tidak berubah. Contoh tetap mendapat `sumberPenilaian: "aturan+AI"` walau `GROQ_API_KEY` tidak diset.
- Tombol contoh keempat bernama "Loker resmi", bukan "Asli", supaya copy antarmuka tidak memakai kata terlarang.
- Diverifikasi di browser 360 × 640: tombol 44 px, bisa dipilih dengan Enter, dua request untuk Teks contoh yang sama memberi HasilCek identik.
