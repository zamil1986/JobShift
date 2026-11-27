import sys, glob, resvg_py
fonts=sorted(glob.glob(sys.argv[1]+'/*.ttf'))
for src in sys.argv[2:]:
    out=src[:-4]+'.png'
    data=resvg_py.svg_to_bytes(svg_path=src, font_files=fonts, font_family="GSans", zoom=2.5, background="#ffffff")
    open(out,'wb').write(bytes(data)); print(out)
