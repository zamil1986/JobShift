import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { TAGLINE } from "@/ui/salinan";
import { DESKRIPSI } from "@/ui/salinan-beranda";
import "./globals.css";

// Huruf dot-matrix untuk judul dan cap, seperti cetakan printer struk.
// Disimpan di repo (5 KB, subset latin), tanpa CDN pihak ketiga.
const titik = localFont({
  src: "./fonts/doto-latin.woff2",
  weight: "100 900",
  variable: "--font-titik",
  display: "swap",
});

export const metadata: Metadata = {
  title: TAGLINE,
  description: DESKRIPSI,
};

// Warna bilah browser di Android. Meta tag tidak bisa membaca var(), jadi
// nilainya disalin dari --warna-bidang di globals.css; ubah keduanya bersama.
export const viewport: Viewport = {
  themeColor: "#2338c9",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={titik.variable}>
      <body>{children}</body>
    </html>
  );
}
