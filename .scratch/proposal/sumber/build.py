"""Isi proposal JobShift untuk SEVENT X 2026. Jalankan: python3 -I build.py <tpl_dir> <fig_dir> <out.docx> [toc.json]"""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import Doc, BODY_IND, FONT, escape

TPL, FIG, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TOC = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else {}

d = Doc(TPL)
P = d.paras
out = []
fig = lambda n: os.path.join(FIG, n + ".png")

URL = "https://job-shift-navy.vercel.app"
REPO = "https://github.com/zamil1986/JobShift"

# ============================================================ SAMPUL
def set_text(par, new):
    """Ganti seluruh teks run pertama, hapus run teks lain, pertahankan format."""
    ts = list(re.finditer(r'<w:t xml:space="preserve">([^<]*)</w:t>', par))
    first = ts[0]
    par = par[:first.start(1)] + escape(new) + par[first.end(1):]
    return par

judul = "JOBSHIFT: PENILAI RISIKO PENIPUAN LOWONGAN KERJA BERBASIS ATURAN TRANSPARAN DAN AI"
out.append(set_text(P[0], judul))
out.append(P[1])  # logo
# baris kategori (tambahan, tidak mengubah struktur)
out.append('<w:p><w:pPr><w:spacing w:after="240" w:before="120" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>'
           + d.runs("Kategori Website · Subtema SDGs: *Decent Work and Economic Growth*", size=24) + '</w:p>')
out.append(set_text(P[2], "Tim: lomba nekat h-7"))
out.append(P[4])
out.append(P[5])
anggota = [("Muhammad Zamil (Ketua)", "A11.2025.16473", False),
           ("Ayudhya Naja", "A11.2025.16___", True),
           ("Ahmad Daniel Firdaus", "A11.2025.16___", True),
           ("Nadine Berliana Haty Imany", "A11.2025.16285", False)]
for i, (nama, nim, hl) in enumerate(anggota):
    par = P[6 + i]
    ts = list(re.finditer(r'<w:t xml:space="preserve">([^<]*)</w:t>', par))
    par = par[:ts[1].start(1)] + escape(nim) + par[ts[1].end(1):]
    par = par[:ts[0].start(1)] + escape(nama) + par[ts[0].end(1):]
    if hl:
        # sorot NIM yang belum lengkap
        idx = par.rfind('<w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">' + escape(nim))
        par = par[:idx] + '<w:highlight w:val="yellow"/>' + par[idx:]
    par = par.replace('w:pos="5399.000000000001"', 'w:pos="6100"').replace('w:left="1800" w:hanging="360"', 'w:left="1000" w:hanging="360"')
    out.append(par)
out.append(P[11]); out.append(P[12])
inst = set_text(P[13], "UNIVERSITAS DIAN NUSWANTORO")
kota = set_text(P[14], "SEMARANG")
out += [inst, kota, P[15]]

# ============================================================ DAFTAR ISI
out.append(P[16])
toc_keys = ["DAFTAR ISI", "PENDAHULUAN", "Judul/Nama Perangkat Lunak", "Latar Belakang Ide Perangkat Lunak", "Rumusan Masalah",
            "Tujuan Pengembangan", "Manfaat Pengembangan", "Batasan Aplikasi/Software", "METODOLOGI PENGEMBANGAN",
            "Model Pengembangan Sistem", "Teknologi yang digunakan", "Tahap Pengembangan", "ANALISIS DESAIN SOFTWARE",
            "Analisis Kebutuhan Sistem", "Perancangan Kebutuhan Sistem", "Desain Antarmuka (UI/UX)", "Fitur dan Alur Kerja Sistem",
            "KESIMPULAN", "Kesimpulan", "DAFTAR PUSTAKA"]
out.append(d.sdt_open)
for k, i in zip(toc_keys, range(17, 37)):
    par = P[i]
    if k in TOC:
        par = re.sub(r'(<w:tab/><w:t xml:space="preserve">)\d+(</w:t>)(?!.*<w:tab/><w:t)', lambda m: m.group(1) + str(TOC[k]) + m.group(2), par, flags=re.S)
    # tab stop template (12000) ada di luar margin kanan sehingga nomor halaman terpotong
    par = par.replace('<w:tab w:val="right" w:leader="none" w:pos="12000"/>', '<w:tab w:val="right" w:leader="dot" w:pos="8500"/>')
    if i == 36:
        par, n = re.subn(r'<w:r[^>]*><w:fldChar w:fldCharType="end"/></w:r>', '', par)
        assert n == 1
    out.append(par)
# entri LAMPIRAN (tambahan) + penutup field TOC
lamp_no = TOC.get("LAMPIRAN", 0)
out.append('<w:p><w:pPr><w:widowControl w:val="0"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="8500"/></w:tabs>'
           '<w:spacing w:after="0" w:before="60" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>'
           f'<w:r><w:rPr>{FONT}<w:color w:val="000000"/></w:rPr><w:t xml:space="preserve">LAMPIRAN</w:t><w:tab/><w:t xml:space="preserve">{lamp_no}</w:t></w:r>'
           '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>')
out.append(d.sdt_close)
out.append(d.pagebreak())

# ============================================================ BAB I
out += [P[43], P[44], P[45]]
out.append(d.p("Perangkat lunak yang dikembangkan bernama **JobShift**, dengan tagline *“JobShift — cek dulu sebelum transfer.”* JobShift adalah aplikasi web tanpa login untuk menilai risiko penipuan sebuah lowongan kerja yang diterima di luar job portal, misalnya lewat WhatsApp, Telegram, atau media sosial, **sebelum** pencari kerja membayar atau menyerahkan data pribadi."))
out.append(d.p("Nama JobShift berasal dari kata *job* (pekerjaan) dan *shift* (pergeseran). Aplikasi ini ingin menggeser kebiasaan pencari kerja dari “langsung percaya lalu transfer” menjadi “cek dulu, baru bertindak”. Karena nama saja tidak menjelaskan fungsinya, tagline selalu ditampilkan bersama nama di halaman cek dan halaman hasil."))
out.append(d.p("Cara pakainya sederhana. Pengguna menempelkan teks lowongan, atau mengunggah screenshot yang dibaca dengan OCR langsung di browser, lalu menekan tombol Cek. Dengan target waktu respons di bawah lima detik, JobShift menampilkan **Label** risiko (*Risiko rendah*, *Waspada*, atau *Bahaya*), **Skor** 0–100, daftar **Tanda bahaya** beserta kalimat pemicunya yang disorot di teks asli, **Modus** penipuan yang cocok, dan **Langkah aman** yang menautkan kanal resmi. Identitas singkat perangkat lunak dirangkum pada Tabel 1.1."))
out.append(d.table("1", "Identitas perangkat lunak JobShift", [2300, 5780], ["Aspek", "Keterangan"], [
    ["Nama dan tagline", "JobShift — cek dulu sebelum transfer."],
    ["Kategori lomba", "Website (aplikasi web responsif, mulai lebar layar 360 px)"],
    ["Subtema SDGs", "Decent Work and Economic Growth (SDG 8), khususnya target 8.5, 8.7, dan 8.8"],
    ["Sasaran pengguna", "Pencari kerja usia 17–30 tahun yang menerima tawaran lewat pesan pribadi atau media sosial; pengguna sekunder: guru BK dan pendamping calon pekerja migran"],
    ["Fungsi utama", "Menilai risiko penipuan sebuah teks lowongan, menjelaskan alasannya, dan mengarahkan ke tindakan serta kanal resmi"],
    ["Teknologi inti", "Next.js dan TypeScript; mesin Aturan deterministik; AI Groq (openai/gpt-oss-120b) yang hanya menambah; OCR Tesseract.js di browser"],
    ["URL karya", URL],
    ["Repositori", REPO],
]))
out.append(d.p("Tiga karakteristik membedakan JobShift dari pemeriksa penipuan pada umumnya. Pertama, **penjelasan yang bisa ditunjuk**: setiap poin Skor berasal dari kalimat di teks lowongan atau dari informasi penting yang tidak disebutkan, sehingga pengguna tahu persis mengapa sebuah lowongan dinilai berisiko. Kedua, **AI hanya menambah**: penilaian utama berasal dari Aturan yang deterministik, sedangkan AI hanya boleh menambah Tanda bahaya. Hasil tidak pernah menjadi “lebih ringan” hanya karena AI gagal atau terlambat menjawab. Ketiga, **privasi sejak rancangan**: teks tidak disimpan, screenshot tidak pernah diunggah, dan data pribadi disamarkan sebelum teks dikirim ke AI."))

