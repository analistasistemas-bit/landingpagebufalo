#!/usr/bin/env python3
"""
extract_images.py — Búfalo website asset pipeline (idempotent)

Produces:
  public/images/logos/          — logo-v2.png, logo-principal.png, logo-branca.png
  public/favicon.svg            — branded SVG favicon
  public/favicon.png            — 32x32 PNG from buffalo symbol
  src/data/cores-linha120.json  — color palette sampled from cartela pages
  public/images/produtos/       — category WebP + product WebP + _placeholder.webp
  scripts/IMAGES_REPORT.md      — summary report

Color-sampling method:
  - Open catalog pages 4-8 (Linha 120 cartela) from pre-rasterized PNGs.
  - Each page is divided into a grid. We skip the border/background and sample
    the center of each grid cell to get the dominant cone color.
  - We then cluster nearby colors and deduplicate to get a varied palette.
  - No OCR: codes are omitted when not readable; entries have hex only.

Category-image method (v2 — divisória circle crop):
  - Each category has an exact divisória page in the catalog (verified visually).
  - Divisória layout: large red circle with product photo in the top-left area,
    category name text below. The circle is ~1250px wide starting at col 0.
  - Crop window (0, 300, 1250, 1550) captures the circle as a 1250x1250 square,
    avoiding the text below. Resize to 800x800 WebP quality 80.
  - fios-overloque (pág 10) has no divisória. Instead: crop the largest product
    photo from that page, apply a red duotone + circular mask to match the style.
  - Page map (1-indexed PDF page → slug):
      3  → linhas-de-costura
      10 → fios-overloque  (duotone fallback from pág 3 if crop looks bad)
      35 → ziperes
      50 → elasticos
      25 → passamanarias
      46 → fechos-colchetes
      56 → tesouras
      62 → acessorios
"""

import os
import json
import math
from PIL import Image, ImageDraw

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE = "/Users/diego/Desktop/IA/LandingPage Bufalo"
LOGO_SRC = os.path.join(BASE, "Logo")
PAGES_DIR = os.path.join(BASE, "_catalogo_paginas")
PDF_PATH = os.path.join(BASE, "Catálogo Búfalo 18-06.pdf")

OUT_LOGOS = os.path.join(BASE, "public/images/logos")
OUT_PRODUTOS = os.path.join(BASE, "public/images/produtos")
OUT_PUBLIC = os.path.join(BASE, "public")
OUT_DATA = os.path.join(BASE, "src/data")
OUT_SCRIPTS = os.path.join(BASE, "scripts")

BRAND_RED = (178, 34, 34)      # #B22222
BRAND_DARK = (107, 0, 0)       # #6B0000

for d in [OUT_LOGOS, OUT_PRODUTOS]:
    os.makedirs(d, exist_ok=True)

# ─── Report tracking ──────────────────────────────────────────────────────────
report_lines = []
def rpt(line):
    print(line)
    report_lines.append(line)

# ══════════════════════════════════════════════════════════════════════════════
# 1. LOGOS
# ══════════════════════════════════════════════════════════════════════════════
def process_logos():
    rpt("\n## Logos")
    mapping = [
        ("LOGO PRINCIPAL - V2@4x.png",    "logo-v2.png",       600),
        ("LOGO PRINCIPAL@4x.png",         "logo-principal.png", 600),
        ("LOGO SECUNDÁRIA - BRANCO@4x.png","logo-branca.png",   600),
    ]
    for src_name, dst_name, max_side in mapping:
        src = os.path.join(LOGO_SRC, src_name)
        dst = os.path.join(OUT_LOGOS, dst_name)
        img = Image.open(src).convert("RGBA")
        w, h = img.size
        ratio = min(max_side / w, max_side / h)
        if ratio < 1.0:
            nw, nh = int(w * ratio), int(h * ratio)
            img = img.resize((nw, nh), Image.LANCZOS)
        img.save(dst, "PNG", optimize=True)
        rpt(f"  - {dst_name}: {img.size[0]}x{img.size[1]}px → {os.path.getsize(dst)//1024}KB")


# ══════════════════════════════════════════════════════════════════════════════
# 2. FAVICON
# ══════════════════════════════════════════════════════════════════════════════
def process_favicon():
    rpt("\n## Favicon")

    # favicon.svg — rounded red square with white "B"
    svg = '''\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#B22222"/>
  <text x="16" y="23" font-family="Georgia,serif" font-weight="bold"
        font-size="20" text-anchor="middle" fill="white">B</text>
</svg>'''
    svg_path = os.path.join(OUT_PUBLIC, "favicon.svg")
    with open(svg_path, "w") as f:
        f.write(svg)
    rpt(f"  - favicon.svg: written ({len(svg)} bytes)")

    # favicon.png 32x32 from BUFALO VERMELHO symbol
    symbol_src = os.path.join(LOGO_SRC, "BUFALO VERMELHO@4x.png")
    dst_png = os.path.join(OUT_PUBLIC, "favicon.png")
    img = Image.open(symbol_src).convert("RGBA")
    img = img.resize((32, 32), Image.LANCZOS)
    img.save(dst_png, "PNG", optimize=True)
    rpt(f"  - favicon.png: 32x32 from buffalo symbol → {os.path.getsize(dst_png)} bytes")


