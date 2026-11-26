import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TAGLINE } from "@/ui/salinan";
import "./globals.css";

export const metadata: Metadata = {
  title: TAGLINE,
  description:
    "Tempel teks lowongan kerja yang kamu terima, lalu lihat tanda bahayanya sebelum kamu membayar atau mengirim data pribadi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