out.append(P[47])
out.append(d.p("Pencarian kerja di Indonesia makin banyak berlangsung di luar job portal. Informasi lowongan beredar lewat grup WhatsApp “info loker”, kanal Telegram, unggahan TikTok, dan pesan langsung di media sosial. Kanal ini cepat dan menjangkau pencari kerja muda, tetapi tidak memiliki mekanisme verifikasi sama sekali. Celah inilah yang dimanfaatkan pelaku penipuan dengan tawaran kerja yang menjanjikan, lalu meminta biaya atau data pribadi di awal."))
out.append(d.p("Skala masalahnya besar dan terus bertambah. Indonesia Anti-Scam Centre (IASC) yang dikelola OJK menerima sekitar 579 ribu laporan penipuan sejak dibentuk hingga 31 Mei 2026, dan **26.910** di antaranya adalah penipuan lowongan kerja (Putri, 2026). Hingga Oktober 2026 jumlah laporan ke IASC naik menjadi 741.545, dan **80% korban baru melapor 12 jam atau lebih setelah kejadian** (Safina, 2026), padahal dana korban biasanya sudah berpindah dalam hitungan jam. Untuk lowongan luar negeri, Komdigi memutus akses **7.908** konten iklan lowongan luar negeri fiktif sepanjang Januari–Agustus 2026, dengan peringatan bahwa modus ini menjadi pintu masuk perdagangan orang (Setyowati, 2026). Ringkasan data tersebut disajikan pada Tabel 1.2."))
out.append(d.table("1", "Data yang menunjukkan urgensi masalah", [3900, 1600, 2580], ["Indikator", "Angka", "Sumber"], [
    ["Laporan penipuan lowongan kerja ke IASC (sejak dibentuk s.d. 31 Mei 2026)", "26.910", "Putri (2026), Katadata"],
    ["Total laporan penipuan digital ke IASC (Nov 2024 s.d. Okt 2026)", "741.545", "Safina (2026), Kontan"],
    ["Korban yang baru melapor ≥ 12 jam setelah kejadian", "80%", "Safina (2026), Kontan"],
    ["Konten iklan lowongan luar negeri fiktif yang diputus aksesnya (Jan–Agu 2026)", "7.908", "Setyowati (2026), Katadata"],
], col_jc=["left", "center", "left"]))
out.append(d.p("Dari pola modus yang terdokumentasi, tim mengelompokkan penipuan lowongan ke dalam tiga **Modus** yang menjadi fokus JobShift:"))
out.append(d.lst([
    "**Modus Tugas**: kerja “tugas” daring (like, rating, ulasan) yang awalnya membayar kecil, lalu meminta deposit untuk “naik level” atau mencairkan komisi.",
    "**Modus Lokal**: lowongan dalam negeri palsu yang sering mengatasnamakan perusahaan besar dan meminta biaya seragam, *medical check-up*, atau pelatihan sebelum mulai bekerja.",
    "**Modus Luar negeri**: lowongan luar negeri fiktif bergaji tinggi di luar jalur penempatan resmi, misalnya berangkat dengan visa wisata, yang berisiko menjadi tindak pidana perdagangan orang (TPPO).",
], "ol"))
out.append(d.p("Solusi yang ada belum menutup celah *sebelum* korban bertindak. Job portal seperti Jobstreet dan Glints hanya memverifikasi lowongan di dalam platform mereka, bukan pesan yang diteruskan di grup. Kanal pelaporan resmi seperti IASC dan aduankonten.id bekerja **setelah** kejadian; formulir IASC bahkan mensyaratkan bukti transaksi, sehingga tidak bisa dipakai oleh orang yang belum membayar. Perbandingan posisi JobShift ditunjukkan pada Tabel 1.3."))
out.append(d.table("1", "Posisi JobShift dibanding solusi yang sudah ada", [2150, 1480, 1480, 1480, 1490],
    ["Aspek", "Job portal", "IASC / Kontak OJK", "Cari sendiri di internet", "JobShift"], [
    ["Waktu bekerja", "Sebelum melamar", "Setelah transfer", "Sebelum, tidak pasti", "**Sebelum transfer**"],
    ["Menilai pesan WA/Telegram yang diteruskan", "Tidak", "Tidak", "Sebagian", "**Ya**"],
    ["Menunjuk kalimat yang mencurigakan", "Tidak", "Tidak", "Tidak", "**Ya, disorot**"],
    ["Mengarahkan ke kanal resmi yang sesuai modus", "Tidak", "Ya (satu kanal)", "Tidak", "**Ya**"],
    ["Waktu yang dibutuhkan", "—", "Hari (proses laporan)", "Menit–jam", "**Target < 5 detik**"],
], col_jc=["left", "center", "center", "center", "center"]))
out.append(d.p("Masalah ini selaras dengan tema SEVENT X *“Developing Sustainable Tech Solutions for Society”* dan subtema **Decent Work and Economic Growth (SDG 8)**. JobShift mendukung target 8.5 tentang pekerjaan layak bagi semua, termasuk kaum muda; target 8.7 tentang penghapusan kerja paksa dan perdagangan orang, karena rekrutmen palsu ke luar negeri adalah pintu masuk TPPO; serta target 8.8 tentang lingkungan kerja yang aman bagi semua pekerja, termasuk pekerja migran (UN DESA, t.t.). JobShift juga menjawab tema besar *“Building Smart, Scalable and Intuitive Solutions”*: **smart** karena menggabungkan Aturan yang bisa dijelaskan dengan AI, **scalable** karena tidak memakai basis data dan tetap berjalan dengan Aturan saja ketika kuota AI habis, dan **intuitive** karena hanya butuh satu kotak teks, tanpa akun, dengan bahasa awam."))

out.append(P[51])
out.append(d.p("Berdasarkan latar belakang tersebut, rumusan masalah dalam pengembangan JobShift adalah sebagai berikut."))
out.append(d.lst([
    "Bagaimana pencari kerja dapat menilai risiko penipuan sebuah lowongan yang diterima lewat pesan pribadi dalam hitungan detik, sebelum mentransfer uang atau mengirim data pribadi?",
    "Bagaimana hasil penilaian dapat dijelaskan dengan menunjuk kalimat pemicu di teks lowongan, sehingga pengguna memahami alasannya dan mampu mengenali modus serupa di kemudian hari?",
    "Bagaimana AI dapat dimanfaatkan untuk menangkap pola yang lolos dari Aturan tanpa membuat hasil tidak konsisten dan tanpa mengirim data pribadi pengguna ke pihak ketiga?",
    "Bagaimana pengguna diarahkan ke tindakan dan kanal resmi yang tepat, baik sebelum maupun sesudah telanjur bertindak?",
    "Bagaimana akurasi penilaian diukur secara jujur sehingga pengguna tahu seberapa jauh hasilnya dapat dipercaya?",
], "ol"))

