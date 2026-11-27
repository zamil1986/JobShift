"""Membuat semua gambar proposal JobShift sebagai SVG (lalu dirender ke PNG oleh svg2png.py)."""
import os, sys, math
from xml.sax.saxutils import escape

OUT = sys.argv[1]
from fontTools.ttLib import TTFont
_F = {}
def measure(txt, size, bold=False):
    key = "Bold" if bold else "Regular"
    if key not in _F:
        f = TTFont(f"/private/tmp/claude-501/-Users-zamil--claude-spares-spare-gVWJ71/75c50455-69fa-4ca3-925f-dd3dc94d8f13/scratchpad/fonts2/GSans-{key}.ttf")
        _F[key] = (f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)
    cmap, hmtx, upm = _F[key]
    return sum(hmtx[cmap.get(ord(c), cmap[32])][0] for c in txt) * size / upm
os.makedirs(OUT, exist_ok=True)

NAVY = "#1B2A7A"; NAVY_L = "#E8ECFB"; INK = "#1a1a1a"; GREY = "#4a4a4a"; LINE = "#6b6b6b"
AKSEN = "#0b5394"; CARD = "#f6f6f4"
RENDAH_BG, RENDAH = "#e7f3ea", "#14532d"
WAS_BG, WAS = "#fff3e0", "#7a3e00"
BAH_BG, BAH = "#fdecea", "#8c0b0b"
MARK = "#ffe08a"
AI_BG, AI = "#f3e8fd", "#5b2a86"


class SVG:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.items = []

    def add(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, fill="#fff", stroke=INK, sw=1.5, rx=0, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def text(self, x, y, s, size=14, bold=False, fill=INK, anchor="middle", italic=False):
        wt = ' font-weight="bold"' if bold else ""
        st = ' font-style="italic"' if italic else ""
        self.add(f'<text x="{x}" y="{y}" font-family="GSans" font-size="{size}"{wt}{st} fill="{fill}" text-anchor="{anchor}">{escape(s)}</text>')

    def tag(self, x, y, s, size=11, fill=GREY):
        w = len(s) * size * 0.56 + 8
        self.rect(x - w / 2, y - size, w, size + 6, "#fff", "#fff", 0, 3)
        self.text(x, y, s, size, False, fill)

    def lines(self, x, y, arr, size=14, bold=False, fill=INK, anchor="middle", lh=None):
        lh = lh or size * 1.3
        for i, s in enumerate(arr):
            self.text(x, y + i * lh, s, size, bold, fill, anchor)

    def line(self, x1, y1, x2, y2, stroke=INK, sw=1.5, dash=None, arrow=False, open_arrow=False):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        m = ' marker-end="url(#ah)"' if arrow else (' marker-end="url(#oa)"' if open_arrow else "")
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}{m}/>')

    def path(self, d, stroke=INK, sw=1.5, fill="none", arrow=False, dash=None):
        m = ' marker-end="url(#ah)"' if arrow else ""
        da = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}"{m}{da}/>')

    def ellipse(self, cx, cy, rx, ry, fill="#fff", stroke=INK, sw=1.5):
        self.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def circle(self, cx, cy, r, fill=INK, stroke=INK, sw=1.5):
        self.add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def poly(self, pts, fill="#fff", stroke=INK, sw=1.5):
        p = " ".join(f"{x},{y}" for x, y in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def save(self, name):
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">'
                '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
                f'<path d="M0,0 L10,5 L0,10 z" fill="{INK}"/></marker>'
                '<marker id="oa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">'
                f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{INK}" stroke-width="1.3"/></marker>'
                '<marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto">'
                f'<path d="M1,1 L11,6 L1,11 z" fill="#fff" stroke="{INK}" stroke-width="1.3"/></marker></defs>'
                f'<rect width="{self.w}" height="{self.h}" fill="#fff"/>')
        open(os.path.join(OUT, name + ".svg"), "w").write(head + "".join(self.items) + "</svg>")


def box(s, x, y, w, h, title, sub=(), fill="#fff", stroke=INK, tsize=14, ssize=12, rx=8, tcol=INK, scol=GREY):
    s.rect(x, y, w, h, fill, stroke, 1.6, rx)
    n = len(sub)
    total = tsize * 1.25 + n * ssize * 1.3
    y0 = y + h / 2 - total / 2 + tsize * 0.9
    s.text(x + w / 2, y0, title, tsize, True, tcol)
    for i, t in enumerate(sub):
        s.text(x + w / 2, y0 + tsize * 0.35 + (i + 1) * ssize * 1.3, t, ssize, False, scol)


