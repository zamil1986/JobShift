"""Mesin pengisi template SEVENT X: menyunting word/document.xml secara langsung.

Struktur, gaya, heading, header/footer, font tertanam, dan logo template dipertahankan.
Yang diganti hanya paragraf petunjuk di bawah setiap heading.
"""
import re, os, shutil, zipfile, struct
from xml.sax.saxutils import escape

FONT = '<w:rFonts w:ascii="Google Sans" w:cs="Google Sans" w:eastAsia="Google Sans" w:hAnsi="Google Sans"/>'
BODY_IND = 425.19685039370086
FIRST = 294.80314960629914
TEXT_W = 8508  # twips, lebar area teks (11906 - 2 x 1699)


class Doc:
    def __init__(self, tpl_dir):
        self.dir = tpl_dir
        self.xml = open(os.path.join(tpl_dir, "word/document.xml"), encoding="utf-8").read()
        b = self.xml.find("<w:body>") + len("<w:body>")
        e = self.xml.find("<w:sectPr>", b)
        self.head, self.body, self.tail = self.xml[:b], self.xml[b:e], self.xml[e:]
        m = re.search(r"<w:sdt>.*?<w:sdtContent>", self.body, re.S)
        self.sdt_open = m.group(0)
        self.sdt_close = "</w:sdtContent></w:sdt>"
        flat = self.body.replace(self.sdt_open, "").replace(self.sdt_close, "")
        self.paras = re.findall(r"<w:p[ >].*?</w:p>", flat, re.S)
        assert "".join(self.paras) == flat, "body berisi elemen selain paragraf"
        self.numbering = open(os.path.join(tpl_dir, "word/numbering.xml"), encoding="utf-8").read()
        self.rels = open(os.path.join(tpl_dir, "word/_rels/document.xml.rels"), encoding="utf-8").read()
        self.next_num = 20
        self.new_abs = []
        self.new_nums = []
        self.images = []  # (rid, target, src)
        self.next_rid = 100
        self.next_docpr = 1000
        self.fig_no = {}
        self.tab_no = {}
        self.bullet_abs = None

    # ------------------------------------------------------------ numbering
    def _bullet_abs(self):
        if self.bullet_abs is None:
            self.bullet_abs = 30
            self.new_abs.append(
                '<w:abstractNum w:abstractNumId="30"><w:multiLevelType w:val="hybridMultilevel"/>'
                '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/>'
                '<w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>'
                '<w:rPr><w:rFonts w:ascii="Google Sans" w:hAnsi="Google Sans" w:cs="Google Sans"/></w:rPr></w:lvl>'
                '<w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="–"/>'
                '<w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr></w:lvl>'
                '</w:abstractNum>')
        return self.bullet_abs

    def new_list(self, kind):
        nid = self.next_num
        self.next_num += 1
        if kind == "ul":
            self.new_nums.append(f'<w:num w:numId="{nid}"><w:abstractNumId w:val="{self._bullet_abs()}"/></w:num>')
        else:
            # abstractNum 7 = "%1." desimal milik template; mulai ulang dari 1 untuk setiap daftar baru
            self.new_nums.append(f'<w:num w:numId="{nid}"><w:abstractNumId w:val="7"/>'
                                 '<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>')
        return nid

    # ------------------------------------------------------------ runs
    @staticmethod
    def runs(text, size=None, bold=False, italic=False, color=None):
        """Markup: **tebal**, *miring*, [[HL:teks]] = sorotan kuning (slot yang harus diisi tim)."""
        out = []
        tokens = re.split(r"(\*\*.+?\*\*|\*[^*]+?\*|\[\[HL:.+?\]\])", text)
        for t in tokens:
            if not t:
                continue
            b, i, hl = bold, italic, False
            if t.startswith("**"):
                t, b = t[2:-2], True
            elif t.startswith("[[HL:"):
                t, hl = t[5:-2], True
            elif t.startswith("*") and t.endswith("*") and len(t) > 2:
                t, i = t[1:-1], True
            rpr = FONT
            if b:
                rpr += '<w:b w:val="1"/><w:bCs w:val="1"/>'
            if i:
                rpr += '<w:i w:val="1"/><w:iCs w:val="1"/>'
            if color:
                rpr += f'<w:color w:val="{color}"/>'
            if size:
                rpr += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
            if hl:
                rpr += '<w:highlight w:val="yellow"/>'
            out.append(f'<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{escape(t)}</w:t></w:r>')
        return "".join(out)

    # ------------------------------------------------------------ blocks
    def p(self, text, first=True, after=200, before=0, ind=BODY_IND, jc=None, keep_next=False, size=None, bold=False, italic=False):
        ppr = f'<w:spacing w:after="{after}" w:before="{before}" w:lineRule="auto"/>'
        ppr += f'<w:ind w:left="{ind}" w:firstLine="{FIRST if first else 0}"/>'
        if jc:
            ppr += f'<w:jc w:val="{jc}"/>'
        if keep_next:
            ppr = '<w:keepNext w:val="1"/>' + ppr
        return f'<w:p><w:pPr>{ppr}</w:pPr>{self.runs(text, size, bold, italic)}</w:p>'

    def sub(self, text):
        """Sub-judul kecil (tidak masuk daftar isi)."""
        return (f'<w:p><w:pPr><w:keepNext w:val="1"/><w:keepLines w:val="1"/><w:spacing w:after="80" w:before="120" w:lineRule="auto"/>'
                f'<w:ind w:left="{BODY_IND}" w:firstLine="0"/><w:jc w:val="left"/></w:pPr>{self.runs(text, bold=True)}</w:p>')

    def lst(self, items, kind="ol", num_id=None, left=992.1259842519685, after_last=200):
        nid = num_id or self.new_list(kind)
        out = []
        for k, it in enumerate(items):
            after = after_last if k == len(items) - 1 else 60
            out.append(f'<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="{nid}"/></w:numPr>'
                       f'<w:spacing w:after="{after}" w:before="0" w:lineRule="auto"/><w:ind w:left="{left}" w:hanging="360"/></w:pPr>'
                       f'{self.runs(it)}</w:p>')
        return "".join(out)

    def caption(self, kind, chap, text, before=120, after=120, keep_next=False):
        key = (kind, chap)
        reg = self.fig_no if kind == "Gambar" else self.tab_no
        reg[key] = reg.get(key, 0) + 1
        label = f"{kind} {chap}.{reg[key]}" if chap else f"{kind} {reg[key]}"
        kn = '<w:keepNext w:val="1"/>' if keep_next else ""
        return (f'<w:p><w:pPr>{kn}<w:spacing w:after="{after}" w:before="{before}" w:line="240" w:lineRule="auto"/>'
                f'<w:ind w:left="0" w:firstLine="0"/><w:jc w:val="center"/></w:pPr>'
                f'{self.runs("**" + label + "** " + text, size=20)}</w:p>'), label

    def table(self, chap, cap, widths, header, rows, size=19, ind=BODY_IND, col_jc=None):
        total = sum(widths)
        cap_xml, label = self.caption("Tabel", chap, cap, before=160, after=80, keep_next=True)
        border = "".join(f'<w:{s} w:val="single" w:sz="6" w:space="0" w:color="8A8FA8"/>' for s in ("top", "left", "bottom", "right", "insideH", "insideV"))
        tbl = [f'<w:tbl><w:tblPr><w:tblW w:w="{total}" w:type="dxa"/><w:tblInd w:w="{int(ind)}" w:type="dxa"/>'
               f'<w:tblBorders>{border}</w:tblBorders><w:tblLayout w:type="fixed"/>'
               '<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar>'
               '</w:tblPr><w:tblGrid>' + "".join(f'<w:gridCol w:w="{w}"/>' for w in widths) + '</w:tblGrid>']

        def cell(text, w, head=False, jc="left"):
            shade = '<w:shd w:val="clear" w:color="auto" w:fill="E8ECFB"/>' if head else ""
            paras = []
            for part in (text if isinstance(text, list) else [text]):
                paras.append(f'<w:p><w:pPr><w:spacing w:after="0" w:before="0" w:line="252" w:lineRule="auto"/>'
                             f'<w:ind w:left="0" w:firstLine="0"/><w:jc w:val="{"center" if head else jc}"/></w:pPr>'
                             f'{self.runs(part, size=size, bold=head)}</w:p>')
            return f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>{shade}</w:tcPr>{"".join(paras)}</w:tc>'

        tbl.append('<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>' + "".join(cell(h, w, True) for h, w in zip(header, widths)) + '</w:tr>')
        for r in rows:
            tbl.append('<w:tr><w:trPr><w:cantSplit/></w:trPr>' + "".join(
                cell(c, w, False, (col_jc[i] if col_jc else "left")) for i, (c, w) in enumerate(zip(r, widths))) + '</w:tr>')
        tbl.append('</w:tbl>')
        spacer = '<w:p><w:pPr><w:spacing w:after="120" w:before="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>'
        return cap_xml + "".join(tbl) + spacer

    def figure(self, chap, png, cap, width_cm):
        w, h = struct.unpack(">II", open(png, "rb").read()[16:24])
        cx = int(width_cm * 360000)
        cy = int(cx * h / w)
        rid = f"rId{self.next_rid}"; self.next_rid += 1
        name = f"fig{len(self.images) + 1}.png"
        self.images.append((rid, name, png))
        did = self.next_docpr; self.next_docpr += 1
        drawing = (f'<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{cx}" cy="{cy}"/>'
                   f'<wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="{did}" name="{name}" descr="{escape(cap)}"/>'
                   '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
                   '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>'
                   f'<pic:nvPicPr><pic:cNvPr id="{did}" name="{name}"/><pic:cNvPicPr/></pic:nvPicPr>'
                   f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
                   f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
                   '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>')
        img_p = (f'<w:p><w:pPr><w:keepNext w:val="1"/><w:spacing w:after="0" w:before="120" w:line="240" w:lineRule="auto"/>'
                 f'<w:ind w:left="0" w:firstLine="0"/><w:jc w:val="center"/></w:pPr><w:r>{drawing}</w:r></w:p>')
        cap_xml, label = self.caption("Gambar", chap, cap, before=80, after=200)
        return img_p + cap_xml

    @staticmethod
    def pagebreak():
        return '<w:p><w:pPr><w:spacing w:after="0" w:before="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>'

    # ------------------------------------------------------------ output
    def save(self, body_parts, out_path):
        body = "".join(body_parts)
        xml = self.head + body + self.tail
        work = self.dir + "_build"
        if os.path.exists(work):
            shutil.rmtree(work)
        shutil.copytree(self.dir, work)
        open(os.path.join(work, "word/document.xml"), "w", encoding="utf-8").write(xml)
        num = self.numbering
        last_abs = num.rfind("</w:abstractNum>") + len("</w:abstractNum>")
        num = num[:last_abs] + "".join(self.new_abs) + num[last_abs:]
        num = num.replace("</w:numbering>", "".join(self.new_nums) + "</w:numbering>")
        open(os.path.join(work, "word/numbering.xml"), "w", encoding="utf-8").write(num)
        rels = self.rels.replace("</Relationships>", "".join(
            f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{name}"/>'
            for rid, name, _ in self.images) + "</Relationships>")
        open(os.path.join(work, "word/_rels/document.xml.rels"), "w", encoding="utf-8").write(rels)
        for _, name, src in self.images:
            shutil.copy(src, os.path.join(work, "word/media", name))
        if os.path.exists(out_path):
            os.remove(out_path)
        with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
            # [Content_Types].xml harus menjadi entri pertama
            z.write(os.path.join(work, "[Content_Types].xml"), "[Content_Types].xml")
            for root, _, files in os.walk(work):
                for f in sorted(files):
                    full = os.path.join(root, f)
                    arc = os.path.relpath(full, work)
                    if arc == "[Content_Types].xml":
                        continue
                    z.write(full, arc)
