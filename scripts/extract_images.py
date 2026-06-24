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

Product-extraction method:
  - Uses fitz (PyMuPDF) to extract embedded raster images from each PDF page.
  - Matches pages to categories by page range heuristics from catalog structure.
  - The largest image per category page is picked as representative.
  - Saved as WebP 800px wide, quality=80.
"""

import os
import sys
import json
import math
import struct
import base64
import shutil
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

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
# 4. PRODUCT / CATEGORY IMAGES
# ══════════════════════════════════════════════════════════════════════════════
# Category → page ranges in the catalog (approximate, based on file sizes / content)
# Pages with large files = photo pages
CATEGORY_PAGES = {
    "linhas-de-costura":   [3, 4, 5, 6, 7, 8],   # Linha 120 cones
    "fios-overloque":      [9, 10, 11, 12],
    "ziperes":             [13, 14, 15, 16, 17],
    "elasticos":           [25, 26, 27],
    "passamanarias":       [30, 31, 32, 33],
    "fechos-colchetes":    [40, 41, 42],
    "tesouras":            [50, 51, 52],
    "acessorios":          [60, 61, 62],
}

def extract_largest_image_from_pdf_page(doc, page_num_0indexed):
    """Extract the largest embedded raster from a PDF page. Returns PIL Image or None."""
    try:
        page = doc[page_num_0indexed]
        image_list = page.get_images(full=True)
        if not image_list:
            return None
        # Pick largest by pixel count
        best = None
        best_pixels = 0
        for img_info in image_list:
            xref = img_info[0]
            try:
                base_img = doc.extract_image(xref)
                data = base_img["image"]
                pil = Image.open(BytesIO(data)).convert("RGB")
                px = pil.size[0] * pil.size[1]
                if px > best_pixels:
                    best_pixels = px
                    best = pil
            except Exception:
                continue
        return best
    except Exception:
        return None

def crop_product_region(page_path, region_frac=(0.05, 0.12, 0.95, 0.88)):
    """Crop the main content area from a rasterized page, removing margins/headers."""
    img = Image.open(page_path).convert("RGB")
    w, h = img.size
    l = int(w * region_frac[0])
    t = int(h * region_frac[1])
    r = int(w * region_frac[2])
    b = int(h * region_frac[3])
    return img.crop((l, t, r, b))

def resize_to_width(img, target_w=800):
    w, h = img.size
    if w <= target_w:
        return img
    ratio = target_w / w
    return img.resize((target_w, int(h * ratio)), Image.LANCZOS)

def save_webp(img, path, quality=80):
    img = resize_to_width(img, 800)
    img.save(path, "WEBP", quality=quality)

def process_products():
    rpt("\n## Product / Category Images")
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    rpt(f"  - PDF has {total_pages} pages")

    produced_category = []
    produced_product = []
    used_placeholder = []

    for slug, pages in CATEGORY_PAGES.items():
        out_path = os.path.join(OUT_PRODUTOS, f"{slug}.webp")
        found = False

        # Try PDF embedded images first
        for pg in pages:
            if pg < 1 or pg > total_pages:
                continue
            pil = extract_largest_image_from_pdf_page(doc, pg - 1)
            if pil and pil.size[0] > 100 and pil.size[1] > 100:
                save_webp(pil, out_path)
                rpt(f"  - {slug}.webp: from PDF page {pg} embedded image {pil.size}")
                produced_category.append(slug)
                found = True
                break

        # Fallback: crop from rasterized page
        if not found:
            for pg in pages:
                page_path = os.path.join(PAGES_DIR, f"pag_{pg:02d}.png")
                if not os.path.exists(page_path):
                    continue
                pil = crop_product_region(page_path)
                if pil:
                    save_webp(pil, out_path)
                    rpt(f"  - {slug}.webp: cropped from rasterized pag_{pg:02d}")
                    produced_category.append(slug)
                    found = True
                    break

        if not found:
            used_placeholder.append(slug)
            rpt(f"  - {slug}.webp: NOT FOUND — will use placeholder")

    doc.close()
    return produced_category, produced_product, used_placeholder


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
