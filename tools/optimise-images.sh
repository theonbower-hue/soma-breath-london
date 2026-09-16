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

# grade <in> <out> <width> <brightness%> <saturation%> [crop] [tint%]
grade() {
  local in=$1 out=$2 width=$3 bright=$4 sat=$5 crop=${6:-} tint=${7:-14}
  magick "$in" ${crop:+-crop "$crop" +repage} \
    -resize "${width}x" \
    -modulate "$bright,$sat,100" \
    -fill '#1a1238' -colorize "$tint%" \
    -strip "$OUT/tmp.png"
  cwebp -quiet -q 58 -m 6 -sharp_yuv "$OUT/tmp.png" -o "$out"
  rm "$OUT/tmp.png"
}

# Hero: the generated fabric rave image. Already dark and moody, so only a light
# grade that keeps its green and amber; the page's veil does the rest.
# The master is 1536x1024, so the wide version is not upscaled.
grade "$SRC/fabric-rave.png" "$OUT/hero-1536.webp" 1536 85 90 "" 6
grade "$SRC/fabric-rave.png" "$OUT/hero-1000.webp" 1000 85 90 "" 6
# Portrait crop for phones, centred on the DJ booth.
grade "$SRC/fabric-rave.png" "$OUT/hero-portrait.webp" 720 85 90 "768x1024+436+0" 6

# The generated breathwork image at fabric: same light grade as the hero.
grade "$SRC/fabric-breathwork.png" "$OUT/breathwork-1200.webp" 1200 88 90 "" 6
grade "$SRC/fabric-breathwork.png" "$OUT/breathwork-700.webp" 700 88 90 "" 6

# SOMA's own community photograph: shown bare, so a lighter version of the dark grade.
grade "$SRC/community.jpg" "$OUT/community-1200.webp" 1200 82 45
grade "$SRC/community.jpg" "$OUT/community-700.webp" 700 82 45

# The breath rave poster: a finished design, so no grade. Its film grain compresses
# poorly, so it is sized for its on-page width (max ~26rem) at 1x and 2x.
for width in 840 560; do
  magick "$SRC/breath-rave-poster.jpg" -resize "${width}x" -strip "$OUT/tmp.png"
  cwebp -quiet -q 55 -m 6 "$OUT/tmp.png" -o "$OUT/poster-$width.webp"
  rm "$OUT/tmp.png"
done

ls -l "$OUT"
