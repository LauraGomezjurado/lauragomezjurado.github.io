#!/usr/bin/env bash
# repaint.sh — re-render every plate the site uses, on the current paper.
#
# Paper comes from src/design-tokens.json via render.mjs, so this script never
# names a colour. Run it after changing the paper or the grain.
#
# Sizes are the placement, not a guess: the hero is full-bleed so it needs real
# pixels; the research spreads sit at ~46% of a 1440 column, so 1600 wide is
# already 2x. --bleed drops the plate chrome for anything shown large.
#
# Renders are 1-4 min each and are NOT byte-reproducible (p5.brush carries its
# own randomness beyond p5's seed). Judge by eye; don't diff the PNGs.
set -u
cd "$(dirname "$0")/../.."
R="node scripts/paint/render.mjs"
ART=public/images/art

shot () { # sketch  out  size  seed  extra...
  local sketch=$1 out=$2 size=$3 seed=$4; shift 4
  echo "── $out"
  $R "sketches/$sketch.js" --size "$size" --seed "$seed" --out "$ART/$out.png" "$@" || echo "   FAILED: $out"
}

# Hero: no --bleed. The composition deliberately keeps its left third open for
# the name, and bleeding would fill it.
shot attractor-plate-wet   hero-attractor      2400x1500 7

# Research spreads: bleed, so the drawing fills its half of the spread.
shot plate-norm-balls      spread-norm-balls   1600x1100 4  --bleed
shot plate-loss-basin      spread-loss-basin   1600x1100 2  --bleed
shot plate-search-tree     spread-search-tree  1600x1100 5  --bleed
shot plate-spectrum        spread-spectrum     1600x1100 3  --bleed
shot plate-latent-chain    spread-latent-chain 1600x1100 6  --bleed
shot plate-task-arithmetic spread-task-arith   1600x1100 8  --bleed
shot plate-hidden-objectives spread-hidden-obj 1600x1100 9  --bleed

echo
echo "done. convert to webp with:"
echo "  for f in $ART/*.png; do cwebp -q 88 \"\$f\" -o \"\${f%.png}.webp\"; done"