out.append(P[53])
out.append(d.p("Tujuan pengembangan JobShift dirumuskan agar dapat diukur. Setiap tujuan pada Tabel 1.4 menjawab satu rumusan masalah dan memiliki cara ukur serta target yang jelas."))
out.append(d.table("1", "Tujuan pengembangan, cara ukur, dan target", [3300, 3080, 1700], ["Tujuan", "Cara ukur", "Target"], [
    ["Menilai risiko satu lowongan dengan cepat, tanpa daftar akun (RM 1)", "20 percobaan cek dari HP lewat data seluler, persentil ke-95", "< 5 detik"],
    ["Menjelaskan setiap hasil dengan kalimat pemicu atau informasi yang tidak ada (RM 2)", "Pemeriksaan kontrak data: Tanda bahaya tanpa kutipan dianggap tidak sah", "100% hasil"],
    ["Mendeteksi lowongan palsu sebagai Waspada atau Bahaya (RM 1, 3)", "*npm run eval* pada Set test", "Recall ≥ 85%"],
    ["Menjaga lowongan sungguhan agar tidak dicap Bahaya (RM 3)", "*npm run eval* pada Set test", "False positive ≤ 10%"],
    ["Tetap berfungsi saat AI tidak tersedia (RM 3)", "API key dimatikan, lalu 5 contoh dicek", "5 dari 5 berlabel"],
    ["Mengarahkan setiap hasil Waspada/Bahaya ke Langkah darurat dan kanal resmi (RM 4)", "Pemeriksaan isi hasil untuk setiap Label dan Modus", "100% hasil"],
    ["Dapat dipakai pengguna keyboard dan screen reader (RM 1)", "Lighthouse Accessibility di halaman cek dan hasil", "Skor ≥ 95"],
    ["Melaporkan akurasi apa adanya (RM 5)", "Halaman Cara kerja membaca angka langsung dari hasil eval", "Pembilang/penyebut tampil"],
]))

out.append(P[55])
out.append(d.p("JobShift memberikan dampak positif yang dijabarkan melalui tiga aspek utama berikut."))
out.append(d.lst([
    "**Aspek Masyarakat (Society)**: JobShift memberi pencari kerja muda, ibu rumah tangga yang mencari penghasilan tambahan, dan calon pekerja migran cara cepat untuk berhenti sejenak sebelum mentransfer uang atau mengirim KTP dan OTP. Penjelasan yang menunjuk kalimat di pesan itu sendiri juga mengedukasi: pengguna belajar mengenali tanda bahaya yang sama pada lowongan berikutnya. Guru BK dapat memakai contoh siap pakai untuk mengajarkan modus penipuan kepada siswa kelas XII sebelum lulus.",
    "**Aspek Keberlanjutan (Sustainability)**: Setiap penipuan yang dicegah berarti uang keluarga tidak hilang dan risiko seseorang terjebak perdagangan orang berkurang, sejalan dengan SDG 8.5, 8.7, dan 8.8. Secara teknis, JobShift dirancang murah untuk dijalankan jangka panjang: tidak ada basis data, inti penilaian berjalan tanpa layanan berbayar, AI memakai paket gratis yang boleh habis tanpa mematikan aplikasi, dan katalog Aturan berupa data yang mudah diperbarui ketika modus baru muncul.",
    "**Aspek Teknologi**: JobShift menunjukkan pola rancangan *rules-first, AI-assisted* yang dapat diterapkan pada aplikasi perlindungan konsumen lain: Aturan deterministik dengan pembatal kalimat sangkalan (Penyangkal), AI yang dibatasi hanya menambah bukti dengan kutipan yang terverifikasi, Penyamaran data pribadi sebelum ke AI, OCR yang berjalan sepenuhnya di browser, serta evaluasi dengan set uji yang dipegang anggota yang tidak menyetel Aturan.",
], "ol"))

out.append(P[61])
out.append(d.p("Agar pengembangan tetap terarah dan dapat diselesaikan dalam waktu lomba, tim menetapkan batasan berikut."))
out.append(d.lst([
    "Input berupa teks 50–3.000 karakter atau screenshot PNG/JPG/WebP maksimal 5 MB. Input berupa URL lowongan belum didukung dan masuk rencana pengembangan.",
    "Penilaian dioptimalkan untuk teks berbahasa Indonesia, dengan kata kunci bahasa Inggris inti untuk Aturan terpenting.",
    "Hasil JobShift adalah **indikasi risiko**, bukan vonis hukum. JobShift tidak memverifikasi legalitas perusahaan karena tidak memiliki akses ke data atau API pemerintah, dan Label Risiko rendah tidak pernah berarti lowongan itu terjamin.",
    "JobShift tidak menyimpan laporan nomor atau nama pelaku dan tidak menggantikan kanal pelaporan resmi; JobShift mengarahkan pengguna ke kanal tersebut.",
    "Pola penipuan yang dikenali terbatas pada tiga Modus (Tugas, Lokal, Luar negeri) dan tanda bahaya umum yang tercakup dalam katalog Aturan.",
    "Lapisan AI memakai paket gratis Groq dengan kuota harian terbatas. Di luar kuota, Cek tetap berjalan dengan Aturan saja.",
    "Aplikasi berupa web dan diuji di Chrome Android, Safari iOS, serta Chrome dan Firefox desktop, mulai lebar layar 360 px.",
], "ol"))
out.append(d.pagebreak())

# ============================================================ BAB II
out += [P[64], P[65], P[66]]
out.append(d.p("Tim menggunakan kerangka kerja **Scrum** (Schwaber & Sutherland, 2020) yang disesuaikan dengan waktu lomba yang singkat: setiap *sprint* berlangsung satu hari, dengan target (*sprint goal*) yang selalu berupa fitur yang bisa didemokan dari URL publik. Scrum dipilih karena tiga alasan. Pertama, waktu pengembangan hanya beberapa hari sehingga tim membutuhkan umpan balik harian, bukan rencana panjang di awal. Kedua, kebutuhan dapat berubah setelah Aturan diuji pada data, misalnya bobot yang harus disetel ulang. Ketiga, empat anggota bisa bekerja paralel pada tiket berbeda tanpa saling menunggu."))
out.append(d.p("Agar kecepatan tidak mengorbankan kualitas, Scrum dilengkapi tiga praktik. **Spesifikasi lebih dulu**: sebelum menulis kode, tim menyusun PRD, spesifikasi MVP, glosarium istilah, dan catatan keputusan arsitektur (ADR) sehingga seluruh anggota memakai kontrak data dan istilah yang sama. **Irisan vertikal**: *product backlog* dipecah menjadi 14 tiket yang masing-masing menghasilkan fitur utuh dari antarmuka sampai server, bukan lapisan teknis terpisah. **Pengembangan berbasis tes**: setiap Aturan memiliki minimal satu tes positif dan satu tes negatif yang masuk lewat satu pintu, yaitu fungsi *cek(teks, { ai })*. Pembagian peran tim dapat dilihat pada Tabel 2.1."))
out.append(d.table("2", "Peran anggota tim dalam Scrum", [2250, 2350, 3480], ["Anggota", "Peran", "Tanggung jawab utama"], [
    ["Muhammad Zamil", "Ketua, lead teknis, *Product Owner*", "Kerangka aplikasi, inti Cek, mesin Aturan, lapisan AI dan Penyamaran, integrasi, review dan merge semua *pull request*, deploy"],
    ["Ahmad Daniel Firdaus", "Pengembang Aturan", "Katalog Aturan per Modus, Set dev (60 contoh), penyetelan bobot Aturan"],
    ["Ayudhya Naja", "Data, evaluasi, dan mutu", "Set test (40 contoh, dipegang terpisah), skrip *npm run eval*, halaman Cara kerja, audit rilis"],
    ["Nadine Berliana Haty Imany", "UI/UX, copy, aksesibilitas", "Penjelasan dan Langkah aman, OCR screenshot, contoh siap pakai, aksesibilitas antarmuka"],
]))
out.append(d.p("Acara Scrum dijalankan secara ringkas: perencanaan sprint di pagi hari, sinkronisasi harian di grup tim, *sprint review* berupa demo di URL publik, dan retrospeksi singkat di malam hari. *Definition of Done* sebuah tiket adalah: semua kriteria penerimaan bisa didemokan dari URL publik, seluruh tes Vitest lulus, ESLint tanpa error, TypeScript *strict* tanpa error, dan kode sudah di-review oleh lead teknis."))

