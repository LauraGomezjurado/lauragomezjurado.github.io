#!/usr/bin/env bash
# render-queue-b.sh — a second serial queue, for jobs that need --data.
#
# Separate file rather than a flag on render-queue.sh, because that one is often
# already running and a bash script must not be edited mid-run.
#
# Same rule as its sibling: strictly one render at a time. Concurrent
# SwiftShader renders are slower than sequential ones.
#
# Do not chain these with a wrapper that waits on `pgrep -f render-queue` - the
# wrapper's own command line contains that string, so it matches itself and
# waits forever. Put every job in one JOBS array instead.
set -u
cd "$(dirname "$0")/../.."

# sketch : out-dir/name : size : seed : data-file-or-"-" : extra flags
JOBS=(
  "mark-stratum:marks/year-2026:460x330:3:scripts/paint/data/year-2026.json:--transparent"
  "mark-stratum:marks/year-2025:460x260:5:scripts/paint/data/year-2025.json:--transparent"
  "mark-stratum:marks/year-2024:460x230:7:scripts/paint/data/year-2024.json:--transparent"
  "mark-stratum:marks/year-2023:460x230:9:scripts/paint/data/year-2023.json:--transparent"
)

for job in "${JOBS[@]}"; do
  IFS=: read -r sketch out size seed data flags <<< "$job"
  echo "── $out"
  args=(--size "$size" --seed "$seed" --out "public/images/$out.png")
  [ "$data" != "-" ] && args+=(--data "$data")
  if node scripts/paint/render.mjs "sketches/$sketch.js" "${args[@]}" $flags; then
    if [[ "$flags" == *--transparent* ]]; then
      cwebp -q 88 -alpha_q 100 -quiet "public/images/$out.png" -o "public/images/$out.webp"
    else
      cwebp -q 88 -quiet "public/images/$out.png" -o "public/images/$out.webp"
    fi
    echo "   -> public/images/$out.webp"
  else
    echo "   FAILED: $out"
  fi
done
echo "QUEUE B DONE"
