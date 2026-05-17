"""Generate RAWBY app icons: dark green bg, RAWBY letters in typewriter circles."""
from PIL import Image, ImageDraw, ImageFont
import os

BG = (18, 52, 36)
# 16% white overlay on BG = circle fill
CIRCLE_FILL = (56, 84, 71)
# 40% white border
CIRCLE_BORDER = (113, 133, 124)
TEXT_COLOR = (255, 255, 255)

LETTERS = list("RAWBY")

def draw_icon(size: int, path: str):
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)

    padding = size * 0.07
    total_width = size - 2 * padding
    n = len(LETTERS)
    gap = total_width * 0.035
    circle_d = (total_width - gap * (n - 1)) / n
    r = circle_d / 2
    cy = size / 2

    font_size = int(circle_d * 0.50)
    font = None
    for path_attempt in [
        "C:/Windows/Fonts/ArialBD.ttf",
        "C:/Windows/Fonts/Arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]:
        try:
            font = ImageFont.truetype(path_attempt, font_size)
            break
        except Exception:
            pass
    if font is None:
        font = ImageFont.load_default()

    border_w = max(2, int(size * 0.005))

    for i, letter in enumerate(LETTERS):
        cx = padding + r + i * (circle_d + gap)
        x0, y0 = cx - r, cy - r
        x1, y1 = cx + r, cy + r

        draw.ellipse([x0, y0, x1, y1], fill=CIRCLE_FILL, outline=CIRCLE_BORDER, width=border_w)

        bbox = draw.textbbox((0, 0), letter, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = cx - tw / 2 - bbox[0]
        ty = cy - th / 2 - bbox[1]
        draw.text((tx, ty), letter, fill=TEXT_COLOR, font=font)

    img.save(path, "PNG")
    print(f"Saved {path} ({size}x{size})")

os.makedirs("../web/icons", exist_ok=True)
draw_icon(512, "../web/icons/Icon-512.png")
draw_icon(192, "../web/icons/Icon-192.png")
draw_icon(512, "../web/icons/Icon-maskable-512.png")
draw_icon(192, "../web/icons/Icon-maskable-192.png")
draw_icon(32, "../web/favicon.png")
print("Done.")