out.append(P[68])
out.append(d.p("Perangkat keras dan perangkat lunak yang mendukung perancangan, implementasi, dan pengujian JobShift dirinci pada Tabel 2.2 dan Tabel 2.3. Seluruh layanan yang dipakai memiliki paket gratis sehingga aplikasi dapat terus berjalan tanpa biaya operasional."))
out.append(d.table("2", "Perangkat keras yang digunakan", [2600, 3200, 2280], ["Perangkat", "Spesifikasi", "Fungsi"], [
    ["Laptop pengembang 1", "Apple MacBook Air (chip Apple M1), RAM 8 GB, macOS", "Implementasi inti, integrasi, deploy"],
    ["Laptop pengembang 2–4", "[[HL:isi merek, prosesor, RAM, OS]]", "Implementasi Aturan, UI, dan evaluasi"],
    ["Ponsel Android kelas menengah", "[[HL:isi merek/tipe dan versi Android]]", "Uji OCR, uji latensi lewat data seluler, uji tampilan 360 px"],
    ["Server", "Vercel (serverless), tanpa server fisik", "Hosting aplikasi dan API"],
]))
out.append(d.table("2", "Perangkat lunak dan layanan yang digunakan", [2100, 2900, 3080], ["Kategori", "Teknologi", "Fungsi"], [
    ["Bahasa pemrograman", "TypeScript 5 (mode *strict*)", "Seluruh kode klien dan server dengan tipe yang ketat"],
    ["Framework", "Next.js 16.4 (App Router), React 19.3", "Halaman web, Route Handler *POST /api/cek*, render di server"],
    ["Validasi data", "Zod 4", "Validasi input API dan keluaran AI; skema yang sama dipakai sebagai JSON Schema untuk AI"],
    ["AI", "Groq API, model *openai/gpt-oss-120b*, *strict json_schema*", "Menambah Tanda bahaya dengan kutipan; keluaran dijamin sesuai skema"],
    ["OCR", "Tesseract.js (data bahasa *ind* + *eng*) di Web Worker", "Membaca screenshot di browser tanpa mengunggah gambar"],
    ["Basis data", "Tidak ada (disengaja)", "Teks pengguna tidak disimpan; data Aturan dan copy berupa file statis"],
    ["Pengujian dan mutu", "Vitest 5, ESLint 9, Lighthouse", "Tes perilaku, analisis statis, audit aksesibilitas"],
    ["Hosting dan repositori", "Vercel, Git, GitHub (publik)", "Deploy otomatis dari branch *main*, *pull request* dan review"],
    ["Lingkungan kerja", "Antigravity (editor kode berbantuan AI), Node.js ≥ 20", "Penulisan kode dan dokumen spesifikasi"],
]))
out.append(d.p("Pemilihan Groq didasarkan pada riset dokumentasi resmi beberapa penyedia API AI gratis. Groq menyediakan *structured output* mode *strict* yang dengan *constrained decoding* menjamin keluaran selalu sesuai skema (Groq, t.t.-a), dan secara bawaan tidak menyimpan data permintaan inferensi; log hanya disimpan paling lama 30 hari untuk menangani gangguan atau dugaan penyalahgunaan (Groq, t.t.-b). Next.js dipilih karena merupakan framework React untuk membangun aplikasi web *full-stack* (Vercel, t.t.), sehingga halaman dan API berada dalam satu proyek yang di-deploy sekali. Tesseract.js dipilih karena merupakan OCR berbasis JavaScript yang mendukung lebih dari 100 bahasa dan dapat berjalan di browser (Naptha, t.t.), sehingga screenshot yang bisa memuat nomor rekening dan foto KTP tidak perlu meninggalkan perangkat pengguna."))

out.append(P[70])
out.append(d.p("Pengembangan JobShift dikerjakan melalui enam tahap yang berurutan, dengan keluaran yang jelas pada setiap fase (Tabel 2.4)."))
out.append(d.table("2", "Tahapan pengembangan JobShift", [1900, 3700, 2480], ["Tahap", "Kegiatan", "Keluaran"], [
    ["1. Riset masalah", "Mengumpulkan data IASC, Komdigi, dan pola modus; meriset API AI gratis dan kanal resmi (IASC, Karirhub, aduankonten.id, KP2MI)", "PRD, dokumen riset API AI dan IASC"],
    ["2. Analisis kebutuhan", "Menyusun persona, *user story*, kebutuhan fungsional dan non-fungsional, metrik keberhasilan", "Spesifikasi MVP, glosarium istilah"],
    ["3. Perancangan", "Merancang arsitektur, kontrak data *HasilCek*, katalog Aturan, alur skor, UML, dan mockup antarmuka", "Kontrak data, ADR-0001 dan ADR-0002, diagram, mockup"],
    ["4. Implementasi", "Mengerjakan 14 tiket irisan vertikal dalam sprint harian, setiap tiket lewat *pull request* dan review", "Kode di GitHub, deploy di Vercel"],
    ["5. Pengujian", "Tes Vitest lewat seam *cek()*; evaluasi Set dev dan Set test; Lighthouse; 20 percobaan latensi; uji tanpa API key", "Laporan *npm run eval*, hasil audit"],
    ["6. Evaluasi dan rilis", "Audit rilis di URL publik, perbaikan, pembekuan bobot Aturan, penyusunan proposal dan video", "Versi final, proposal, video demonstrasi"],
]))
out.append(d.p("Untuk mengukur akurasi secara jujur, tim menyusun dataset evaluasi dengan target 100 contoh lowongan dari sumber publik dalam format JSONL yang sudah disamarkan dari nomor HP, nama orang, dan nomor rekening. Dataset dibagi menjadi **Set dev** (60 contoh) yang boleh dipakai untuk menyetel bobot Aturan, dan **Set test** (40 contoh) yang dikumpulkan serta dipegang oleh anggota yang **tidak** menyetel Aturan. Set test baru dibuka setelah bobot dibekukan, sehingga angka akurasi yang dilaporkan tidak “bocor” dari proses penyetelan. Jadwal sprint dan status pengerjaan saat proposal ini disusun ditunjukkan pada Tabel 2.5."))
out.append(d.table("2", "Rencana sprint dan status pengerjaan", [1500, 4380, 2200], ["Sprint", "Sasaran sprint (tiket)", "Status"], [
    ["26 Nov (M1)", "Kerangka Next.js, inti *cek()*, *POST /api/cek*, halaman cek, deploy Vercel (01)", "Selesai"],
    ["26–27 Nov", "Mesin Aturan, Aturan kritis R01/R02, Penyangkal, Skor/Label/Modus, sorotan kutipan (03); dataset Set dev dan Set test (02)", "Mesin Aturan selesai; [[HL:status dataset]]"],
    ["27 Nov (M2)", "Katalog Aturan Modus Tugas, Luar negeri, Lokal, dan aturan umum (04–07); Penjelasan dan Langkah aman (08); OCR (09)", "[[HL:perbarui sebelum submit]]"],
    ["28 Nov (M3)", "Lapisan AI dan Penyamaran (10), skrip eval (11), contoh siap pakai (12), halaman Cara kerja (13), audit rilis dan pembekuan fitur (14)", "[[HL:perbarui sebelum submit]]"],
    ["29 Nov (M4)", "Pengumpulan URL, repositori, proposal, surat orisinalitas, video", "[[HL:perbarui sebelum submit]]"],
    ["5–10 Des (M5–M6)", "Jika lolos final: fitur P1 (bacakan hasil, bagikan ke WhatsApp, batas pemakaian), latihan presentasi dan Q&A", "Direncanakan"],
]))
out.append(d.pagebreak())