# ---------------------------------------------------------------- Arsitektur
def arsitektur():
    s = SVG(1000, 640)
    # Browser
    s.rect(20, 20, 300, 600, "#fafbff", NAVY, 2, 14)
    s.text(170, 50, "Perangkat pengguna (browser)", 16, True, NAVY)
    s.text(170, 70, "HP Android/iOS atau laptop, tanpa login", 12, False, GREY)
    box(s, 45, 90, 250, 78, "Halaman Cek (FormCek)", ["Tempel teks 50–3.000 karakter", "Contoh siap pakai (4 tombol)"])
    box(s, 45, 185, 250, 92, "OCR di browser", ["Tesseract.js di Web Worker", "data bahasa ind + eng di-host sendiri", "gambar tidak pernah diunggah"], fill=NAVY_L)
    box(s, 45, 294, 250, 92, "Tampilan hasil", ["Label + ikon + kata, Skor", "sorotan Kutipan pemicu (<mark>)", "aria-live, fokus ke judul hasil"])
    box(s, 45, 403, 250, 78, "Langkah aman & darurat", ["tautan kanal resmi + domainnya"])
    box(s, 45, 498, 250, 98, "Halaman Cara kerja", ["ringkasan Aturan, akurasi Set test", "(pembilang/penyebut), batasan,", "kebijakan privasi"])
    s.line(170, 277, 170, 294, arrow=True)

    # Vercel
    s.rect(370, 20, 390, 600, "#fbfbf8", INK, 2, 14)
    s.text(565, 50, "Vercel — Next.js (App Router, TypeScript)", 16, True, INK)
    box(s, 395, 75, 340, 62, "Route Handler POST /api/cek", ["parse JSON → cek() → JSON, isi Teks tidak di-log"])
    s.rect(395, 155, 340, 440, NAVY_L, NAVY, 1.8, 10)
    s.text(565, 180, "Inti Cek: cek(teks, { ai }) → HasilCek", 14, True, NAVY)
    steps = [("1. Validasi panjang", "50–3.000 karakter setelah trim"),
             ("2. Mesin Aturan (deterministik)", "katalog ≥ 15 Aturan, Penyangkal, kutipan"),
             ("3. Penyamaran → Adapter AI", "HP/NIK/rekening/email → penanda"),
             ("4. Saring Tanda bahaya AI", "Zod, kutipan wajib ada, tanpa irisan"),
             ("5. Skor, Label, Modus terkuat", "min(100, Σ bobot), ambang 25 / 60"),
             ("6. Penjelasan + Langkah aman", "copy statis, tanpa kata terlarang")]
    for i, (a, b) in enumerate(steps):
        y = 195 + i * 66
        box(s, 415, y, 300, 54, a, [b], fill="#fff", tsize=13, ssize=11)
        if i:
            s.line(565, y - 12, 565, y, arrow=True)
    s.line(565, 137, 565, 155, arrow=True)

    # Groq
    s.rect(800, 250, 180, 150, AI_BG, AI, 2, 14)
    s.lines(890, 282, ["Groq API"], 16, True, AI)
    s.lines(890, 306, ["openai/gpt-oss-120b", "strict json_schema", "timeout 3,5 detik", "hanya menambah ≤ +25"], 12, False, GREY, lh=17)
    s.line(715, 340, 800, 330, arrow=True)
    s.line(800, 365, 715, 375, arrow=True, dash="5 4")
    s.tag(757, 320, "Teks tersamar")
    s.tag(757, 392, "JSON")

    # data statis
    s.rect(800, 440, 180, 155, "#fff", LINE, 1.5, 10, dash="6 4")
    s.lines(890, 465, ["Data statis (repo)"], 13, True, INK)
    s.lines(890, 488, ["katalog Aturan", "copy Langkah aman", "keluaran AI contoh", "hasil eval (JSON)", "tanpa basis data", "Teks tidak disimpan"], 11, False, GREY, lh=16)
    s.line(800, 520, 735, 520, arrow=True, dash="5 4")

    # panah browser <-> server
    s.line(295, 128, 395, 105, arrow=True)
    s.tag(345, 100, "HTTPS")
    s.line(395, 120, 295, 330, arrow=True, dash="5 4")
    s.tag(345, 228, "HasilCek")
    s.save("arsitektur")


# ---------------------------------------------------------------- Use case
def actor(s, x, y, name_lines):
    s.circle(x, y, 14, "#fff")
    s.line(x, y + 14, x, y + 55)
    s.line(x - 22, y + 30, x + 22, y + 30)
    s.line(x, y + 55, x - 18, y + 85)
    s.line(x, y + 55, x + 18, y + 85)
    s.lines(x, y + 108, name_lines, 13, True)


