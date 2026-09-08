# SOMA Breath brand reference

Extracted from the live site on 2026-09-08 by reading computed styles on
<https://www.somabreath.com/about-niraj-soma-breath/> — not guessed, not from a style guide.
Re-check these if the site is redesigned.

## Colour

| Role | Value | Where it came from |
| --- | --- | --- |
| Brand violet | `#6C56E6` | Every primary CTA background, link colour |
| White ground | `#FFFFFF` | Page background |
| Violet tint | `#F7F6FF` | Panel / section background |
| Alt grey | `#F9F9F9` | Secondary panel |
| Heading ink | `#232323` | `h1` colour |
| Body ink | `#111111` / `#000000` | Body copy |
| Secondary button | `#000000` bg, white text | "Login" button |

## Type

- **Display:** `Archivo Black` 400 — headings only. Sentence case, letter-spacing `-1.38px`
  at 50px (≈ `-0.028em`), which is why this page uses `-0.032em` on large sizes.
- **Body:** `Inter` 300–700, base size 20px on the site (this page uses 19px).
- Both load from one Google Fonts request; the site uses the identical URL.

## Components

- Buttons and inputs are **fully pilled** — `border-radius: 50px`, never a small radius.
- Primary button: violet fill, white text, bold, sentence case (not uppercase).
- Logo: `soma-breath®-logo-c08255.svg`, 178×60, single colour `#010101`.

## Deviations made for this page

- A **dark theme** was added. The site is light-only, so the dark palette is an extension:
  violet lifts to `#907CFF` for contrast on a dark ground, ground drops to `#0D0B1A`.
- Body size 19px rather than 20px, for a denser reading column.
- The logo's hardcoded `#010101` became `currentColor`, and the knockout stripes through
  the "O" became `var(--ground)`, so the mark works on both themes.
