# 12: Contoh siap pakai dengan AI statis

**What to build:** Juri atau pengguna baru menekan salah satu dari 4 tombol contoh (Tugas, Lokal, Luar negeri, Asli). Kotak teks langsung terisi, dan Cek memberi hasil yang sama setiap kali tanpa memakai kuota AI. Lihat spec bagian Modul (adapter Statis) dan PRD FR-08.

**Blocked by:** 04, 05, 06, 07, 10

**Status:** ready-for-agent

- [ ] 4 tombol contoh bisa dioperasikan dengan keyboard; satu klik mengisi kotak teks
- [ ] Teks contoh fiktif dan tidak memuat data pribadi sungguhan
- [ ] Adapter Statis mengembalikan keluaran AI tersimpan kalau Teks yang dinormalisasi persis sama dengan salah satu contoh; tidak ada panggilan Groq (dites)
- [ ] Ketiga contoh Palsu berlabel Bahaya atau Waspada dengan Modus terkuat yang sesuai; contoh Asli berlabel Risiko rendah
- [ ] Kontrak `POST /api/cek` tidak berubah
