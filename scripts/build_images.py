#!/usr/bin/env python3
"""
build_images.py — gera os assets de imagem do site Búfalo (idempotente).

Saídas:
- public/images/logos/logo-header.png  : logo principal (búfalo + BÚFALO vermelho) para o header
- public/images/logos/logo-branca.png  : logo secundária forçada a branco puro, para o footer
- public/images/produtos/{slug}.webp   : 1 imagem full-bleed por categoria (recorte do círculo da divisória do catálogo)
- public/images/produtos/{id}.webp     : 1 imagem distinta por produto (recortes variados da mesma fonte)

Fonte das fotos: 'Catálogo Búfalo 18-06.pdf'. Cada categoria aponta para a página
da sua divisória (círculo de foto tratada em vermelho). Para 'fios-overloque' não há
divisória própria, então usamos um recorte diferente da página de cones (pág 3).

Requer: pymupdf (fitz), Pillow, numpy.
"""
import json
from pathlib import Path
import fitz
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "Catálogo Búfalo 18-06.pdf"
LOGO_DIR = ROOT / "Logo"
OUT_LOGOS = ROOT / "public/images/logos"
OUT_PROD = ROOT / "public/images/produtos"

# Categoria -> página do PDF (1-based) com a divisória / foto de produto
PAGE = {
    "linhas-de-costura": 3,
    "fios-overloque": 3,   # sem divisória própria: recorte diferente dos cones da pág 3
    "ziperes": 35,
    "elasticos": 50,
    "passamanarias": 25,
    "fechos-colchetes": 46,
    "tesouras": 56,
    "acessorios": 62,
}


def render_page(pno: int) -> Image.Image:
    doc = fitz.open(PDF)
    p = doc[pno - 1]
    pix = p.get_pixmap(matrix=fitz.Matrix(3, 3))
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def circle_bbox(img: Image.Image):
    """Centro/raio do círculo da divisória = maior massa não-branca no topo (exclui nome+montanhas)."""
    a = np.asarray(img)
    H, W, _ = a.shape
    top = a[: int(H * 0.62)]
    nonwhite = top.min(axis=2) < 232
    ys, xs = np.where(nonwhite)
    if len(xs) == 0:
        return W // 2, H // 3, min(W, H) // 3
    cx = (int(xs.min()) + int(xs.max())) // 2
    cy = (int(ys.min()) + int(ys.max())) // 2
    r = min(int(xs.max()) - int(xs.min()), int(ys.max()) - int(ys.min())) // 2
    return cx, cy, r


def crop_square(img: Image.Image, cx, cy, side) -> Image.Image:
    cx, cy, side = int(cx), int(cy), int(side)
    W, H = img.size
    x0 = min(max(0, cx - side // 2), W - side)
    y0 = min(max(0, cy - side // 2), H - side)
    x0, y0 = max(0, x0), max(0, y0)
    return img.crop((x0, y0, x0 + side, y0 + side))


def build_logos():
    OUT_LOGOS.mkdir(parents=True, exist_ok=True)
    # Header: logo principal (com búfalo + wordmark vermelho)
    src = Image.open(LOGO_DIR / "LOGO PRINCIPAL@4x.png")
    w = 1000
    h = int(src.size[1] * w / src.size[0])
    src.resize((w, h)).save(OUT_LOGOS / "logo-header.png")
    # Footer: secundária forçada a branco puro (nítida sobre o bordô)
    sec = Image.open(LOGO_DIR / "LOGO SECUNDÁRIA - BRANCO@4x.png").convert("RGBA")
    a = np.array(sec)
    a[..., 0] = 255
    a[..., 1] = 255
    a[..., 2] = 255
    out = Image.fromarray(a)
    w = 760
    h = int(out.size[1] * w / out.size[0])
    out.resize((w, h)).save(OUT_LOGOS / "logo-branca.png")


def build_product_images():
    OUT_PROD.mkdir(parents=True, exist_ok=True)
    cache = {}
    for pno in set(PAGE.values()):
        im = render_page(pno)
        cache[pno] = (im,) + circle_bbox(im)

    # Imagem full-bleed por categoria
    for slug, pno in PAGE.items():
        im, cx, cy, r = cache[pno]
        if slug == "fios-overloque":
            sq = crop_square(im, cx + int(r * 0.45), cy - int(r * 0.35), r * 0.9)
        else:
            sq = crop_square(im, cx, cy, r * 1.30)
        sq.resize((800, 800)).save(OUT_PROD / f"{slug}.webp", "WEBP", quality=84)

    # Imagem distinta por produto (recortes variados da mesma fonte)
    prods = json.loads((ROOT / "src/data/produtos.json").read_text())
    bycat = {}
    for p in prods:
        bycat.setdefault(p["categoriaSlug"], []).append(p)
    for slug, items in bycat.items():
        im, cx, cy, r = cache[PAGE[slug]]
        if slug == "fios-overloque":
            base_cx, base_cy = cx + int(r * 0.45), cy - int(r * 0.35)
        else:
            base_cx, base_cy = cx, cy
        n = len(items)
        for i, p in enumerate(items):
            ang = (i / max(n, 1)) * 2 * np.pi
            dx = int(np.cos(ang) * r * 0.30)
            dy = int(np.sin(ang) * r * 0.30)
            zoom = 1.0 - 0.10 * (i % 3)
            side = r * 1.05 * zoom
            sq = crop_square(im, base_cx + dx, base_cy + dy, side)
            sq.resize((700, 700)).save(OUT_PROD / f"{p['id']}.webp", "WEBP", quality=82)


if __name__ == "__main__":
    build_logos()
    build_product_images()
    print("imagens geradas em public/images/")
