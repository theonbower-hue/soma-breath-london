# SOMA Breath London — waitlist landing page

A single-file landing page for SOMA Breath's 2026 London sessions, with a working email
waitlist. Built 2026-09-08 from client copy in a Google Doc.

**Live:** <https://claude.ai/code/artifact/5ec9b2b5-0b02-424e-bea6-d5c7286a55ac>

## Layout of this repo

| Path | What it is |
| --- | --- |
| `index.html` | The whole page — HTML, CSS, JS and the logo SVG, no build step |
| `assets/soma-logo.svg` | Official logo as downloaded, before inlining |
| `content/source-copy.md` | The original client copy from the Google Doc |
| `docs/brand.md` | Brand tokens read off somabreath.com, and where each came from |

`index.html` is self-contained: open it in a browser and it renders. The only network
request is the Google Fonts stylesheet.

## Page structure

Masthead → full-bleed hero with sign-up → What is SOMA Breath → the 8-step Awakening
Ceremony as a carousel → two Q&As → benefits split "In the body" / "In the mind" → second
sign-up → Cambridge quote → footer.

## The waitlist

**The forms do not capture addresses.** On 2026-09-08 the data store was removed so the
artifact could be shared publicly — an artifact that declares a store is organisation-internal
and cannot be made public. The store was empty at the time, so no sign-ups were lost.

Both forms now validate the address and then say plainly that sign-ups are not being
collected yet, rather than appearing to succeed.

To capture real addresses, host `index.html` yourself and drop in an ESP embed (Mailchimp,
ConvertKit). This cannot be done inside an artifact: the sandbox blocks all outbound network
requests, so a third-party form endpoint will never fire. The earlier working version used
the artifact document store at `waitlist/<sanitised email>`, which is available in this
repo's git history.

## Known constraints and open items

- **Email capture is not wired up** — see "The waitlist" above. This is the main thing
  standing between this page and a real launch.
- **Hero photo not embedded.** `--hero-image` in the `.hero` rule is a violet gradient
  standing in for a studio photograph. Replace that one declaration with
  `url("data:image/jpeg;base64,…")`. The overlay, `background-position: center 58%` and the
  light type colours are already tuned for a warm-toned room shot.
- **Privacy policy links point at `#privacy`** in three places — needs the real URL.
- **Cambridge and accreditation logos are missing.** The source doc called for them; the
  accreditation section was empty in the doc, so it was left out rather than invented. The
  Cambridge quote is present as text.
- The Cambridge quote is attributed to "Cambridge University research team" — the source doc
  gave no named attribution. Confirm before this goes public.

## Editing

Change `index.html`, then republish to the same artifact URL to keep the link stable. Ask
Claude to publish with that URL, or from a fresh conversation pass it explicitly — publishing
without it creates a second, separate artifact.
