"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Grup kartu dengan sorotan yang mengikuti kursor (efek "spotlight" ala
 * Open React Template). Hanya mengisi variabel CSS --sorot-x/--sorot-y di
 * tiap kartu; gayanya ada di globals.css (.kartu-sorot). Tanpa kursor (HP),
 * tidak ada yang berubah.
 */
export function Sorotan({ className, children }: { className?: string; children: ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null);

  function gerak(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !wadah.current) return;
    for (const kartu of wadah.current.querySelectorAll<HTMLElement>(".kartu-sorot")) {
      const kotak = kartu.getBoundingClientRect();
      kartu.style.setProperty("--sorot-x", `${e.clientX - kotak.left}px`);
      kartu.style.setProperty("--sorot-y", `${e.clientY - kotak.top}px`);
    }
  }

  return (
    <div ref={wadah} className={className} onPointerMove={gerak}>
      {children}
    </div>
  );
}
