import type { ReactNode } from "react";
import type { NamaIkonFitur } from "./salinan-beranda";

// Ikon dan ilustrasi beranda, digambar sendiri: satu ketebalan garis (1.5),
// sudut membulat, warna dari `currentColor` dan token CSS. Semuanya
// dekoratif; teks di sebelahnya yang dibacakan.

type PropsSvg = { className?: string };

/** Tanda JobShift: gelembung pesan dengan centang, karena yang dicek adalah pesan. */
export function TandaJobShift({ className }: PropsSvg) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M6 5h20a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H14l-6 5v-5H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
        fill="var(--warna-aksen)"
      />
      <path
        d="m10.5 14.5 3.5 3.5 7.5-8"
        fill="none"
        stroke="var(--warna-teks-kuat)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const IKON_FITUR: Record<NamaIkonFitur, ReactNode> = {
  kutip: (
    <>
      <path {...garis} d="M4 6h16M4 10h9M4 14h16M4 18h7" />
      <rect {...garis} x="12" y="8" width="9" height="4" rx="1" />
    </>
  ),
  kunci: (
    <>
      <rect {...garis} x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path {...garis} d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  tambah: (
    <>
      <circle {...garis} cx="12" cy="12" r="8.5" />
      <path {...garis} d="M12 8v8M8 12h8" />
    </>
  ),
  orang: (
    <>
      <circle {...garis} cx="12" cy="8.5" r="3.5" />
      <path {...garis} d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" />
    </>
  ),
  pola: (
    <>
      <rect {...garis} x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect {...garis} x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect {...garis} x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <circle {...garis} cx="16.75" cy="16.75" r="3.25" />
    </>
  ),
  arah: (
    <>
      <path {...garis} d="M5 12h12M13 7l5 5-5 5" />
      <path {...garis} d="M5 5v14" />
    </>
  ),
};

export function IkonFitur({ nama }: { nama: NamaIkonFitur }) {
  return (
    <svg className="ikon-fitur" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {IKON_FITUR[nama]}
    </svg>
  );
}

/**
 * Ilustrasi tiap langkah Cara kerja, digambar sebagai potongan antarmuka:
 * gelembung pesan yang disalin, kotak tempel dengan tombol, dan teks dengan
 * satu kalimat yang ditandai.
 */
const ILUSTRASI_LANGKAH: ReactNode[] = [
  <>
    <rect x="18" y="16" width="124" height="54" rx="12" className="il-panel" />
    <path d="M30 32h82M30 44h100M30 56h64" className="il-baris" />
    <rect x="58" y="80" width="84" height="34" rx="10" className="il-panel il-aktif" />
    <path d="M70 92h54M70 102h36" className="il-baris il-baris-terang" />
    <path d="m128 74 8-8m0 0h-7m7 0v7" className="il-garis-aksen" />
  </>,
  <>
    <rect x="22" y="14" width="116" height="66" rx="10" className="il-panel" />
    <path d="M34 30h80M34 42h92M34 54h56" className="il-baris" />
    <rect x="22" y="90" width="116" height="26" rx="8" className="il-tombol" />
    <path d="M70 103h20" className="il-baris il-baris-terang" />
  </>,
  <>
    <rect x="18" y="14" width="124" height="102" rx="12" className="il-panel" />
    <path d="M30 32h96M30 46h70" className="il-baris" />
    <rect x="26" y="54" width="108" height="18" rx="4" className="il-sorot" />
    <path d="M32 63h88" className="il-baris il-baris-gelap" />
    <path d="M30 86h92M30 100h52" className="il-baris" />
  </>,
];

export function IlustrasiLangkah({ urutan }: { urutan: number }) {
  return (
    <svg className="ilustrasi-langkah" viewBox="0 0 160 130" aria-hidden="true" focusable="false">
      {ILUSTRASI_LANGKAH[urutan]}
    </svg>
  );
}
