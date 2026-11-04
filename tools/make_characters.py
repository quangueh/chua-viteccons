"""Ve lai nhan vat chibi 3D-style tu dau bang PIL (khong dung sprite cu).

Chibi quay lung: dau TO hon vai (mu bao ho trang bong phu nua tren, toc den lo phia duoi),
than gon mac giap phan quang VITECCONS, ngoi bat cheo tren chieu coi / dang di bo.
Frame lay: xoay khoi than quanh khop hang. Ve o 3x roi downscale LANCZOS.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'public', 'assets')
LOGO = os.path.join(ASSETS, 'viteccons_logo.png')

SS = 3

SHIRT = (248, 245, 238)
SHIRT_SH = (220, 214, 200)
RED = (210, 46, 30)
RED_DK = (166, 30, 22)
ORANGE = (236, 104, 16)
REFLECT = (233, 230, 214)
PANTS = (42, 50, 80)
PANTS_DK = (28, 34, 56)
HAIR = (24, 16, 13)
HAIR_HI = (64, 46, 36)
SKIN = (240, 196, 152)
MAT = (214, 168, 96)
MAT_DK = (172, 124, 58)
MAT_EDGE = (120, 44, 24)
HAT_W = (253, 253, 249)
HAT_E = (176, 174, 164)
HAT_SH = (212, 210, 202)


def load_logo():
    img = Image.open(LOGO).convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r > 232 and g > 232 and b > 232:
                px[x, y] = (r, g, b, 0)
    return img


def font(sz):
    for name in ('arialbd.ttf', 'DejaVuSans-Bold.ttf', 'arial.ttf'):
        try:
            return ImageFont.truetype(name, sz)
        except OSError:
            continue
    return ImageFont.load_default()


def soft_shadow(size, box, blur, alpha=110):
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(box, fill=(8, 3, 2, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def draw_mat(d, cx, y, w, h):
    x0, y0, x1, y1 = cx - w // 2, y, cx + w // 2, y + h
    d.rounded_rectangle([x0, y0, x1, y1], radius=h // 3, fill=MAT_EDGE)
    d.rounded_rectangle([x0 + 4 * SS, y0 + 4 * SS, x1 - 4 * SS, y1 - 4 * SS],
                        radius=max(4, h // 3 - 3 * SS), fill=MAT)
    for lx in range(x0 + 14 * SS, x1 - 10 * SS, 16 * SS):
        d.line([lx, y0 + 6 * SS, lx, y1 - 6 * SS], fill=MAT_DK, width=2 * SS)
    d.line([x0 + 6 * SS, y0 + h // 2, x1 - 6 * SS, y0 + h // 2], fill=MAT_DK, width=2 * SS)


def legs_sit(d, cx, y, w):
    """Hai dau goi bat cheo ngam vao chieu."""
    lh = 26 * SS
    d.ellipse([cx - w // 2 - 6 * SS, y - 4 * SS, cx - 4 * SS, y + lh], fill=PANTS_DK)
    d.ellipse([cx + 4 * SS, y - 4 * SS, cx + w // 2 + 6 * SS, y + lh], fill=PANTS_DK)
    d.ellipse([cx - w // 2 - 4 * SS, y - 8 * SS, cx - 2 * SS, y + lh - 5 * SS], fill=PANTS)
    d.ellipse([cx + 2 * SS, y - 8 * SS, cx + w // 2 + 4 * SS, y + lh - 5 * SS], fill=PANTS)
    d.arc([cx - w // 2, y - 2 * SS, cx - 8 * SS, y + lh - 8 * SS], 200, 330, fill=PANTS_DK, width=2 * SS)
    d.arc([cx + 8 * SS, y - 2 * SS, cx + w // 2, y + lh - 8 * SS], 210, 340, fill=PANTS_DK, width=2 * SS)


def vest_torso(d, L, cx, top_y, bot_y, w_top, w_bot, logo=None):
    """Ao trang bo tron + band vest + logo VITECCONS + chu."""
    ht, hb = w_top / 2.0, w_bot / 2.0
    d.polygon([(cx - ht, top_y + 4 * SS), (cx + ht, top_y + 4 * SS),
               (cx + hb, bot_y), (cx - hb, bot_y)], fill=SHIRT)
    d.ellipse([cx - ht, top_y - 5 * SS, cx + ht, top_y + 12 * SS], fill=SHIRT)
    d.line([(cx - ht + 3 * SS, top_y + 8 * SS), (cx - hb + 3 * SS, bot_y - 2 * SS)], fill=SHIRT_SH, width=3 * SS)
    d.line([(cx + ht - 3 * SS, top_y + 8 * SS), (cx + hb - 3 * SS, bot_y - 2 * SS)], fill=SHIRT_SH, width=3 * SS)
    d.line([(cx - hb + 4 * SS, bot_y - 3 * SS), (cx + hb - 4 * SS, bot_y - 3 * SS)], fill=SHIRT_SH, width=2 * SS)

    hh = bot_y - top_y
    y_ref = top_y + int(hh * 0.46)
    y_red = y_ref + max(5 * SS, int(hh * 0.15))
    y_orange = top_y + int(hh * 0.80)
    vt, vb = w_top * 0.42, w_bot * 0.42
    d.polygon([(cx - vt, y_ref), (cx + vt, y_ref), (cx + vb, y_red + 2), (cx - vb, y_red + 2)], fill=REFLECT)
    d.polygon([(cx - vt, y_red + 2), (cx + vt, y_red + 2), (cx + vb, y_orange), (cx - vb, y_orange)], fill=RED)
    d.line([(cx - vt, y_red + 2), (cx - vb, y_orange)], fill=RED_DK, width=2 * SS)
    d.line([(cx + vt, y_red + 2), (cx + vb, y_orange)], fill=RED_DK, width=2 * SS)
    d.polygon([(cx - vb, y_orange), (cx + vb, y_orange),
               (cx + vb * 0.94, bot_y - 1), (cx - vb * 0.94, bot_y - 1)], fill=ORANGE)
    if logo:
        lw_ = int(w_top * 0.55)
        lh_ = int(logo.height * (lw_ / logo.width))
        lg = logo.resize((lw_, lh_), Image.LANCZOS)
        lg.putalpha(lg.getchannel('A').point(lambda x: int(x * 0.95)))
        L.alpha_composite(lg, (int(cx - lw_ / 2), top_y + int(hh * 0.12) - lh_ // 2))


def head_hat(d, cx, cy, r, green=False):
    """Dau chibi: toc den + tai + mu bong phu ~55% phia tren dau."""
    r = int(r)
    for sx in (-1, 1):
        d.ellipse([cx + sx * (r + 2 * SS) - 5 * SS, cy - 2 * SS,
                   cx + sx * (r + 2 * SS) + 5 * SS, cy + 10 * SS], fill=SKIN)
    d.ellipse([cx - r, cy - r + 2 * SS, cx + r, cy + int(r * 0.95)], fill=HAIR)
    d.ellipse([cx - r + 6 * SS, cy - r + 8 * SS, cx - int(r * 0.1), cy - int(r * 0.15)], fill=HAIR_HI)
    d.ellipse([cx - r + 4 * SS, cy + int(r * 0.5), cx + r - 4 * SS, cy + r + 4 * SS], fill=HAIR)

    hr = int(r * 1.15)
    dome_cx, dome_cy = cx, cy - int(r * 0.40)
    dome_rx, dome_ry = hr, int(r * 0.68)
    top, bot = dome_cy - dome_ry, dome_cy + dome_ry
    if green:
        shell, edge, shade, band = (56, 170, 84), (24, 102, 48), (36, 138, 64), (20, 112, 52)
    else:
        shell, edge, shade, band = HAT_W, HAT_E, HAT_SH, (43, 94, 167)
    d.ellipse([dome_cx - dome_rx - SS, top - SS, dome_cx + dome_rx + SS, bot + SS], fill=edge)
    d.ellipse([dome_cx - dome_rx, top, dome_cx + dome_rx, bot], fill=shell)
    d.chord([dome_cx - dome_rx, top, dome_cx + dome_rx, bot], -55, 55, fill=shade)
    d.ellipse([dome_cx - int(dome_rx * 0.62), top + 3 * SS, dome_cx - int(dome_rx * 0.05),
               top + int(dome_ry * 0.72)], fill=(255, 255, 255))
    d.line([dome_cx, top + 2 * SS, dome_cx, bot - 3 * SS],
           fill=edge if not green else (24, 116, 52), width=2 * SS)
    d.chord([dome_cx - dome_rx + 2 * SS, top, dome_cx + dome_rx - 2 * SS, bot + 8 * SS],
            25, 155, fill=band, width=3 * SS)
    bw = int(dome_rx * 1.15)
    d.ellipse([dome_cx - bw, bot - 4 * SS, dome_cx + bw, bot + 5 * SS], fill=edge)
    d.ellipse([dome_cx - bw + SS, bot - 4 * SS, dome_cx + bw - SS, bot + SS], fill=shell)


def draw_torso(L, cx, top_y, hip_y, green, arms, logo):
    """Ve than + tay + dau + mu truc tiep len layer L (canvas coords)."""
    d = ImageDraw.Draw(L)
    w_top, w_bot = 62 * SS, 70 * SS

    if arms == 'up':
        for sx in (-1, 1):
            d.line([cx + sx * 30 * SS, top_y + 14 * SS, cx + sx * 10 * SS, top_y - 48 * SS],
                   fill=SHIRT_SH, width=15 * SS)
            d.line([cx + sx * 29 * SS, top_y + 14 * SS, cx + sx * 9 * SS, top_y - 46 * SS],
                   fill=SHIRT, width=12 * SS)
        d.ellipse([cx - 9 * SS, top_y - 60 * SS, cx + 9 * SS, top_y - 42 * SS], fill=SKIN)
    elif arms == 'reach':
        for sx in (-1, 1):
            d.line([cx + sx * 32 * SS, top_y + 16 * SS, cx + sx * 36 * SS, hip_y + 30 * SS],
                   fill=SHIRT_SH, width=15 * SS)
            d.line([cx + sx * 31 * SS, top_y + 16 * SS, cx + sx * 34 * SS, hip_y + 28 * SS],
                   fill=SHIRT, width=12 * SS)
            d.ellipse([cx + sx * 34 * SS - 6 * SS, hip_y + 24 * SS,
                       cx + sx * 34 * SS + 6 * SS, hip_y + 38 * SS], fill=SKIN)
    else:  # 'lap'
        for sx in (-1, 1):
            d.line([cx + sx * 33 * SS, top_y + 12 * SS, cx + sx * 43 * SS, hip_y - 2 * SS],
                   fill=SHIRT_SH, width=15 * SS)
            d.line([cx + sx * 32 * SS, top_y + 12 * SS, cx + sx * 41 * SS, hip_y - 4 * SS],
                   fill=SHIRT, width=12 * SS)
            d.ellipse([cx + sx * 41 * SS - 6 * SS, hip_y - 12 * SS,
                       cx + sx * 41 * SS + 6 * SS, hip_y + 1 * SS], fill=SKIN)

    vest_torso(d, L, cx, top_y, hip_y, w_top, w_bot, logo)
    head_hat(d, cx, top_y - 28 * SS, 30 * SS, green)


def compose_sit(green=False, bow_deg=0, arms='lap', logo=None):
    W, H = 150 * SS, 200 * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cx = W // 2
    mat_y = 172 * SS
    hip = (cx, 160 * SS)

    d = ImageDraw.Draw(cv)
    cv.alpha_composite(soft_shadow(cv.size, (cx - 62 * SS, mat_y + 6 * SS, cx + 62 * SS, mat_y + 30 * SS), 6 * SS, 100))
    draw_mat(d, cx, mat_y, 136 * SS, 26 * SS)
    legs_sit(d, cx, 150 * SS, 62 * SS)

    torso = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    draw_torso(torso, cx, 100 * SS, hip[1], green, arms, logo)
    if bow_deg:
        torso = torso.rotate(bow_deg, resample=Image.BICUBIC, center=hip)
    cv.alpha_composite(torso)
    return cv


def compose_walk(green=False, step=1, logo=None):
    W, H = 130 * SS, 230 * SS
    cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(cv)
    cx = W // 2
    hip = (cx, 166 * SS)
    cv.alpha_composite(soft_shadow(cv.size, (cx - 40 * SS, 216 * SS, cx + 40 * SS, 230 * SS), 5 * SS, 105))
    a, b = (9, -9) if step > 0 else (-9, 9)
    d.rounded_rectangle([cx - 20 * SS + a * SS, 166 * SS, cx - 4 * SS + a * SS, 222 * SS], radius=8 * SS, fill=PANTS)
    d.rounded_rectangle([cx + 4 * SS + b * SS, 166 * SS, cx + 20 * SS + b * SS, 216 * SS], radius=8 * SS, fill=PANTS_DK)
    d.ellipse([cx - 22 * SS + a * SS, 216 * SS, cx - 2 * SS + a * SS, 226 * SS], fill=(22, 16, 12))
    d.ellipse([cx + 2 * SS + b * SS, 210 * SS, cx + 22 * SS + b * SS, 220 * SS], fill=(22, 16, 12))

    torso = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    draw_torso(torso, cx, 104 * SS, hip[1], green, 'lap', logo)
    cv.alpha_composite(torso)
    return cv


def save(im, name):
    im = im.resize((im.width // SS, im.height // SS), Image.LANCZOS)
    im.save(os.path.join(ASSETS, name))
    print('char:', name, im.size)


def main():
    logo = load_logo()
    save(compose_sit(logo=logo), 'devotee.png')
    save(compose_sit(logo=logo, bow_deg=14), 'devotee_kneel_down.png')
    save(compose_sit(logo=logo, arms='up'), 'devotee_bow.png')
    save(compose_sit(logo=logo, bow_deg=42), 'devotee_bow_mid.png')
    save(compose_sit(logo=logo, bow_deg=72, arms='reach'), 'devotee_prostrate.png')
    save(compose_sit(logo=logo, bow_deg=96, arms='reach'), 'devotee_prostrate_deep.png')
    save(compose_walk(logo=logo, step=1), 'devotee_walk.png')
    save(compose_walk(logo=logo, step=-1), 'devotee_walk_2.png')
    save(compose_sit(green=True, logo=logo), 'devotee_green.png')


if __name__ == '__main__':
    main()