def usecase():
    s = SVG(1000, 700)
    s.rect(230, 20, 565, 665, "#fcfcff", NAVY, 2, 6)
    s.text(512, 50, "Sistem JobShift", 16, True, NAVY)
    U = {}
    L, R, RL, RR = 375, 670, 128, 108
    def uc(key, cx, cy, lines, rx=RL, fill="#fff"):
        s.ellipse(cx, cy, rx, 30, fill, INK, 1.6)
        s.lines(cx, cy - (len(lines) - 1) * 8 + 5, lines, 13)
        U[key] = (cx, cy, rx)
    uc("tempel", L, 100, ["Menempel teks lowongan"])
    uc("unggah", L, 185, ["Mengunggah screenshot"])
    uc("ocr", R, 185, ["Membaca teks", "(OCR di browser)"], rx=RR, fill=NAVY_L)
    uc("edit", R, 100, ["Mengedit hasil bacaan"], rx=RR)
    uc("cek", L, 280, ["Mengecek risiko lowongan"], fill=NAVY_L)
    uc("aturan", R, 280, ["Menilai dengan Aturan"], rx=RR, fill=NAVY_L)
    uc("ai", R, 390, ["Menambah", "penilaian AI"], rx=RR, fill=AI_BG)
    uc("hasil", L, 390, ["Melihat Label, alasan,", "dan sorotan kutipan"])
    uc("langkah", L, 490, ["Melihat Langkah aman", "dan kanal resmi"])
    uc("contoh", L, 570, ["Mencoba contoh siap pakai"])
    uc("carakerja", L, 645, ["Membaca halaman Cara kerja"])

    actor(s, 100, 150, ["Pencari kerja"])
    actor(s, 100, 480, ["Pengguna baru /", "Juri / Guru BK"])
    actor(s, 905, 350, ["Layanan AI", "(Groq)"])
    s.add('<line x1="100" y1="464" x2="100" y2="282" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#tri)"/>')
    s.tag(100, 380, "generalisasi")

    def assoc(ax, ay, key):
        cx, cy, rx = U[key]
        x2 = cx - rx if ax < cx else cx + rx
        s.line(ax, ay, x2, cy)
    for k in ["tempel", "unggah", "cek", "hasil", "langkah"]:
        assoc(124, 185, k)
    for k in ["contoh", "carakerja"]:
        assoc(124, 515, k)
    assoc(880, 380, "ai")

    def dep(k1, k2, label):
        x1, y1, r1 = U[k1]; x2, y2, r2 = U[k2]
        if x1 == x2:
            sy = y1 + 30 if y2 > y1 else y1 - 30
            ey = y2 - 30 if y2 > y1 else y2 + 30
            sx = ex = x1
        else:
            sx = x1 + r1 if x2 > x1 else x1 - r1
            ex = x2 - r2 if x2 > x1 else x2 + r2
            sy, ey = y1, y2
        s.line(sx, sy, ex, ey, dash="6 4", open_arrow=True)
        if x1 == x2:
            s.tag(sx + 40, (sy + ey) / 2 + 4, label)
        elif abs(sy - ey) < 5:
            s.tag((sx + ex) / 2, sy - 9, label)
        else:
            s.tag((sx + ex) / 2 + 40, (sy + ey) / 2 + 4, label)
    dep("unggah", "ocr", "«include»")
    dep("edit", "ocr", "«extend»")
    dep("cek", "aturan", "«include»")
    dep("ai", "cek", "«extend»")
    dep("cek", "hasil", "«include»")
    dep("langkah", "hasil", "«extend»")
    s.save("usecase")