# ══════════════════════════════════════════════════════════════════════════════
# 3. COLOR PALETTE — Linha 120
# ══════════════════════════════════════════════════════════════════════════════
def rgb_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def sample_page_colors(page_path, rows, cols, skip_border_frac=0.08):
    """Sample colors from a grid, skipping near-white/near-black cells."""
    img = Image.open(page_path).convert("RGB")
    w, h = img.size
    # Skip top and bottom margins (catalog has headers/footers)
    top_skip = int(h * 0.12)
    bot_skip = int(h * 0.10)
    left_skip = int(w * 0.05)
    right_skip = int(w * 0.05)
    usable_w = w - left_skip - right_skip
    usable_h = h - top_skip - bot_skip
    cell_w = usable_w // cols
    cell_h = usable_h // rows
    colors = []
    for r in range(rows):
        for c in range(cols):
            cx = left_skip + c * cell_w + cell_w // 2
            cy = top_skip + r * cell_h + cell_h // 2
            # Sample a small patch around center
            patch_size = min(cell_w, cell_h) // 4
            patch_size = max(patch_size, 4)
            x0 = max(0, cx - patch_size)
            y0 = max(0, cy - patch_size)
            x1 = min(w, cx + patch_size)
            y1 = min(h, cy + patch_size)
            patch = img.crop((x0, y0, x1, y1))
            pixels = list(patch.getdata())
            avg = tuple(int(sum(p[i] for p in pixels) / len(pixels)) for i in range(3))
            # Skip near-white (background), near-black, near-gray
            r_val, g_val, b_val = avg
            brightness = (r_val + g_val + b_val) / 3
            saturation = max(r_val, g_val, b_val) - min(r_val, g_val, b_val)
            if brightness > 230 or brightness < 20 or saturation < 25:
                continue
            colors.append(avg)
    return colors

def deduplicate_colors(colors, min_dist=20):
    """Remove near-duplicate colors, keeping one representative per cluster."""
    unique = []
    for c in colors:
        if all(rgb_distance(c, u) > min_dist for u in unique):
            unique.append(c)
    return unique

def rgb_to_hex(rgb):
    return "#{:02X}{:02X}{:02X}".format(*rgb)

