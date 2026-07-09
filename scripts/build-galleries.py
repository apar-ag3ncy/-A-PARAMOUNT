#!/usr/bin/env python3
"""Build per-product photo galleries from the client's `final paramount-assets`.

Source layout (verified): each product has a folder; a few products (Doors,
Bhandar, 14-Swapna) nest their images in MATERIAL subfolders. The mapping from
folder -> catalog slug is LOCKED below (hand-verified; several fuzzy auto-matches
were wrong — Brass safe=Tijori not Gate, Door steps != Doors, Manekstambh !=
Toran, Pakshal/Dhajadand != Kalash). Do not "simplify" it with fuzzy matching.

Output:
  public/gallery/<slug>/<materialSlug>/NN.webp   (optimized, <=1600px, q82)
  public/icons/materials/<name>.webp             (the icon-button chips)
  src/lib/galleries.ts                           (typed manifest the UI reads)

Run: /usr/bin/python3 scripts/build-galleries.py
"""
import json, os, re, shutil, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.normpath(os.path.join(ROOT, "..", "final paramount-assets"))
OUT_IMG = os.path.join(ROOT, "public", "gallery")
OUT_ICON = os.path.join(ROOT, "public", "icons", "materials")
OUT_TS = os.path.join(ROOT, "src", "lib", "galleries.ts")
MAXPX, QUALITY = 1600, 82

# folder name (as on disk) -> catalog slug. LOCKED, hand-verified.
FOLDER_TO_SLUG = {
    "Allumium Platform Railing ": "aluminium-platform-railing-and-ladder",
    "Angi Mugat": "angi-mugat",
    "Bajot": "ashtaprakari-puja-bajot",
    "Bhandar ": "bhandar",
    "Brass Bell": "brass-bell",
    "Brass Grill": "brass-grill-jali",
    "Brass safe": "brass-tijori",
    "Chattar": "chattar",
    "DIYA": "silver-aarti-mangal-divo",
    "Deri Window ": "deri-window-and-door",
    "Dhajadand kalash Jain": "dhwajadand",
    "Divi stand": "divistand",
    "Door": "doors",
    "Door steps": "door-step",
    "KOTHI": "silver-kothi",
    "Kalash": "kalash",
    "Mandir": "mandir",
    "Manekstambh Toran": "manekstambh-toran",
    "Murti": "wooden-carved-murti",
    "NAAN": "kalpavruksh-naan",
    "Pakshal kalash ": "pakshal-kalash",
    "Patlo Table": "patla",
    "Pichwadi": "pichwadi",
    "Puja table": "puja-table",
    "Rath": "rath",
    "ShatrunjayPat": "shatrunjay-pat",
    "Swapnaji1": "14-swapna-and-parna",
    "Trigadu": "samovasaran-trigadu",
    "Vyaakhyan paat": "vyaakhyan-paat",
    "brass gate": "brass-gate",
    "khumb kalasah": "kumbh-kalash",
    "sinhasan": "sinhasan",
    "vyaakhyaan kamal": "vyaakhyan-kamal",
}

# canonical material -> its icon-button file (in the assets icon-buttons folder).
ICON_FILES = {
    "wooden": "Wooden.png", "brass": "Brass.png", "silver": "Silver.png",
    "copper": "Copper.png", "diamond": "Diamond.png", "minakari": "Minakari.png",
    "polish": "Polish.png", "inlay": "Inaay.png", "brass-jaali": "Brass-jaali.png",
    "copper-brass": "Copper-brass.png", "brass-germansilver": "Brass-germansilver.png",
}

def slugify(s):
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", s.lower()))

def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

def match_icon(label):
    """Best icon-button for a material label, or None. Compound finishes are
    matched by requiring BOTH parts, so 'Brass Emboss' resolves to brass — not
    brass-germansilver — and 'Brass Copper' to copper-brass."""
    n = norm(label)
    has = lambda *ws: all(w in n for w in ws)
    # most-specific compounds first
    if has("brass") and ("germansilver" in n or "gs" in n):
        return "brass-germansilver"
    if has("copper", "brass"):
        return "copper-brass"
    if has("brass") and ("jaali" in n or "jali" in n):
        return "brass-jaali"
    # singles / synonyms
    if "minakari" in n:                       return "minakari"
    if "diamond" in n:                        return "diamond"
    if "wooden" in n or "carving" in n:       return "wooden"  # carved = wooden door
    if "silver" in n:                         return "silver"
    if "copper" in n:                         return "copper"
    if "polish" in n:                         return "polish"
    if "inlay" in n or "emboss" in n:         return "inlay"
    if "jaali" in n or "jali" in n:           return "brass-jaali"
    if "brass" in n:                          return "brass"
    return None  # e.g. "Patra" (metal-clad) -> labelled text chip, no icon

def nice_label(raw):
    """Human material label from a messy subfolder name."""
    t = re.sub(r"\b(doors?|bhandar|door)\b", "", raw, flags=re.I).strip()
    t = re.sub(r"\s+", " ", t).title()
    fix = {"Patra": "Patra (Metal-clad)", "Gs": "GS"}
    return fix.get(t, t) or raw.title()