# ---------------------------------------------------------------- Activity
def activity():
    W, H = 1000, 1200
    s = SVG(W, H)
    lanes = [("Pengguna", 20, 220), ("Browser (UI)", 240, 230), ("Server (Inti Cek)", 470, 310), ("Layanan AI (Groq)", 780, 200)]
    for name, x, w in lanes:
        s.rect(x, 20, w, H - 40, "#fdfdff", NAVY, 1.5, 0)
        s.rect(x, 20, w, 40, NAVY_L, NAVY, 1.5, 0)
        s.text(x + w / 2, 46, name, 15, True, NAVY)
    cx = {n: x + w / 2 for n, x, w in lanes}
    P, B, S_, A = "Pengguna", "Browser (UI)", "Server (Inti Cek)", "Layanan AI (Groq)"

    def act(c, y, lines, w=180, fill="#fff"):
        h = 24 + 16 * len(lines)
        s.rect(c - w / 2, y, w, h, fill, INK, 1.6, 14)
        s.lines(c, y + h / 2 - (len(lines) - 1) * 8 + 5, lines, 13)
        return y + h

    def dec(c, y, r=24):
        s.poly([(c, y), (c + r, y + r), (c, y + 2 * r), (c - r, y + r)])
        return y + 2 * r

    p, b, sv, ai = cx[P], cx[B], cx[S_], cx[A]
    s.circle(p, 88, 12)
    s.line(p, 100, p, 118, arrow=True)
    e = act(p, 118, ["Menerima lowongan", "di WA/Telegram/medsos"])
    s.line(p, e, p, 190, arrow=True)
    e = dec(p, 190)                       # 190..238, tengah 214
    s.line(p + 24, 214, b - 100, 214, arrow=True)
    s.tag(p + 62, 206, "[screenshot]")
    e_ocr = act(b, 192, ["Membaca gambar", "dengan OCR (progres)"], w=200, fill=NAVY_L)
    s.path(f"M{b},{e_ocr} L{b},272 L{p+40},272 L{p+40},288", arrow=True)
    e_ed = act(p, 288, ["Memeriksa & mengedit", "teks hasil bacaan"])
    s.path(f"M{p-24},214 L{p-100},214 L{p-100},392 L{p-90},392", arrow=True)
    s.tag(p - 72, 240, "[teks]")
    s.line(p, e_ed, p, 370, arrow=True)
    e_tp = act(p, 370, ["Menempel teks lalu", "menekan tombol Cek"])
    d2 = 368
    s.line(p + 90, 392, b - 24, d2 + 24, arrow=True)
    e = dec(b, d2)
    s.lines(b - 30, d2 - 22, ["Panjang 50–3.000", "karakter?"], 11, False, GREY, "start", 13)
    s.line(b, e, b, 458, arrow=True)
    s.tag(b + 26, 444, "[tidak]")
    e_err = act(b, 458, ["Menampilkan pesan", "panjang teks"], w=170)
    s.path(f"M{b-85},{e_err-26} L{p+40},{e_err-26} L{p+40},{e_tp}", arrow=True)
    s.path(f"M{b+24},{d2+24} L{sv},{d2+24} L{sv},440", arrow=True)
    s.tag(b + 95, d2 + 40, "[ya] POST /api/cek")
    e_val = act(sv, 440, ["Validasi input"], w=170)
    fy = e_val + 22
    s.line(sv, e_val, sv, fy, arrow=True)
    s.add(f'<rect x="{sv-140}" y="{fy}" width="280" height="7" fill="{INK}"/>')
    rx, mx = sv - 72, sv + 78
    s.line(rx, fy + 7, rx, fy + 30, arrow=True)
    e_rule = act(rx, fy + 30, ["Menjalankan Aturan", "atas Teks asli"], w=150)
    s.line(mx, fy + 7, mx, fy + 30, arrow=True)
    e_pm = act(mx, fy + 30, ["Menyamarkan", "data pribadi"], w=130)
    ai_y = e_pm + 40
    s.path(f"M{mx+65},{fy+58} L{ai},{fy+58} L{ai},{ai_y}", arrow=True)
    s.tag(ai - 40, fy + 50, "Teks tersamar")
    e_ai = act(ai, ai_y, ["Menilai Teks", "tersamar (JSON)"], w=160, fill=AI_BG)
    s.line(ai, e_ai, ai, e_ai + 20, arrow=True)
    e_d3 = dec(ai, e_ai + 20)
    s.lines(ai + 30, e_ai + 26, ["≤ 3,5 detik", "& valid?"], 11, False, GREY, "start", 13)
    jy = e_d3 + 70
    s.add(f'<rect x="{sv-140}" y="{jy}" width="{ai+20-(sv-140)}" height="7" fill="{INK}"/>')
    s.line(rx, e_rule, rx, jy, arrow=True)
    s.line(ai, e_d3, ai, jy, arrow=True)
    s.tag(ai + 22, e_d3 + 22, "[ya]")
    s.path(f"M{ai-24},{e_d3-24} L{ai-70},{e_d3-24} L{ai-70},{jy}", arrow=True, dash="5 4")
    s.tag(ai - 70, e_d3 + 22, "[tidak/timeout]")
    e_f = act(sv, jy + 30, ["Menyaring Tanda bahaya AI", "(atau catat: AI tidak tersedia)"], w=240)
    s.line(sv, jy + 7, sv, jy + 30, arrow=True)
    e_s = act(sv, e_f + 25, ["Menghitung Skor,", "Label, Modus terkuat"], w=200)
    s.line(sv, e_f, sv, e_f + 25, arrow=True)
    e_l = act(sv, e_s + 25, ["Menyusun Penjelasan,", "Langkah aman & darurat"], w=220)
    s.line(sv, e_s, sv, e_s + 25, arrow=True)
    y_show = e_l + 40
    s.path(f"M{sv},{e_l} L{sv},{e_l+16} L{b},{e_l+16} L{b},{y_show}", arrow=True)
    s.tag(b + 90, e_l + 12, "HasilCek (JSON)")
    e_show = act(b, y_show, ["Menampilkan hasil,", "sorotan kutipan,", "mengumumkan via aria-live"], w=205)
    y_read = e_show + 40
    s.path(f"M{b},{e_show} L{b},{e_show+16} L{p},{e_show+16} L{p},{y_read}", arrow=True)
    e_read = act(p, y_read, ["Membaca alasan dan", "mengikuti Langkah aman"])
    ey = e_read + 34
    s.line(p, e_read, p, ey - 14, arrow=True)
    s.circle(p, ey, 13, "#fff")
    s.circle(p, ey, 8)
    newh = int(ey + 40)
    s.items = [it.replace(f'height="{H-40}"', f'height="{newh-40}"') for it in s.items]
    s.h = newh
    s.save("activity")


