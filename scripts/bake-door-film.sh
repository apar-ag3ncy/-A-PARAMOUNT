#!/usr/bin/env bash
# Bake the intro film into the scroll-scrubbed WebP frame sequence.
#
# The home intro (HomeFilm) does NOT play a <video> — it draws pre-decoded WebP
# frames on a canvas, one per scroll position. Seeking a <video> has decode
# latency that coalesces under continuous input, so slow scrolling read as
# laggy; a pre-decoded frame draw is frame-perfect at any scroll speed. See
# CLAUDE.md ("bake frames, don't re-animate live").
#
# The film is TWO sources, and they are sampled straight to frames rather than
# concatenated as video — a concat would re-encode (and soften) the client's
# master for no reason. Sampling both at the SAME fps and numbering the frames
# consecutively makes the join invisible:
#
#   BODY : the client's own graded master, kept verbatim from 0 to CUT seconds
#          (doors + walk-in). Never regenerate this — it is real client footage.
#   TAIL : the generated ceiling crane, which continues from the master's frame
#          at CUT and lands flat-on on the real ceiling photograph. It exists
#          because the master's own ending craned into a dark, angled, all-gold
#          ceiling that is not the temple's actual ceiling.
#
# Usage:  scripts/bake-door-film.sh <body.mp4> <tail.mp4> [CUT_SECONDS] [FPS]
set -euo pipefail

BODY="${1:?usage: bake-door-film.sh <body.mp4> <tail.mp4> [cut_seconds] [fps]}"
TAIL="${2:?need the tail clip}"
CUT="${3:-7.0}"
FPS="${4:-16}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/door/seq"
FF="${FFMPEG:-ffmpeg}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "body : $BODY  (0 → ${CUT}s)"
echo "tail : $TAIL"
echo "fps  : $FPS"

for TIER in 1600 800; do
  # q82 for the phone tier, q88 for desktop — the desktop tier carries the
  # carving detail the client judges "crisp".
  Q=88; [ "$TIER" = "800" ] && Q=82
  W="$TMP/$TIER"; rm -rf "$W"; mkdir -p "$W"

  # BODY frames. -ss AFTER -i so the cut is frame-accurate on the 60fps master.
  "$FF" -loglevel error -i "$BODY" -t "$CUT" \
    -vf "fps=${FPS},scale=${TIER}:-2:flags=lanczos" \
    -c:v libwebp -quality "$Q" -compression_level 6 \
    -start_number 0 "$W/b-%04d.webp" -y
  NB=$(ls "$W"/b-*.webp | wc -l | tr -d ' ')

  # TAIL frames. Its first frame IS the body's last frame (it was generated from
  # it), so drop one to avoid a duplicated, stalled frame at the join.
  "$FF" -loglevel error -i "$TAIL" \
    -vf "fps=${FPS},scale=${TIER}:-2:flags=lanczos" \
    -c:v libwebp -quality "$Q" -compression_level 6 \
    -start_number 0 "$W/t-%04d.webp" -y
  rm -f "$W/t-0000.webp"

  # Renumber both runs into ONE consecutive sequence.
  DIR="$OUT/$TIER"; rm -rf "$DIR"; mkdir -p "$DIR"
  i=0
  for f in $(ls "$W"/b-*.webp | sort) $(ls "$W"/t-*.webp | sort); do
    cp "$f" "$(printf '%s/f-%03d.webp' "$DIR" "$i")"
    i=$((i + 1))
  done

  MB=$(du -sm "$DIR" | awk '{print $1}')
  KB=$(du -sk "$DIR" | awk -v n="$i" '{printf "%.0f", $1/n}')
  echo "tier ${TIER}w: ${i} frames (${NB} body + $((i - NB)) tail) · ${MB} MB · ~${KB} KB/frame (q${Q})"
  FINAL=$i
done

echo
echo "TOTAL: $(du -sm "$OUT" | awk '{print $1}') MB"
echo "SET FRAME_COUNT = ${FINAL} in src/components/sections/HomeFilm.tsx"
