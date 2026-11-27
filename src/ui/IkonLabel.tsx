import type { Label } from "@/cek/tipe";

/**
 * Ikon Label sebagai SVG yang mengikuti `currentColor`. Emoji (ℹ ⚠ ⛔) tidak
 * bisa diwarnai dan bentuknya berbeda di tiap merek HP, jadi bentuknya
 * dibedakan di sini: lingkaran (Risiko rendah), segitiga (Waspada), segi
 * delapan (Bahaya). Bentuk + warna + kata, supaya terbaca buta warna.
 * Dekoratif: kata Label di sebelahnya yang dibacakan pembaca layar.
 */
export function IkonLabel({ label }: { label: Label }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {label === "risiko_rendah" && (
        <>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
        </>
      )}
      {label === "waspada" && (
        <>
          <path
            d="M12 2.8 22 20.5H2L12 2.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 9.5v5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="12" cy="17.4" r="1.3" fill="currentColor" />
        </>
      )}
      {label === "bahaya" && (
        <>
          <path
            d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path d="M7.5 12h9" stroke="var(--warna-bahaya-latar)" strokeWidth="2.75" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