# ============================================================ BAB III
out += [P[76], P[77], P[78]]
out.append(d.p("Analisis kebutuhan diawali dengan memahami siapa pengguna JobShift. Tim menyusun empat persona dari pola modus yang terdokumentasi (Tabel 3.1). Persona ini bersifat fiktif dan akan dikonfirmasi lewat wawancara singkat dengan pencari kerja sungguhan; masing-masing mewakili satu Modus penipuan dan satu kebutuhan utama."))
out.append(d.table("3", "Persona pengguna JobShift", [1900, 2100, 2000, 2080], ["Persona", "Situasi", "Ancaman", "Kebutuhan dari JobShift"], [
    ["**Rina**, 19 tahun, lulusan SMK", "Melamar kerja pabrik dan admin lewat grup WhatsApp loker", "Modus Lokal: biaya seragam/medical, mengatasnamakan PT besar", "Jawaban cepat sebelum mentransfer biaya"],
    ["**Bu Sari**, 38 tahun, ibu rumah tangga", "Mencari penghasilan tambahan dari HP", "Modus Tugas: like/rating, deposit naik level", "Penjelasan sederhana, huruf besar, kontras tinggi"],
    ["**Andi**, 24 tahun, calon pekerja migran", "Tergiur tawaran kerja luar negeri bergaji tinggi di TikTok", "Modus Luar negeri: visa wisata, risiko TPPO", "Tahu tanda bahaya dan cara cek jalur resmi"],
    ["**Pak Hendra**, guru BK SMK", "Mengingatkan siswa kelas XII yang akan lulus", "Semua modus", "Alat yang bisa didemokan di kelas"],
]))
out.append(d.p("Dari persona tersebut diturunkan kebutuhan fungsional, yaitu fitur wajib (P0) yang harus jalan di URL publik, sebagaimana dirangkum pada Tabel 3.2."))
out.append(d.table("3", "Kebutuhan fungsional (P0)", [900, 2000, 5180], ["ID", "Kebutuhan", "Kriteria penerimaan utama"], [
    ["FR-01", "Input teks", "Kotak teks 50–3.000 karakter dengan penghitung; tombol Cek nonaktif saat kosong; pesan yang jelas bila terlalu pendek atau panjang; disclaimer privasi di bawah tombol"],
    ["FR-02", "Input screenshot", "PNG/JPG/WebP ≤ 5 MB; OCR di browser dengan indikator progres; hasil bacaan bisa diedit sebelum dicek; bila gagal, diarahkan menempel teks"],
    ["FR-03", "Mesin Aturan", "≥ 15 Aturan; setiap kecocokan mengembalikan alasan dan kutipan pemicu; Penyangkal ≤ 3 kata membatalkan R01/R02; deterministik; setiap Aturan punya tes positif dan negatif"],
    ["FR-04", "Skor dan Label", "Skor 0–100; Risiko rendah 0–24, Waspada 25–59, Bahaya ≥ 60; satu Aturan kritis langsung Bahaya; Modus terkuat dihitung dari jumlah bobot"],
    ["FR-05", "Lapisan AI", "Berjalan paralel dengan Aturan, batas waktu 3,5 detik; Teks disamarkan dulu; keluaran divalidasi skema; hanya menambah (+10 per butir, maks. +25)"],
    ["FR-06", "Halaman hasil", "Label berupa warna + ikon + kata; kutipan disorot di teks asli; Tanda bahaya tersirat terpisah; Penjelasan ≤ 3 kalimat; peringatan tetap pada Risiko rendah"],
    ["FR-07", "Langkah aman", "Langkah per Label dan per Modus terkuat; tautan Karirhub, aduankonten.id, KP2MI; Langkah darurat (IASC, bank/e-wallet, Kontak OJK 157) untuk Waspada dan Bahaya"],
    ["FR-08", "Contoh siap pakai", "Empat tombol contoh (tiga palsu, satu sungguhan); hasil AI contoh disimpan statis"],
    ["FR-09", "Aksesibilitas", "Seluruh alur bisa dengan keyboard; hasil dibacakan screen reader lewat *aria-live*; Lighthouse Accessibility ≥ 95"],
    ["FR-10", "Halaman Cara kerja", "Ringkasan Aturan, angka eval Set test dengan pembilang dan penyebut, batasan, kebijakan privasi"],
    ["FR-11", "API cek", "*POST /api/cek* dengan *{teks}* mengembalikan *HasilCek*; input tidak valid dijawab 400 dengan pesan yang jelas"],
    ["FR-12", "Skrip evaluasi", "*npm run eval* mencetak recall, presisi, false positive, dan tabel confusion untuk mode Aturan, AI saja, dan gabungan"],
]))
out.append(d.p("Kebutuhan non-fungsional mengatur kualitas sistem. Privasi dan ketersediaan paling diprioritaskan, karena pengguna menempelkan pesan pribadi dan URL wajib aktif selama penjurian (Tabel 3.3)."))
out.append(d.table("3", "Kebutuhan non-fungsional", [1000, 1650, 5430], ["ID", "Aspek", "Kebutuhan"], [
    ["NFR-01", "Privasi", "Teks dan gambar tidak disimpan dan tidak masuk log; gambar diproses di browser; data pribadi disamarkan sebelum ke AI"],
    ["NFR-02", "Ketersediaan", "URL publik aktif terus sampai final 10 Desember 2026 di hosting yang tidak “tidur”"],
    ["NFR-03", "Kinerja", "Cek teks: persentil ke-95 < 5 detik; OCR: target < 15 detik di HP kelas menengah"],
    ["NFR-04", "Keamanan", "API key hanya di environment variable server; teks pengguna dirender sebagai teks biasa, tidak pernah sebagai HTML"],
    ["NFR-05", "Ketahanan", "Bila AI mati, timeout, atau kuota habis, Cek tetap berjalan dengan Aturan saja"],
    ["NFR-06", "Aksesibilitas", "Kontras ≥ 4,5:1 (WCAG 2.1 tingkat AA); target tim di atas AA: huruf isi ≥ 16 px dan area sentuh ≥ 44 × 44 px; menghormati *prefers-reduced-motion*"],
    ["NFR-07", "Kompatibilitas", "Chrome Android, Safari iOS, Chrome dan Firefox desktop, mulai lebar 360 px"],
    ["NFR-08", "Bahasa", "Semua teks antarmuka dalam bahasa Indonesia awam, tanpa istilah teknis seperti “skor model”"],
    ["NFR-09", "Kualitas kode", "TypeScript *strict*, ESLint tanpa error, semua tes lulus, README menjelaskan cara menjalankan dan arsitektur"],
]))

