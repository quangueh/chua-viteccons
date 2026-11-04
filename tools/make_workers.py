"""Ve ao dong phuc Viteccons + mu bao ho len 8 frame sprite phat tu.

Ao trang o tren (ke ca tay), giap vest o giua lung: soc phan quang -> do -> cam,
duoi that lung to dam (quan). Mu bao ho trang dome che bui toc.
Logo V + wordmark VITECCONS in tren lung ao (tai composite tu logo goc).
Mau giu do nhan theo luminance goc -> nep vai con nguyen.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'public', 'assets')
SRC_DIR = os.path.join(ROOT, 'orig_devotee')
LOGO = os.path.join(ASSETS, 'viteccons_logo.png')

# (hat_cx, hat_cy, hat_r, shirt_top, vest_top, waist_y, vest_w_top, vest_w_bot)
FRAMES = {
    'devotee.png':                (69, 31, 28, 56, 78, 120, 44, 52),
    'devotee_kneel_down.png':     (67, 30, 28, 54, 74, 114, 42, 50),
    'devotee_bow.png':            (70, 31, 28, 58, 78, 118, 44, 52),
    'devotee_bow_mid.png':        (70, 35, 28, 60, 82, 120, 44, 54),
    'devotee_prostrate.png':      (67, 27, 27, 40, 60, 104, 48, 54),
    'devotee_prostrate_deep.png': (70, 31, 27, 44, 64, 108, 50, 56),
    'devotee_walk.png':           (50, 27, 27, 54, 82, 136, 32, 38),
    'devotee_walk_2.png':         (50, 27, 27, 54, 82, 136, 32, 38),
}

WHITE = (250, 248, 242)
RED = (212, 46, 32)
ORANGE = (238, 104, 16)
REFLECT = (226, 224, 212)
PANTS = (46, 54, 76)


def load_logo():
    img = Image.open(LOGO).convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r > 232 and g > 232 and b > 232:
                px[x, y] = (r, g, b, 0)
    return img


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def shade_region(im, mask, y0, y1, color, gain=1.0):
    w, h = im.size
    px = im.load()
    m = mask.load()
    for y in range(max(0, y0), min(h, y1)):
        for x in range(w):
            if m[x, y]:
                r, g, b, a = px[x, y]
                L = lum(r, g, b) / 255.0
                k = (0.45 + 0.55 * L) * gain
                px[x, y] = (
                    min(255, int(color[0] * k + r * 0.08)),
                    min(255, int(color[1] * k + g * 0.08)),
                    min(255, int(color[2] * k + b * 0.08)),
                    a,
                )


def trapezoid_mask(size, cx, top_y, bot_y, w_top, w_bot, clip):
    w, h = size
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    ht, hb = w_top / 2.0, w_bot / 2.0
    d.polygon([(cx - ht, top_y), (cx + ht, top_y),
               (cx + hb, bot_y), (cx - hb, bot_y)], fill=255)
    m = Image.composite(m, Image.new('L', (w, h), 0), clip)
    m = m.filter(ImageFilter.GaussianBlur(1.0))
    return m.point(lambda a: 255 if a > 90 else 0)


def dress(im, cx, shirt_top, vest_top, waist_y, vwt, vwb):
    """Ao trang toan than tren + vest do-cam giua + quan toi duoi. Tra ve (cx,logo_cy)."""
    w, h = im.size
    alpha = im.getchannel('A')
    body = alpha.point(lambda a: 255 if a > 90 else 0)

    # ao trang: toan bo than tu co ao -> that lung (ke ca tay ao)
    shirt = trapezoid_mask((w, h), cx, shirt_top, waist_y,
                           int(vwt * 2.4), int(vwb * 2.4), body)
    shade_region(im, shirt, shirt_top, waist_y, WHITE, 1.07)

    # vest: trapezoid hep giua lung, tu nguc -> that lung
    vest = trapezoid_mask((w, h), cx, vest_top, waist_y, vwt, vwb, body)
    vh = waist_y - vest_top
    y_ref0 = vest_top + int(vh * 0.16)
    y_ref1 = y_ref0 + max(3, int(vh * 0.10))
    y_red1 = vest_top + int(vh * 0.62)
    shade_region(im, vest, vest_top, y_ref0, WHITE, 1.04)
    shade_region(im, vest, y_ref0, y_ref1, REFLECT, 1.02)
    shade_region(im, vest, y_ref1, y_red1, RED, 1.0)
    shade_region(im, vest, y_red1, waist_y, ORANGE, 1.04)

    # quan/vay toi phia duoi
    shade_region(im, body, waist_y, h, PANTS, 0.95)

    logo_cy = shirt_top + int((vest_top - shirt_top) * 0.5)
    return cx, logo_cy


def paste_logo(im, logo, cx, cy, w_px):
    lh = int(logo.height * (w_px / logo.width))
    lg = logo.resize((w_px, lh), Image.LANCZOS)
    lg.putalpha(lg.getchannel('A').point(lambda x: int(x * 0.95)))
    im.alpha_composite(lg, (cx - w_px // 2, cy - lh // 2))


def draw_hat(im, cx, cy, r, green=False):
    w, h = im.size
    layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    if green:
        shell, edge, brim, shade, hl = (
            (52, 168, 82, 255), (20, 96, 44, 255), (40, 140, 68, 255),
            (26, 116, 52, 255), (86, 200, 116, 255))
    else:
        shell, edge, brim, shade, hl = (
            (250, 250, 246, 255), (168, 166, 156, 255), (228, 226, 216, 255),
            (200, 198, 188, 255), (255, 255, 255, 255))

    # dome: ellipse det om dau (cy = tam dome, rx=r, ry=r*0.75)
    rx, ry = r, int(r * 0.82)
    top, bot = cy - ry, cy + ry
    d.ellipse([cx - rx, top, cx + rx, bot], fill=edge)
    d.ellipse([cx - rx + 2, top + 2, cx + rx - 2, bot - 1], fill=shell)
    # highlight ben trai (DAC de khong lo bui toc)
    d.ellipse([cx - int(rx * 0.55), top + int(ry * 0.30),
               cx - int(rx * 0.12), cy - int(ry * 0.15)], fill=hl)
    # duong gop mu giua dinh
    d.line([cx, top + 3, cx, cy], fill=shade, width=2)
    # brim: dai ngang mong, om sat day dome
    rw, rh = int(rx * 1.12), max(4, int(ry * 0.22))
    ry0 = bot - 3
    d.ellipse([cx - rw, ry0, cx + rw, ry0 + rh], fill=edge)
    d.ellipse([cx - rw + 1, ry0, cx + rw - 1, ry0 + rh - 3], fill=brim)

    im.alpha_composite(layer)


def process(fname, params, logo, suffix='', green=False):
    im = Image.open(os.path.join(SRC_DIR, fname)).convert('RGBA')
    hat_cx, hat_cy, hat_r, shirt_top, vest_top, waist_y, vwt, vwb = params
    lcx, lcy = dress(im, hat_cx, shirt_top, vest_top, waist_y, vwt, vwb)
    paste_logo(im, logo, lcx, lcy, max(22, int(im.size[0] * 0.26)))
    draw_hat(im, hat_cx, hat_cy, hat_r, green)
    out = fname if not suffix else fname.replace('.png', suffix + '.png')
    im.save(os.path.join(ASSETS, out))
    return out


def main():
    logo = load_logo()
    for fname, p in FRAMES.items():
        print('worker:', process(fname, p, logo))
    process('devotee.png', FRAMES['devotee.png'], logo, '_green', green=True)
    print('worker: devotee_green.png')


if __name__ == '__main__':
    main()
