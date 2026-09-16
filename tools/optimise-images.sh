#!/usr/bin/env bash
# Regenerate the web images from the masters in assets/photos/.
#
# Masters stay untouched (and out of the deploy, via .vercelignore). The web
# copies are graded dark, cool and mostly desaturated so the page reads
# underground rather than wellness, then saved as WebP. Desaturated, darkened
# images also compress far smaller than the bright originals.
#
# Run from the repo root: bash tools/optimise-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=assets/photos
OUT=img
mkdir -p "$OUT"

# grade <in> <out> <width> <brightness%> <saturation%> [crop]
grade() {
  local in=$1 out=$2 width=$3 bright=$4 sat=$5 crop=${6:-}
  magick "$in" ${crop:+-crop "$crop" +repage} \
    -resize "${width}x" \
    -modulate "$bright,$sat,100" \
    -fill '#1a1238' -colorize 14% \
    -strip "$OUT/tmp.png"
  cwebp -quiet -q 58 -m 6 -sharp_yuv "$OUT/tmp.png" -o "$out"
  rm "$OUT/tmp.png"
}

# Hero: sits under a dark veil, so it can be graded hard.
grade "$SRC/hero.jpg" "$OUT/hero-1600.webp" 1600 62 22
grade "$SRC/hero.jpg" "$OUT/hero-1000.webp" 1000 62 22
# Portrait crop for phones, centred on the facilitator.
grade "$SRC/hero.jpg" "$OUT/hero-portrait.webp" 720 62 22 "1012x1350+520+0"

# Section photographs: shown bare, so a lighter grade.
for name in community session; do
  grade "$SRC/$name.jpg" "$OUT/$name-1200.webp" 1200 82 45
  grade "$SRC/$name.jpg" "$OUT/$name-700.webp" 700 82 45
done

ls -l "$OUT"