out.append(P[80])
out.append(d.sub("a. Arsitektur sistem"))
out.append(d.p("JobShift dibangun sebagai satu aplikasi Next.js yang di-deploy ke Vercel (Gambar 3.1). Di sisi browser terdapat halaman cek, OCR, dan tampilan hasil. Di sisi server, Route Handler *POST /api/cek* sengaja dibuat tipis: hanya mengurai JSON, memanggil *cek()*, lalu mengembalikan JSON tanpa pernah menulis isi Teks ke log. Seluruh logika penilaian berada dalam satu modul **Inti Cek** dengan satu pintu masuk, *cek(teks, { ai })*, yang menjalankan enam langkah berurutan. Karena antarmukanya kecil, modul ini mudah dites dan katalog Aturan dapat disetel tanpa mengubah kode lain."))
out.append(d.figure("3", fig("arsitektur"), "Arsitektur sistem JobShift", 14.6))
out.append(d.sub("b. Use Case Diagram"))
out.append(d.p("Use Case Diagram pada Gambar 3.2 memetakan interaksi aktor dengan sistem. **Pencari kerja** adalah aktor utama yang menempel teks atau mengunggah screenshot, mengecek risiko, melihat hasil, dan mengikuti Langkah aman. **Pengguna baru, juri, atau guru BK** mewarisi semua kemampuan pencari kerja dan secara khusus memakai contoh siap pakai serta halaman Cara kerja. **Layanan AI (Groq)** adalah aktor sistem eksternal. Use case *Mengecek risiko lowongan* selalu menyertakan (*include*) penilaian Aturan, sedangkan penilaian AI hanya memperluas (*extend*) bila AI tersedia."))
out.append(d.figure("3", fig("usecase"), "Use Case Diagram JobShift", 14.2))
out.append(d.sub("c. Activity Diagram"))
out.append(d.p("Activity Diagram pada Gambar 3.3 menunjukkan alur satu Cek dari awal hingga selesai dalam empat *swimlane*. Bila pengguna memakai screenshot, gambar dibaca di browser dan hasilnya diperiksa pengguna sebelum dikirim. Browser memvalidasi panjang teks; teks yang terlalu pendek atau panjang tidak pernah dikirim ke server. Di server, Aturan atas Teks asli dan panggilan AI atas Teks tersamar berjalan **paralel** (*fork*). Jika AI tidak menjawab dalam 3,5 detik atau keluarannya tidak valid, alur tetap berlanjut dengan hasil Aturan saja, sehingga pengguna selalu mendapat Label."))
out.append(d.figure("3", fig("activity"), "Activity Diagram proses Cek", 14.6))
out.append(d.sub("d. Logika penilaian: Aturan, Skor, dan Label"))
out.append(d.p("Inti penilaian adalah **katalog Aturan**: pola tetap yang dicari di teks. Setiap Aturan memiliki alasan dalam bahasa awam, daftar pola (bahasa Indonesia dan Inggris), bobot, status kritis, dan paling banyak satu Modus. Teks dinormalisasi (huruf kecil, spasi dipadatkan) hanya untuk pencocokan, dengan peta posisi kembali ke teks asli, sehingga kutipan yang disorot selalu potongan persis dari pesan pengguna. Aturan **kritis** (bobot 60) adalah perilaku yang praktis tidak pernah dilakukan lowongan sungguhan, misalnya meminta uang sebelum diterima (R01), meminta OTP/PIN/password (R02), atau memberangkatkan kerja ke luar negeri dengan visa wisata (R03). Ringkasan katalog ada pada Tabel 3.4; daftar lengkapnya pada Lampiran 1."))
out.append(d.table("3", "Ringkasan katalog Aturan", [3200, 1250, 1250, 2380], ["Kelompok", "Jumlah", "Bobot", "Contoh pola"], [
    ["Aturan kritis (R01, R02, R03, R07)", "4", "60", "“biaya seragam”, “kode OTP”, “visa turis”, “deposit naik level”"],
    ["Modus Tugas (R06b, R08)", "2", "20–25", "“lanjut di Telegram”, “per like dibayar”"],
    ["Modus Lokal (R04, R11)", "2", "20–25", "gaji tidak wajar, nama PT besar + email @gmail"],
    ["Modus Luar negeri (R05, R12, R16)", "3", "25", "gaji tinggi tanpa keahlian, tiket ditanggung, Kamboja/Myanmar"],
    ["Tanda bahaya umum (R06a, R09, R10, R14, R15)", "5", "10–20", "nomor WA pribadi, tanpa interview, kuota terbatas, kirim foto KTP, bit.ly"],
    ["Tanda bahaya tersirat (R13)", "1", "10", "tidak ada nama perusahaan **dan** alamat kantor"],
], col_jc=["left", "center", "center", "left"]))
out.append(d.p("Dua keputusan rancangan membuat penilaian ini dapat dipercaya. **Penyangkal** (ADR-0002): kata seperti “tidak”, “tanpa”, “bebas”, “jangan”, atau “gratis” yang muncul paling jauh tiga kata sebelum pemicu membatalkan kecocokan R01 dan R02. Lowongan sungguhan yang menulis “tidak dipungut biaya apa pun” tidak lagi dicap Bahaya, sedangkan penipu yang menulis “tanpa biaya pendaftaran” lalu meminta “biaya seragam” tetap tertangkap pada kecocokan kedua. **AI hanya menambah** (ADR-0001): Skor dihitung seperti Gambar 3.4, dengan AI menyumbang paling banyak +25, sehingga AI sendirian tidak pernah bisa membuat Label Bahaya, dan Skor gabungan tidak pernah lebih rendah daripada Skor Aturan saja."))
out.append(d.figure("3", fig("skor"), "Alur perhitungan Skor dan ambang Label", 14.6))

out.append(P[82])
out.append(d.p("Desain antarmuka JobShift dirancang untuk orang yang sedang ragu dan terburu-buru, sering kali di HP dengan koneksi seluler. Karena itu, seluruh alur dimulai dari **satu kotak teks** tanpa formulir dan tanpa akun. Prinsip desain yang diterapkan adalah sebagai berikut."))
out.append(d.lst([
    "**Label tidak hanya mengandalkan warna.** Setiap Label tampil sebagai warna, ikon, dan kata sekaligus, sehingga tetap terbaca oleh pengguna buta warna dan screen reader.",
    "**Bukti di tempat yang sama.** Kalimat pemicu disorot (*<mark>*) langsung di teks asli, dan informasi yang tidak ada ditampilkan di daftar terpisah, sehingga pengguna belajar mengenali polanya.",
    "**Tidak memberi rasa aman palsu.** Teks hasil tidak pernah memakai kata “aman”, “asli”, “legit”, atau “terpercaya”. Label Risiko rendah selalu disertai peringatan tetap yang terlihat tanpa *scroll* di layar 360 × 640.",
    "**Bahasa awam.** Tidak ada istilah teknis seperti “R01” atau “skor model” di antarmuka; Penjelasan paling banyak tiga kalimat.",
    "**Aksesibilitas.** Kontras teks ≥ 4,5:1 sesuai WCAG 2.1 tingkat AA (Kirkpatrick dkk., 2025), ditambah target tim yang lebih ketat: huruf isi ≥ 16 px dan area sentuh ≥ 44 × 44 px (setara kriteria *Target Size* tingkat AAA). Fokus keyboard selalu terlihat, hasil diumumkan lewat *aria-live* dan fokus dipindah ke judul hasil, serta animasi mengikuti *prefers-reduced-motion*.",
    "**Tautan yang bisa diperiksa.** Setiap tautan kanal resmi menampilkan domainnya (misalnya *iasc.ojk.go.id*), karena penipu juga membuat situs tiruan.",
], "ul"))
out.append(d.p("Mockup antarmuka utama ditunjukkan pada Gambar 3.5 dan Gambar 3.6. Alur pengguna (*user journey*) dimulai dari halaman Cek (a), lalu langsung ke hasil (b atau c). Pengguna yang memakai screenshot melewati layar baca gambar (d) dan dapat memperbaiki salah baca sebelum menekan Cek. Hasil Waspada dan Bahaya selalu diakhiri Langkah aman serta Langkah darurat (e). Halaman Cara kerja (f) menjelaskan cara penilaian, akurasi, batasan, dan privasi."))
out.append(d.figure("3", fig("mockup1"), "Mockup halaman Cek dan halaman hasil", 15.0))
out.append(d.figure("3", fig("mockup2"), "Mockup OCR, Langkah aman, dan halaman Cara kerja", 15.0))

