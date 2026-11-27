import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { TAGLINE } from "@/ui/salinan";
import { DESKRIPSI } from "@/ui/salinan-beranda";
import "./globals.css";

export const metadata: Metadata = {
  title: TAGLINE,
  description: DESKRIPSI,
};

// Warna bilah browser di Android. Meta tag tidak bisa membaca var(), jadi
// nilainya disalin dari --warna-latar di globals.css; ubah keduanya bersama.
export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
