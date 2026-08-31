"""Generate PWA/app icons for LifeLog.

Simple, calm mark: a rounded square in brand green with a soft
"daily timeline" glyph — a gently rising line (the day) with a single
dot (the current moment/log entry). No external assets, no dependencies
beyond Pillow, fully reproducible.

Run: python3 scripts/make-icons.py
"""
from PIL import Image, ImageDraw

BRAND = (61, 113, 72, 255)  # #3d7148
BRAND_DARK = (48, 90, 58, 255)  # #305a3a
MARK = (246, 247, 245, 255)  # near-white


def rounded_square(size: int, radius_ratio: float = 0.225) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BRAND)
    return img


def draw_glyph(img: Image.Image, safe_ratio: float) -> None:
    """Draw the timeline glyph inside a centered safe zone."""
    size = img.size[0]
    d = ImageDraw.Draw(img)
    pad = size * (1 - safe_ratio) / 2
    x0, y0 = pad, pad
    x1, y1 = size - pad, size - pad
    w = x1 - x0
    h = y1 - y0

    # Gently rising polyline: day-shape (low -> mid -> high -> current dot)
    pts = [
        (x0, y0 + h * 0.72),
        (x0 + w * 0.28, y0 + h * 0.58),
        (x0 + w * 0.48, y0 + h * 0.66),
        (x0 + w * 0.68, y0 + h * 0.30),
        (x0 + w * 0.86, y0 + h * 0.20),
    ]
    stroke = max(2, int(size * 0.045))
    d.line(pts, fill=MARK, width=stroke, joint="curve")
    for p in (pts[0], pts[-1]):
        rr = stroke * 0.9
        d.ellipse([p[0] - rr, p[1] - rr, p[0] + rr, p[1] + rr], fill=MARK)

    # "current moment" marker — larger dot with ring, at the peak
    cx, cy = x0 + w * 0.86, y0 + h * 0.20
    ring_r = size * 0.085
    dot_r = size * 0.045
    d.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=MARK, width=stroke)
    d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=MARK)


def make(path: str, size: int, safe_ratio: float = 0.62, maskable: bool = False) -> None:
    img = rounded_square(size, radius_ratio=0.0 if maskable else 0.225)
    if maskable:
        # Maskable icons must fill edge-to-edge; keep glyph within the ~80% safe zone.
        d = ImageDraw.Draw(img)
        d.rectangle([0, 0, size, size], fill=BRAND)
        draw_glyph(img, safe_ratio=0.55)
    else:
        draw_glyph(img, safe_ratio=safe_ratio)
    img.save(path)


if __name__ == "__main__":
    import os

    out = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(out, exist_ok=True)
    make(f"{out}/icon-192.png", 192)
    make(f"{out}/icon-512.png", 512)
    make(f"{out}/icon-maskable-512.png", 512, maskable=True)
    make(f"{out}/apple-touch-icon.png", 180, safe_ratio=0.66)
    make(f"{out}/favicon-32.png", 32, safe_ratio=0.7)
    make(f"{out}/favicon-16.png", 16, safe_ratio=0.7)
    print("icons written to", out)
