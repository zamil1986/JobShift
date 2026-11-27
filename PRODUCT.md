# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Indonesian job seekers aged 17–30 who receive job offers through private messages, WhatsApp job groups, and social media (TikTok, Instagram), outside job portals. They are usually on a cheap Android phone around 360 px wide, often on mobile data, and they open JobShift right after getting an offer, before they pay a fee or send personal data. Their job is simple: paste the posting and know within seconds whether it is risky, and why.

The PRD's personas are fictional, built from documented scam patterns, and not yet confirmed through interviews:

- Rina, 19, SMK graduate: fake local jobs asking for uniform or medical fees.
- Bu Sari, 38: "task" jobs with level-up deposits. She has weak eyesight, needs large type, and wants results she can have read aloud.
- Andi, 24, prospective migrant worker: fake overseas jobs and trafficking risk.
- Pak Hendra, SMK guidance counsellor (secondary audience): demos the tool on a classroom projector.

Competition judges also evaluate the product. They are a secondary audience, not the primary one.

## Product Purpose

JobShift lets a job seeker paste the text of a posting and get a risk Label (Risiko rendah / Waspada / Bahaya) in under 5 seconds, with no account. The Label comes with the reasons: the exact sentences that triggered it, and the important information the posting leaves out. Every result points to safe next steps and official channels.

Success means the user does not transfer money or send data to a scammer, and understands the warning well enough to recognise the same pattern next time. The anti-goals are failure even if the app runs:

- the user feels "safe" about a fake posting;
- a real company is labelled a scammer without explanation;
- personal data is stored on the server.

## Positioning

JobShift sits **before** the transfer. Job portals verify only postings on their own platforms, and reporting channels (IASC, aduankonten.id) act **after** the loss. JobShift checks any pasted text, from anywhere, at the moment of decision.

It points at the exact triggering sentence in the user's own text instead of returning an opaque score. Explainable rules run first, and AI can only add warnings, never remove them (ADR-0001).

## Operating Context

The scene is a phone, a chat app, and a forwarded posting. The user copies the message, opens JobShift, pastes, and taps Cek. Secondary scenes:

- a guidance counsellor projecting the tool in a classroom;
- a judge trying the built-in examples.

## Capabilities and Constraints

- **Input:** pasted text of 50–3,000 characters, with a counter. Screenshot upload with in-browser OCR and ready-made example buttons are planned (tickets 09 and 12).
- **Engine:** a rule engine with at least 15 rules, a Skor of 0–100, and three Labels. Critical rules force Bahaya. Three Modus: Tugas, Lokal, Luar negeri.
- **AI layer:** an optional Groq layer that only adds warnings, with a 3.5-second timeout. Text is masked (phone numbers, account numbers, NIK, email) before it is sent to the AI.
- **Results:** the triggering quote is highlighted in the original text. Implied warnings (Tanda bahaya tersirat) are listed separately. Next steps and emergency steps link to official domains.
- **Banned words:** generated result text never uses "aman", "asli", "legit", or "terpercaya". The brand tagline and official domains are the only exceptions.
- **Fixed Risiko rendah warning**, which must be visible without scrolling: "Tidak ditemukan tanda bahaya, tapi ini bukan jaminan. Jangan transfer uang apa pun sebelum resmi diterima kerja."
- **Stack and performance:**
  - Next.js 16 App Router with global CSS.
  - No fonts or assets from third-party CDNs.
  - Pages must work over mobile data.
  - p95 response under 5 seconds.
- **Privacy:** the pasted text is not stored.
- **Undecided:** evaluation numbers (recall, false positive rate) do not exist yet. They come from the test set at milestone M3 and must not be shown before then.

## Brand Commitments

- Name: JobShift.
- Tagline, always shown with the name on the check and result pages: "JobShift — cek dulu sebelum transfer."
- Language: plain Indonesian for lay readers, with no technical terms such as "skor model" or rule IDs (NFR-08).
- Tone: a calm, clear checking aid, not an app that frightens people.
- Visual reference pinned by the user on 2026-11-27: the look of the Cruip Open React Template ("seperti ini lohh", with a screenshot). That means a dark navy ground, indigo accents and glow, a gradient headline, a floating rounded header, card sections, and a glowing CTA panel. It sets the look and the craft bar. The template's content (testimonials, brand logos, product video) is not product truth and must not be copied or invented.

## Evidence on Hand

Real statistics with sources, from PRD.md:

- IASC recorded 26,910 job-scam reports up to around 31 May 2026 (Katadata).
- 80% of scam victims report only 12 hours after the incident (Kontan, 17 Nov 2026).
- Komdigi and BP2MI blocked 7,908 fake overseas job ads between January and August 2026 (Katadata).

Real official channels:

- IASC: https://iasc.ojk.go.id/
- Kontak OJK: 157
- Karirhub Kemnaker
- aduankonten.id
- KP2MI legality check: https://migran-aman.kp2mi.go.id/cek-legalitas
- KP2MI complaints: 0800-1000, WA 0811-8080-141

Absent, and must not be fabricated:

- testimonials
- user counts
- partner or institution logos
- accuracy figures (until M3)
- press mentions

## Product Principles

1. Act before the money moves: every surface serves the moment before the transfer.
2. Show the reason, not just the verdict: point at the user's own sentence.
3. Never imply safety: a low-risk result is "no warning found", never a guarantee.
4. Respect the phone in the user's hand: fast on mobile data, readable at 360 px, no account.
5. Hand off to official channels: JobShift does not replace IASC, OJK, or KP2MI.

## Accessibility & Inclusion

WCAG 2.1 AA (NFR-06):

- text contrast ≥ 4.5:1;
- body text ≥ 16 px;
- touch targets ≥ 44 × 44 px;
- honour `prefers-reduced-motion`.

Also required:

- the whole flow is keyboard-operable;
- results are announced through `aria-live`, and focus moves to the result heading;
- Lighthouse Accessibility ≥ 95;
- works from 360 px wide, on Chrome Android, Safari iOS, and desktop Chrome and Firefox (NFR-07).
