"""Compose nen chanh dien landscape 1920x1080 tu amitabha_stage.jpg (810x1440).

Cat vung Phat + ban tho (top ~0-780), dat giua phia tren. Hai ben noi rong
bang mirror + tuong go toi + cot do + den long. San go + tham do hinh thang
phia duoi cho dao trang ngoi le.
Output: public/assets/temple_hall_wide.jpg
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'public', 'assets')
SRC = os.path.join(ASSETS, 'amitabha_stage.jpg')
OUT = os.path.join(ASSETS, 'temple_hall_wide.jpg')

W, H = 1920, 1080
ALTAR_H = 800          # chieu cao vung ban tho (Phat)
FLOOR_Y = 800          # san go bat dau
CENTER = W // 2


def vgrad(size, top_color, bot_color):
    w, h = size
    g = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        g.putpixel((0, y), tuple(int(top_color[i] + (bot_color[i] - top_color[i]) * t) for i in range(3)))
    return g.resize((w, h))


def add_glow(base, cx, cy, rx, ry, color, alpha):
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(min(rx, ry) * 0.45))
    base.alpha_composite(layer)


def main():
    src = Image.open(SRC).convert('RGB')
    altar = src.crop((0, 0, 810, 780))          # Phat + ban tho + hao quang
    aw = int(altar.width * (ALTAR_H / altar.height))
    altar = altar.resize((aw, ALTAR_H), Image.LANCZOS)   # ~830x800

    hall = vgrad((W, H), (38, 14, 9), (16, 6, 4)).convert('RGBA')

    # ----- hai ben: mirror vung mep anh altar de noi rong buc tuong -----
    side_w = (W - aw) // 2                     # ~545
    edge = altar.crop((0, 0, min(400, aw), ALTAR_H))
    left = ImageOps.mirror(edge).resize((side_w, ALTAR_H), Image.LANCZOS)
    right = ImageOps.mirror(
        altar.crop((aw - min(400, aw), 0, aw, ALTAR_H))
    ).resize((side_w, ALTAR_H), Image.LANCZOS)

    dim = Image.new('RGBA', (side_w, ALTAR_H), (18, 6, 4, 150))
    hall.alpha_composite(Image.alpha_composite(left.convert('RGBA'), dim), (0, 0))
    hall.alpha_composite(Image.alpha_composite(right.convert('RGBA'), dim), (W - side_w, 0))
    hall.alpha_composite(altar.convert('RGBA'), (CENTER - aw // 2, 0))

    # ----- cot tru do hai ben -----
    d = ImageDraw.Draw(hall)
    for px in (120, 1500 + 300):
        pass  # vi tri cot tinh rieng duoi
    for cx, cw in ((140, 54), (1726, 54)):
        d.rounded_rectangle([cx - cw // 2, 40, cx + cw // 2, FLOOR_Y],
                            radius=cw // 2, fill=(58, 16, 11, 255))
        d.rounded_rectangle([cx - cw // 2, 40, cx - cw // 2 + int(cw * 0.38), FLOOR_Y],
                            radius=cw // 2, fill=(86, 26, 16, 255))
        d.rectangle([cx - cw // 2 - 6, 36, cx + cw // 2 + 6, 58], fill=(120, 82, 30, 255))
        d.rectangle([cx - cw // 2 - 6, FLOOR_Y - 22, cx + cw // 2 + 6, FLOOR_Y],
                    fill=(90, 60, 22, 255))

    # ----- den long treo -----
    for lx in (300, 1620):
        d.line([lx, 0, lx, 92], fill=(60, 40, 18, 255), width=3)
        d.ellipse([lx - 26, 92, lx + 26, 152], fill=(255, 178, 66, 255))
        d.ellipse([lx - 19, 98, lx + 19, 146], fill=(255, 216, 120, 255))
        d.rectangle([lx - 12, 86, lx + 12, 94], fill=(140, 84, 24, 255))
        d.rectangle([lx - 12, 150, lx + 12, 158], fill=(140, 84, 24, 255))
        add_glow(hall, lx, 124, 90, 90, (255, 170, 60), 60)

    # ----- san go -----
    floor = vgrad((W, H - FLOOR_Y), (66, 32, 16), (22, 10, 6)).convert('RGBA')
    fd = ImageDraw.Draw(floor)
    for i in range(9):
        y = int((i / 8) * (H - FLOOR_Y - 8))
        fd.line([0, y, W, y], fill=(30, 13, 7, 120), width=2)
    # vanh sang nhe tren san
    hall.alpha_composite(floor, (0, FLOOR_Y))
    add_glow(hall, CENTER, FLOOR_Y + 60, 560, 130, (255, 170, 70), 46)

    # ----- tham do hinh thang giua -----
    d = ImageDraw.Draw(hall)
    top_w, bot_w = 210, 560
    carpet = [
        (CENTER - top_w // 2, FLOOR_Y + 4), (CENTER + top_w // 2, FLOOR_Y + 4),
        (CENTER + bot_w // 2, H), (CENTER - bot_w // 2, H),
    ]
    d.polygon(carpet, fill=(122, 22, 16, 255))
    d.polygon([(c[0] + (8 if i < 2 else -8), c[1]) if i < 2 else (c[0] + (8 if i == 2 else -8), c[1])
               for i, c in enumerate(carpet)], outline=(190, 130, 48, 255))
    d.line([carpet[0], carpet[3]], fill=(190, 130, 48, 255), width=4)
    d.line([carpet[1], carpet[2]], fill=(190, 130, 48, 255), width=4)
    # cham hoa van giua tham
    for my in range(FLOOR_Y + 70, H, 110):
        mw = top_w + (bot_w - top_w) * (my - FLOOR_Y) / (H - FLOOR_Y)
        d.ellipse([CENTER - mw * 0.16, my - 8, CENTER + mw * 0.16, my + 8],
                  outline=(190, 130, 48, 110), width=2)

    # ----- bong phan chieu Phat xuong san -----
    refl = altar.crop((0, ALTAR_H - 260, aw, ALTAR_H)).resize((aw, 130))
    refl = ImageOps.flip(refl).convert('RGBA').filter(ImageFilter.GaussianBlur(6))
    refl.putalpha(refl.getchannel('A').point(lambda a: int(a * 0.16)))
    hall.alpha_composite(refl, (CENTER - aw // 2, FLOOR_Y + 2))

    hall.convert('RGB').save(OUT, 'JPEG', quality=86)
    print('OK', OUT, os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main()
