# SOMA Breath London — waitlist landing page

A single-page waitlist site for the House of Jung × SOMA Breath breath rave at fabric London, January 2027. Sign-ups
go to a Brevo list through a server-side route. Built 2026-09-08 from client copy in a Google
Doc; Brevo and the dark redesign added 2026-09-16.

**Live:** <https://claude.ai/code/artifact/5ec9b2b5-0b02-424e-bea6-d5c7286a55ac>

## Layout of this repo

| Path | What it is |
| --- | --- |
| `index.html` | The whole page — HTML, CSS, JS and the logo SVG, no build step |
| `api/subscribe.js` | Vercel serverless function: validates a sign-up and adds it to Brevo |
| `img/` | Web images: graded, resized WebP generated from the masters |
| `assets/photos/` | Full-size master photographs (not deployed) |
| `tools/optimise-images.sh` | Regenerates `img/` from `assets/photos/` |
| `vercel.json` | Vercel config: clean URLs, security headers |
| `tools/build-artifact.py` | Generates the SVG-free Claude Artifact variant |
| `build/artifact.html` | Generated — do not edit by hand |
| `.vercelignore` | Keeps the working notes out of the deployed bundle |
| `assets/soma-logo.svg` | Official logo as downloaded, before inlining |
| `content/source-copy.md` | The original client copy from the Google Doc |
| `docs/brand.md` | Brand tokens read off somabreath.com, and where each came from |

`index.html` has no build step. Beyond its own images, the only third-party request is the
Google Fonts stylesheet.

## Page structure

Full-bleed hero (masthead, headline, sign-up) → What happens at a breath rave (with the
"no alcohol" callout) → What is SOMA Breath → the 8-step Awakening Ceremony as a carousel →
Who guides the sessions → benefits split "In the body" / "In the mind" → second sign-up →
footer.

## The waitlist

Both sign-up cards post JSON to `/api/subscribe` (`api/subscribe.js`), which calls
`POST https://api.brevo.com/v3/contacts` with the key from the environment. The browser never
sees the Brevo key.

- **Fields:** email only — marketing targets London as a whole, so no postcode is asked
  for. The address is validated in the page and again on the server.
- **Attribution:** `utm_source`, `utm_medium` and `utm_campaign` are read from the landing URL
  and kept in `sessionStorage` for the tab, then sent as `UTM_SOURCE`, `UTM_MEDIUM` and
  `UTM_CAMPAIGN`. Empty UTMs are left out, so a later untagged sign-up does not wipe the
  original source.
- **Existing contacts:** `updateEnabled: true`, and a `duplicate_parameter` response are both
  treated as success.
- **Spam:** a hidden `website` honeypot field. If it is filled in, the route returns success
  without calling Brevo.
- **Success:** the button shows a spinner, then both cards swap to an inline thank-you. If a
  Meta Pixel (`window.fbq`) is on the page, `fbq("track", "Lead")` fires once.
- **Errors:** the route returns `{ ok: false, error }` with `invalid_email`,
  `server_config`, `upstream_unreachable` or `upstream_error`. Details go to
  the Vercel function log; the page shows a plain-English message.

### Environment variables (Vercel → Settings → Environment Variables)

| Name | Value |
| --- | --- |
| `BREVO_API_KEY` | A Brevo API v3 key (Brevo → SMTP & API → API keys) |
| `BREVO_LIST_ID` | The numeric ID of the waitlist list (Brevo → Contacts → Lists) |

Redeploy after adding or changing them. In Brevo, create `UTM_SOURCE`, `UTM_MEDIUM`
and `UTM_CAMPAIGN` as **Text** contact attributes first, or the values have
nowhere to go.

## Known constraints and open items

- **No Meta Pixel is installed.** The Lead event is wired up but only fires once a pixel
  snippet is added to `<head>`.
- **Confirmed and on the page (2026-09-16):** the venue (fabric, London) and the month
  (January 2027). Exact dates, times and prices are not on the page yet.
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

Custom domain `somabreath.houseofjung.org`:

1. In the Vercel project, Settings → Domains → add `somabreath.houseofjung.org`.
2. At GoDaddy, which runs DNS for `houseofjung.org`, point the `somabreath` CNAME at the
   value Vercel shows (currently `b33b2c29773a12c2.vercel-dns-017.com`). Until 2026-09-16 this record pointed at
   `cname.sibpages.com` (a Brevo landing page); if the domain shows a Brevo page again,
   check that record and disconnect the domain from the Brevo landing page.
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

The script also inlines every local image as a base64 data URI, because artifacts cannot
fetch images over the network — `/hero.jpg` and friends would silently render nothing. It
scans for local image references and hard-fails if any survive, so adding a new photo needs
no change to the script. This is why the artifact build is ~520KB against the hosted page's
~45KB. The waitlist cannot work in the artifact: its sandbox blocks the call to
`/api/subscribe`, so the forms there show the "couldn't reach the server" message.

## Photographs

Masters live in `assets/photos/`; the page uses the WebP copies in `img/`. Run
`bash tools/optimise-images.sh` (needs ImageMagick and `cwebp`) after replacing a master.

`fabric-rave.png` — the hero. A generated image (not a photograph) of a House of Jung x
SOMA Breath rave at fabric, 1536x1024. It is shown as a band across the top of the hero with
only a light grade, because its "House of Jung x SOMA Breath" screen should stay readable.
There is a portrait crop centred on the DJ booth for phones: about 29KB on a phone and 67KB
on desktop.

`community.jpg` and `session.jpg` are client-supplied SOMA Breath photographs, graded dark
and desaturated. Both run without captions; the surrounding copy carries the context.
