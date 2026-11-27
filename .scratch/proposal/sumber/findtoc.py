import sys, json, pypdfium2 as p
pdf = p.PdfDocument(sys.argv[1])
pages = [pdf[i].get_textpage().get_text_range().replace('\r', '') for i in range(len(pdf))]
keys = ["DAFTAR ISI", "PENDAHULUAN", "Judul/Nama Perangkat Lunak", "Latar Belakang Ide Perangkat Lunak", "Rumusan Masalah",
        "Tujuan Pengembangan", "Manfaat Pengembangan", "Batasan Aplikasi/Software", "METODOLOGI PENGEMBANGAN",
        "Model Pengembangan Sistem", "Teknologi yang digunakan", "Tahap Pengembangan", "ANALISIS DESAIN SOFTWARE",
        "Analisis Kebutuhan Sistem", "Perancangan Kebutuhan Sistem", "Desain Antarmuka (UI/UX)", "Fitur dan Alur Kerja Sistem",
        "KESIMPULAN", "Kesimpulan", "DAFTAR PUSTAKA", "LAMPIRAN-LAMPIRAN"]
res = {}
for k in keys:
    start = 1 if k == "DAFTAR ISI" else 2  # lewati sampul dan halaman daftar isi
    for i in range(start, len(pages)):
        lines = [l.strip() for l in pages[i].split('\n')]
        if any(l == k or (l.endswith(k) and len(l) <= len(k) + 6) for l in lines):
            res[k] = i + 1; break
    else:
        res[k] = None
res["LAMPIRAN"] = res.pop("LAMPIRAN-LAMPIRAN")
print(json.dumps(res, indent=0)); print("total halaman", len(pages))
json.dump(res, open(sys.argv[2], 'w'))
