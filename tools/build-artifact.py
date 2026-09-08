#!/usr/bin/env python3
"""Generate build/artifact.html from index.html.

Two differences from the hosted site, both required by the Artifact platform:

1. No inline SVG. Claude Artifacts cannot be shared publicly if the page embeds
   an SVG — the format can carry script, so it fails automated review. The logo
   falls back to an Archivo Black wordmark, which is the brand's own display face.
2. No document shell. The Artifact runtime supplies its own doctype, <head> and
   <body>, so this strips ours to avoid nesting two documents.

Run: python3 tools/build-artifact.py
"""

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")

# 1. drop our document shell — the artifact runtime adds its own
body = re.search(r"<body>\n(.*)\n</body>", src, re.S)
head = re.search(r"<head>\n(.*)\n</head>", src, re.S)
if not body or not head:
    raise SystemExit("index.html is missing its <head>/<body> shell")

head_inner = head.group(1)
# keep the title, font links and <style>; drop the meta the runtime owns
head_inner = re.sub(r'^<meta charset[^>]*>\n', "", head_inner)
head_inner = re.sub(r'^<meta name="viewport"[^>]*>\n', "", head_inner)
head_inner = re.sub(r'^<meta (name|property)="(description|theme-color|og:[^"]+|twitter:[^"]+)"[^>]*>\n',
                    "", head_inner, flags=re.M)
# the runtime's own reset already covers these
head_inner = re.sub(r"  /\* Baseline the artifact runtime.*?\[hidden\] \{ display: none !important; \}\n",
                    "", head_inner, flags=re.S)

# 2. swap the inline SVG logo for a text wordmark
markup = re.sub(
    r'<a class="wordmark"[^>]*>.*?</a>',
    '<a class="wordmark-text" href="https://www.somabreath.com/">SOMA BREATH<sup>&reg;</sup></a>',
    body.group(1),
    flags=re.S,
)

out = head_inner.rstrip() + "\n\n" + markup.strip() + "\n"

if "<svg" in out:
    raise SystemExit("build still contains an <svg> — public sharing would be refused")

dest = ROOT / "build" / "artifact.html"
dest.write_text(out, encoding="utf-8")
print(f"wrote {dest.relative_to(ROOT)} ({len(out):,} bytes, 0 svg)")
