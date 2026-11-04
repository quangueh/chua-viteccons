"""Composite the Viteccons logo mark onto the back of each devotee sprite frame."""
import os
from PIL import Image

ASSETS = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
LOGO = os.path.join(ASSETS, 'viteccons_logo.png')

# frame -> (logo width as fraction of sprite width, center y as fraction of height)
FRAMES = {
    'devotee.png':                (0.18, 0.44),
    'devotee_kneel_down.png':     (0.18, 0.44),
    'devotee_bow.png':            (0.17, 0.42),
    'devotee_bow_mid.png':        (0.17, 0.43),
    'devotee_prostrate.png':      (0.16, 0.44),
    'devotee_prostrate_deep.png': (0.16, 0.46),
    'devotee_walk.png':           (0.22, 0.38),
    'devotee_walk_2.png':         (0.22, 0.38),
}


def load_mark():
    """Crop the V mark (above the VITECCONS wordmark) and make white transparent."""
    img = Image.open(LOGO).convert('RGBA')
    w, h = img.size
    # Find vertical gap between mark and wordmark: scan rows, mark is in top ~62%
    cut_y = int(h * 0.62)
    top = img.crop((0, 0, w, cut_y))
    px = top.load()
    # bbox of non-white pixels
    min_x, min_y, max_x, max_y = w, cut_y, 0, 0
    for y in range(cut_y):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 10 and not (r > 235 and g > 235 and b > 235):
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
    mark = top.crop((min_x - 2, min_y - 2, max_x + 3, max_y + 3))
    # white -> transparent
    mk = mark.load()
    for y in range(mark.height):
        for x in range(mark.width):
            r, g, b, a = mk[x, y]
            if r > 235 and g > 235 and b > 235:
                mk[x, y] = (r, g, b, 0)
    return mark


def main():
    mark = load_mark()
    print('mark size:', mark.size)

    for fname, (w_frac, y_frac) in FRAMES.items():
        path = os.path.join(ASSETS, fname)
        sprite = Image.open(path).convert('RGBA')
        sw, sh = sprite.size
        lw = max(16, int(sw * w_frac))
        lh = int(mark.height * (lw / mark.width))
        logo = mark.resize((lw, lh), Image.LANCZOS)
        # soften alpha so it reads as printed on cloth
        alpha = logo.getchannel('A').point(lambda a: int(a * 0.9))
        logo.putalpha(alpha)
        cx, cy = sw // 2, int(sh * y_frac)
        sprite.alpha_composite(logo, (cx - lw // 2, cy - lh // 2))
        sprite.save(path)
        print('branded', fname)


if __name__ == '__main__':
    main()