# ---------------------------------------------------------------- Alur skor
def skor():
    s = SVG(1000, 430)
    s.text(500, 34, "Satu Cek: dari Teks ke Label", 17, True, NAVY)
    box(s, 20, 60, 170, 120, "Teks lowongan", ["ditempel atau hasil", "OCR yang sudah", "dikonfirmasi"], fill=CARD)
    box(s, 240, 55, 300, 70, "Aturan (Teks asli)", ["kritis = 60 · non-kritis 10–25", "Penyangkal ≤ 3 kata membatalkan R01/R02"], fill=NAVY_L, stroke=NAVY, ssize=11)
    box(s, 240, 140, 300, 70, "AI (Teks tersamar)", ["+10 per Tanda bahaya sah, maks. +25", "tidak pernah menurunkan Skor"], fill=AI_BG, stroke=AI, ssize=11)
    s.line(190, 110, 240, 90, arrow=True)
    s.line(190, 130, 240, 175, arrow=True)
    box(s, 590, 85, 390, 100, "Skor = min(100, Σ bobot Aturan", ["+ Tanda bahaya tersirat + min(25, 10 × n AI))", "Setiap poin bisa ditunjuk ke kalimat di Teks", "atau ke informasi yang tidak ada"], fill="#fff", ssize=12, tsize=14)
    s.line(540, 90, 590, 120, arrow=True)
    s.line(540, 175, 590, 150, arrow=True)
    # bar
    x0, y0, W = 60, 250, 880
    seg = [(0, 25, "Risiko rendah", "0–24", RENDAH_BG, RENDAH), (25, 60, "Waspada", "25–59", WAS_BG, WAS), (60, 100, "Bahaya", "60–100", BAH_BG, BAH)]
    for a, b, n, r, bg, fg in seg:
        xa = x0 + W * a / 100; xb = x0 + W * b / 100
        s.rect(xa, y0, xb - xa, 54, bg, fg, 2, 0)
        s.text((xa + xb) / 2, y0 + 25, n, 16, True, fg)
        s.text((xa + xb) / 2, y0 + 44, "Skor " + r, 12, False, fg)
    for v in (0, 25, 60, 100):
        xv = x0 + W * v / 100
        s.text(xv, y0 + 74, str(v), 12, True, INK)
    s.line(785, 185, 785, 245, arrow=True)
    s.lines(500, y0 + 110, ["Satu Aturan kritis (misalnya meminta uang sebelum diterima) sudah cukup untuk Bahaya.",
                            "AI sendirian paling banyak +25, jadi AI bisa menaikkan ke Waspada tetapi tidak pernah membuat Bahaya.",
                            "Risiko rendah selalu disertai peringatan bahwa hasil ini bukan jaminan."], 13, False, GREY, lh=20)
    s.save("skor")


# ---------------------------------------------------------------- Mockup
def phone(s, x, y, title):
    w, h = 300, 610
    s.rect(x, y, w, h, "#111", "#111", 1, 34)
    s.rect(x + 10, y + 12, w - 20, h - 24, "#fff", "#fff", 1, 26)
    s.rect(x + w / 2 - 40, y + 20, 80, 14, "#111", "#111", 1, 7)
    s.text(x + w / 2, y + h + 28, title, 14, True, NAVY)
    return x + 24, y + 66, w - 48