def process_colors():
    rpt("\n## Linha 120 Color Palette")
    # Pages 4-8 are the Linha 120 color cartela (high file size confirms photo-heavy pages)
    cartela_pages = [5, 6, 7]  # pag_05, pag_06, pag_07 — the 2-3MB pages with cone grids
    all_colors = []
    for page_num in cartela_pages:
        path = os.path.join(PAGES_DIR, f"pag_{page_num:02d}.png")
        if not os.path.exists(path):
            continue
        # Each cartela page has ~8 rows x 6 cols of cones
        sampled = sample_page_colors(path, rows=8, cols=6)
        all_colors.extend(sampled)
        rpt(f"  - pag_{page_num:02d}: {len(sampled)} raw color samples")

    # Also sample pages 4 and 8 which may have partial cartela
    for page_num in [4, 8]:
        path = os.path.join(PAGES_DIR, f"pag_{page_num:02d}.png")
        if not os.path.exists(path):
            continue
        sampled = sample_page_colors(path, rows=6, cols=5)
        all_colors.extend(sampled)
        rpt(f"  - pag_{page_num:02d}: {len(sampled)} raw color samples")

    # Deduplicate
    unique = deduplicate_colors(all_colors, min_dist=18)
    rpt(f"  - After dedup: {len(unique)} unique colors")

    # Sort by hue for pleasant display
    def sort_key(rgb):
        r, g, b = [x/255.0 for x in rgb]
        cmax = max(r, g, b)
        cmin = min(r, g, b)
        delta = cmax - cmin
        if delta == 0:
            h = 0
        elif cmax == r:
            h = 60 * (((g - b) / delta) % 6)
        elif cmax == g:
            h = 60 * (((b - r) / delta) + 2)
        else:
            h = 60 * (((r - g) / delta) + 4)
        return h

    unique.sort(key=sort_key)

    # Build JSON — no codes since OCR is unreliable, use index-based labels
    palette = [{"hex": rgb_to_hex(c)} for c in unique]
    out_path = os.path.join(OUT_DATA, "cores-linha120.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(palette, f, indent=2, ensure_ascii=False)
    rpt(f"  - Wrote {len(palette)} entries to cores-linha120.json")
    return len(palette)


# ══════════════════════════════════════════════════════════════════════════════
# 4. PRODUCT / CATEGORY IMAGES — divisória circle crop
# ══════════════════════════════════════════════════════════════════════════════
# Exact map: PDF page (1-indexed) → category slug
# All pages except fios-overloque have a divisória with a large red circle photo.
# Verified visually: pag_03=linhas, pag_25=passamanarias, pag_35=ziperes,
# pag_46=fechos, pag_50=elasticos, pag_56=tesouras, pag_62=acessorios
DIVISORIA_MAP = {
    "linhas-de-costura":  3,
    "ziperes":            35,
    "elasticos":          50,
    "passamanarias":      25,
    "fechos-colchetes":   46,
    "tesouras":           56,
    "acessorios":         62,
}
# fios-overloque uses pag_10 with duotone treatment (no divisória circle)
OVERLOQUE_PAGE = 10
# Fallback for overloque duotone: use linhas-de-costura divisória if pag_10 crop is poor
OVERLOQUE_FALLBACK_PAGE = 3

# Circle crop window — verified on pag_03 thumbnail:
# cols 0-1250, rows 300-1550 captures the circle as a ~1250x1250 square
# avoiding the category name text at the bottom of the red panel
CIRCLE_CROP = (0, 300, 1250, 1550)  # (left, top, right, bottom) in full-res pixels


def crop_divisoria_circle(page_path, crop_box=CIRCLE_CROP, out_size=800):
    """Crop the red circle area from a divisória page and resize to out_size x out_size."""
    img = Image.open(page_path).convert("RGB")
    cropped = img.crop(crop_box)
    # Ensure square (crop_box should already be square, but enforce)
    w, h = cropped.size
    side = min(w, h)
    if w != h:
        cropped = cropped.crop((0, 0, side, side))
    return cropped.resize((out_size, out_size), Image.LANCZOS)


def apply_red_duotone_circle(img, out_size=800):
    """Apply a red duotone + circular mask to an RGB image, returning RGBA 800x800."""
    import numpy as np
    # Resize to square
    w, h = img.size
    side = min(w, h)
    # Center-crop to square
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((out_size, out_size), Image.LANCZOS)

    # Convert to grayscale then apply red duotone
    arr = np.array(img).astype(float)
    gray = arr[:, :, 0] * 0.299 + arr[:, :, 1] * 0.587 + arr[:, :, 2] * 0.114
    # Map gray 0-255 → dark red (#6B0000) to bright (#B22222) to near-white
    dark = np.array([107, 0, 0], dtype=float)     # #6B0000
    mid  = np.array([178, 34, 34], dtype=float)   # #B22222
    light = np.array([255, 180, 180], dtype=float)

    t = gray / 255.0
    # Two-segment blend: dark→mid for t<0.5, mid→light for t>=0.5
    t1 = np.clip(t * 2, 0, 1)
    t2 = np.clip((t - 0.5) * 2, 0, 1)
    mask_low  = (t < 0.5)[:, :, None]
    mask_high = (t >= 0.5)[:, :, None]
    t1 = t1[:, :, None]
    t2 = t2[:, :, None]
    result = (dark[None, None] * (1 - t1) + mid[None, None] * t1) * mask_low
    result += (mid[None, None] * (1 - t2) + light[None, None] * t2) * mask_high
    result = np.clip(result, 0, 255).astype(np.uint8)
    duotone = Image.fromarray(result, "RGB")

    # Apply circular mask
    mask = Image.new("L", (out_size, out_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, out_size - 1, out_size - 1), fill=255)

    result_rgba = duotone.convert("RGBA")
    result_rgba.putalpha(mask)
    # Composite onto white background for clean WebP
    bg = Image.new("RGB", (out_size, out_size), (255, 255, 255))
    bg.paste(duotone, mask=mask)
    return bg


def process_products():
    rpt("\n## Product / Category Images (divisória circle crop)")

    produced_category = []
    used_placeholder = []

    # ── 7 divisória pages ──────────────────────────────────────────────────────
    for slug, page_num in DIVISORIA_MAP.items():
        out_path = os.path.join(OUT_PRODUTOS, f"{slug}.webp")
        page_path = os.path.join(PAGES_DIR, f"pag_{page_num:02d}.png")
        if not os.path.exists(page_path):
            rpt(f"  - {slug}.webp: MISSING page {page_path}")
            used_placeholder.append(slug)
            continue
        img = crop_divisoria_circle(page_path)
        img.save(out_path, "WEBP", quality=80)
        size_kb = os.path.getsize(out_path) // 1024
        rpt(f"  - {slug}.webp: pag_{page_num:02d} circle crop 800x800 → {size_kb}KB")
        produced_category.append(slug)

    # ── fios-overloque: duotone circle from pag_10 ────────────────────────────
    slug = "fios-overloque"
    out_path = os.path.join(OUT_PRODUTOS, f"{slug}.webp")
    page_path = os.path.join(PAGES_DIR, f"pag_{OVERLOQUE_PAGE:02d}.png")
    if os.path.exists(page_path):
        img = Image.open(page_path).convert("RGB")
        # pag_10: product content starts below header (~row 200), use top product area
        # The cones are in the upper portion; crop a representative region
        w, h = img.size
        # Crop a square from the first product photo block (roughly rows 200-1200, centered)
        crop = img.crop((80, 200, 1440, 1460))
        duotone_img = apply_red_duotone_circle(crop)
        duotone_img.save(out_path, "WEBP", quality=80)
        size_kb = os.path.getsize(out_path) // 1024
        rpt(f"  - {slug}.webp: pag_{OVERLOQUE_PAGE:02d} duotone circle 800x800 → {size_kb}KB")
        produced_category.append(slug)
    else:
        # Fallback: use linhas-de-costura divisória with duotone
        fallback_path = os.path.join(PAGES_DIR, f"pag_{OVERLOQUE_FALLBACK_PAGE:02d}.png")
        if os.path.exists(fallback_path):
            img = Image.open(fallback_path).convert("RGB")
            crop = img.crop(CIRCLE_CROP)
            duotone_img = apply_red_duotone_circle(crop)
            duotone_img.save(out_path, "WEBP", quality=80)
            size_kb = os.path.getsize(out_path) // 1024
            rpt(f"  - {slug}.webp: FALLBACK pag_{OVERLOQUE_FALLBACK_PAGE:02d} duotone → {size_kb}KB (NOTE: pag_10 missing)")
            produced_category.append(slug)
        else:
            used_placeholder.append(slug)
            rpt(f"  - {slug}.webp: NOT FOUND — will use placeholder")

    return produced_category, [], used_placeholder


# ══════════════════════════════════════════════════════════════════════════════
# 5. PLACEHOLDER IMAGE
# ══════════════════════════════════════════════════════════════════════════════
def process_placeholder():
    rpt("\n## Placeholder Image")
    dst = os.path.join(OUT_PRODUTOS, "_placeholder.webp")

    # Load the white logo for overlay
    logo_src = os.path.join(LOGO_SRC, "LOGO SECUNDÁRIA - BRANCO@4x.png")
    logo = Image.open(logo_src).convert("RGBA")

    # Create red background 800x600
    bg = Image.new("RGBA", (800, 600), (*BRAND_RED, 255))

    # Scale logo to fit nicely (max 60% of width)
    max_w = int(800 * 0.55)
    lw, lh = logo.size
    ratio = max_w / lw
    new_size = (int(lw * ratio), int(lh * ratio))
    logo = logo.resize(new_size, Image.LANCZOS)

    # Center logo on background
    px = (800 - new_size[0]) // 2
    py = (600 - new_size[1]) // 2
    bg.paste(logo, (px, py), logo)

    # Save as WebP
    bg_rgb = bg.convert("RGB")
    bg_rgb.save(dst, "WEBP", quality=85)
    rpt(f"  - _placeholder.webp: 800x600 red bg + white logo → {os.path.getsize(dst)//1024}KB")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    rpt("# Búfalo Image Asset Pipeline")
    rpt(f"Base: {BASE}\n")

    process_logos()
    process_favicon()
    color_count = process_colors()
    cat_imgs, prod_imgs, placeholders = process_products()
    process_placeholder()

    # Write report
    rpt("\n## Summary")
    rpt(f"  - Logos produced: 3 (logo-v2.png, logo-principal.png, logo-branca.png)")
    rpt(f"  - Favicon: favicon.svg + favicon.png")
    rpt(f"  - Colors JSON: {color_count} entries")
    rpt(f"  - Category images: {len(cat_imgs)}/8")
    rpt(f"  - Product-specific images: {len(prod_imgs)}")
    rpt(f"  - Categories using placeholder: {placeholders}")
    rpt(f"  - Placeholder: _placeholder.webp")

    report_path = os.path.join(OUT_SCRIPTS, "IMAGES_REPORT.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines) + "\n")
    print(f"\nReport written to {report_path}")

if __name__ == "__main__":
    main()
