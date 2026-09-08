# SOMA Breath London — waitlist landing page

A single-file landing page for SOMA Breath's 2026 London sessions, with a working email
waitlist. Built 2026-09-08 from client copy in a Google Doc.

**Live:** <https://claude.ai/code/artifact/5ec9b2b5-0b02-424e-bea6-d5c7286a55ac>

## Layout of this repo

| Path | What it is |
| --- | --- |
| `index.html` | The whole page — HTML, CSS, JS and the logo SVG, no build step |
| `vercel.json` | Vercel config: clean URLs, security headers |
| `tools/build-artifact.py` | Generates the SVG-free Claude Artifact variant |
| `build/artifact.html` | Generated — do not edit by hand |
| `.vercelignore` | Keeps the working notes out of the deployed bundle |
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


## Deploying

Static site, no build step. Vercel serves the repo root, so `index.html` sits at the top
level; `.vercelignore` keeps the README, source copy and brand notes out of the deployed
bundle. Do not set `outputDirectory` — a stale value is stored server-side on the project
and will 404 the root even after you remove it from `vercel.json`. If that happens, delete
the local `.vercel/` directory and deploy again to get a clean project.

`index.html` is a complete standalone document — doctype, `<head>`, `<body>`, and its own
CSS baseline (`body { margin: 0 }` and friends). The artifact runtime used to supply that
wrapper; a self-hosted copy needs its own, or the page renders in quirks mode with a stray
body margin that breaks the full-bleed hero. If you ever republish this file as an artifact,
strip the shell back out — the artifact tool adds its own.

```bash
npx vercel login      # one-time, opens a browser
npx vercel --prod     # deploy
```

Custom domain `somabreath.houseifjung.org`:

1. In the Vercel project, Settings → Domains → add `somabreath.houseifjung.org`.
2. At whoever runs DNS for `houseifjung.org`, add a CNAME record:
   `somabreath` → `cname.vercel-dns.com`
3. TLS is issued automatically once the record resolves.


## The Claude Artifact variant

<https://claude.ai/code/artifact/5ec9b2b5-0b02-424e-bea6-d5c7286a55ac>

Claude Artifacts **cannot be shared publicly if the page embeds an SVG** — the format can
carry script, so it fails automated review with "embeds a file type that can't be reviewed
for public sharing". The hosted site keeps the real vector logo; the artifact gets a
generated variant with an Archivo Black wordmark instead.

```bash
python3 tools/build-artifact.py    # index.html -> build/artifact.html
```

The script also strips our `<head>`/`<body>` shell, which the artifact runtime supplies
itself. It refuses to write the file if any `<svg>` survives. Re-run it after changing
`index.html`, then republish to the artifact URL above.

Carousel arrows are CSS chevrons rather than SVG icons for the same reason.