def wrap(s, x, y, text, width_chars, size=12, fill=INK, bold=False, lh=None, anchor="start"):
    lh = lh or size * 1.35
    words = text.split(); line = ""; n = 0
    for wd in words:
        if len(line) + len(wd) + 1 > width_chars and line:
            s.text(x, y + n * lh, line, size, bold, fill, anchor); n += 1; line = wd
        else:
            line = (line + " " + wd).strip()
    if line:
        s.text(x, y + n * lh, line, size, bold, fill, anchor); n += 1
    return y + n * lh


def icon_bahaya(s, cx, cy, r, col):
    pts = [(cx + r * math.cos(math.radians(22.5 + 45 * i)), cy + r * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)]
    s.poly(pts, col, col, 1)
    s.rect(cx - r * 0.55, cy - r * 0.16, r * 1.1, r * 0.32, "#fff", "#fff", 0)


def icon_info(s, cx, cy, r, col):
    s.circle(cx, cy, r, col, col)
    s.rect(cx - 1.6, cy - 2, 3.2, r * 0.9, "#fff", "#fff", 0)
    s.circle(cx, cy - r * 0.45, 1.9, "#fff", "#fff")


def icon_warn(s, cx, cy, r, col):
    s.poly([(cx, cy - r), (cx + r, cy + r * 0.8), (cx - r, cy + r * 0.8)], col, col)
    s.rect(cx - 1.5, cy - r * 0.35, 3, r * 0.6, "#fff", "#fff", 0)
    s.circle(cx, cy + r * 0.48, 1.7, "#fff", "#fff")


def header(s, x, y, w):
    s.text(x, y, "JobShift", 22, True, INK, "start")
    s.text(x, y + 20, "JobShift — cek dulu sebelum transfer.", 11.5, False, GREY, "start")
    return y + 40


def button(s, x, y, w, label, fill=AKSEN, fg="#fff", h=40):
    s.rect(x, y, w, h, fill, fill, 1, 8)
    s.text(x + w / 2, y + h / 2 + 5, label, 14, True, fg)


