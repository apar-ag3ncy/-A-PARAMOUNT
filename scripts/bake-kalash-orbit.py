#!/usr/bin/env python3
"""Bake a 360-degree turntable film into viewer frames.

Pipeline: decode mp4 -> find the frame that closes the 360 loop (best match
against frame 0 in the tail) -> score camera drift (background patches must
stay still) -> resample N frames evenly across the revolution -> center-crop,
resize, encode WebP tiers -> emit a contact sheet + metrics JSON.
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image
import imageio_ffmpeg

def read_frames(path):
    """All frames as uint8 RGB arrays via the bundled ffmpeg."""
    gen = imageio_ffmpeg.read_frames(path, pix_fmt="rgb24")
    meta = next(gen)
    w, h = meta["size"]
    frames = [np.frombuffer(b, dtype=np.uint8).reshape(h, w, 3).copy() for b in gen]
    return frames, meta

def small_gray(fr, size=96):
    im = Image.fromarray(fr).convert("L").resize((size, size), Image.BILINEAR)
    return np.asarray(im, dtype=np.float32)

def main(mp4, outdir, n_frames=96, tiers=(1024, 640), q=82):
    os.makedirs(outdir, exist_ok=True)
    frames, meta = read_frames(mp4)
    fps = meta["fps"]
    print(f"decoded {len(frames)} frames @ {fps:.2f}fps  size={meta['size']}")

    gs = [small_gray(f) for f in frames]
    ref = gs[0]

    # --- loop closure: best match to frame 0 in the last 40% of the clip ---
    lo = int(len(frames) * 0.6)
    diffs = [(i, float(np.mean(np.abs(gs[i] - ref)))) for i in range(lo, len(frames))]
    i_end, d_end = min(diffs, key=lambda t: t[1])
    # baseline: how different is a mid-rotation frame from frame 0?
    d_mid = float(np.mean(np.abs(gs[len(frames) // 2] - ref)))
    print(f"loop closes at frame {i_end}/{len(frames)}  (residual {d_end:.2f} vs mid-spin {d_mid:.2f})")

    # --- camera drift: corner patches (background silk) should not move ---
    H, W = gs[0].shape
    p = 20
    def corners(g):
        return np.stack([g[:p, :p], g[:p, -p:], g[-p:, :p], g[-p:, -p:]])
    drift = max(
        float(np.mean(np.abs(corners(gs[i]) - corners(ref))))
        for i in range(0, i_end, max(1, i_end // 24))
    )
    print(f"max corner drift over the loop: {drift:.2f} (static camera => small)")

    # --- resample N frames at EQUAL ROTATION increments over [0, i_end) ---
    # The model eases the spin in/out (~2.6x speed variation), so equal-index
    # sampling would cluster angles near the seam. Consecutive-frame motion is
    # a monotone proxy for angular speed; picking indices at equal cumulative-
    # motion increments linearises the rotation, so 1 baked frame = 3.75 deg
    # everywhere and the drag feels constant-speed.
    d = [float(np.mean(np.abs(gs[i + 1] - gs[i]))) for i in range(i_end)]
    cum = np.concatenate([[0.0], np.cumsum(d)])
    total = cum[-1]
    idx = [int(np.searchsorted(cum, k * total / n_frames)) for k in range(n_frames)]
    idx = [min(i, i_end - 1) for i in idx]

    # --- encode tiers ---
    src_w, src_h = meta["size"]
    side = min(src_w, src_h)
    x0, y0 = (src_w - side) // 2, (src_h - side) // 2
    sizes = {}
    for tier in tiers:
        tdir = os.path.join(outdir, str(tier))
        os.makedirs(tdir, exist_ok=True)
        total = 0
        for k, i in enumerate(idx):
            im = Image.fromarray(frames[i]).crop((x0, y0, x0 + side, y0 + side))
            im = im.resize((tier, tier), Image.LANCZOS)
            fp = os.path.join(tdir, f"f-{k:03d}.webp")
            im.save(fp, "WEBP", quality=q, method=6)
            total += os.path.getsize(fp)
        sizes[tier] = total
        print(f"tier {tier}: {n_frames} frames, {total/1e6:.2f} MB total, avg {total/n_frames/1024:.0f} KB")

    # --- contact sheet: every 8th frame for eyeballing ---
    cols, thumb = 6, 320
    picks = idx[:: max(1, len(idx) // 12)][:12]
    rows = math.ceil(len(picks) / cols)
    sheet = Image.new("RGB", (cols * thumb, rows * thumb), (250, 246, 233))
    for k, i in enumerate(picks):
        im = Image.fromarray(frames[i]).crop((x0, y0, x0 + side, y0 + side)).resize((thumb, thumb), Image.BILINEAR)
        sheet.paste(im, ((k % cols) * thumb, (k // cols) * thumb))
    sheet.save(os.path.join(outdir, "contact.png"))

    json.dump(
        {"frames": n_frames, "fps": fps, "decoded": len(frames), "loop_end": i_end,
         "loop_residual": d_end, "mid_residual": d_mid, "corner_drift": drift,
         "tier_bytes": sizes},
        open(os.path.join(outdir, "metrics.json"), "w"), indent=1)
    print("metrics ->", os.path.join(outdir, "metrics.json"))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], n_frames=int(sys.argv[3]) if len(sys.argv) > 3 else 96)