def list_images(d):
    return sorted(
        f for f in os.listdir(d)
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        and not f.startswith(".")
    )

def encode(src, dst):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((MAXPX, MAXPX), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    return os.path.getsize(dst), im.size  # (bytes, (w, h))

def entry(src_path, dst, web_path, manifest_only):
    """Encode (or reuse) one image and return its manifest entry {src, w, h}."""
    if manifest_only and os.path.exists(dst):
        b, (w, h) = 0, Image.open(dst).size
    else:
        b, (w, h) = encode(src_path, dst)
    return b, {"src": web_path, "w": w, "h": h}

def main():
    # MANIFEST_ONLY=1 rebuilds src/lib/galleries.ts (e.g. after a match_icon or
    # label change) without touching the already-encoded webp on disk.
    manifest_only = os.environ.get("MANIFEST_ONLY") == "1"
    if os.path.isdir(OUT_IMG) and not manifest_only:
        shutil.rmtree(OUT_IMG)
    manifest = {}
    total_bytes = total_files = 0

    for folder, slug in sorted(FOLDER_TO_SLUG.items(), key=lambda kv: kv[1]):
        src = os.path.join(ASSETS, folder)
        if not os.path.isdir(src):
            print(f"  !! missing folder: {folder}", file=sys.stderr)
            continue
        subdirs = sorted(
            x for x in os.listdir(src)
            if os.path.isdir(os.path.join(src, x)) and not x.startswith(".")
        )
        groups = []  # {material, label, icon, images:[...]}
        if subdirs:
            for sub in subdirs:
                imgs = list_images(os.path.join(src, sub))
                if not imgs:
                    continue
                label = nice_label(sub)
                mslug = slugify(sub) or "variant"
                paths = []
                for i, f in enumerate(imgs):
                    dst = os.path.join(OUT_IMG, slug, mslug, f"{i:02d}.webp")
                    b, e = entry(os.path.join(src, sub, f), dst,
                                 f"/gallery/{slug}/{mslug}/{i:02d}.webp", manifest_only)
                    total_bytes += b; total_files += 1
                    paths.append(e)
                groups.append({"material": mslug, "label": label,
                               "icon": match_icon(sub), "images": paths})
        else:
            imgs = list_images(src)
            paths = []
            for i, f in enumerate(imgs):
                dst = os.path.join(OUT_IMG, slug, "all", f"{i:02d}.webp")
                b, e = entry(os.path.join(src, f), dst,
                             f"/gallery/{slug}/all/{i:02d}.webp", manifest_only)
                total_bytes += b; total_files += 1
                paths.append(e)
            if paths:
                groups.append({"material": "all", "label": "All",
                               "icon": None, "images": paths})
        if groups:
            manifest[slug] = {"groups": groups,
                              "count": sum(len(g["images"]) for g in groups)}
            print(f"  {slug:34s} {manifest[slug]['count']:3d} imgs, "
                  f"{len(groups)} group(s): {[g['label'] for g in groups]}")

    # icon-button chips -> optimized webp
    os.makedirs(OUT_ICON, exist_ok=True)
    icon_src_dir = os.path.join(ASSETS, "icon-buttons ")
    icon_out = {}
    for key, fn in ICON_FILES.items():
        p = os.path.join(icon_src_dir, fn)
        if os.path.isfile(p):
            dst = os.path.join(OUT_ICON, f"{key}.webp")
            Image.open(p).convert("RGBA").save(dst, "WEBP", quality=90, method=6)
            icon_out[key] = f"/icons/materials/{key}.webp"

    # emit TS
    header = (
        "// AUTO-GENERATED by scripts/build-galleries.py — do not edit by hand.\n"
        "// Per-product photo galleries + material groups from the client assets.\n\n"
        "export interface GalleryImage {\n"
        "  src: string;\n  w: number;\n  h: number; // intrinsic size (for exact-fit frames)\n}\n"
        "export interface GalleryGroup {\n"
        "  material: string;\n  label: string;\n"
        "  icon: string | null; // /icons/materials/<key>.webp\n"
        "  images: GalleryImage[];\n}\n"
        "export interface ProductGallery {\n  groups: GalleryGroup[];\n  count: number;\n}\n\n"
        f"export const MATERIAL_ICONS: Record<string, string> = {json.dumps(icon_out, indent=2)};\n\n"
        f"export const GALLERIES: Record<string, ProductGallery> = {json.dumps(manifest, indent=2)};\n\n"
        "export function galleryFor(slug: string): ProductGallery | undefined {\n"
        "  return GALLERIES[slug];\n}\n"
    )
    with open(OUT_TS, "w") as f:
        f.write(header)

    print(f"\n{len(manifest)} products, {total_files} images, "
          f"{total_bytes/1e6:.1f} MB, {len(icon_out)} icons")
    print("wrote", OUT_TS)

if __name__ == "__main__":
    main()