def mockup1():
    s = SVG(1000, 680)
    # Layar 1: input
    x, y, w = phone(s, 20, 15, "(a) Halaman Cek")
    y = header(s, x, y, w)
    s.text(x, y + 8, "Tempel teks lowongan", 13, True, INK, "start")
    s.rect(x, y + 18, w, 190, "#fff", LINE, 2, 8)
    sample = "Lowongan staf gudang PT Sinar Pangan Nusantara, gaji Rp6.500.000/bulan. Langsung kerja tanpa interview! Wajib transfer biaya seragam Rp350.000 ke admin sebelum hari Senin. Hubungi WA 0812-xxxx-xxxx."
    wrap(s, x + 10, y + 40, sample, 33, 11.5, INK, lh=16)
    s.text(x + w, y + 226, "214 / 3.000", 11, False, GREY, "end")
    s.rect(x, y + 236, w, 40, "#fff", AKSEN, 2, 8)
    s.text(x + w / 2, y + 261, "Unggah screenshot", 13, True, AKSEN)
    button(s, x, y + 286, w, "Cek risiko")
    wrap(s, x, y + 344, "JobShift tidak menyimpan teks yang kamu tempel. Teks hanya dipakai untuk satu kali cek ini.", 40, 10.5, GREY, lh=14)
    s.text(x, y + 392, "Coba contoh:", 12, True, INK, "start")
    for i, t in enumerate(["Kerja tugas", "Loker lokal", "Luar negeri", "Loker resmi"]):
        bx = x + (i % 2) * (w / 2 + 2); by = y + 402 + (i // 2) * 46
        s.rect(bx, by, w / 2 - 4, 40, CARD, LINE, 1.2, 8)
        s.text(bx + (w / 2 - 4) / 2, by + 25, t, 12, True, INK)

    # Layar 2: hasil Bahaya
    x, y, w = phone(s, 350, 15, "(b) Hasil berlabel Bahaya")
    s.text(x, y, "Hasil cek", 18, True, INK, "start")
    s.rect(x, y + 12, w, 52, BAH_BG, BAH, 2, 8)
    icon_bahaya(s, x + 24, y + 38, 13, BAH)
    s.text(x + 46, y + 36, "Bahaya", 18, True, BAH, "start")
    s.text(x + 46, y + 54, "Skor 90 dari 100", 11.5, False, BAH, "start")
    yy = wrap(s, x, y + 84, "Lowongan ini meminta uang sebelum kamu resmi diterima. Polanya cocok dengan Modus Lokal: biaya seragam atau medical yang tidak pernah diminta perusahaan sungguhan.", 40, 11, INK, lh=15)
    s.text(x, yy + 6, "Modus yang cocok: Lokal", 11.5, True, INK, "start")
    s.text(x, yy + 32, "Tanda bahaya", 14, True, INK, "start")
    items = [("Meminta uang sebelum kamu resmi diterima kerja.", "biaya seragam"),
             ("Langsung diterima tanpa seleksi.", "Langsung kerja tanpa interview"),
             ("Kontak hanya lewat nomor pribadi.", "WA 0812")]
    yy += 50
    for a, q in items:
        s.circle(x + 5, yy - 4, 2.6)
        yy = wrap(s, x + 14, yy, a, 38, 11, INK, lh=14)
        s.rect(x + 14, yy - 12, measure("“" + q + "”", 11) + 10, 17, MARK, MARK, 0, 3)
        s.text(x + 19, yy + 1, "“" + q + "”", 11, False, INK, "start")
        yy += 22
    s.text(x, yy + 6, "Teks yang dicek", 14, True, INK, "start")
    s.rect(x, yy + 16, w, 96, CARD, CARD, 0, 6)
    t = ["Lowongan staf gudang PT Sinar Pangan", "Nusantara, gaji Rp6.500.000/bulan.", "Langsung kerja tanpa interview! Wajib", "transfer biaya seragam Rp350.000 ke..."]
    hl = {2: "Langsung kerja tanpa interview", 3: "biaya seragam"}
    for i, ln in enumerate(t):
        ly = yy + 36 + i * 19
        if i in hl:
            a = ln.index(hl[i])
            s.rect(x + 8 + measure(ln[:a], 11), ly - 12, measure(hl[i], 11), 16, MARK, MARK, 0, 2)
        s.text(x + 8, ly, ln, 11, False, INK, "start")
    button(s, x, yy + 124, w, "Lihat Langkah aman ↓", fill="#fff", fg=AKSEN, h=36)
    s.rect(x, yy + 124, w, 36, "none", AKSEN, 2, 8)

    # Layar 3: Risiko rendah
    x, y, w = phone(s, 680, 15, "(c) Hasil berlabel Risiko rendah")
    s.text(x, y, "Hasil cek", 18, True, INK, "start")
    s.rect(x, y + 12, w, 52, RENDAH_BG, RENDAH, 2, 8)
    icon_info(s, x + 24, y + 38, 12, RENDAH)
    s.text(x + 46, y + 36, "Risiko rendah", 18, True, RENDAH, "start")
    s.text(x + 46, y + 54, "Skor 10 dari 100", 11.5, False, RENDAH, "start")
    s.rect(x, y + 76, w, 92, WAS_BG, WAS, 1.5, 8)
    icon_warn(s, x + 18, y + 96, 10, WAS)
    wrap(s, x + 34, y + 98, "Tidak ditemukan tanda bahaya, tapi ini bukan jaminan. Jangan transfer uang apa pun sebelum resmi diterima kerja.", 33, 11, WAS, True, lh=15)
    yy = wrap(s, x, y + 192, "Kami tidak menemukan pola penipuan yang dikenal di teks ini. Tetap cek lowongannya di kanal resmi sebelum mengirim data.", 40, 11, INK, lh=15)
    s.text(x, yy + 14, "Yang tidak disebutkan di teks", 13, True, INK, "start")
    s.circle(x + 5, yy + 36, 2.6)
    yy = wrap(s, x + 14, yy + 40, "Tidak disebutkan nama perusahaan maupun alamat kantor.", 38, 11, INK, lh=14)
    s.text(x, yy + 18, "Langkah berikutnya", 13, True, INK, "start")
    for i, (t, d) in enumerate([("Cari lowongan resmi di Karirhub", "karirhub.kemnaker.go.id"), ("Laporkan konten mencurigakan", "aduankonten.id")]):
        by = yy + 30 + i * 56
        s.rect(x, by, w, 48, "#fff", LINE, 1.2, 8)
        s.text(x + 10, by + 20, t, 11.5, True, AKSEN, "start")
        s.text(x + 10, by + 37, d, 10.5, False, GREY, "start")
    s.save("mockup1")


def mockup2():
    s = SVG(1000, 680)
    # (d) OCR
    x, y, w = phone(s, 20, 15, "(d) Baca screenshot (OCR)")
    y = header(s, x, y, w)
    s.rect(x, y + 4, w, 150, CARD, LINE, 1.2, 8)
    for i in range(6):
        s.rect(x + 18, y + 22 + i * 20, [200, 170, 210, 150, 190, 120][i], 9, "#d5d9e6", "#d5d9e6", 0, 4)
    s.text(x, y + 178, "Membaca gambar… 64%", 12, True, INK, "start")
    s.rect(x, y + 186, w, 10, "#e3e3e3", "#e3e3e3", 0, 5)
    s.rect(x, y + 186, w * 0.64, 10, AKSEN, AKSEN, 0, 5)
    s.text(x, y + 222, "Periksa hasil bacaan", 13, True, INK, "start")
    s.rect(x, y + 230, w, 130, "#fff", LINE, 2, 8)
    wrap(s, x + 10, y + 252, "DICARI ADMIN ONLINE penempatan Kamboja, gaji 25 juta/bulan, tanpa pengalaman. Visa turis diurus, tiket ditanggung...", 33, 11.5, INK, lh=16)
    wrap(s, x, y + 382, "Gambar dibaca di HP kamu dan tidak diunggah ke server. Perbaiki teks yang salah baca sebelum dicek.", 40, 10.5, GREY, lh=14)
    button(s, x, y + 420, w, "Cek risiko")

    # (e) Langkah aman + darurat
    x, y, w = phone(s, 350, 15, "(e) Langkah aman & darurat")
    s.rect(x, y - 8, w, 44, BAH_BG, BAH, 2, 8)
    icon_bahaya(s, x + 22, y + 14, 12, BAH)
    s.text(x + 42, y + 20, "Bahaya · Modus Luar negeri", 13.5, True, BAH, "start")
    s.text(x, y + 62, "Langkah aman", 14, True, INK, "start")
    yy = y + 70
    for t, d in [("Cek izin P3MI sebelum melamar", "migran-aman.kp2mi.go.id"), ("Pengaduan KP2MI 0800-1000", "WA 0811-8080-141"), ("Jangan berangkat dengan visa wisata", "")]:
        h = 46 if d else 34
        s.rect(x, yy, w, h, "#fff", LINE, 1.2, 8)
        s.text(x + 10, yy + 20, t, 11.5, True, AKSEN if d else INK, "start")
        if d:
            s.text(x + 10, yy + 37, d, 10.5, False, GREY, "start")
        yy += h + 8
    s.text(x, yy + 18, "Sudah telanjur transfer?", 13, True, BAH, "start")
    yy += 28
    for t, d in [("Lapor ke IASC secepatnya", "iasc.ojk.go.id"), ("Hubungi bank / e-wallet kamu", ""), ("Kontak OJK 157", "")]:
        s.circle(x + 5, yy + 4, 2.6)
        s.text(x + 14, yy + 8, t, 11.5, False, INK, "start")
        if d:
            s.text(x + w, yy + 8, d, 10.5, False, AKSEN, "end")
        yy += 22
    s.text(x, yy + 14, "Sudah telanjur kirim data?", 13, True, BAH, "start")
    yy += 24
    for t in ["Hubungi bank / e-wallet kamu", "Kontak OJK 157", "Laporkan akun pelaku di platformnya"]:
        s.circle(x + 5, yy + 4, 2.6)
        s.text(x + 14, yy + 8, t, 11.5, False, INK, "start")
        yy += 22

    # (f) Cara kerja
    x, y, w = phone(s, 680, 15, "(f) Halaman Cara kerja")
    s.text(x, y, "Cara kerja JobShift", 17, True, INK, "start")
    yy = wrap(s, x, y + 24, "Penilaian utama berasal dari Aturan yang sama untuk setiap teks. AI hanya boleh menambah tanda bahaya yang kutipannya ada di teks.", 40, 11, INK, lh=15)
    s.text(x, yy + 14, "Akurasi pada Set test", 13, True, INK, "start")
    yy += 24
    for t, v in [("Loker palsu tertangkap", "__ / __"), ("Loker resmi diberi Bahaya", "__ / __"), ("Contoh sintetis", "__ dari __")]:
        s.rect(x, yy, w, 40, CARD, CARD, 0, 8)
        s.text(x + 10, yy + 25, t, 11.5, False, INK, "start")
        s.text(x + w - 10, yy + 25, v, 13, True, NAVY, "end")
        yy += 46
    s.text(x, yy + 10, "angka dibaca otomatis dari hasil npm run eval", 10, False, GREY, "start")
    s.text(x, yy + 38, "Batasan", 13, True, INK, "start")
    yy = wrap(s, x, yy + 56, "Dioptimalkan untuk bahasa Indonesia. Hasil adalah indikasi risiko, bukan vonis hukum.", 40, 11, INK, lh=15)
    s.text(x, yy + 12, "Privasi", 13, True, INK, "start")
    wrap(s, x, yy + 30, "Teks tidak disimpan. Nomor HP, NIK, rekening, dan email disamarkan sebelum dikirim ke AI.", 40, 11, INK, lh=15)
    s.save("mockup2")


arsitektur(); usecase(); activity(); skor(); mockup1(); mockup2()
print("ok")