out.append(P[84])
out.append(d.p("Fitur unggulan JobShift beserta mekanisme penggunaannya dijelaskan sebagai berikut."))
fitur = [
    ("Cek teks instan.", "Pengguna menempelkan pesan lowongan, lalu menekan Cek. Penghitung karakter dan pesan kesalahan yang sama dipakai di browser dan API, sehingga pengguna tahu persis kapan teksnya terlalu pendek untuk dinilai."),
    ("Baca screenshot di browser.", "Gambar dibaca oleh Tesseract.js di Web Worker dengan indikator progres. Hasil bacaan tampil di kotak yang bisa diedit, dan gambar tidak pernah diunggah ke server."),
    ("Label, Skor, dan Tanda bahaya yang disorot.", "Setiap Tanda bahaya menampilkan alasan dan kutipan pemicu yang disorot di teks asli, diurutkan dari bobot terbesar. Tanda bahaya tersirat (misalnya tidak ada nama perusahaan maupun alamat) tampil di daftar terpisah tanpa sorotan."),
    ("Penyangkal.", "Kalimat peringatan seperti “tidak dipungut biaya” atau “jangan berikan OTP kepada siapa pun” tidak dihitung sebagai permintaan uang atau OTP, sehingga lowongan resmi yang justru memberi peringatan tidak dicap Bahaya."),
    ("Lapisan AI dengan Penyamaran.", "Sebelum dikirim ke AI, email, NIK, nomor HP, dan nomor rekening diganti penanda seperti *[NOMOR]*, sementara angka gaji tetap terbaca. Butir AI dibuang bila kutipannya tidak ada di teks, memuat penanda, atau tumpang-tindih dengan Tanda bahaya Aturan."),
    ("Langkah aman dan Langkah darurat.", "Langkah umum menyesuaikan Label, dan langkah spesifik menyesuaikan Modus terkuat, misalnya cek legalitas P3MI dan pengaduan KP2MI untuk Modus Luar negeri (KP2MI, t.t.). Hasil Waspada dan Bahaya selalu memuat bagian “Sudah telanjur transfer?” (IASC, bank atau e-wallet, Kontak OJK 157) dan “Sudah telanjur kirim data?”. IASC ditautkan ke domain resminya karena OJK menegaskan pelaporan hanya melalui *iasc.ojk.go.id* (OJK, 2025)."),
    ("Contoh siap pakai.", "Empat tombol contoh (Modus Tugas, Lokal, Luar negeri, dan satu lowongan sungguhan) mengisi kotak teks dengan satu klik. Hasil AI untuk contoh disimpan statis sehingga demo tidak bergantung pada kuota AI."),
    ("Halaman Cara kerja dan evaluasi jujur.", "Halaman ini menampilkan ringkasan Aturan, angka akurasi dari Set test beserta pembilang dan penyebutnya, jumlah contoh sintetis, batasan, dan kebijakan privasi. Angkanya dibaca otomatis dari file hasil *npm run eval*, bukan diketik tangan."),
    ("API terbuka.", "*POST /api/cek* dengan isi *{teks}* mengembalikan *HasilCek* lengkap, sehingga JobShift dapat diintegrasikan ke bot WhatsApp atau aplikasi lain di masa depan."),
]
out.append(d.lst([f"**{a}** {b}" for a, b in fitur], "ol"))
out.append(d.p("Sebagai ilustrasi alur kerja, misalkan Rina menerima pesan: *“Lowongan staf gudang PT Sinar Pangan Nusantara, gaji Rp6.500.000/bulan. Langsung kerja tanpa interview! Wajib transfer biaya seragam Rp350.000 ke admin. Hubungi WA 0812-xxxx-xxxx.”* Mesin Aturan menemukan “biaya seragam” (R01, Aturan kritis, bobot 60), sehingga Labelnya langsung **Bahaya** dengan Modus terkuat **Lokal**. Penyangkal tidak berlaku karena kata “tanpa” di kalimat sebelumnya tidak menyangkal biaya tersebut. Dengan katalog Aturan lengkap, “Langsung kerja tanpa interview” (R09, 15) dan “WA 0812” (R06a, 15) ikut tercatat sehingga Skor menjadi 90. Langkah aman kemudian mengarahkan Rina untuk tidak mentransfer, mencari lowongan resmi di Karirhub Kemnaker, dan melapor ke aduankonten.id, seperti pada Gambar 3.5 (b). Seluruh proses ini selesai sebelum Rina sempat membuka aplikasi bank."))
out.append(d.pagebreak())

# ============================================================ BAB IV
out += [P[86], P[87], P[88]]
out.append(d.p("JobShift menjawab masalah penipuan lowongan kerja di titik yang paling menentukan, yaitu **sebelum** korban mentransfer uang atau mengirim data pribadi. Dengan satu kotak teks atau satu screenshot, pencari kerja mendapat Label risiko, Skor, dan alasan yang menunjuk kalimat di pesan itu sendiri dalam hitungan detik (target persentil ke-95 di bawah lima detik), lalu diarahkan ke kanal resmi yang sesuai dengan Modus penipuannya. Hal ini menjawab rumusan masalah pertama, kedua, dan keempat."))
out.append(d.p("Rumusan masalah ketiga dijawab dengan rancangan *rules-first, AI-assisted*. Mesin Aturan yang deterministik menjadi penentu utama, Penyangkal mencegah lowongan sungguhan dicap Bahaya hanya karena memuat kalimat peringatan, dan AI dibatasi hanya menambah Tanda bahaya yang kutipannya terverifikasi, setelah data pribadi disamarkan. Rumusan masalah kelima dijawab dengan evaluasi pada Set test yang dipegang anggota yang tidak menyetel Aturan. Pada Set test, JobShift mendeteksi [[HL:__ dari __ (__%)]] lowongan palsu sebagai Waspada atau Bahaya, dengan false positive [[HL:__ dari __ (__%)]], waktu respons persentil ke-95 [[HL:__ detik]], dan skor Lighthouse Accessibility [[HL:__]]. Angka-angka ini dilaporkan apa adanya di halaman Cara kerja."))
out.append(d.p("Keunggulan JobShift dapat dirangkum sebagai berikut: (1) bekerja sebelum kerugian terjadi, bukan sesudahnya; (2) setiap hasil dapat dijelaskan dan dibuktikan dengan kutipan; (3) konsisten, karena input yang sama selalu menghasilkan Label yang sama dan tidak bergantung pada AI; (4) menjaga privasi, karena teks dan gambar tidak disimpan; serta (5) aksesibel bagi pengguna keyboard, screen reader, dan pengguna berpenglihatan lemah."))
out.append(d.p("Dalam jangka panjang, JobShift dapat terus memberi manfaat dengan biaya operasional nol, karena katalog Aturan berupa data yang mudah diperbarui ketika modus baru muncul. Rencana pengembangan berikutnya meliputi fitur membacakan hasil dengan suara untuk pengguna yang kurang lancar membaca, membagikan peringatan ke grup WhatsApp tanpa menyertakan data pribadi, halaman edukasi “Kenali modus” untuk guru BK, input berupa URL lowongan, serta kerja sama dengan sekolah, Balai Latihan Kerja, dan lembaga pendamping pekerja migran. Dengan demikian, JobShift berkontribusi nyata pada SDG 8: membantu kaum muda mendapatkan pekerjaan yang layak dan aman, serta menutup salah satu pintu masuk perdagangan orang."))
out.append(d.pagebreak())

