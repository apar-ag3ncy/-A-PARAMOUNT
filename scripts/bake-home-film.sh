#!/usr/bin/env bash
# Bake the home intro film (HomeFilm) from the client's graded master into the
# WebP frame sequence the canvas scrubs: public/door/seq/{1600,800}/f-###.webp.
#
# WHY frames and not a <video>: seeking video.currentTime has resolution-dependent
# decode latency and coalesces under continuous input, so slow scrolling reads as
# laggy. A pre-decoded frame drawn in one drawImage per rAF is frame-perfect at any
# scroll speed. See CLAUDE.md ("bake frames, don't re-animate live") and the header
# comment in src/components/sections/HomeFilm.tsx. Do NOT reintroduce video scrubbing.
#
# The bake is UNIFORM: 200 frames evenly across the master, ~20fps throughout. An
# earlier bake chained the master's door act (20fps) to two AI-generated extensions
# for the walk-in and ceiling baked at 7.5fps; that 2.7x drop in temporal density is
# what made the interior read as steppy under a slow scrub. Uniform sampling keeps
# the per-frame motion delta constant, so the whole film scrubs at one weight.
#
# FRAME_COUNT in HomeFilm.tsx MUST match COUNT here, and the PACE control points are
# expressed as fractions of this sequence — retime them if the master's act
# boundaries move (currently doors 0-2.5s, walk-in 2.5-7.0s, ceiling 7.0-end).
#
# ffmpeg is not preinstalled on macOS; fetch a static build (e.g. evermeet.cx) and
# point FFMPEG at it.
set -euo pipefail

MASTER="${MASTER:-assets/door/final-1-120fps-master.mp4}"
OUT="${OUT:-public/door/seq}"
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
COUNT="${COUNT:-200}"
QUALITY="${QUALITY:-82}"

[ -f "$MASTER" ] || { echo "master not found: $MASTER" >&2; exit 1; }

DUR=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$MASTER")
FPS=$(awk -v c="$COUNT" -v d="$DUR" 'BEGIN{printf "%.6f", c/d}')
echo "master   : $MASTER"
echo "duration : ${DUR}s -> $COUNT frames @ ${FPS}fps"

for TIER in 1200 800; do
  DIR="$OUT/$TIER"
  rm -rf "$DIR"; mkdir -p "$DIR"
  echo "baking $TIER ..."
  # -start_number 0 so names are f-000..f-(COUNT-1); lanczos keeps the marble
  # carving crisp on the downscale. Frame COUNT, not webp quality, drives the
  # download for this detail-dense scene: trim frames rather than lower quality.
  "$FFMPEG" -v error -y -i "$MASTER" \
    -vf "fps=${FPS},scale=${TIER}:-2:flags=lanczos" \
    -c:v libwebp -quality "$QUALITY" -compression_level 6 \
    -start_number 0 "$DIR/f-%03d.webp"

  N=$(find "$DIR" -name 'f-*.webp' | wc -l | tr -d ' ')
  # The fps filter can land one frame over/under; drop any tail past COUNT so the
  # sequence is exactly 0..COUNT-1 with no gap for nearest() to paper over.
  if [ "$N" -gt "$COUNT" ]; then
    for ((i=COUNT; i<N; i++)); do rm -f "$(printf "%s/f-%03d.webp" "$DIR" "$i")"; done
    N="$COUNT"
  fi
  [ "$N" -eq "$COUNT" ] || { echo "  ERROR: got $N frames, expected $COUNT" >&2; exit 1; }
  echo "  $N frames, $(du -sh "$DIR" | cut -f1)"
done

# Posters: first frame (closed doors) covers first paint until frame 0 decodes;
# last frame (settled ceiling) is the reduced-motion backdrop the brand resolves on.
"$FFMPEG" -v error -y -i "$MASTER" -vf "select=eq(n\,0),scale=1200:-2:flags=lanczos" \
  -frames:v 1 -q:v 4 public/door/door-open-poster.jpg
"$FFMPEG" -v error -y -sseof -0.1 -i "$MASTER" -vf "scale=1200:-2:flags=lanczos" \
  -frames:v 1 -q:v 4 -update 1 public/door/ceiling-poster.jpg
echo "posters regenerated"
echo "done — keep FRAME_COUNT=$COUNT in src/components/sections/HomeFilm.tsx in sync"
