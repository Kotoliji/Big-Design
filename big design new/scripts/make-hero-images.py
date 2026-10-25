"""Готовит картинки первого экрана из рендера надписи public/cg_arena.png.

    python scripts/make-hero-images.py

- cg_arena.webp / cg_arena_960.webp — надпись после цветокоррекции (контровой свет: тёмный металл, яркие грани);
- cg_arena_glow.webp — мягкое свечение самых ярких граней, накладывается режимом screen;
- cg_arena_reflection.webp — отражение на мокром полу: в основном блики, вертикальные потёки, пятнами;
- floor_wet.webp — фактура мокрого бетона (светлые пятна там, где пол бликует), плавно проявляется от горизонта.
Всё тяжёлое (размытие, маски, шум) запекается здесь, а не считается браузером на каждом кадре.
Выводит числа, которые нужны в стилях ArenaHero.vue.
"""
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "cg_arena.png"
OUT = ROOT / "public" / "hero"

PAD = 16                  # запас вокруг букв, px исходника
ALPHA_THRESHOLD = 8

GAMMA = 2.2               # >1 — средние тона темнее (металл уходит в тень)
GAIN = 1.25               # усиление после гаммы — только самые светлые грани уходят в белый
TINT = (0.96, 1.0, 1.05)  # лёгкий холодный оттенок (R, G, B)

GLOW_PAD = 90             # насколько свечение выходит за границы надписи, px
GLOW_FROM = 0.72          # светятся только пиксели ярче этой доли — грани, а не лицевые стороны
GLOW_NEAR = 0.9           # яркость узкого ореола у самой грани
GLOW_FAR = 1.4            # яркость широкой дымки

REFLECTION_START = 0.5    # непрозрачность отражения у линии пола
REFLECTION_LENGTH = 0.75  # на какой доле высоты отражение гаснет

FLOOR_SIZE = (1280, 420)  # фактура размытая — полного разрешения не нужно
FLOOR_OPACITY = 0.14
FLOOR_FADE_IN = 0.18      # доля высоты, за которую фактура проявляется от горизонта


def grade(img):
    r, g, b, a = img.split()

    def lut(k):
        return [min(255, round(255 * ((i / 255) ** GAMMA) * GAIN * k)) for i in range(256)]

    return Image.merge("RGBA", (r.point(lut(TINT[0])), g.point(lut(TINT[1])), b.point(lut(TINT[2])), a))


def highlights(img, start):
    luma = ImageChops.multiply(img.convert("L"), img.getchannel("A"))
    cut = start * 255
    return luma.point(lambda v: 0 if v < cut else round(255 * (v - cut) / (255 - cut)))


def soft_noise(size, cells, low, high, seed):
    """Плавный шум: случайная сетка cells, растянутая и размытая до size."""
    rnd = random.Random(seed)
    grid = Image.new("L", cells)
    grid.putdata([rnd.randint(0, 255) for _ in range(cells[0] * cells[1])])
    smooth = grid.resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(size[0] / cells[0] / 3))
    return smooth.point(lambda v: round(low + (high - low) * v / 255))


def vertical_ramp(size, fn):
    """Альфа-маска по высоте: fn(доля высоты сверху) → 0..1."""
    ramp = Image.linear_gradient("L").resize(size)  # 0 сверху → 255 снизу
    return ramp.point(lambda v: round(255 * max(0.0, min(1.0, fn(v / 255)))))


def save_webp(img, name, quality, scale=1.0):
    if scale != 1.0:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    img.save(OUT / name, "WEBP", quality=quality, method=6)
    return img.size