# ============================================================ BAB V
out += [P[105], P[106]]
refs = [
    "Groq. (t.t.-a). *Structured outputs*. GroqDocs. Diakses 26 November 2026, dari https://console.groq.com/docs/structured-outputs",
    "Groq. (t.t.-b). *Your data in GroqCloud*. GroqDocs. Diakses 26 November 2026, dari https://console.groq.com/docs/your-data",
    "Kementerian Pelindungan Pekerja Migran Indonesia (KP2MI). (t.t.). *Cek legalitas*. Migran Aman. Diakses 27 November 2026, dari https://migran-aman.kp2mi.go.id/cek-legalitas",
    "Kirkpatrick, A., O Connor, J., Campbell, A., & Cooper, M. (Ed.). (2025). *Web Content Accessibility Guidelines (WCAG) 2.1* (W3C Recommendation, 6 Mei 2025). World Wide Web Consortium. https://www.w3.org/TR/WCAG21/",
    "Naptha. (t.t.). *tesseract.js: Pure JavaScript OCR for more than 100 languages* [Repositori perangkat lunak]. GitHub. Diakses 27 November 2026, dari https://github.com/naptha/tesseract.js",
    "Otoritas Jasa Keuangan. (2025, 28 Maret). *Waspada penipuan website mengatasnamakan Indonesia Anti-Scam Centre (IASC)*. https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada-Penipuan-Website-Mengatasnamakan-Indonesia-Anti-Scam-Centre-IASC.aspx",
    "Putri, K. (2026, 30 Juni). Korban scam tak tahu harus lapor ke mana? Kenali layanan IASC. *Katadata*. https://katadata.co.id/finansial/keuangan/6a4324b291318/korban-scam-tak-tahu-harus-lapor-ke-mana-kenali-layanan-iasc",
    "Safina, B. (2026, 17 November). IASC terima 741.545 laporan scam, 80% korban lapor setelah 12 jam. *Kontan*. https://keuangan.kontan.co.id/news/iasc-terima-741545-laporan-scam-80-korban-lapor-setelah-12-jam",
    "Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org/scrum-guide.html",
    "Setyowati, D. (2026, 8 September). Komdigi blokir 7.908 loker luar negeri palsu, waspada modus perdagangan orang. *Katadata*. https://katadata.co.id/digital/teknologi/6a9ec5336a97b/komdigi-blokir-7908-loker-luar-negeri-palsu-waspada-modus-perdagangan-orang",
    "United Nations Department of Economic and Social Affairs (UN DESA). (t.t.). *Goal 8: Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all*. Diakses 27 November 2026, dari https://sdgs.un.org/goals/goal8",
    "Vercel. (t.t.). *Next.js docs*. Diakses 27 November 2026, dari https://nextjs.org/docs",
]
for r in refs:
    out.append('<w:p><w:pPr><w:spacing w:after="160" w:before="0" w:line="276" w:lineRule="auto"/><w:ind w:left="720" w:hanging="720"/><w:jc w:val="left"/></w:pPr>'
               + d.runs(r) + '</w:p>')
out.append(d.pagebreak())

# ============================================================ LAMPIRAN
out.append(P[108])
out.append(d.sub("Lampiran 1. Katalog Aturan lengkap"))
out.append(d.p("Bobot non-kritis adalah titik awal yang disetel pada Set dev lalu dibekukan sebelum Set test dibuka. Jarak Penyangkal tiga kata tidak diubah.", first=False))
out.append(d.table("L", "Katalog Aturan JobShift", [700, 3000, 2300, 700, 750, 1100],
    ["ID", "Aturan (alasan ringkas)", "Contoh pola", "Bobot", "Kritis", "Modus"], [
    ["R01", "Meminta uang sebelum diterima kerja", "biaya seragam/medical/pelatihan, transfer dulu, registration fee", "60", "Ya", "Lokal"],
    ["R02", "Meminta OTP, PIN, atau password", "kode OTP, PIN, kata sandi, verification code", "60", "Ya", "—"],
    ["R03", "Kerja luar negeri dengan visa kunjungan/wisata", "visa turis/wisata/kunjungan, visa on arrival", "60", "Ya", "Luar negeri"],
    ["R04", "Gaji tidak wajar untuk kerja dalam negeri", "gaji ≥ Rp15 juta tanpa syarat, Rp500 ribu–Rp2 juta per hari", "25", "Tidak", "Lokal"],
    ["R05", "Gaji luar negeri tinggi tanpa syarat keahlian", "gaji puluhan juta + tanpa pengalaman + negara tujuan", "25", "Tidak", "Luar negeri"],
    ["R06a", "Kontak hanya lewat nomor pribadi", "hubungi WA 08xx, chat admin", "15", "Tidak", "—"],
    ["R06b", "Diminta pindah ke Telegram/aplikasi lain", "lanjut di Telegram, join grup Telegram", "20", "Tidak", "Tugas"],
    ["R07", "Deposit/top-up untuk naik level atau cairkan komisi", "deposit, top up, naik level, VIP", "60", "Ya", "Tugas"],
    ["R08", "Bayaran per like, rating, ulasan, atau follow", "like/rating dibayar, per tugas Rp", "25", "Tidak", "Tugas"],
    ["R09", "Langsung diterima tanpa seleksi", "langsung kerja, tanpa interview, pasti diterima", "15", "Tidak", "—"],
    ["R10", "Mendesak dan membatasi waktu", "kuota terbatas, hari ini juga, urgent", "10", "Tidak", "—"],
    ["R11", "Mengatasnamakan perusahaan besar dengan kontak tidak resmi", "nama PT/BUMN besar + @gmail/@yahoo", "20", "Tidak", "Lokal"],
    ["R12", "Berangkat ke luar negeri cepat di luar jalur resmi", "berangkat cepat, paspor diurus, tiket ditanggung", "25", "Tidak", "Luar negeri"],
    ["R13", "Tersirat: tidak ada nama perusahaan dan alamat", "ketiadaan nama badan usaha dan alamat", "10", "Tidak", "—"],
    ["R14", "Meminta data pribadi sensitif di awal", "foto KTP, selfie dengan KTP, KK, ibu kandung", "20", "Tidak", "—"],
    ["R15", "Tautan pendaftaran tidak resmi", "bit.ly, s.id, tinyurl", "15", "Tidak", "—"],
    ["R16", "Negara tujuan rawan TPPO untuk kerja online", "Kamboja, Myanmar, Laos + admin/operator online", "25", "Tidak", "Luar negeri"],
], size=17, col_jc=["center", "left", "left", "center", "center", "center"]))
out.append(d.sub("Lampiran 2. Kontrak data respons API (HasilCek)"))
out.append(d.table("L", "Isi respons POST /api/cek (status 200)", [2100, 5980], ["Field", "Keterangan"], [
    ["label", "*risiko_rendah*, *waspada*, atau *bahaya*"],
    ["skor", "Bilangan bulat 0–100"],
    ["tandaBahaya[]", "sumber (aturan/ai), alasan, kutipan persis dari Teks asli, rentang posisi karakter untuk sorotan, bobot, modus"],
    ["tandaBahayaTersirat[]", "alasan dan bobot, tanpa kutipan"],
    ["modus[], modusTerkuat", "Semua Modus yang cocok urut jumlah bobot; Modus terkuat atau *null*"],
    ["penjelasan", "Ringkasan ≤ 3 kalimat dalam bahasa awam"],
    ["langkahAman, langkahDarurat", "Langkah umum dan spesifik dengan tautan dan domain; Langkah darurat *null* untuk Risiko rendah"],
    ["sumberPenilaian, catatanAI", "*aturan* atau *aturan+AI*; catatan bila AI tidak tersedia"],
], size=18))
out.append(d.sub("Lampiran 3. Tautan karya"))
out.append(d.lst([
    f"URL website: {URL}",
    f"Repositori GitHub (publik): {REPO}",
    "Video demonstrasi (YouTube): [[HL:tempel tautan video “lomba nekat h-7 | SoftDev - SEVENT X National Competition”]]",
], "ul"))

# paragraf penutup polos (LibreOffice memakai format run terakhir untuk field PAGE yang kosong)
out.append('<w:p><w:pPr><w:spacing w:after="0" w:before="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr>' + FONT + '</w:rPr><w:t xml:space="preserve"> </w:t></w:r></w:p>')

# ============================================================ simpan
d.save(out, OUT)
print("ditulis", OUT)