def make_logo(src):
    alpha = src.getchannel("A")
    lo, hi = alpha.getextrema()
    if lo > ALPHA_THRESHOLD:
        raise SystemExit(f"У {SRC.name} нет прозрачного фона (альфа {lo}..{hi})")
    left, top, right, bottom = alpha.point(lambda a: 255 if a > ALPHA_THRESHOLD else 0).getbbox()
    box = (max(0, left - PAD), max(0, top - PAD), min(src.width, right + PAD), min(src.height, bottom + PAD))
    logo = grade(src.crop(box))
    save_webp(logo, "cg_arena.webp", 90)
    save_webp(logo, "cg_arena_960.webp", 88, 960 / logo.width)
    base = (bottom - box[1]) / logo.height
    return logo, base


def make_glow(logo):
    canvas = Image.new("L", (logo.width + 2 * GLOW_PAD, logo.height + 2 * GLOW_PAD))
    canvas.paste(highlights(logo, GLOW_FROM), (GLOW_PAD, GLOW_PAD))
    near = canvas.filter(ImageFilter.GaussianBlur(4)).point(lambda v: min(255, round(v * GLOW_NEAR)))
    far = canvas.filter(ImageFilter.GaussianBlur(26)).point(lambda v: min(255, round(v * GLOW_FAR)))
    glow = Image.new("RGBA", canvas.size, (236, 242, 255, 0))
    glow.putalpha(ImageChops.add(near, far))
    return save_webp(glow, "cg_arena_glow.webp", 80, 0.5)


def make_reflection(logo):
    mirror = logo.transpose(Image.FLIP_TOP_BOTTOM)
    # В мокром полу ярко отражаются только блики — грани букв делаем темнее.
    rgb = [ch.point(lambda v: round(255 * (v / 255) ** 1.6)) for ch in mirror.split()[:3]]
    mirror = Image.merge("RGBA", (*rgb, mirror.getchannel("A")))
    w, h = mirror.size
    streaks = mirror.resize((w, max(1, h // 8)), Image.BOX).resize((w, h), Image.BICUBIC)
    reflection = Image.blend(mirror.filter(ImageFilter.GaussianBlur(3)), streaks, 0.55)

    fade = vertical_ramp((w, h), lambda y: REFLECTION_START * (1 - y / REFLECTION_LENGTH))
    puddles = soft_noise((w, h), (22, 6), 90, 255, seed=7)
    reflection.putalpha(ImageChops.multiply(ImageChops.multiply(reflection.getchannel("A"), fade), puddles))
    return save_webp(reflection, "cg_arena_reflection.webp", 80, 0.5)


def make_floor():
    blotches = soft_noise(FLOOR_SIZE, (28, 9), 0, 255, seed=1)
    detail = soft_noise(FLOOR_SIZE, (120, 40), 0, 255, seed=2)
    texture = Image.blend(blotches, detail, 0.35)
    # Остаются только светлые пятна — участки, где мокрый пол бликует.
    wet = texture.point(lambda v: 0 if v < 120 else min(255, round((v - 120) * 2.2)))
    fade_in = vertical_ramp(FLOOR_SIZE, lambda y: y / FLOOR_FADE_IN)
    alpha = ImageChops.multiply(wet.point(lambda v: round(v * FLOOR_OPACITY)), fade_in)
    floor = Image.new("RGBA", FLOOR_SIZE, (225, 232, 245, 0))
    floor.putalpha(alpha)
    return save_webp(floor, "floor_wet.webp", 75)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGBA")
    logo, base = make_logo(src)
    glow_size = make_glow(logo)
    reflection_size = make_reflection(logo)
    floor_size = make_floor()

    print(f"надпись {logo.size}: --logo-ratio {logo.height / logo.width:.4f}, --logo-base {base:.4f}")
    print(
        f"свечение {glow_size} (x0.5): поле {GLOW_PAD}px = "
        f"{GLOW_PAD / logo.width:.4f} ширины, {GLOW_PAD / logo.height:.4f} высоты надписи"
    )
    print(f"отражение {reflection_size}, пол {floor_size}")
    for f in sorted(OUT.glob("*.webp")):
        print(f"{f.name}: {f.stat().st_size / 1024:.0f} КБ")


if __name__ == "__main__":
    main()
